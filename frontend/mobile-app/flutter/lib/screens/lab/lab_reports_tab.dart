import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/lab_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';
import 'lab_report_detail_screen.dart';

class LabReportsTab extends StatefulWidget {
  const LabReportsTab({super.key});

  @override
  State<LabReportsTab> createState() => _LabReportsTabState();
}

class _LabReportsTabState extends State<LabReportsTab>
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
    await context.read<LabProvider>().load(patientId);
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<LabProvider>();

    if (auth.patient == null) {
      return const EmptyView(
        message: 'Link your patient profile from the Home tab to see your '
            'lab & radiology reports.',
        icon: Icons.link_off_rounded,
      );
    }
    if (provider.isLoading && provider.reports.isEmpty) {
      return const LoadingView();
    }
    if (provider.error != null && provider.reports.isEmpty) {
      return ErrorView(message: provider.error!, onRetry: _load);
    }
    if (provider.reports.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          children: const [
            SizedBox(height: 80),
            EmptyView(message: 'No lab reports yet.', icon: Icons.biotech_outlined),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: provider.reports.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final report = provider.reports[index];
          return Card(
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => LabReportDetailScreen(reportId: report.id),
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
                        color: AppTheme.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.biotech_outlined,
                          color: AppTheme.success),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(report.reportTitle,
                              style: const TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 3),
                          Text(
                            Formatters.date(report.reportDate),
                            style: const TextStyle(
                                fontSize: 12.5, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                    StatusBadge.fromStatus(
                      report.isVerified ? 'verified' : report.status,
                      StatusColors.forLabStatus(
                          report.isVerified ? 'verified' : report.status),
                    ),
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
