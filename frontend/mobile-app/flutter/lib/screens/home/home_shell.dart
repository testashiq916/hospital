import 'package:flutter/material.dart';

import '../appointments/appointments_screen.dart';
import '../billing/billing_screen.dart';
import '../profile/profile_screen.dart';
import '../records/records_screen.dart';
import 'dashboard_tab.dart';

/// Bottom-nav shell hosting the five main areas of the app. Uses an
/// [IndexedStack] so switching tabs doesn't lose scroll position/state.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  void goTo(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final tabs = [
      DashboardTab(onNavigate: goTo),
      const AppointmentsScreen(),
      const RecordsScreen(),
      const BillingScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: SafeArea(
        top: false,
        child: IndexedStack(index: _index, children: tabs),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: goTo,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_today_outlined),
            selectedIcon: Icon(Icons.calendar_today_rounded),
            label: 'Appointments',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_shared_outlined),
            selectedIcon: Icon(Icons.folder_shared_rounded),
            label: 'Records',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded),
            label: 'Billing',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
