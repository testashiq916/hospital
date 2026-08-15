import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../utils/formatters.dart';
import '../auth/api_settings_sheet.dart';
import '../auth/login_screen.dart';
import 'health_timeline_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _confirmLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out?'),
        content: const Text('You will need to sign in again to continue.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    await context.read<AuthProvider>().logout();
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final patient = auth.patient;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: AppTheme.primary.withOpacity(0.12),
                child: Text(
                  (user != null && user.name.isNotEmpty)
                      ? user.name[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user?.name ?? '—',
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(user?.email ?? '',
                        style: const TextStyle(color: Color(0xFF64748B))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (patient != null) ...[
            _SectionCard(
              title: 'Patient details',
              children: [
                _infoRow('Patient ID', patient.patientCode),
                _infoRow('Gender', Formatters.titleCase(patient.gender)),
                _infoRow('Date of birth', Formatters.date(patient.dateOfBirth)),
                _infoRow('Blood group', patient.bloodGroup ?? '—'),
                _infoRow('Mobile', patient.mobile ?? '—'),
              ],
            ),
            const SizedBox(height: 16),
            _SectionCard(
              title: 'Emergency contact',
              children: [
                _infoRow('Name', patient.emergencyContactName ?? '—'),
                _infoRow('Phone', patient.emergencyContactPhone ?? '—'),
              ],
            ),
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                leading: const Icon(Icons.timeline_rounded,
                    color: AppTheme.accent),
                title: const Text('Health timeline'),
                subtitle: const Text('Full history of clinical events'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => HealthTimelineScreen(patientId: patient.id),
                  ),
                ),
              ),
            ),
          ] else
            Card(
              color: AppTheme.warning.withOpacity(0.08),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('No linked patient profile',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(
                      auth.patientResolutionError ?? '—',
                      style: const TextStyle(
                          fontSize: 12.5, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: auth.retryPatientResolution,
                      style: TextButton.styleFrom(padding: EdgeInsets.zero),
                      child: const Text('Try again'),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: const Icon(Icons.settings_ethernet_rounded),
              title: const Text('API connection settings'),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (_) => const ApiSettingsSheet(),
              ),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _confirmLogout(context),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.danger,
                side: const BorderSide(color: AppTheme.danger),
              ),
              icon: const Icon(Icons.logout_rounded),
              label: const Text('Log out'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label,
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          ),
          Expanded(
              child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            ...children,
          ],
        ),
      ),
    );
  }
}
