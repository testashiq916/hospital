import 'package:flutter/material.dart';

import '../../../config/theme.dart';
import '../../../models/appointment.dart';
import '../../../utils/formatters.dart';
import '../../../widgets/status_badge.dart';

class AppointmentCard extends StatelessWidget {
  const AppointmentCard({
    super.key,
    required this.appointment,
    required this.onTap,
  });

  final Appointment appointment;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      appointment.doctorName ?? 'Doctor',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                  ),
                  StatusBadge.fromStatus(
                    appointment.status,
                    StatusColors.forAppointment(appointment.status),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today_rounded,
                      size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 6),
                  Text(
                    Formatters.date(appointment.appointmentDate),
                    style: const TextStyle(fontSize: 12.5),
                  ),
                  const SizedBox(width: 14),
                  const Icon(Icons.schedule_rounded,
                      size: 14, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 6),
                  Text(
                    Formatters.time(appointment.appointmentTime),
                    style: const TextStyle(fontSize: 12.5),
                  ),
                ],
              ),
              if (appointment.tokenNumber != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Token #${appointment.tokenNumber}',
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.accent,
                    ),
                  ),
                ),
              ],
              if (appointment.isTeleconsultation) ...[
                const SizedBox(height: 6),
                const Row(
                  children: [
                    Icon(Icons.videocam_outlined,
                        size: 14, color: Color(0xFF94A3B8)),
                    SizedBox(width: 6),
                    Text('Video consultation', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
