import 'package:flutter/material.dart';

import '../lab/lab_reports_tab.dart';
import '../prescriptions/prescriptions_tab.dart';

/// Combines Prescriptions and Lab/Radiology reports under one "Records"
/// bottom-nav tab with an internal TabBar — both are read-mostly patient
/// history views, so they share a home instead of each claiming a full
/// bottom-nav slot.
class RecordsScreen extends StatelessWidget {
  const RecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Health Records'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Prescriptions'),
              Tab(text: 'Lab & Radiology'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            PrescriptionsTab(),
            LabReportsTab(),
          ],
        ),
      ),
    );
  }
}
