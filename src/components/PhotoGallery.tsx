import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";
import type { SavedPhoto } from "@/types/photo";

type PhotoGalleryProps = {
  photos: SavedPhoto[];
  isLoading: boolean;
  error?: string | null;
  onOpenCamera: () => void;
  onOpenPhoto: (photoId: string) => void;
};

export function PhotoGallery({ photos, isLoading, error, onOpenCamera, onOpenPhoto }: PhotoGalleryProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width < 360 ? 2 : 3;
  const gap = 8;
  const padding = 16;
  const tile = (width - padding * 2 - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Captura</Text>
          <Text style={styles.title}>Fotos</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpenCamera} style={styles.cameraButton}>
          <Text style={styles.cameraLabel}>Cámara</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && photos.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
          <Text style={styles.loadingText}>Cargando fotografías…</Text>
        </View>
      ) : (
        <FlatList
          key={columns}
          data={photos}
          keyExtractor={(photo) => photo.id}
          numColumns={columns}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 24 },
            photos.length === 0 && styles.listEmpty,
          ]}
          columnWrapperStyle={photos.length > 0 ? { gap } : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay fotos</Text>
              <Text style={styles.emptyBody}>Las que saques con la cámara van a aparecer acá.</Text>
              <AppButton label="Abrir la cámara" onPress={onOpenCamera} />
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir fotografía"
              onPress={() => onOpenPhoto(item.id)}
              style={[styles.tile, { width: tile, height: tile }]}
            >
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                contentFit="cover"
                recyclingKey={item.id}
                accessibilityLabel="Miniatura de la fotografía"
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heading: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  cameraButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  tile: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.frame,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  emptyBody: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 8,
  },
});
