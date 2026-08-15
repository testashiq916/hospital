import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/appointment_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/state_views.dart';
import 'appointment_detail_screen.dart';
import 'book_appointment_screen.dart';
import 'widgets/appointment_card.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  bool _loadedOnce = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final patientId = context.watch<AuthProvider>().patient?.id;
    if (!_loadedOnce && patientId != null) {
      _loadedOnce = true;
      WidgetsBinding.instance.addPostFrameCallback((_) => _load());
    }
  }

  Future<void> _load() async {
    final patientId = context.read<AuthProvider>().patient?.id;
    if (patientId == null) return;
    await context.read<AppointmentProvider>().load(patientId);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<AppointmentProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Upcoming'), Tab(text: 'History')],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => const BookAppointmentScreen()),
        ),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Book'),
      ),
      body: auth.patient == null
          ? const EmptyView(
              message:
                  'Link your patient profile from the Home tab to see your '
                  'appointments.',
              icon: Icons.link_off_rounded,
            )
          : _buildBody(provider),
    );
  }

  Widget _buildBody(AppointmentProvider provider) {
    if (provider.isLoading && provider.appointments.isEmpty) {
      return const LoadingView();
    }
    if (provider.error != null && provider.appointments.isEmpty) {
      return ErrorView(message: provider.error!, onRetry: _load);
    }
    return TabBarView(
      controller: _tabController,
      children: [
        _AppointmentList(
          appointments: provider.upcoming,
          onRefresh: _load,
          emptyMessage: 'No upcoming appointments.',
        ),
        _AppointmentList(
          appointments: provider.history,
          onRefresh: _load,
          emptyMessage: 'No past appointments yet.',
        ),
      ],
    );
  }
}

class _AppointmentList extends StatelessWidget {
  const _AppointmentList({
    required this.appointments,
    required this.onRefresh,
    required this.emptyMessage,
  });

  final List appointments;
  final Future<void> Function() onRefresh;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    if (appointments.isEmpty) {
      return RefreshIndicator(
        onRefresh: onRefresh,
        child: ListView(
          children: [
            const SizedBox(height: 80),
            EmptyView(
                message: emptyMessage, icon: Icons.event_busy_outlined),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        itemCount: appointments.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final appointment = appointments[index];
          return AppointmentCard(
            appointment: appointment,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) =>
                    AppointmentDetailScreen(appointmentId: appointment.id),
              ),
            ),
          );
        },
      ),
    );
  }
}
