import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final NumberFormat _currency = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹', // ₹ — the spec's GST/billing examples are INR-based
    decimalDigits: 2,
  );

  static String currency(num value) => _currency.format(value);

  static String date(DateTime? date) {
    if (date == null) return '—';
    return DateFormat('d MMM yyyy').format(date);
  }

  static String dateLong(DateTime? date) {
    if (date == null) return '—';
    return DateFormat('EEEE, d MMMM yyyy').format(date);
  }

  /// Accepts 'HH:mm' or 'HH:mm:ss' and renders '9:30 AM'.
  static String time(String? raw) {
    if (raw == null || raw.isEmpty) return '—';
    final parts = raw.split(':');
    if (parts.length < 2) return raw;
    final hour = int.tryParse(parts[0]) ?? 0;
    final minute = int.tryParse(parts[1]) ?? 0;
    final dt = DateTime(2000, 1, 1, hour, minute);
    return DateFormat('h:mm a').format(dt);
  }

  static String dateTime(DateTime? dt) {
    if (dt == null) return '—';
    return DateFormat('d MMM yyyy, h:mm a').format(dt);
  }

  static String titleCase(String? value) {
    if (value == null || value.isEmpty) return '—';
    return value
        .split(RegExp(r'[_\s]+'))
        .where((w) => w.isNotEmpty)
        .map((w) => w[0].toUpperCase() + w.substring(1))
        .join(' ');
  }
}
