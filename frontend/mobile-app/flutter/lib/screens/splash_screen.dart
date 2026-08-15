import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/theme.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'home/home_shell.dart';

/// First screen shown on launch: silently checks for a stored token
/// (via `AuthProvider.bootstrap`, which calls `GET /auth/me` to make sure
/// it's still valid) and routes to Home or Login accordingly.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    final auth = context.read<AuthProvider>();
    await auth.bootstrap();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => auth.status == AuthStatus.authenticated
            ? const HomeShell()
            : const LoginScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.local_hospital_rounded,
                color: AppTheme.primary,
                size: 44,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'HMS Patient',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Your care, in your pocket',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.6,
                valueColor: AlwaysStoppedAnimation(Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
