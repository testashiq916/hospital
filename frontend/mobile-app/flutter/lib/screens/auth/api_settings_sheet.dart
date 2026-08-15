import 'package:flutter/material.dart';

import '../../config/api_config.dart';
import '../../services/storage_service.dart';

/// Lets the user point the app at a different backend (a physical device
/// can't reach `localhost` on the dev machine — see README). Persists the
/// choice so it survives app restarts.
class ApiSettingsSheet extends StatefulWidget {
  const ApiSettingsSheet({super.key});

  @override
  State<ApiSettingsSheet> createState() => _ApiSettingsSheetState();
}

class _ApiSettingsSheetState extends State<ApiSettingsSheet> {
  late final TextEditingController _controller;
  final _storage = StorageService();

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: ApiConfig.baseUrl);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    ApiConfig.setBaseUrl(_controller.text);
    await _storage.saveBaseUrl(ApiConfig.baseUrl);
    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('API base URL set to ${ApiConfig.baseUrl}')),
    );
  }

  void _reset() {
    setState(() => _controller.text = ApiConfig.defaultBaseUrl);
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
          const Text(
            'API base URL',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
          ),
          const SizedBox(height: 6),
          const Text(
            'Android emulator: use 10.0.2.2 instead of localhost.\n'
            'Physical device: use your computer\'s LAN IP address.',
            style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
              labelText: 'Base URL',
              hintText: 'http://localhost:8000/api/v1',
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _reset,
                  child: const Text('Reset to default'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _save,
                  child: const Text('Save'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
