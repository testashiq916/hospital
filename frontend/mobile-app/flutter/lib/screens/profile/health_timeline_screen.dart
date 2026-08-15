import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/patient.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../../services/patient_service.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';

/// `GET /patients/{id}/timeline` — a paginated feed of clinical events
/// (admissions, prescriptions, lab reports, etc. — whatever the backend
/// records via `PatientTimeline`). Read-only history view.
class HealthTimelineScreen extends StatefulWidget {
  const HealthTimelineScreen({super.key, required this.patientId});

  final int patientId;

  @override
  State<HealthTimelineScreen> createState() => _HealthTimelineScreenState();
}

class _HealthTimelineScreenState extends State<HealthTimelineScreen> {
  late final PatientService _service;
  bool _loading = true;
  String? _error;
  List<PatientTimelineEvent> _events = [];

  @override
  void initState() {
    super.initState();
    _service = PatientService(context.read<AuthProvider>().client);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await _service.timeline(widget.patientId);
      setState(() => _events = page.data);
    } on ApiException catch (e) {
      setState(() => _error = e.displayMessage);
    } catch (e) {
      setState(() => _error = 'Failed to load timeline: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  IconData _iconFor(String type) {
    final t = type.toLowerCase();
    if (t.contains('admission')) return Icons.local_hospital_outlined;
    if (t.contains('lab')) return Icons.biotech_outlined;
    if (t.contains('prescription') || t.contains('medic')) {
      return Icons.medication_outlined;
    }
    if (t.contains('appointment')) return Icons.event_outlined;
    if (t.contains('bill') || t.contains('payment')) {
      return Icons.receipt_long_outlined;
    }
    return Icons.circle_outlined;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Health Timeline')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _events.isEmpty
                  ? const EmptyView(
                      message: 'No timeline events recorded yet.',
                      icon: Icons.timeline_rounded,
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: _events.length,
                        itemBuilder: (context, index) {
                          final event = _events[index];
                          final isLast = index == _events.length - 1;
                          return _TimelineTile(
                            event: event,
                            icon: _iconFor(event.eventType),
                            isLast: isLast,
                          );
                        },
                      ),
                    ),
    );
  }
}

class _TimelineTile extends StatelessWidget {
  const _TimelineTile({
    required this.event,
    required this.icon,
    required this.isLast,
  });

  final PatientTimelineEvent event;
  final IconData icon;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 18, color: AppTheme.primary),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: const Color(0xFFE2E8F0)),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    Formatters.titleCase(event.eventType),
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    Formatters.dateTime(event.eventDate),
                    style: const TextStyle(
                        fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                  if (event.description != null &&
                      event.description!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(event.description!),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
