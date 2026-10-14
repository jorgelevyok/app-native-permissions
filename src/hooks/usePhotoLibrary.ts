import { useCallback, useEffect, useRef, useState } from "react";
import { deletePhoto, loadPhotos, savePhoto } from "@/lib/photoStorage";
import type { CapturedPhoto, SavedPhoto } from "@/types/photo";

export function usePhotoLibrary() {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readyGate = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);

  if (readyGate.current === null) {
    let resolve: () => void = () => undefined;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    readyGate.current = { promise, resolve };
  }

  useEffect(() => {
    let active = true;

    loadPhotos()
      .then((items) => {
        if (active) {
          setPhotos(items);
        }
      })
      .catch(() => {
        if (active) {
          setError("No se pudieron leer las fotos guardadas.");
        }
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
        readyGate.current?.resolve();
      });

    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async (photo: CapturedPhoto) => {
    await readyGate.current?.promise;
    const saved = await savePhoto(photo);
    setPhotos((current) => [saved, ...current]);
    setError(null);
    return saved;
  }, []);

  const remove = useCallback(async (id: string) => {
    await readyGate.current?.promise;
    await deletePhoto(id);
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setError(null);
  }, []);

  return { photos, isReady, error, save, remove };
}
