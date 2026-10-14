import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import type { SavedPhoto } from "@/types/photo";

type PhotoPreviewProps = {
  photo: SavedPhoto;
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDelete: () => void;
  deleteError?: string | null;
};

function formatCapturedAt(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoPreview({
  photo,
  eyebrow,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDelete,
  deleteError,
}: PhotoPreviewProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width - 40, 520);
  const compact = width < 360;
  const capturedAt = formatCapturedAt(photo.createdAt);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>

      <View style={[styles.frame, { width: frameWidth }]}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          contentFit="contain"
          transition={180}
          accessibilityLabel="Fotografía capturada"
        />
      </View>

      <Text style={styles.meta}>
        {photo.width} × {photo.height} px
        {capturedAt ? ` · ${capturedAt}` : ""}
      </Text>

      {deleteError ? <Text style={styles.error}>{deleteError}</Text> : null}

      <View style={styles.action}>
        <AppButton label={primaryLabel} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? (
          <AppButton label={secondaryLabel} onPress={onSecondary} variant="secondary" />
        ) : null}
        <AppButton label="Eliminar" onPress={onDelete} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  copy: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  frame: {
    flex: 1,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: theme.radius.card,
    overflow: "hidden",
    backgroundColor: theme.colors.frame,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  meta: {
    alignSelf: "center",
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 12,
  },
  error: {
    alignSelf: "center",
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: "center",
  },
  action: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    marginTop: 16,
    gap: 12,
  },
});
