import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, type CameraType } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessMessage } from "@/components/AccessMessage";
import { theme } from "@/constants/theme";
import type { CapturedPhoto } from "@/types/photo";

type CameraCaptureProps = {
  photoCount: number;
  onOpenGallery: () => void;
  onCaptured: (photo: CapturedPhoto) => Promise<void>;
};

const FLASH_SEQUENCE = ["off", "on", "auto"] as const;

const FLASH_LABEL: Record<(typeof FLASH_SEQUENCE)[number], string> = {
  off: "Apagado",
  on: "Activo",
  auto: "Auto",
};

export function CameraCapture({ photoCount, onOpenGallery, onCaptured }: CameraCaptureProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const capturingRef = useRef(false);
  const [session, setSession] = useState(0);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<(typeof FLASH_SEQUENCE)[number]>("off");
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const canCapture = isReady && !isCapturing;

  const retryMount = () => {
    setMountError(null);
    setCaptureError(null);
    setIsReady(false);
    setSession((current) => current + 1);
  };

  const toggleFacing = () => {
    setIsReady(false);
    setCaptureError(null);
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const cycleFlash = () => {
    setFlash((current) => {
      const index = FLASH_SEQUENCE.indexOf(current);
      return FLASH_SEQUENCE[(index + 1) % FLASH_SEQUENCE.length];
    });
  };

  const takePhoto = async () => {
    const camera = cameraRef.current;

    if (!camera || !isReady || capturingRef.current) {
      return;
    }

    capturingRef.current = true;
    setIsCapturing(true);
    setCaptureError(null);

    try {
      const picture = await camera.takePictureAsync({ quality: 0.85 });

      if (!picture?.uri) {
        setCaptureError("La cámara no devolvió la fotografía. Intentá de nuevo.");
        return;
      }

      await onCaptured({
        uri: picture.uri,
        width: picture.width,
        height: picture.height,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "No se pudo tomar la fotografía.";
      setCaptureError(message);
    } finally {
      capturingRef.current = false;
      setIsCapturing(false);
    }
  };

  if (mountError) {
    return (
      <AccessMessage
        eyebrow="Cámara"
        title="No se pudo abrir la cámara"
        body={mountError}
        hint="Si el permiso acaba de quedar habilitado, reintentá. En un emulador, conectá una cámara web o probá en un teléfono."
        actions={[{ label: "Reintentar", onPress: retryMount }]}
      />
    );
  }

  return (
    <View style={styles.screen} collapsable={false}>
      <CameraView
        key={session}
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
        mirror={facing === "front"}
        onCameraReady={() => setIsReady(true)}
        onMountError={({ message }) => setMountError(message)}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <View style={styles.chip}>
            <Text style={styles.brand}>Captura</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Flash ${FLASH_LABEL[flash]}. Cambiar modo de flash`}
            onPress={cycleFlash}
            style={styles.chip}
          >
            <Text style={styles.chipLabel}>Flash {FLASH_LABEL[flash]}</Text>
          </Pressable>
        </View>

        {!isReady ? (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator color={theme.colors.accent} size="large" />
            <Text style={styles.loadingText}>Iniciando cámara…</Text>
          </View>
        ) : null}

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 18 }]}>
          {captureError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{captureError}</Text>
            </View>
          ) : null}

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={facing === "back" ? "Usar cámara frontal" : "Usar cámara trasera"}
              onPress={toggleFacing}
              style={styles.sideControl}
            >
              <Text style={styles.sideLabel}>{facing === "back" ? "Trasera" : "Frontal"}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sacar fotografía"
              accessibilityState={{ disabled: !canCapture, busy: isCapturing }}
              disabled={!canCapture}
              onPress={() => {
                void takePhoto();
              }}
              style={({ pressed }) => [
                styles.shutter,
                pressed && canCapture && styles.shutterPressed,
                !canCapture && styles.shutterDisabled,
              ]}
            >
              {isCapturing ? (
                <View style={styles.shutterBusy}>
                  <ActivityIndicator color={theme.colors.onAccent} />
                </View>
              ) : (
                <View style={styles.shutterCore} />
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                photoCount > 0 ? `Ver ${photoCount} fotografías guardadas` : "Ver fotografías guardadas"
              }
              onPress={onOpenGallery}
              style={styles.sideControl}
            >
              <Text style={styles.sideLabel} numberOfLines={1}>
                {photoCount > 0 ? `Fotos ${photoCount}` : "Fotos"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  chipLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  loading: {
    alignSelf: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.chip,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },
  errorBanner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.dangerSurface,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideControl: {
    width: 92,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  sideLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.text,
  },
  shutterBusy: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterPressed: {
    transform: [{ scale: 0.96 }],
  },
  shutterDisabled: {
    opacity: 0.45,
  },
});
