import { useNetInfo } from '@react-native-community/netinfo';

/**
 * Indica se o celular está conectado a uma rede (Wi-Fi ou dados móveis).
 * Enquanto o NetInfo ainda não respondeu (isConnected = null), consideramos online.
 */
export function useOnline(): boolean {
  const { isConnected } = useNetInfo();
  return isConnected !== false;
}
