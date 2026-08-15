import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/appointment.dart';
import '../../providers/appointment_provider.dart';
import '../../services/api_client.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';

class AppointmentDetailScreen extends StatefulWidget {
  const AppointmentDetailScreen({super.key, required this.appointmentId});

  final int appointmentId;

  @override
  State<AppointmentDetailScreen> createState() =>
      _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState extends State<AppointmentDetailScreen> {
  bool _cancelling = false;

  Appointment? _fromList(AppointmentProvider provider) {
    for (final a in provider.appointments) {
      if (a.id == widget.appointmentId) return a;
    }
    return null;
  }

  Future<void> _cancel() async {
    final reasonController = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel appointment?'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'Reason (optional)',
          ),
          maxLines: 2,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep appointment'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Cancel it'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _cancelling = true);
    try {
      await context.read<AppointmentProvider>().cancel(
            widget.appointmentId,
            reason: reasonController.text.trim(),
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Appointment cancelled.')));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.displayMessage)));
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppointmentProvider>();
    final appointment = _fromList(provider);

    return Scaffold(
      appBar: AppBar(title: const Text('Appointment')),
      body: appointment == null
          ? const ErrorView(message: 'Appointment not found.')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        appointment.appointmentCode,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF64748B),
                          fontSize: 12,
                        ),
                      ),
                      StatusBadge.fromStatus(
                        appointment.status,
                        StatusColors.forAppointment(appointment.status),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (appointment.tokenNumber != null)
                    _TokenBanner(appointment: appointment),
                  if (appointment.tokenNumber != null)
                    const SizedBox(height: 20),
                  _DetailCard(appointment: appointment),
                  if (appointment.isTeleconsultation &&
                      appointment.teleconsultationLink != null) ...[
                    const SizedBox(height: 16),
                    Card(
                      child: ListTile(
                        leading: const Icon(Icons.videocam_rounded,
                            color: AppTheme.accent),
                        title: const Text('Video consultation link'),
                        subtitle: Text(appointment.teleconsultationLink!),
                      ),
                    ),
                  ],
                  if (appointment.status == 'cancelled' &&
                      appointment.cancelledReason != null) ...[
                    const SizedBox(height: 16),
                    Card(
                      color: AppTheme.danger.withOpacity(0.06),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Cancellation reason',
                                style:
                                    TextStyle(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 4),
                            Text(appointment.cancelledReason!),
                          ],
                        ),
                      ),
                    ),
                  ],
                  if (appointment.isUpcoming) ...[
                    const SizedBox(height: 28),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _cancelling ? null : _cancel,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.danger,
                          side: const BorderSide(color: AppTheme.danger),
                        ),
                        icon: _cancelling
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2),
                              )
                            : const Icon(Icons.close_rounded),
                        label: Text(_cancelling
                            ? 'Cancelling…'
                            : 'Cancel appointment'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}

class _TokenBanner extends StatelessWidget {
  const _TokenBanner({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, AppTheme.primaryDark],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Text('Your queue token',
              style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 6),
          Text(
            '#${appointment.tokenNumber}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 40,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (appointment.estimatedWaitTime != null &&
              appointment.estimatedWaitTime! > 0) ...[
            const SizedBox(height: 4),
            Text(
              'Estimated wait: ~${appointment.estimatedWaitTime} min',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailCard extends StatelessWidget {
  const _DetailCard({required this.appointment});

  final Appointment appointment;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _row(Icons.person_outline_rounded, 'Doctor',
                appointment.doctorName ?? '—'),
            const Divider(height: 24),
            _row(Icons.calendar_today_outlined, 'Date',
                Formatters.dateLong(appointment.appointmentDate)),
            const Divider(height: 24),
            _row(Icons.schedule_outlined, 'Time',
                Formatters.time(appointment.appointmentTime)),
            const Divider(height: 24),
            _row(Icons.category_outlined, 'Type',
                Formatters.titleCase(appointment.appointmentType)),
            if (appointment.reason != null &&
                appointment.reason!.isNotEmpty) ...[
              const Divider(height: 24),
              _row(Icons.notes_outlined, 'Reason', appointment.reason!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 12),
        SizedBox(
          width: 80,
          child: Text(label,
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B))),
        ),
        Expanded(
          child: Text(value,
              style: const TextStyle(fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }
}
