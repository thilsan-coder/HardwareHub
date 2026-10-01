import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/stock_movement_model.dart';
import '../services/stock_movement_service.dart';
import '../widgets/stock_movement_card.dart';
import 'stock_movement_form_screen.dart';

class StockMovementsScreen extends StatefulWidget {
  const StockMovementsScreen({super.key});

  @override
  State<StockMovementsScreen> createState() => _StockMovementsScreenState();
}

class _StockMovementsScreenState extends State<StockMovementsScreen> {
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
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMovements() async {
    setState(() => _isLoading = true);
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load stock ledger: $e'),
            backgroundColor: AppTheme.danger,
          ),
        );
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
      _loadMovements();
    }
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
            const SizedBox(height: 16),
            _buildDetailRow('Product', m.product?.name ?? 'Unknown'),
            _buildDetailRow('SKU', m.product?.sku ?? 'N/A'),
            _buildDetailRow('Movement Type', m.type.toUpperCase()),
            _buildDetailRow('Units Shifted', '${m.quantityChanged} units'),
            _buildDetailRow('Stock Before', '${m.previousStock} units'),
            _buildDetailRow('Stock After', '${m.newStock} units'),
            _buildDetailRow('Recorded By', m.userName ?? 'Admin'),
            _buildDetailRow('Timestamp', m.createdAt),
            _buildDetailRow('Reason / Memo', m.reason),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Close'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
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
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToCreate,
        backgroundColor: AppTheme.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Log Movement', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
      ),
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

          // Count summary
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              color: AppTheme.slate100,
              border: Border(bottom: BorderSide(color: AppTheme.slate200)),
            ),
            child: Row(
              children: [
                Text(
                  '${_movements.length} logged stock movement${_movements.length == 1 ? '' : 's'}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.slate600),
                ),
              ],
            ),
          ),

          // List View
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
                            Text('Use the "Log Movement" button to record stock additions/deductions.', style: TextStyle(color: AppTheme.slate500, fontSize: 12)),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadMovements,
                        color: AppTheme.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 80),
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
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          setState(() => _selectedType = label);
          _loadMovements();
        },
        selectedColor: AppTheme.primary.withAlpha(35),
        checkmarkColor: AppTheme.primary,
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          color: isSelected ? AppTheme.primary : AppTheme.slate700,
        ),
        backgroundColor: AppTheme.slate100,
        side: BorderSide(color: isSelected ? AppTheme.primary : Colors.transparent),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
