import { useState } from "react";
import { Alert } from "react-native";
import { CameraCapture } from "@/components/CameraCapture";
import { PermissionGate } from "@/components/PermissionGate";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PhotoPreview } from "@/components/PhotoPreview";
import { usePhotoLibrary } from "@/hooks/usePhotoLibrary";
import type { CapturedPhoto } from "@/types/photo";

type Screen =
  | { type: "camera" }
  | { type: "preview"; photoId: string }
  | { type: "gallery" }
  | { type: "photo"; photoId: string };

export default function Index() {
  const library = usePhotoLibrary();
  const [screen, setScreen] = useState<Screen>({ type: "camera" });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openGallery = () => {
    setDeleteError(null);
    setScreen({ type: "gallery" });
  };

  const handleCaptured = async (photo: CapturedPhoto) => {
    const saved = await library.save(photo);
    setDeleteError(null);
    setScreen({ type: "preview", photoId: saved.id });
  };

  const confirmDelete = (photoId: string, next: Screen) => {
    Alert.alert("Eliminar fotografía", "Se borra de la aplicación. Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          void library
            .remove(photoId)
            .then(() => {
              setDeleteError(null);
              setScreen(next);
            })
            .catch(() => {
              setDeleteError("No se pudo eliminar la fotografía.");
            });
        },
      },
    ]);
  };

  const selected =
    screen.type === "preview" || screen.type === "photo"
      ? library.photos.find((photo) => photo.id === screen.photoId)
      : null;

  if (screen.type === "gallery" || (screen.type === "photo" && !selected)) {
    return (
      <PhotoGallery
        photos={library.photos}
        isLoading={!library.isReady}
        error={library.error}
        onOpenCamera={() => setScreen({ type: "camera" })}
        onOpenPhoto={(photoId) => {
          setDeleteError(null);
          setScreen({ type: "photo", photoId });
        }}
      />
    );
  }

  if (selected && screen.type === "preview") {
    return (
      <PhotoPreview
        photo={selected}
        eyebrow="Fotografía"
        title="Vista previa"
        body="Quedó guardada en la app. Podés verla junto con las otras o borrarla."
        primaryLabel="Sacar otra fotografía"
        onPrimary={() => setScreen({ type: "camera" })}
        secondaryLabel="Ver fotos"
        onSecondary={openGallery}
        onDelete={() => confirmDelete(selected.id, { type: "camera" })}
        deleteError={deleteError}
      />
    );
  }

  if (selected && screen.type === "photo") {
    return (
      <PhotoPreview
        photo={selected}
        eyebrow="Galería"
        title="Fotografía"
        body="Está guardada en la aplicación hasta que la elimines."
        primaryLabel="Volver a las fotos"
        onPrimary={openGallery}
        secondaryLabel="Sacar otra"
        onSecondary={() => setScreen({ type: "camera" })}
        onDelete={() => confirmDelete(selected.id, { type: "gallery" })}
        deleteError={deleteError}
      />
    );
  }

  const galleryAction =
    library.photos.length > 0
      ? {
          label: `Ver fotos (${library.photos.length})`,
          onPress: openGallery,
          variant: "secondary" as const,
        }
      : undefined;

  return (
    <PermissionGate extraAction={galleryAction}>
      <CameraCapture
        photoCount={library.photos.length}
        onOpenGallery={openGallery}
        onCaptured={handleCaptured}
      />
    </PermissionGate>
  );
}
