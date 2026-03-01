export enum UserRole {
  CLIENT = 'client',
  COURIER = 'courier',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export enum OrderStatus {
  NOUVELLE = 'nouvelle',
  PRIX_VALIDE = 'prix_validé',
  PAYEE = 'payée',
  EN_ACHAT = 'en_achat',
  EN_LIVRAISON = 'en_livraison',
  LIVREE = 'livrée',
  ANNULEE = 'annulée',
  ECHEC_PAIEMENT = 'échec_paiement',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export enum DeliveryStatus {
  ASSIGNEE = 'assignée',
  EN_ACHAT = 'en_achat',
  EN_LIVRAISON = 'en_livraison',
  LIVREE = 'livrée',
}
