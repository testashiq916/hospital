import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../models/bill.dart';
import '../../providers/billing_provider.dart';
import '../../services/api_client.dart';
import '../../utils/formatters.dart';

/// Simulated "Pay Now" sheet.
///
/// There is no real payment gateway integration here (no Stripe/Razorpay
/// SDK, no card tokenization) — per the task brief this directly calls
/// `POST /api/v1/payments` the same way a front-desk cashier's screen
/// would after a gateway confirms a charge. The card-style form and the
/// short "processing" delay below exist purely to give the flow a realistic
/// shape; no card number is transmitted, validated by a network call, or
/// stored anywhere. Cash/UPI skip the fake card form entirely.
class PayNowSheet extends StatefulWidget {
  const PayNowSheet({super.key, required this.bill});

  final HospitalBill bill;

  @override
  State<PayNowSheet> createState() => _PayNowSheetState();
}

class _PayNowSheetState extends State<PayNowSheet> {
  String _method = 'card';
  bool _processing = false;
  String? _error;

  final _cardNumberController =
      TextEditingController(text: '4242 4242 4242 4242');
  final _cardExpiryController = TextEditingController(text: '12/28');
  final _cardCvvController = TextEditingController(text: '123');

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    super.dispose();
  }

  Future<void> _confirmPayment() async {
    setState(() {
      _processing = true;
      _error = null;
    });
    try {
      // Simulated gateway round-trip — see class doc.
      await Future.delayed(const Duration(milliseconds: 1200));
      await context.read<BillingProvider>().pay(
            billId: widget.bill.id,
            amount: widget.bill.balanceAmount,
            paymentMethod: _method,
            notes: 'Paid via HMS Patient app (simulated gateway)',
          );
      if (!mounted) return;
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment successful.')),
      );
    } on ApiException catch (e) {
      setState(() => _error = e.displayMessage);
    } catch (e) {
      setState(() => _error = 'Payment failed: $e');
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Pay Now',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
          const SizedBox(height: 4),
          Text(
            'Amount due: ${Formatters.currency(widget.bill.balanceAmount)}',
            style: const TextStyle(color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 16),
          _MethodPicker(
            selected: _method,
            onChanged: (m) => setState(() => _method = m),
          ),
          const SizedBox(height: 16),
          if (_method == 'card') ...[
            TextField(
              controller: _cardNumberController,
              decoration: const InputDecoration(labelText: 'Card number'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _cardExpiryController,
                    decoration: const InputDecoration(labelText: 'MM/YY'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _cardCvvController,
                    decoration: const InputDecoration(labelText: 'CVV'),
                    obscureText: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Demo only — this card form is not connected to a real '
              'payment gateway.',
              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
          ] else if (_method == 'upi') ...[
            const Center(
              child: Icon(Icons.qr_code_2_rounded, size: 96, color: Color(0xFFCBD5E1)),
            ),
            const Center(
              child: Text('Scan to pay (simulated)',
                  style: TextStyle(color: Color(0xFF64748B))),
            ),
          ] else ...[
            const Text(
              'Pay at the hospital billing counter, or confirm below to '
              'record a cash payment.',
              style: TextStyle(color: Color(0xFF64748B)),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.danger, fontSize: 13)),
          ],
          const SizedBox(height: 18),
          ElevatedButton(
            onPressed: _processing ? null : _confirmPayment,
            child: _processing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.4,
                      valueColor: AlwaysStoppedAnimation(Colors.white),
                    ),
                  )
                : Text('Confirm payment of '
                    '${Formatters.currency(widget.bill.balanceAmount)}'),
          ),
        ],
      ),
    );
  }
}

class _MethodPicker extends StatelessWidget {
  const _MethodPicker({required this.selected, required this.onChanged});

  final String selected;
  final void Function(String) onChanged;

  static const _options = [
    (value: 'card', label: 'Card', icon: Icons.credit_card),
    (value: 'upi', label: 'UPI', icon: Icons.qr_code_rounded),
    (value: 'cash', label: 'Cash', icon: Icons.payments_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      children: _options.map((o) {
        final isSelected = o.value == selected;
        return ChoiceChip(
          label: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(o.icon, size: 16),
              const SizedBox(width: 6),
              Text(o.label),
            ],
          ),
          selected: isSelected,
          onSelected: (_) => onChanged(o.value),
        );
      }).toList(),
    );
  }
}
