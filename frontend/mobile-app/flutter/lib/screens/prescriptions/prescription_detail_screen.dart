import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/prescription.dart';
import '../../providers/prescription_provider.dart';
import '../../services/api_client.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';

class PrescriptionDetailScreen extends StatefulWidget {
  const PrescriptionDetailScreen({super.key, required this.prescriptionId});

  final int prescriptionId;

  @override
  State<PrescriptionDetailScreen> createState() =>
      _PrescriptionDetailScreenState();
}

class _PrescriptionDetailScreenState extends State<PrescriptionDetailScreen> {
  Prescription? _prescription;
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
      final rx = await context
          .read<PrescriptionProvider>()
          .loadDetail(widget.prescriptionId);
      setState(() => _prescription = rx);
    } on ApiException catch (e) {
      setState(() => _error = e.displayMessage);
    } catch (e) {
      setState(() => _error = 'Failed to load prescription: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Prescription')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildBody(_prescription!),
    );
  }

  Widget _buildBody(Prescription rx) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          rx.prescriptionCode,
          style: const TextStyle(
              fontFamily: 'monospace', color: Color(0xFF64748B), fontSize: 12),
        ),
        const SizedBox(height: 6),
        Text(
          rx.diagnosis?.isNotEmpty == true ? rx.diagnosis! : 'Prescription',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          '${rx.doctorName ?? 'Doctor'} • ${Formatters.date(rx.prescriptionDate)}',
          style: const TextStyle(color: Color(0xFF64748B)),
        ),
        if (rx.notes != null && rx.notes!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Notes', style: TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(rx.notes!),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 20),
        const Text('Medicines', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
        const SizedBox(height: 10),
        ...rx.items.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.medication_liquid_outlined,
                            size: 18, color: AppTheme.accent),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.medicineName,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        Text('x${item.quantity}',
                            style: const TextStyle(color: Color(0xFF64748B))),
                      ],
                    ),
                    if ([item.dosage, item.frequency, item.duration]
                        .any((s) => s != null && s.isNotEmpty)) ...[
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 12,
                        runSpacing: 4,
                        children: [
                          if (item.dosage != null && item.dosage!.isNotEmpty)
                            _chip('Dosage', item.dosage!),
                          if (item.frequency != null && item.frequency!.isNotEmpty)
                            _chip('Frequency', item.frequency!),
                          if (item.duration != null && item.duration!.isNotEmpty)
                            _chip('Duration', item.duration!),
                        ],
                      ),
                    ],
                    if (item.instructions != null &&
                        item.instructions!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        item.instructions!,
                        style: const TextStyle(
                            fontSize: 12.5,
                            fontStyle: FontStyle.italic,
                            color: Color(0xFF64748B)),
                      ),
                    ],
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Widget _chip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text('$label: $value', style: const TextStyle(fontSize: 11.5)),
    );
  }
}
