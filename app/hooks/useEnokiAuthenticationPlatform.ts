import * as SecureStore from "expo-secure-store";

export default function useEnokiAuthenticationPlatform() {
  const saveSecure = async (k: string, v: string) => {
    return SecureStore.setItemAsync(k, v);
  };

  const fetchSecure = async (k: string) => {
    return SecureStore.getItemAsync(k);
  };

  const removeSecure = async (k: string) => {
    return SecureStore.deleteItemAsync(k);
  };

  return {
    saveSecure,
    fetchSecure,
    removeSecure,
  };
}
