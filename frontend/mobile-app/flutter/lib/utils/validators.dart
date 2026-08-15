class Validators {
  Validators._();

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final pattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!pattern.hasMatch(value.trim())) return 'Enter a valid email address';
    return null;
  }

  static String? required(String? value, {String label = 'This field'}) {
    if (value == null || value.trim().isEmpty) return '$label is required';
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }
}
