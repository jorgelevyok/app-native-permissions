import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import { useCameraPermissions } from "expo-camera";

export function useCameraAccess() {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getPermissionRef = useRef(getPermission);

  useEffect(() => {
    getPermissionRef.current = getPermission;
  }, [getPermission]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void getPermissionRef.current();
      }
    });

    return () => subscription.remove();
  }, []);

  const askForPermission = useCallback(async () => {
    setError(null);
    setIsRequesting(true);

    try {
      return await requestPermission();
    } catch {
      setError("No se pudo mostrar el diálogo de permisos. Probá de nuevo o abrí la configuración.");
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [requestPermission]);

  const openSettings = useCallback(async () => {
    setError(null);

    try {
      await Linking.openSettings();
    } catch {
      setError("No se pudo abrir la configuración del dispositivo.");
    }
  }, []);

  const refresh = useCallback(async () => {
    setError(null);

    try {
      return await getPermission();
    } catch {
      setError("No se pudo comprobar el permiso de cámara.");
      return null;
    }
  }, [getPermission]);

  return {
    permission,
    isRequesting,
    error,
    askForPermission,
    openSettings,
    refresh,
  };
}
