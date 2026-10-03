import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/stock_movement_model.dart';
import '../services/app_event_bus.dart';
import '../services/stock_movement_service.dart';
import '../widgets/stock_movement_card.dart';
import 'stock_movement_form_screen.dart';

class StockMovementsScreen extends StatefulWidget {
  const StockMovementsScreen({super.key});

  @override
  State<StockMovementsScreen> createState() => _StockMovementsScreenState();
}

class _StockMovementsScreenState extends State<StockMovementsScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final StockMovementService _movementService = StockMovementService();
  final TextEditingController _searchController = TextEditingController();

  List<StockMovementModel> _movements = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedType = 'All';

  @override
  void initState() {
    super.initState();
    _loadMovements();
    AppEventBus().onDataMutated.addListener(_onDataMutated);
  }

  @override
  void dispose() {
    AppEventBus().onDataMutated.removeListener(_onDataMutated);
    _searchController.dispose();
    super.dispose();
  }

  void _onDataMutated() {
    if (mounted) {
      _loadMovements(forceRefresh: true);
    }
  }

  Future<void> _loadMovements({bool forceRefresh = false}) async {
    if (_movements.isEmpty || forceRefresh) {
      setState(() => _isLoading = true);
    }
    try {
      final items = await _movementService.getStockMovements(
        search: _searchQuery.isEmpty ? null : _searchQuery,
        type: _selectedType == 'All' ? null : _selectedType,
      );
      if (mounted) {
        setState(() {
          _movements = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _onSearchChanged(String val) {
    _searchQuery = val;
    _loadMovements();
  }

  void _navigateToCreate() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const StockMovementFormScreen(),
      ),
    );
    if (result == true) {
      _loadMovements(forceRefresh: true);
    }
  }

  void _navigateToEdit(StockMovementModel m) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => StockMovementFormScreen(movement: m),
      ),
    );
    if (result == true) {
      _loadMovements(forceRefresh: true);
    }
  }

  void _confirmDeleteMovement(StockMovementModel m) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.delete_sweep_rounded, color: AppTheme.danger, size: 22),
            SizedBox(width: 8),
            Text('Move to Recycle Bin?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.slate900)),
          ],
        ),
        content: Text(
          'Voiding this "${m.type.toUpperCase()}" movement will safely move it to the Recycle Bin and automatically revert the product stock balance. Proceed?',
          style: const TextStyle(fontSize: 13, color: AppTheme.slate600, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.slate600)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              final res = await _movementService.deleteStockMovement(m.id);
              if (mounted) {
                if (res.success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Stock movement moved to Recycle Bin & balance reverted'), backgroundColor: AppTheme.success),
                  );
                  _loadMovements();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(res.message ?? 'Failed to delete movement'), backgroundColor: AppTheme.danger),
                  );
                }
              }
            },
            child: const Text('Void & Move to Bin'),
          ),
        ],
      ),
    );
  }

  void _showDetailModal(StockMovementModel m) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Movement Audit Details',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.slate900),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20, color: AppTheme.slate400),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _buildDetailRow('Product', m.product?.name ?? 'Unknown'),
            _buildDetailRow('SKU', m.product?.sku ?? 'N/A'),
            _buildDetailRow('Movement Type', m.type.toUpperCase()),
            _buildDetailRow('Units Shifted', '${m.quantityChanged} units'),
            _buildDetailRow('Stock Before', '${m.previousStock} units'),
            _buildDetailRow('Stock After', '${m.newStock} units'),
            _buildDetailRow('Recorded By', m.userName ?? 'Admin'),
            _buildDetailRow('Timestamp', m.createdAt),
            _buildDetailRow('Reason / Memo', m.reason),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _navigateToEdit(m);
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppTheme.primary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.edit_rounded, size: 18, color: AppTheme.primary),
                    label: const Text('Edit Movement', style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primary)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(ctx);
                      _confirmDeleteMovement(m);
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: const BorderSide(color: AppTheme.danger),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppTheme.danger),
                    label: const Text('Move to Bin', style: TextStyle(fontWeight: FontWeight.w700, color: AppTheme.danger)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.slate500, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontSize: 13, color: AppTheme.slate900, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      body: Column(
        children: [
          // Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search movement reason, SKU, product...',
                    prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.slate400, size: 20),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppTheme.slate50,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildTypeChip('All'),
                      _buildTypeChip('In'),
                      _buildTypeChip('Out'),
                      _buildTypeChip('Adjustment'),
                      _buildTypeChip('Damage'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Count summary with sleek inline "+ Log Movement" button
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: AppTheme.slate100,
              border: Border(
                top: BorderSide(color: AppTheme.slate200, width: 0.8),
                bottom: BorderSide(color: AppTheme.slate200, width: 0.8),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_movements.length} LOGGED MOVEMENT${_movements.length == 1 ? '' : 'S'}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                    color: AppTheme.slate700,
                  ),
                ),
                // Inline + Log Movement Action Pill (Never blocks cards!)
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _navigateToCreate,
                    borderRadius: BorderRadius.circular(20),
                    child: Ink(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primary.withAlpha(70),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.add_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Log Movement',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // List View with clean padding
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _movements.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.history_rounded, size: 48, color: AppTheme.slate400),
                            SizedBox(height: 12),
                            Text('No Stock Movements Recorded', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                            SizedBox(height: 4),
                            Text('Use the "Log Movement" button above to record stock additions/deductions.', style: TextStyle(color: AppTheme.slate500, fontSize: 12)),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadMovements,
                        color: AppTheme.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                          itemCount: _movements.length,
                          itemBuilder: (context, index) {
                            final m = _movements[index];
                            return StockMovementCard(
                              movement: m,
                              onTap: () => _showDetailModal(m),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(String label) {
    final isSelected = _selectedType.toLowerCase() == label.toLowerCase();
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedType = label);
          _loadMovements();
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.slate900 : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppTheme.slate900 : AppTheme.slate200,
              width: 1,
            ),
            boxShadow: isSelected
                ? const [
                    BoxShadow(
                      color: Color(0x18000000),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? Colors.white : AppTheme.slate700,
            ),
          ),
        ),
      ),
    );
  }
}
