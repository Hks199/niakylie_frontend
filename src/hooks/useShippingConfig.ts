import { useEffect, useState } from 'react';
import { shippingApi } from '../api/shipping';
import { defaultShippingConfig, ShippingConfig } from '../utils/shipping';

/** Loads admin-managed delivery pricing when the storefront page opens. */
export function useShippingConfig(): ShippingConfig {
  const [config, setConfig] = useState<ShippingConfig>(defaultShippingConfig);

  useEffect(() => {
    const loadConfig = () => {
      shippingApi.getConfig()
        .then((result) => setConfig({ ...defaultShippingConfig, ...result }))
        .catch(() => {});
    };
    loadConfig();
  }, []);

  return config;
}
