import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/billing_provider.dart';
import '../../utils/formatters.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';
import 'bill_detail_screen.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key});

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  bool _loadedOnce = false;

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
    await context.read<BillingProvider>().load(patientId);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final provider = context.watch<BillingProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Bills & Payments')),
      body: auth.patient == null
          ? const EmptyView(
              message:
                  'Link your patient profile from the Home tab to see your '
                  'bills.',
              icon: Icons.link_off_rounded,
            )
          : _buildBody(provider),
    );
  }

  Widget _buildBody(BillingProvider provider) {
    if (provider.isLoading && provider.bills.isEmpty) {
      return const LoadingView();
    }
    if (provider.error != null && provider.bills.isEmpty) {
      return ErrorView(message: provider.error!, onRetry: _load);
    }
    if (provider.bills.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          children: const [
            SizedBox(height: 80),
            EmptyView(message: 'No bills yet.', icon: Icons.receipt_long_outlined),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SummaryCard(totalOutstanding: provider.totalOutstanding),
          const SizedBox(height: 16),
          ...provider.bills.map(
            (bill) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Card(
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BillDetailScreen(billId: bill.id),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(bill.billCode,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w700, fontSize: 13.5)),
                            StatusBadge.fromStatus(
                              bill.paymentStatus,
                              StatusColors.forPaymentStatus(bill.paymentStatus),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(Formatters.date(bill.billDate),
                            style: const TextStyle(
                                fontSize: 12, color: Color(0xFF64748B))),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total: ${Formatters.currency(bill.totalAmount)}',
                              style: const TextStyle(fontSize: 12.5),
                            ),
                            if (bill.balanceAmount > 0)
                              Text(
                                'Due: ${Formatters.currency(bill.balanceAmount)}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.danger,
                                ),
                              )
                            else
                              const Text(
                                'Fully paid',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.success,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.totalOutstanding});

  final double totalOutstanding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppTheme.primary, AppTheme.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Total outstanding',
              style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 4),
          Text(
            Formatters.currency(totalOutstanding),
            style: const TextStyle(
                color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}
