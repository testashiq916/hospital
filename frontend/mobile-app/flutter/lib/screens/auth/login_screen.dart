import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/api_config.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../utils/validators.dart';
import '../home/home_shell.dart';
import 'api_settings_sheet.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController =
      TextEditingController(text: 'patient@demo-hms.test');
  final _passwordController = TextEditingController(text: 'Password@123');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    if (!mounted) return;
    if (ok) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeShell()),
      );
    } else if (auth.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 24),
                    Container(
                      width: 64,
                      height: 64,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.local_hospital_rounded,
                        color: AppTheme.primary,
                        size: 32,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Welcome back',
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Sign in to manage your appointments, prescriptions '
                      'and reports.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF64748B),
                          ),
                    ),
                    const SizedBox(height: 28),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: Validators.email,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline_rounded),
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined),
                          onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: Validators.password,
                    ),
                    const SizedBox(height: 22),
                    ElevatedButton(
                      onPressed: auth.isLoading ? null : _submit,
                      child: auth.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.4,
                                valueColor:
                                    AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : const Text('Log In'),
                    ),
                    const SizedBox(height: 20),
                    _DemoCredentialsCard(
                      onUse: (email, password) {
                        _emailController.text = email;
                        _passwordController.text = password;
                      },
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton.icon(
                        icon: const Icon(Icons.settings_ethernet_rounded,
                            size: 18),
                        label: const Text('API connection settings'),
                        onPressed: () => showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          builder: (_) => const ApiSettingsSheet(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DemoCredentialsCard extends StatelessWidget {
  const _DemoCredentialsCard({required this.onUse});

  final void Function(String email, String password) onUse;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.info_outline_rounded,
                    size: 18, color: AppTheme.accent),
                SizedBox(width: 8),
                Text(
                  'Demo login',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Every seeded account uses the password Password@123. '
              'The patient portal account is:',
              style: TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
            ),
            const SizedBox(height: 6),
            InkWell(
              onTap: () => onUse('patient@demo-hms.test', 'Password@123'),
              borderRadius: BorderRadius.circular(8),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: Text(
                  'patient@demo-hms.test',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ),
            Text(
              'API: ${ApiConfig.baseUrl}',
              style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
      ),
    );
  }
}
