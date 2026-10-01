import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/dashboard_stats_model.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/product_service.dart';
import '../widgets/metric_card.dart';
import 'login_screen.dart';
import 'product_form_screen.dart';
import 'product_list_screen.dart';
import 'recycle_bin_screen.dart';
import 'stock_movement_form_screen.dart';
import 'stock_movements_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _currentBottomNavIndex = 0;
  DashboardStatsModel? _stats;
  UserModel? _user;
  bool _isLoading = true;
  String _currentTime = '';
  Timer? _clockTimer;

  @override
  void initState() {
    super.initState();
    _updateClock();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) => _updateClock());
    _loadDashboardData();
  }

  void _updateClock() {
    if (mounted) {
      setState(() {
        _currentTime = DateFormat('hh:mm:ss a').format(DateTime.now());
      });
    }
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    final user = await AuthService().fetchCurrentUser();
    final stats = await ProductService().getDashboardSummary();

    if (mounted) {
      setState(() {
        _user = user;
        _stats = stats;
        _isLoading = false;
      });
    }
  }

  void _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
        content: const Text('Are you sure you want to log out from HardwareHub?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.slate600)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await AuthService().logout();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }

  Widget _buildDashboardTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }

    final stats = _stats ??
        DashboardStatsModel(
          totalProducts: 0,
          activeProducts: 0,
          healthyStockCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalInventoryValue: 0.0,
        );

    final total = stats.totalProducts > 0 ? stats.totalProducts : 1;
    final healthyPercent = ((stats.healthyStockCount / total) * 100).clamp(0, 100).toInt();
    final lowPercent = ((stats.lowStockCount / total) * 100).clamp(0, 100).toInt();
    final outPercent = ((stats.outOfStockCount / total) * 100).clamp(0, 100).toInt();

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      color: AppTheme.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Workspace Banner matching Web App
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppTheme.headerGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x15000000),
                    blurRadius: 16,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(25),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome, ${_user?.name ?? 'Admin'}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Hardware Store Live Control',
                              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.success.withAlpha(40),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppTheme.success.withAlpha(120)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            CircleAvatar(radius: 3, backgroundColor: AppTheme.success),
                            SizedBox(width: 4),
                            Text('LIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.success)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Divider(color: Color(0x22FFFFFF), height: 1),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Server Time: $_currentTime',
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Color(0xFFCBD5E1)),
                      ),
                      Text(
                        'Total SKUs: ${stats.totalProducts}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFCBD5E1)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Low Stock Alert Banner (if any)
            if (stats.lowStockCount > 0 || stats.outOfStockCount > 0) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.warningBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.warningBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Color(0xFFB45309), size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Stock Replenishment Required',
                            style: TextStyle(
                              color: Color(0xFF9A3412),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            '${stats.lowStockCount} items below threshold, ${stats.outOfStockCount} items out of stock.',
                            style: const TextStyle(color: Color(0xFFB45309), fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4 Stat Cards
            const Text(
              'INVENTORY METRICS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppTheme.slate500),
            ),
            const SizedBox(height: 10),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.35,
              children: [
                MetricCard(
                  title: 'Total Products',
                  value: '${stats.totalProducts}',
                  icon: Icons.inventory_2_outlined,
                  iconColor: AppTheme.primary,
                  subtitle: '${stats.activeProducts} Active SKUs',
                ),
                MetricCard(
                  title: 'Total Valuation',
                  value: '\$${stats.totalInventoryValue.toStringAsFixed(2)}',
                  icon: Icons.attach_money_rounded,
                  iconColor: AppTheme.success,
                  subtitle: 'Current Store Assets',
                ),
                MetricCard(
                  title: 'Healthy Stock',
                  value: '${stats.healthyStockCount}',
                  icon: Icons.check_circle_outline_rounded,
                  iconColor: AppTheme.success,
                  subtitle: '$healthyPercent% Optimal Levels',
                ),
                MetricCard(
                  title: 'Low / Out Stock',
                  value: '${stats.lowStockCount + stats.outOfStockCount}',
                  icon: Icons.warning_amber_rounded,
                  iconColor: stats.lowStockCount > 0 ? AppTheme.warning : AppTheme.slate400,
                  subtitle: '${stats.outOfStockCount} Out of Stock',
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Inventory Health Distribution Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.slate200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'INVENTORY HEALTH BREAKDOWN',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppTheme.slate600),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Row(
                      children: [
                        if (healthyPercent > 0)
                          Expanded(
                            flex: healthyPercent,
                            child: Container(height: 8, color: AppTheme.success),
                          ),
                        if (lowPercent > 0)
                          Expanded(
                            flex: lowPercent,
                            child: Container(height: 8, color: AppTheme.warning),
                          ),
                        if (outPercent > 0)
                          Expanded(
                            flex: outPercent,
                            child: Container(height: 8, color: AppTheme.danger),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildHealthLegend('Healthy ($healthyPercent%)', AppTheme.success),
                      _buildHealthLegend('Low ($lowPercent%)', AppTheme.warning),
                      _buildHealthLegend('Out ($outPercent%)', AppTheme.danger),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick Actions
            const Text(
              'QUICK SHORTCUTS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppTheme.slate500),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: _buildActionTile(
                    title: 'New Product',
                    subtitle: 'Add catalog SKU',
                    icon: Icons.add_box_rounded,
                    color: AppTheme.primary,
                    onTap: () async {
                      final added = await Navigator.push<bool>(
                        context,
                        MaterialPageRoute(builder: (_) => const ProductFormScreen()),
                      );
                      if (added == true) _loadDashboardData();
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildActionTile(
                    title: 'Log Movement',
                    subtitle: 'Audit stock change',
                    icon: Icons.swap_horiz_rounded,
                    color: AppTheme.success,
                    onTap: () async {
                      final added = await Navigator.push<bool>(
                        context,
                        MaterialPageRoute(builder: (_) => const StockMovementFormScreen()),
                      );
                      if (added == true) _loadDashboardData();
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthLegend(String label, Color color) {
    return Row(
      children: [
        CircleAvatar(radius: 4, backgroundColor: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.slate600)),
      ],
    );
  }

  Widget _buildActionTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.slate200),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withAlpha(25),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.slate900)),
                      Text(subtitle, style: const TextStyle(fontSize: 10, color: AppTheme.slate500)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildDashboardTab(),
      const ProductListScreen(),
      const StockMovementsScreen(),
      const RecycleBinScreen(),
    ];

    final titles = [
      'Dashboard & KPIs',
      'Products Inventory',
      'Stock Ledger Audit',
      'Recycle Bin Archive',
    ];

    return Scaffold(
      backgroundColor: AppTheme.slate50,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.inventory_2_rounded, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 10),
            Text(titles[_currentBottomNavIndex]),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _currentTime,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.white),
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, size: 18),
            tooltip: 'Sign Out',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: pages[_currentBottomNavIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppTheme.slate200, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _currentBottomNavIndex,
          onDestinationSelected: (idx) {
            setState(() => _currentBottomNavIndex = idx);
          },
          backgroundColor: Colors.white,
          indicatorColor: AppTheme.primaryLight,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded, color: AppTheme.primary),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.inventory_2_outlined),
              selectedIcon: Icon(Icons.inventory_2_rounded, color: AppTheme.primary),
              label: 'Products',
            ),
            NavigationDestination(
              icon: Icon(Icons.history_rounded),
              selectedIcon: Icon(Icons.history_rounded, color: AppTheme.primary),
              label: 'Stock Ledger',
            ),
            NavigationDestination(
              icon: Icon(Icons.delete_outline_rounded),
              selectedIcon: Icon(Icons.delete_rounded, color: AppTheme.primary),
              label: 'Recycle Bin',
            ),
          ],
        ),
      ),
    );
  }
}
