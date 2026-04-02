import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const RC_IOS_KEY     = extra.revenuecatApiKeyIos     || 'appl_PLACEHOLDER';
const RC_ANDROID_KEY = extra.revenuecatApiKeyAndroid || 'goog_PLACEHOLDER';

// RevenueCat offering identifiers — match what you create in RC dashboard
export const OFFERING_ID = 'default';
export const ENTITLEMENT_PRO  = 'pro';
export const ENTITLEMENT_TEAM = 'team';

interface PurchasesContextType {
  packages:          PurchasesPackage[];
  customerInfo:      CustomerInfo | null;
  isPro:             boolean;
  isTeam:            boolean;
  loading:           boolean;
  purchasing:        boolean;
  purchasePackage:   (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases:  () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType>({
  packages: [], customerInfo: null, isPro: false, isTeam: false,
  loading: true, purchasing: false,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  refreshCustomerInfo: async () => {},
});

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const [packages,     setPackages]     = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [purchasing,   setPurchasing]   = useState(false);

  useEffect(() => {
    initPurchases();
  }, []);

  const initPurchases = async () => {
    try {
      if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
      await Purchases.configure({ apiKey });

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (e) {
      console.warn('RevenueCat init error:', e);
    } finally {
      setLoading(false);
    }
  };

  const isPro = !!(
    customerInfo?.entitlements.active[ENTITLEMENT_PRO] ||
    customerInfo?.entitlements.active[ENTITLEMENT_TEAM]
  );
  const isTeam = !!customerInfo?.entitlements.active[ENTITLEMENT_TEAM];

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    setPurchasing(true);
    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      const activated = !!(info.entitlements.active[ENTITLEMENT_PRO] || info.entitlements.active[ENTITLEMENT_TEAM]);
      if (activated) {
        Alert.alert('🎉 Purchase Complete!', 'Welcome to SecureScan Pro. All features are now unlocked.');
      }
      return activated;
    } catch (e: any) {
      if (e.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Purchase Failed', e.message || 'Something went wrong. Please try again.');
      }
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setPurchasing(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      const restored = !!(info.entitlements.active[ENTITLEMENT_PRO] || info.entitlements.active[ENTITLEMENT_TEAM]);
      Alert.alert(
        restored ? '✅ Restored!' : 'No Purchases Found',
        restored ? 'Your purchases have been restored successfully.' : 'No previous purchases found for this account.'
      );
      return restored;
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message || 'Could not restore purchases.');
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch {}
  };

  return (
    <PurchasesContext.Provider value={{
      packages, customerInfo, isPro, isTeam, loading, purchasing,
      purchasePackage, restorePurchases, refreshCustomerInfo,
    }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export const usePurchases = () => useContext(PurchasesContext);
