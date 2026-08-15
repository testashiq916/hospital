import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/bill.dart';
import '../../providers/billing_provider.dart';
import '../../services/api_client.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';
import 'pay_now_sheet.dart';

class BillDetailScreen extends StatefulWidget {
  const BillDetailScreen({super.key, required this.billId});

  final int billId;

  @override
  State<BillDetailScreen> createState() => _BillDetailScreenState();
}

class _BillDetailScreenState extends State<BillDetailScreen> {
  HospitalBill? _bill;
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
      final bill = await context.read<BillingProvider>().loadDetail(widget.billId);
      setState(() => _bill = bill);
    } on ApiException catch (e) {
      setState(() => _error = e.displayMessage);
    } catch (e) {
      setState(() => _error = 'Failed to load bill: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _payNow(HospitalBill bill) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => PayNowSheet(bill: bill),
    );
    if (result == true && mounted) {
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bill Details')),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _buildBody(_bill!),
    );
  }

  Widget _buildBody(HospitalBill bill) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(bill.billCode,
                      style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF64748B),
                          fontSize: 12)),
                  StatusBadge.fromStatus(
                    bill.paymentStatus,
                    StatusColors.forPaymentStatus(bill.paymentStatus),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(Formatters.date(bill.billDate),
                  style: const TextStyle(color: Color(0xFF64748B))),
              const SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _amountRow('Total amount', bill.totalAmount),
                      const SizedBox(height: 8),
                      _amountRow('Paid amount', bill.paidAmount),
                      const Divider(height: 24),
                      _amountRow('Balance due', bill.balanceAmount, bold: true),
                    ],
                  ),
                ),
              ),
              if (bill.items.isNotEmpty) ...[
                const SizedBox(height: 20),
                const Text('Charges',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 10),
                Card(
                  child: Column(
                    children: bill.items
                        .map((item) => ListTile(
                              dense: true,
                              title: Text(item.description),
                              subtitle: Text(
                                  '${item.quantity.toStringAsFixed(0)} × '
                                  '${Formatters.currency(item.unitPrice)}'),
                              trailing: Text(Formatters.currency(item.total)),
                            ))
                        .toList(),
                  ),
                ),
              ],
              if (bill.payments.isNotEmpty) ...[
                const SizedBox(height: 20),
                const Text('Payment history',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 10),
                Card(
                  child: Column(
                    children: bill.payments
                        .map((p) => ListTile(
                              dense: true,
                              leading: const Icon(Icons.check_circle_outline,
                                  color: AppTheme.success),
                              title: Text(Formatters.currency(p.amount)),
                              subtitle: Text(
                                  '${Formatters.titleCase(p.paymentMethod)} • '
                                  '${Formatters.date(p.paymentDate)}'),
                              trailing: Text(p.paymentCode,
                                  style: const TextStyle(fontSize: 11)),
                            ))
                        .toList(),
                  ),
                ),
              ],
              const SizedBox(height: 90),
            ],
          ),
        ),
        if (bill.balanceAmount > 0)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _payNow(bill),
                  icon: const Icon(Icons.payments_outlined),
                  label: Text(
                      'Pay ${Formatters.currency(bill.balanceAmount)} now'),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _amountRow(String label, double value, {bool bold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: bold ? 15 : 13,
                fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
                color: bold ? Colors.black87 : const Color(0xFF64748B))),
        Text(
          Formatters.currency(value),
          style: TextStyle(
            fontSize: bold ? 18 : 14,
            fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
            color: bold ? AppTheme.danger : Colors.black87,
          ),
        ),
      ],
    );
  }
}
