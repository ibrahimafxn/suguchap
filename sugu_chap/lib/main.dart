import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const String apiBaseUrl = 'http://localhost:3000';
const bool devSkipOtpCode = true;
const String devFixedOtpCode = '123456';

void main() {
  runApp(const SuguChapApp());
}

class SuguChapApp extends StatelessWidget {
  const SuguChapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AppStateScope(
      notifier: AppState(
        apiClient: ApiClient(baseUrl: apiBaseUrl),
        storage: const FlutterSecureStorage(),
      )..bootstrap(),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'SuguChap',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF0F766E),
            brightness: Brightness.light,
          ),
          scaffoldBackgroundColor: const Color(0xFFF8F5F0),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFFF3EBDD),
            foregroundColor: Color(0xFF1F2937),
            elevation: 0,
          ),
          textTheme: const TextTheme(
            headlineMedium: TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
            ),
            titleMedium: TextStyle(
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
            ),
            bodyMedium: TextStyle(
              color: Color(0xFF374151),
            ),
          ),
        ),
        home: const RootScreen(),
      ),
    );
  }
}

class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);
    if (!appState.isReady) {
      return const SplashScreen();
    }
    if (!appState.isAuthenticated) {
      return const AuthScreen();
    }
    if (!appState.isOnboarded) {
      return const OnboardingScreen();
    }
    return const MarketListScreen();
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class ApiClient {
  ApiClient({required this.baseUrl, String? token}) : _token = token;

  final String baseUrl;
  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Map<String, String> _headers() {
    final headers = {'Content-Type': 'application/json'};
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<void> requestOtp(String phone) async {
    final uri = Uri.parse('$baseUrl/api/v1/auth/otp/request');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'phone': phone}),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Erreur OTP request (${response.statusCode})');
    }
  }

  Future<AuthResult> verifyOtp(String phone, String code) async {
    final uri = Uri.parse('$baseUrl/api/v1/auth/otp/verify');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'phone': phone, 'code': code}),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Erreur OTP verify (${response.statusCode})');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return AuthResult.fromJson(data);
  }

  Future<List<Market>> fetchMarkets() async {
    final uri = Uri.parse('$baseUrl/api/v1/markets');
    final response = await http.get(uri, headers: _headers());
    if (response.statusCode != 200) {
      throw Exception('Erreur API markets (${response.statusCode})');
    }
    final List<dynamic> data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => Market.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Product>> fetchProducts(String marketId) async {
    final uri = Uri.parse('$baseUrl/api/v1/products?market_id=$marketId');
    final response = await http.get(uri, headers: _headers());
    if (response.statusCode != 200) {
      throw Exception('Erreur API products (${response.statusCode})');
    }
    final List<dynamic> data = jsonDecode(response.body) as List<dynamic>;
    return data.map((item) => Product.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<OrderResult> createOrder({
    required String marketId,
    required String deliveryAddress,
    required String deliveryCity,
    required List<CartItem> items,
    String paymentMethod = 'cash_on_delivery',
  }) async {
    final uri = Uri.parse('$baseUrl/api/v1/orders');
    final payload = {
      'market_id': marketId,
      'delivery_address': deliveryAddress,
      'delivery_city': deliveryCity,
      'payment_method': paymentMethod,
      'items': items
          .map(
            (item) => {
              'product_id': item.product.id,
              'quantity': item.quantity,
              'price_estimated': item.product.price,
            },
          )
          .toList(),
    };
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Erreur API orders (${response.statusCode})');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return OrderResult.fromJson(data);
  }

  Future<OrderResult> fetchOrder(String orderId) async {
    final uri = Uri.parse('$baseUrl/api/v1/orders/$orderId');
    final response = await http.get(uri, headers: _headers());
    if (response.statusCode != 200) {
      throw Exception('Erreur API order (${response.statusCode})');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return OrderResult.fromJson(data);
  }
}

class AuthResult {
  final String token;
  final String phone;

  const AuthResult({required this.token, required this.phone});

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return AuthResult(
      token: json['token']?.toString() ?? '',
      phone: user['phone']?.toString() ?? '',
    );
  }
}

class OrderResult {
  final String id;
  final String status;

  const OrderResult({required this.id, required this.status});

  factory OrderResult.fromJson(Map<String, dynamic> json) {
    return OrderResult(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
    );
  }
}

class AppState extends ChangeNotifier {
  AppState({required this.apiClient, required this.storage});

  final ApiClient apiClient;
  final FlutterSecureStorage storage;

  static const _tokenKey = 'auth_token';
  static const _phoneKey = 'phone';
  static const _cityKey = 'city';
  static const _addressKey = 'address';
  static const _onboardedKey = 'onboarded';

  List<Market> markets = [];
  List<Product> products = [];
  bool marketsLoading = false;
  bool productsLoading = false;
  bool orderLoading = false;
  bool isReady = false;
  OrderResult? lastOrder;
  String? lastError;

  String? city;
  String? address;
  String? phone;
  String? selectedMarketId;
  bool isOnboarded = false;

  String? authToken;
  bool get isAuthenticated => authToken != null && authToken!.isNotEmpty;

  final Map<String, CartItem> cart = {};

  Future<void> bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    authToken = await storage.read(key: _tokenKey);
    phone = prefs.getString(_phoneKey);
    city = prefs.getString(_cityKey);
    address = prefs.getString(_addressKey);
    isOnboarded = prefs.getBool(_onboardedKey) ?? false;

    if (authToken != null && authToken!.isNotEmpty) {
      apiClient.setToken(authToken!);
    }

    isReady = true;
    notifyListeners();
  }

  Future<void> setAuthToken(String token, String phone) async {
    authToken = token;
    this.phone = phone;
    apiClient.setToken(token);
    await storage.write(key: _tokenKey, value: token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_phoneKey, phone);
    notifyListeners();
  }

  Future<void> persistProfile() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cityKey, city ?? '');
    await prefs.setString(_addressKey, address ?? '');
    await prefs.setBool(_onboardedKey, isOnboarded);
  }

  Future<void> signOut() async {
    authToken = null;
    apiClient.setToken('');
    markets = [];
    products = [];
    cart.clear();
    isOnboarded = false;
    city = null;
    address = null;
    phone = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_phoneKey);
    await prefs.remove(_cityKey);
    await prefs.remove(_addressKey);
    await prefs.remove(_onboardedKey);
    await storage.delete(key: _tokenKey);
    notifyListeners();
  }

  Future<void> loadMarkets() async {
    marketsLoading = true;
    lastError = null;
    notifyListeners();
    try {
      markets = await apiClient.fetchMarkets();
    } catch (err) {
      lastError = err.toString();
    } finally {
      marketsLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProducts(String marketId) async {
    productsLoading = true;
    lastError = null;
    notifyListeners();
    try {
      products = await apiClient.fetchProducts(marketId);
    } catch (err) {
      lastError = err.toString();
    } finally {
      productsLoading = false;
      notifyListeners();
    }
  }

  Future<OrderResult> submitOrder() async {
    if (selectedMarketId == null) {
      throw Exception('Aucun marche selectionne');
    }
    if (address == null || address!.isEmpty || city == null || city!.isEmpty) {
      throw Exception('Adresse ou ville manquante');
    }
    if (cart.isEmpty) {
      throw Exception('Panier vide');
    }

    orderLoading = true;
    lastError = null;
    notifyListeners();
    try {
      final result = await apiClient.createOrder(
        marketId: selectedMarketId!,
        deliveryAddress: address!,
        deliveryCity: city!,
        items: cart.values.toList(),
      );
      cart.clear();
      lastOrder = result;
      return result;
    } catch (err) {
      lastError = err.toString();
      rethrow;
    } finally {
      orderLoading = false;
      notifyListeners();
    }
  }

  Future<OrderResult> refreshOrder(String orderId) async {
    orderLoading = true;
    lastError = null;
    notifyListeners();
    try {
      final result = await apiClient.fetchOrder(orderId);
      lastOrder = result;
      return result;
    } catch (err) {
      lastError = err.toString();
      rethrow;
    } finally {
      orderLoading = false;
      notifyListeners();
    }
  }

  void completeOnboarding({
    required String city,
    required String address,
    required String phone,
  }) {
    this.city = city;
    this.address = address;
    this.phone = phone;
    isOnboarded = true;
    persistProfile();
    notifyListeners();
  }

  Future<void> selectMarket(String marketId) async {
    selectedMarketId = marketId;
    cart.clear();
    await loadProducts(marketId);
    notifyListeners();
  }

  void addToCart(Product product) {
    final existing = cart[product.id];
    if (existing == null) {
      cart[product.id] = CartItem(product: product, quantity: 1);
    } else {
      cart[product.id] = existing.copyWith(quantity: existing.quantity + 1);
    }
    notifyListeners();
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      cart.remove(productId);
    } else {
      final existing = cart[productId];
      if (existing != null) {
        cart[productId] = existing.copyWith(quantity: quantity);
      }
    }
    notifyListeners();
  }

  double get cartTotal {
    double total = 0;
    for (final item in cart.values) {
      total += item.quantity * item.product.price;
    }
    return total;
  }

  int get cartCount {
    int count = 0;
    for (final item in cart.values) {
      count += item.quantity;
    }
    return count;
  }
}

class AppStateScope extends InheritedNotifier<AppState> {
  const AppStateScope({
    super.key,
    required AppState notifier,
    required Widget child,
  }) : super(notifier: notifier, child: child);

  static AppState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppStateScope>();
    return scope!.notifier!;
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();

  bool _codeStep = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await AppStateScope.of(context).apiClient.requestOtp(
            _phoneController.text.trim(),
          );
      if (devSkipOtpCode) {
        await _verifyOtp(codeOverride: devFixedOtpCode);
        return;
      }
      setState(() {
        _codeStep = true;
      });
    } catch (err) {
      setState(() {
        _error = err.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _verifyOtp({String? codeOverride}) async {
    final code = codeOverride ?? _codeController.text.trim();
    if (code.isEmpty) {
      setState(() {
        _error = 'Code OTP requis';
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await AppStateScope.of(context).apiClient.verifyOtp(
            _phoneController.text.trim(),
            code,
          );
      await AppStateScope.of(context).setAuthToken(result.token, result.phone);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const OnboardingScreen()),
      );
    } catch (err) {
      setState(() {
        _error = err.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connexion'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Saisis ton numero',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              const Text('Un code OTP sera envoye par SMS.'),
              const SizedBox(height: 24),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Telephone',
                  hintText: '+2250700000000',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().length < 8) {
                    return 'Telephone invalide';
                  }
                  return null;
                },
              ),
              if (!devSkipOtpCode && _codeStep) ...[
                const SizedBox(height: 16),
                TextFormField(
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Code OTP',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(
                  _error!,
                  style: const TextStyle(color: Colors.redAccent),
                ),
              ],
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _loading
                      ? null
                      : _codeStep
                          ? _verifyOtp
                          : _requestOtp,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(_codeStep ? 'Verifier' : 'Recevoir le code'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _cityController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final appState = AppStateScope.of(context);
    if (_cityController.text.isEmpty && appState.city != null) {
      _cityController.text = appState.city!;
    }
    if (_addressController.text.isEmpty && appState.address != null) {
      _addressController.text = appState.address!;
    }
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    AppStateScope.of(context).completeOnboarding(
      city: _cityController.text.trim(),
      address: _addressController.text.trim(),
      phone: AppStateScope.of(context).phone ?? '',
    );
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const MarketListScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bienvenue sur SuguChap'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Complete ton profil',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              const Text('Ces infos servent a estimer la livraison.'),
              const SizedBox(height: 24),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(
                  labelText: 'Ville',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().length < 2) {
                    return 'Ville obligatoire';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Adresse',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().length < 5) {
                    return 'Adresse trop courte';
                  }
                  return null;
                },
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submit,
                  child: const Text('Continuer'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MarketListScreen extends StatefulWidget {
  const MarketListScreen({super.key});

  @override
  State<MarketListScreen> createState() => _MarketListScreenState();
}

class _MarketListScreenState extends State<MarketListScreen> {
  bool _loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loaded) return;
    _loaded = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final appState = AppStateScope.of(context);
      if (appState.markets.isEmpty) {
        appState.loadMarkets();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Choisir un marche'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await appState.signOut();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const AuthScreen()),
                (route) => false,
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CartScreen()),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: appState.marketsLoading
            ? const Center(child: CircularProgressIndicator())
            : appState.markets.isEmpty
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Aucun marche charge.'),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: () => appState.loadMarkets(),
                        child: const Text('Reessayer'),
                      ),
                      if (appState.lastError != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          appState.lastError!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.redAccent),
                        ),
                      ],
                    ],
                  )
                : ListView.separated(
                    itemCount: appState.markets.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final market = appState.markets[index];
                      return InkWell(
                        onTap: () async {
                          await appState.selectMarket(market.id);
                          if (!mounted) return;
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const CatalogScreen()),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Row(
                            children: [
                              const CircleAvatar(
                                radius: 24,
                                backgroundColor: Color(0xFF0F766E),
                                child: Icon(Icons.storefront, color: Colors.white),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      market.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(market.location),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios, size: 18),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}

class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);
    final products = appState.products;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Catalogue'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const CartScreen()),
                  );
                },
              ),
              if (appState.cartCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF97316),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${appState.cartCount}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.search, size: 18),
                  SizedBox(width: 8),
                  Text('Rechercher un article...'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (appState.productsLoading)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (products.isEmpty)
              Expanded(
                child: Center(
                  child: Text(
                    appState.lastError ?? 'Aucun produit disponible.',
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              Expanded(
                child: ListView.separated(
                  itemCount: products.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            height: 48,
                            width: 48,
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.shopping_basket_outlined),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text('${product.price.toStringAsFixed(0)} FCFA / ${product.unit}'),
                              ],
                            ),
                          ),
                          FilledButton(
                            onPressed: () => appState.addToCart(product),
                            child: const Text('Ajouter'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);
    final items = appState.cart.values.toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Panier'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: items.isEmpty
            ? const Center(child: Text('Votre panier est vide.'))
            : Column(
                children: [
                  Expanded(
                    child: ListView.separated(
                      itemCount: items.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = items[index];
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.product.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${item.product.price.toStringAsFixed(0)} FCFA / ${item.product.unit}',
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    onPressed: () => appState.updateQuantity(
                                      item.product.id,
                                      item.quantity - 1,
                                    ),
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                  Text('${item.quantity}'),
                                  IconButton(
                                    onPressed: () => appState.updateQuantity(
                                      item.product.id,
                                      item.quantity + 1,
                                    ),
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3EBDD),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total estime',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          '${appState.cartTotal.toStringAsFixed(0)} FCFA',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: items.isEmpty
                          ? null
                          : () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const PriceValidationScreen(),
                                ),
                              );
                            },
                      child: const Text('Valider le panier'),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class Market {
  final String id;
  final String name;
  final String city;
  final String location;

  const Market({
    required this.id,
    required this.name,
    required this.city,
    required this.location,
  });

  factory Market.fromJson(Map<String, dynamic> json) {
    return Market(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Marche',
      city: json['city']?.toString() ?? '',
      location: json['city']?.toString() ?? '',
    );
  }
}

class Product {
  final String id;
  final String marketId;
  final String name;
  final String category;
  final String unit;
  final double price;

  const Product({
    required this.id,
    required this.marketId,
    required this.name,
    required this.category,
    required this.unit,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      marketId: json['market_id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Produit',
      category: json['category']?.toString() ?? '',
      unit: json['unit']?.toString() ?? '',
      price: (json['price_estimated'] is num)
          ? (json['price_estimated'] as num).toDouble()
          : double.tryParse(json['price_estimated']?.toString() ?? '') ?? 0,
    );
  }
}

class CartItem {
  final Product product;
  final int quantity;

  const CartItem({required this.product, required this.quantity});

  CartItem copyWith({int? quantity}) {
    return CartItem(
      product: product,
      quantity: quantity ?? this.quantity,
    );
  }
}

class PriceValidationScreen extends StatelessWidget {
  const PriceValidationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);
    final total = appState.cartTotal;
    final address = appState.address ?? '';
    final city = appState.city ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Validation du prix'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recapitulatif',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            _InfoRow(label: 'Adresse', value: '$address, $city'),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'Paiement',
              value: 'Payer a la reception',
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF3EBDD),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total estime',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '${total.toStringAsFixed(0)} FCFA',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: appState.orderLoading
                    ? null
                    : () async {
                        try {
                          final result = await appState.submitOrder();
                          if (!context.mounted) return;
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => OrderStatusScreen(orderId: result.id),
                            ),
                          );
                        } catch (err) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(err.toString()),
                              backgroundColor: Colors.redAccent,
                            ),
                          );
                        }
                      },
                child: appState.orderLoading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Confirmer la commande'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrderStatusScreen extends StatefulWidget {
  const OrderStatusScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderStatusScreen> createState() => _OrderStatusScreenState();
}

class _OrderStatusScreenState extends State<OrderStatusScreen> {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      await AppStateScope.of(context).refreshOrder(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateScope.of(context);
    final status = appState.lastOrder?.status ?? 'nouvelle';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Suivi commande'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Commande ${widget.orderId}',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            _InfoRow(label: 'Statut', value: status),
            const SizedBox(height: 24),
            _StatusStep(title: 'Nouvelle', active: status == 'nouvelle'),
            _StatusStep(title: 'Prix valide', active: status == 'prix_validé'),
            _StatusStep(title: 'Payee', active: status == 'payée'),
            _StatusStep(title: 'En achat', active: status == 'en_achat'),
            _StatusStep(title: 'En livraison', active: status == 'en_livraison'),
            _StatusStep(title: 'Livree', active: status == 'livrée'),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: appState.orderLoading
                    ? null
                    : () async {
                        try {
                          await appState.refreshOrder(widget.orderId);
                        } catch (err) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(err.toString()),
                              backgroundColor: Colors.redAccent,
                            ),
                          );
                        }
                      },
                child: appState.orderLoading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Actualiser'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        Flexible(child: Text(value, textAlign: TextAlign.right)),
      ],
    );
  }
}

class _StatusStep extends StatelessWidget {
  const _StatusStep({required this.title, required this.active});

  final String title;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            height: 12,
            width: 12,
            decoration: BoxDecoration(
              color: active ? const Color(0xFF0F766E) : const Color(0xFFE5E7EB),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Text(title),
        ],
      ),
    );
  }
}
