import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/prescription_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import 'prescription_detail_screen.dart';

class PrescriptionsTab extends StatefulWidget {
  const PrescriptionsTab({super.key});

  @override
  State<PrescriptionsTab> createState() => _PrescriptionsTabState();
}

class _PrescriptionsTabState extends State<PrescriptionsTab>
    with AutomaticKeepAliveClientMixin {
  bool _loadedOnce = false;

  @override
  bool get wantKeepAlive => true;

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
    await context.read<PrescriptionProvider>().load(patientId);
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<PrescriptionProvider>();

    if (auth.patient == null) {
      return const EmptyView(
        message: 'Link your patient profile from the Home tab to see your '
            'prescriptions.',
        icon: Icons.link_off_rounded,
      );
    }
    if (provider.isLoading && provider.prescriptions.isEmpty) {
      return const LoadingView();
    }
    if (provider.error != null && provider.prescriptions.isEmpty) {
      return ErrorView(message: provider.error!, onRetry: _load);
    }
    if (provider.prescriptions.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          children: const [
            SizedBox(height: 80),
            EmptyView(
              message: 'No prescriptions yet.',
              icon: Icons.medication_outlined,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.prescriptions.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final rx = provider.prescriptions[index];
          return Card(
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => PrescriptionDetailScreen(prescriptionId: rx.id),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.medication_outlined,
                          color: AppTheme.accent),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            rx.diagnosis?.isNotEmpty == true
                                ? rx.diagnosis!
                                : rx.prescriptionCode,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${rx.doctorName ?? 'Doctor'} • '
                            '${Formatters.date(rx.prescriptionDate)}',
                            style: const TextStyle(
                                fontSize: 12.5, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${rx.items.length} medicine(s)',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded,
                        color: Color(0xFFCBD5E1)),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
