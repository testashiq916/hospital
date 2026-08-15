import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/api_config.dart';
import 'config/theme.dart';
import 'providers/appointment_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/billing_provider.dart';
import 'providers/lab_provider.dart';
import 'providers/prescription_provider.dart';
import 'screens/splash_screen.dart';
import 'services/storage_service.dart';

/// Root widget: wires up the provider tree and (once a persisted API base
/// URL is loaded) shows [SplashScreen], which decides Login vs Home.
///
/// Provider layering: [AuthProvider] owns the single [ApiClient] instance
/// (and thus the auth token). The domain providers below it are created
/// with `ChangeNotifierProxyProvider` so they always share that same
/// client — one Dio instance, one interceptor, one 401 handler for the
/// whole app.
class HmsPatientApp extends StatefulWidget {
  const HmsPatientApp({super.key});

  @override
  State<HmsPatientApp> createState() => _HmsPatientAppState();
}

class _HmsPatientAppState extends State<HmsPatientApp> {
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _restoreBaseUrl();
  }

  Future<void> _restoreBaseUrl() async {
    final saved = await StorageService().readBaseUrl();
    if (saved != null && saved.isNotEmpty) {
      ApiConfig.setBaseUrl(saved);
    }
    setState(() => _ready = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProxyProvider<AuthProvider, AppointmentProvider>(
          create: (ctx) =>
              AppointmentProvider(ctx.read<AuthProvider>().client),
          update: (ctx, auth, previous) =>
              previous ?? AppointmentProvider(auth.client),
        ),
        ChangeNotifierProxyProvider<AuthProvider, PrescriptionProvider>(
          create: (ctx) =>
              PrescriptionProvider(ctx.read<AuthProvider>().client),
          update: (ctx, auth, previous) =>
              previous ?? PrescriptionProvider(auth.client),
        ),
        ChangeNotifierProxyProvider<AuthProvider, LabProvider>(
          create: (ctx) => LabProvider(ctx.read<AuthProvider>().client),
          update: (ctx, auth, previous) => previous ?? LabProvider(auth.client),
        ),
        ChangeNotifierProxyProvider<AuthProvider, BillingProvider>(
          create: (ctx) => BillingProvider(ctx.read<AuthProvider>().client),
          update: (ctx, auth, previous) =>
              previous ?? BillingProvider(auth.client),
        ),
      ],
      child: MaterialApp(
        title: 'HMS Patient',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        themeMode: ThemeMode.light,
        home: const SplashScreen(),
      ),
    );
  }
}
