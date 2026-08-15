import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/appointment.dart';
import '../../providers/appointment_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/billing_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';
import '../appointments/appointment_detail_screen.dart';
import '../appointments/book_appointment_screen.dart';

/// Landing tab: greeting, quick actions, upcoming appointments, and an
/// outstanding-balance nudge — the things a patient wants to see first.
class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key, required this.onNavigate});

  /// Lets quick-action tiles jump to another bottom-nav tab (e.g.
  /// "View bills" -> index 3) without a full navigator push.
  final void Function(int tabIndex) onNavigate;

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  bool _loadedOnce = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = context.watch<AuthProvider>();
    final patientId = auth.patient?.id;
    if (!_loadedOnce && patientId != null) {
      _loadedOnce = true;
      WidgetsBinding.instance.addPostFrameCallback((_) => _refresh());
    }
  }

  Future<void> _refresh() async {
    final auth = context.read<AuthProvider>();
    final patientId = auth.patient?.id;
    if (patientId == null) return;
    await Future.wait([
      context.read<AppointmentProvider>().load(patientId),
      context.read<BillingProvider>().load(patientId),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final appointments = context.watch<AppointmentProvider>();
    final billing = context.watch<BillingProvider>();
    final user = auth.user;
    final patient = auth.patient;

    return RefreshIndicator(
      onRefresh: _refresh,
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: false,
            floating: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            elevation: 0,
            titleSpacing: 20,
            title: Text(
              _greeting(),
              style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(
                  user?.name ?? 'Welcome',
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 20),
                if (patient == null) _PatientLinkNotice(auth: auth),
                if (patient == null) const SizedBox(height: 16),
                _QuickActionsGrid(onNavigate: widget.onNavigate),
                const SizedBox(height: 24),
                if (billing.bills.isNotEmpty && billing.totalOutstanding > 0)
                  _OutstandingBalanceCard(
                    amount: billing.totalOutstanding,
                    onTap: () => widget.onNavigate(3),
                  ),
                if (billing.bills.isNotEmpty && billing.totalOutstanding > 0)
                  const SizedBox(height: 24),
                Text(
                  'Upcoming appointments',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 12),
                _buildUpcomingSection(appointments, patient != null),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingSection(
    AppointmentProvider appointments,
    bool hasPatient,
  ) {
    if (!hasPatient) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Link your patient profile above to see appointments here.',
            style: TextStyle(color: Color(0xFF64748B)),
          ),
        ),
      );
    }
    if (appointments.isLoading && appointments.appointments.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: LoadingView(),
      );
    }
    if (appointments.error != null && appointments.appointments.isEmpty) {
      return ErrorView(message: appointments.error!, onRetry: _refresh);
    }
    final upcoming = appointments.upcoming.take(3).toList();
    if (upcoming.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'No upcoming appointments',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 4),
              const Text(
                'Book one with your preferred department and doctor.',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const BookAppointmentScreen(),
                  ),
                ),
                icon: const Icon(Icons.add_rounded),
                label: const Text('Book appointment'),
              ),
            ],
          ),
        ),
      );
    }
    return Column(
      children: upcoming
          .map((a) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _AppointmentTile(appointment: a),
              ))
          .toList(),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}

class _PatientLinkNotice extends StatelessWidget {
  const _PatientLinkNotice({required this.auth});

  final AuthProvider auth;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppTheme.warning.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppTheme.warning.withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline_rounded, color: AppTheme.warning),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Patient profile not linked',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    auth.patientResolutionError ??
                        'We could not find a patient record matching your '
                            'account.',
                    style: const TextStyle(
                        fontSize: 12.5, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: auth.retryPatientResolution,
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(0, 0),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Try again'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionsGrid extends StatelessWidget {
  const _QuickActionsGrid({required this.onNavigate});

  final void Function(int) onNavigate;

  @override
  Widget build(BuildContext context) {
    final actions = [
      (
        icon: Icons.event_available_rounded,
        label: 'Book\nAppointment',
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const BookAppointmentScreen()),
        ),
      ),
      (
        icon: Icons.medication_outlined,
        label: 'Prescriptions',
        onTap: () => onNavigate(2),
      ),
      (
        icon: Icons.biotech_outlined,
        label: 'Lab &\nRadiology',
        onTap: () => onNavigate(2),
      ),
      (
        icon: Icons.payments_outlined,
        label: 'Pay\nBills',
        onTap: () => onNavigate(3),
      ),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 0.82,
      children: actions
          .map((a) => _QuickActionTile(
                icon: a.icon,
                label: a.label,
                onTap: a.onTap,
              ))
          .toList(),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppTheme.primary, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}

class _OutstandingBalanceCard extends StatelessWidget {
  const _OutstandingBalanceCard({required this.amount, required this.onTap});

  final double amount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppTheme.primary, AppTheme.primaryDark],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            const Icon(Icons.account_balance_wallet_outlined,
                color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Outstanding balance',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  Text(
                    Formatters.currency(amount),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white),
          ],
        ),
      ),
    );
  }
}

class _AppointmentTile extends StatelessWidget {
  const _AppointmentTile({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) =>
                AppointmentDetailScreen(appointmentId: appointment.id),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  appointment.appointmentDate != null
                      ? appointment.appointmentDate!.day.toString()
                      : '—',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppTheme.primary,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      appointment.doctorName ?? 'Doctor',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${Formatters.date(appointment.appointmentDate)} • '
                      '${Formatters.time(appointment.appointmentTime)}',
                      style: const TextStyle(
                          fontSize: 12.5, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
              StatusBadge.fromStatus(
                appointment.status,
                StatusColors.forAppointment(appointment.status),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
