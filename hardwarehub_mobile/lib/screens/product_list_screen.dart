import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../config/theme.dart';
import '../models/product_model.dart';
import '../services/app_event_bus.dart';
import '../services/product_service.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';
import 'product_form_screen.dart';

class ProductListScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialStatus;

  const ProductListScreen({
    super.key,
    this.initialCategory,
    this.initialStatus,
  });

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final ProductService _productService = ProductService();
  final TextEditingController _searchController = TextEditingController();

  List<ProductModel> _products = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedCategory = 'All';
  String _selectedStatus = 'All';

  @override
  void initState() {
    super.initState();
    if (widget.initialCategory != null) {
      _selectedCategory = widget.initialCategory!;
    }
    if (widget.initialStatus != null) {
      _selectedStatus = widget.initialStatus!;
    }
    _loadProducts();
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
      _loadProducts(forceRefresh: true);
    }
  }

  Future<void> _loadProducts({bool forceRefresh = false}) async {
    if (_products.isEmpty || forceRefresh) {
      setState(() => _isLoading = true);
    }
    try {
      final items = await _productService.getProducts(
        search: _searchQuery.isEmpty ? null : _searchQuery,
        category: _selectedCategory == 'All' ? null : _selectedCategory,
        status: _selectedStatus == 'All' ? null : _selectedStatus,
        forceRefresh: forceRefresh,
      );
      if (mounted) {
        setState(() {
          _products = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _onSearchChanged(String value) {
    _searchQuery = value;
    _loadProducts();
  }

  void _navigateToCreate() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const ProductFormScreen(),
      ),
    );
    if (result == true) {
      _loadProducts(forceRefresh: true);
    }
  }

  void _navigateToDetail(ProductModel product) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetailScreen(productId: product.id),
      ),
    );
    if (result == true) {
      _loadProducts(forceRefresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: AppTheme.slate50,
      body: Column(
        children: [
          // Sleek Minimalist Search and Filters Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              children: [
                // Row 1: Unified Search Input + Status Filter Button
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.slate50,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppTheme.slate200),
                        ),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          style: const TextStyle(color: AppTheme.slate900, fontSize: 13, fontWeight: FontWeight.w600),
                          decoration: InputDecoration(
                            hintText: 'Search products by name, SKU...',
                            hintStyle: const TextStyle(color: AppTheme.slate400, fontSize: 13, fontWeight: FontWeight.w500),
                            prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.slate400, size: 18),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.close_rounded, color: AppTheme.slate500, size: 16),
                                    onPressed: () {
                                      _searchController.clear();
                                      _onSearchChanged('');
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            isDense: true,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Quick Status Filter Menu Button
                    PopupMenuButton<String>(
                      initialValue: _selectedStatus,
                      onSelected: (val) {
                        setState(() => _selectedStatus = val);
                        _loadProducts();
                      },
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      color: Colors.white,
                      elevation: 4,
                      itemBuilder: (context) => [
                        _buildStatusMenuItem('All', 'All Statuses', Icons.all_inclusive_rounded),
                        _buildStatusMenuItem('Active', 'Active Only', Icons.check_circle_outline_rounded),
                        _buildStatusMenuItem('Inactive', 'Inactive Only', Icons.pause_circle_outline_rounded),
                      ],
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedStatus == 'All' ? AppTheme.slate50 : AppTheme.primary.withAlpha(25),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _selectedStatus == 'All' ? AppTheme.slate200 : AppTheme.primary,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.tune_rounded,
                              size: 16,
                              color: _selectedStatus == 'All' ? AppTheme.slate700 : AppTheme.primary,
                            ),
                            if (_selectedStatus != 'All') ...[
                              const SizedBox(width: 6),
                              Text(
                                _selectedStatus,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.primary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Row 2: Sleek Horizontal Category Scroll Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  child: Row(
                    children: [
                      _buildCategoryChip('All Categories', _selectedCategory == 'All'),
                      ...AppConstants.categories.map((cat) {
                        return _buildCategoryChip(cat, _selectedCategory == cat);
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Product count summary bar with sleek inline "+ New SKU" button
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
                Row(
                  children: [
                    Text(
                      'SHOWING ${_products.length} PRODUCT${_products.length == 1 ? '' : 'S'}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.6,
                        color: AppTheme.slate700,
                      ),
                    ),
                    if (_selectedCategory != 'All' || _selectedStatus != 'All' || _searchQuery.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategory = 'All';
                            _selectedStatus = 'All';
                            _searchQuery = '';
                            _searchController.clear();
                          });
                          _loadProducts();
                        },
                        child: const Text(
                          'Clear',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                // Inline + New SKU Action Pill (Never obscures products!)
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
                            'New SKU',
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

          // Product List view with clean padding
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _products.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadProducts,
                        color: AppTheme.primary,
                        backgroundColor: Colors.white,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];
                            return ProductCard(
                              product: product,
                              onTap: () => _navigateToDetail(product),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, bool isSelected) {
    final catKey = label == 'All Categories' ? 'All' : label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () {
          setState(() => _selectedCategory = catKey);
          _loadProducts();
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

  PopupMenuItem<String> _buildStatusMenuItem(String value, String title, IconData icon) {
    final isSelected = _selectedStatus == value;
    return PopupMenuItem<String>(
      value: value,
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: isSelected ? AppTheme.primary : AppTheme.slate500,
          ),
          const SizedBox(width: 10),
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
              color: isSelected ? AppTheme.primary : AppTheme.slate800,
            ),
          ),
          if (isSelected) ...[
            const Spacer(),
            const Icon(Icons.check_rounded, size: 16, color: AppTheme.primary),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.slate200),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x06000000),
                    blurRadius: 10,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(
                Icons.inventory_2_outlined,
                size: 48,
                color: AppTheme.slate400,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No Products Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.slate900,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Try adjusting your search query, selecting another category, or register a new SKU in your catalog.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: AppTheme.slate500,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _navigateToCreate,
              icon: const Icon(Icons.add_rounded, size: 18),
              label: const Text('Add First Product'),
            ),
          ],
        ),
      ),
    );
  }
}
