import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/passport/view_models/passport_view_model.dart';
import 'features/passport/views/passport_view.dart';
import 'features/radar/view_models/radar_view_model.dart';
import 'features/radar/views/radar_view.dart';
import 'features/scanner/view_models/scanner_view_model.dart';
import 'features/scanner/views/scanner_view.dart';

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final radarVM = context.watch<RadarViewModel>();
    final passportVM = context.watch<PassportViewModel>();
    final scannerVM = context.watch<ScannerViewModel>();

    final pages = [
      RadarView(
        viewModel: radarVM,
        onSendToScanner: (text) {
          scannerVM.setContractText(text);
          scannerVM.scanContract();
          setState(() => _currentIndex = 2);
        },
      ),
      PassportView(viewModel: passportVM),
      ScannerView(viewModel: scannerVM),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.radar_outlined),
            activeIcon: Icon(Icons.radar),
            label: '레이더',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.badge_outlined),
            activeIcon: Icon(Icons.badge),
            label: '패스포트',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.gavel_outlined),
            activeIcon: Icon(Icons.gavel),
            label: '리스크 진단',
          ),
        ],
      ),
    );
  }
}
