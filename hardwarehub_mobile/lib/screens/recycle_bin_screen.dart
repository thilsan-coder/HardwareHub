import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import '../models/stock_movement_model.dart';
import '../services/app_event_bus.dart';
import '../services/product_service.dart';
import '../services/stock_movement_service.dart';
import '../widgets/status_badge.dart';

class RecycleBinScreen extends StatefulWidget {
  const RecycleBinScreen({super.key});

  @override
  State<RecycleBinScreen> createState() => _RecycleBinScreenState();
}

class _RecycleBinScreenState extends State<RecycleBinScreen> with SingleTickerProviderStateMixin, AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  late TabController _tabController;
  final ProductService _productService = ProductService();
  final StockMovementService _movementService = StockMovementService();
  final TextEditingController _searchController = TextEditingController();

  List<ProductModel> _deletedProducts = [];
  List<StockMovementModel> _deletedMovements = [];
  bool _isLoading = true;
  String _searchQuery = '';
  int? _actioningId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadAllRecycleData();
    AppEventBus().onDataMutated.addListener(_onDataMutated);
  }

  @override
  void dispose() {
    AppEventBus().onDataMutated.removeListener(_onDataMutated);
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onDataMutated() {
    if (mounted) {
      _loadAllRecycleData();
    }
  }

  Future<void> _loadAllRecycleData() async {
    if (_deletedProducts.isEmpty && _deletedMovements.isEmpty) {
      setState(() => _isLoading = true);
    }
    try {
      final results = await Future.wait([
        _productService.getRecycleBinProducts(search: _searchQuery),
        _movementService.getRecycleBinStockMovements(search: _searchQuery),
      ]);
      if (mounted) {
        setState(() {
          _deletedProducts = results[0] as List<ProductModel>;
          _deletedMovements = results[1] as List<StockMovementModel>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _restoreProduct(ProductModel p) async {
    setState(() => _actioningId = p.id);
    final res = await _productService.restoreProduct(p.id);
    if (mounted) {
      setState(() => _actioningId = null);
      if (res.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Product "${p.name}" restored'), backgroundColor: AppTheme.success),
        );
        _loadAllRecycleData();
      }
    }
  }

  void _forceDeleteProduct(ProductModel p) async {
    setState(() => _actioningId = p.id);
    final res = await _productService.forceDeleteProduct(p.id);
    if (mounted) {
      setState(() => _actioningId = null);
      if (res.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Product "${p.name}" permanently purged'), backgroundColor: AppTheme.slate900),
        );
        _loadAllRecycleData();
      }
    }
  }

  void _restoreMovement(StockMovementModel m) async {
    setState(() => _actioningId = m.id);
    final res = await _movementService.restoreStockMovement(m.id);
    if (mounted) {
      setState(() => _actioningId = null);
      if (res.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Movement record restored'), backgroundColor: AppTheme.success),
        );
        _loadAllRecycleData();
      }
    }
  }

  void _forceDeleteMovement(StockMovementModel m) async {
    setState(() => _actioningId = m.id);
    final res = await _movementService.forceDeleteStockMovement(m.id);
    if (mounted) {
      setState(() => _actioningId = null);
      if (res.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Movement record permanently purged'), backgroundColor: AppTheme.slate900),
        );
        _loadAllRecycleData();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      body: Column(
        children: [
          // Dual Tab Selector matching Web UI
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              labelColor: AppTheme.primary,
              unselectedLabelColor: AppTheme.slate500,
              indicatorColor: AppTheme.primary,
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
              tabs: [
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.inventory_2_outlined, size: 16),
                      const SizedBox(width: 8),
                      Text('Products (${_deletedProducts.length})'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.history_rounded, size: 16),
                      const SizedBox(width: 8),
                      Text('Movements (${_deletedMovements.length})'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Search Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                _searchQuery = val;
                _loadAllRecycleData();
              },
              decoration: InputDecoration(
                hintText: 'Search archived records...',
                prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.slate400, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _searchQuery = '';
                          _loadAllRecycleData();
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppTheme.slate50,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
            ),
          ),

          // Tab Views
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      // Products Tab
                      _deletedProducts.isEmpty
                          ? _buildEmptyState('No Deleted Products in Bin')
                          : RefreshIndicator(
                              onRefresh: _loadAllRecycleData,
                              child: ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _deletedProducts.length,
                                itemBuilder: (context, idx) {
                                  final p = _deletedProducts[idx];
                                  final isBusy = _actioningId == p.id;
                                  return _buildProductArchiveCard(p, isBusy);
                                },
                              ),
                            ),

                      // Movements Tab
                      _deletedMovements.isEmpty
                          ? _buildEmptyState('No Deleted Movements in Bin')
                          : RefreshIndicator(
                              onRefresh: _loadAllRecycleData,
                              child: ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _deletedMovements.length,
                                itemBuilder: (context, idx) {
                                  final m = _deletedMovements[idx];
                                  final isBusy = _actioningId == m.id;
                                  return _buildMovementArchiveCard(m, isBusy);
                                },
                              ),
                            ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductArchiveCard(ProductModel p, bool isBusy) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              StatusBadge(status: p.category, isCategory: true),
              Text(
                p.deletedAtHuman != null ? 'Deleted ${p.deletedAtHuman}' : 'Archived',
                style: const TextStyle(fontSize: 11, color: AppTheme.slate400),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(p.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.slate900)),
          const SizedBox(height: 4),
          Text('SKU: ${p.sku} | \$${p.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, color: AppTheme.slate600)),
          const SizedBox(height: 12),
          if (isBusy)
            const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)))
          else
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _restoreProduct(p),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.success,
                      side: const BorderSide(color: AppTheme.success),
                    ),
                    icon: const Icon(Icons.restore_from_trash_rounded, size: 16),
                    label: const Text('Restore'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _forceDeleteProduct(p),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.danger,
                      side: const BorderSide(color: AppTheme.danger),
                    ),
                    icon: const Icon(Icons.delete_forever_rounded, size: 16),
                    label: const Text('Purge'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildMovementArchiveCard(StockMovementModel m, bool isBusy) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(m.type.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primary)),
              Text(m.createdAt, style: const TextStyle(fontSize: 11, color: AppTheme.slate400)),
            ],
          ),
          const SizedBox(height: 8),
          Text(m.product?.name ?? 'Unknown SKU', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.slate900)),
          const SizedBox(height: 4),
          Text('${m.quantityChanged} units | Reason: ${m.reason}', style: const TextStyle(fontSize: 12, color: AppTheme.slate600)),
          const SizedBox(height: 12),
          if (isBusy)
            const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)))
          else
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _restoreMovement(m),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.success,
                      side: const BorderSide(color: AppTheme.success),
                    ),
                    icon: const Icon(Icons.restore_from_trash_rounded, size: 16),
                    label: const Text('Restore'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _forceDeleteMovement(m),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.danger,
                      side: const BorderSide(color: AppTheme.danger),
                    ),
                    icon: const Icon(Icons.delete_forever_rounded, size: 16),
                    label: const Text('Purge'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String msg) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.delete_outline_rounded, size: 48, color: AppTheme.slate400),
          const SizedBox(height: 12),
          Text(msg, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppTheme.slate800)),
          const SizedBox(height: 4),
          const Text('Soft-deleted records will appear here for recovery.', style: TextStyle(color: AppTheme.slate500, fontSize: 12)),
        ],
      ),
    );
  }
}
