import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/lab_report.dart';
import '../../providers/lab_provider.dart';
import '../../services/api_client.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';

class LabReportDetailScreen extends StatefulWidget {
  const LabReportDetailScreen({super.key, required this.reportId});

  final int reportId;

  @override
  State<LabReportDetailScreen> createState() => _LabReportDetailScreenState();
}

class _LabReportDetailScreenState extends State<LabReportDetailScreen> {
  LabReport? _report;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final report =
          await context.read<LabProvider>().loadDetail(widget.reportId);
      setState(() => _report = report);
    } on ApiException catch (e) {
      setState(() => _error = e.displayMessage);
    } catch (e) {
      setState(() => _error = 'Failed to load report: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Report'),
        actions: [
          if (_report != null)
            IconButton(
              tooltip: 'Download PDF',
              icon: const Icon(Icons.download_outlined),
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'PDF download depends on backend file storage — not '
                    'wired up in this demo build.',
                  ),
                ),
              ),
            ),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildBody(_report!),
    );
  }

  Widget _buildBody(LabReport report) {
    final items = report.labOrder?.items ?? const [];
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                report.reportTitle,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
              ),
            ),
            StatusBadge.fromStatus(
              report.isVerified ? 'verified' : report.status,
              StatusColors.forLabStatus(
                  report.isVerified ? 'verified' : report.status),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          '${report.reportCode} • ${Formatters.date(report.reportDate)}',
          style: const TextStyle(color: Color(0xFF64748B)),
        ),
        if (items.isNotEmpty) ...[
          const SizedBox(height: 20),
          const Text('Test results',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          const SizedBox(height: 10),
          Card(
            child: Column(
              children: items
                  .map((item) => _ResultRow(item: item))
                  .toList(),
            ),
          ),
        ],
        if (report.clinicalInterpretation != null &&
            report.clinicalInterpretation!.isNotEmpty) ...[
          const SizedBox(height: 20),
          _NoteCard(
            title: 'Clinical interpretation',
            body: report.clinicalInterpretation!,
            icon: Icons.psychology_outlined,
          ),
        ],
        if (report.recommendation != null &&
            report.recommendation!.isNotEmpty) ...[
          const SizedBox(height: 12),
          _NoteCard(
            title: 'Recommendation',
            body: report.recommendation!,
            icon: Icons.tips_and_updates_outlined,
          ),
        ],
      ],
    );
  }
}

class _ResultRow extends StatelessWidget {
  const _ResultRow({required this.item});

  final LabOrderItem item;

  @override
  Widget build(BuildContext context) {
    final valueText = item.result != null
        ? '${item.result} ${item.unit ?? ''}'
        : (item.resultText ?? 'Pending');
    final rangeText = (item.rangeLow != null && item.rangeHigh != null)
        ? 'Ref: ${item.rangeLow}–${item.rangeHigh} ${item.unit ?? ''}'
        : null;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(item.testName,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  valueText.trim(),
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: item.isAbnormal ? AppTheme.danger : Colors.black87,
                  ),
                ),
                if (rangeText != null)
                  Text(rangeText,
                      style: const TextStyle(
                          fontSize: 11, color: Color(0xFF94A3B8))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NoteCard extends StatelessWidget {
  const _NoteCard({required this.title, required this.body, required this.icon});

  final String title;
  final String body;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: AppTheme.accent),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 8),
            Text(body),
          ],
        ),
      ),
    );
  }
}
