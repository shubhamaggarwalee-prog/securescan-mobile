const Purchases = {
  configure: jest.fn(() => Promise.resolve()),
  setLogLevel: jest.fn(),
  getCustomerInfo: jest.fn(() => Promise.resolve({
    entitlements: { active: {} },
    activeSubscriptions: [],
    allPurchasedProductIdentifiers: [],
  })),
  getOfferings: jest.fn(() => Promise.resolve({
    current: {
      availablePackages: [
        { identifier: 'pro_monthly', packageType: 'MONTHLY', product: { title: 'Pro Monthly', priceString: '$29.00' } },
        { identifier: 'pro_annual', packageType: 'ANNUAL', product: { title: 'Pro Annual', priceString: '$249.00' } },
      ]
    }
  })),
  purchasePackage: jest.fn(() => Promise.resolve({
    customerInfo: { entitlements: { active: { pro: { isActive: true } } } }
  })),
  restorePurchases: jest.fn(() => Promise.resolve({
    entitlements: { active: {} }
  })),
};
module.exports = Purchases;
module.exports.default = Purchases;
module.exports.LOG_LEVEL = { DEBUG: 'DEBUG', ERROR: 'ERROR' };
module.exports.PURCHASES_ERROR_CODE = { PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR' };
