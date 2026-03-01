// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sugu_chap/main.dart';

void main() {
  testWidgets('Auth screen renders', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: AuthScreen(),
      ),
    );

    expect(find.text('Connexion'), findsOneWidget);
  });

  testWidgets('Cart screen shows empty state', (WidgetTester tester) async {
    final state = AppState(
      apiClient: ApiClient(baseUrl: 'http://localhost:3000'),
      storage: const FlutterSecureStorage(),
    );
    state.isReady = true;
    state.authToken = 'token';
    state.isOnboarded = true;

    await tester.pumpWidget(
      AppStateScope(
        notifier: state,
        child: const MaterialApp(
          home: CartScreen(),
        ),
      ),
    );

    expect(find.text('Votre panier est vide.'), findsOneWidget);
  });
}
