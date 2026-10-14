import { Directory, File, Paths } from "expo-file-system";
import type { CapturedPhoto, SavedPhoto } from "@/types/photo";

const DIRECTORY_NAME = "captura-photos";
const MANIFEST_NAME = "manifest.json";

type StoredPhoto = {
  id: string;
  width: number;
  height: number;
  createdAt: string;
};

let queue: Promise<void> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function photosDirectory() {
  const directory = new Directory(Paths.document, DIRECTORY_NAME);

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  return directory;
}

function createPhotoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isStoredPhoto(value: unknown): value is StoredPhoto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const photo = value as Partial<StoredPhoto>;

  return (
    typeof photo.id === "string" &&
    /^[a-z0-9-]+$/i.test(photo.id) &&
    typeof photo.width === "number" &&
    typeof photo.height === "number" &&
    typeof photo.createdAt === "string"
  );
}

function readManifest(directory: Directory): StoredPhoto[] {
  const manifest = new File(directory, MANIFEST_NAME);

  if (!manifest.exists) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(manifest.textSync());
    return Array.isArray(parsed) ? parsed.filter(isStoredPhoto) : [];
  } catch {
    return [];
  }
}

function writeManifest(directory: Directory, photos: StoredPhoto[]) {
  const manifest = new File(directory, MANIFEST_NAME);

  if (!manifest.exists) {
    manifest.create();
  }

  manifest.write(JSON.stringify(photos));
}

function toSavedPhoto(entry: StoredPhoto, directory: Directory): SavedPhoto | null {
  const file = new File(directory, `${entry.id}.jpg`);

  if (!file.exists) {
    return null;
  }

  return {
    id: entry.id,
    uri: file.uri,
    width: entry.width,
    height: entry.height,
    createdAt: entry.createdAt,
  };
}

export function loadPhotos(): Promise<SavedPhoto[]> {
  return enqueue(async () => {
    const directory = photosDirectory();
    const stored = readManifest(directory);
    const photos = stored.flatMap((entry) => {
      const photo = toSavedPhoto(entry, directory);
      return photo ? [photo] : [];
    });

    if (photos.length !== stored.length) {
      writeManifest(
        directory,
        photos.map(({ id, width, height, createdAt }) => ({ id, width, height, createdAt })),
      );
    }

    return photos;
  });
}

export function savePhoto(photo: CapturedPhoto): Promise<SavedPhoto> {
  return enqueue(async () => {
    const directory = photosDirectory();
    const id = createPhotoId();
    const destination = new File(directory, `${id}.jpg`);
    const source = new File(photo.uri);

    try {
      await source.copy(destination);

      const entry: StoredPhoto = {
        id,
        width: photo.width,
        height: photo.height,
        createdAt: new Date().toISOString(),
      };

      writeManifest(directory, [entry, ...readManifest(directory)]);

      const saved = toSavedPhoto(entry, directory);

      if (!saved) {
        throw new Error("missing-file");
      }

      return saved;
    } catch {
      try {
        if (destination.exists) {
          destination.delete();
        }
      } catch {
        // Si no se puede borrar el archivo a medias, la próxima lectura lo descarta.
      }

      throw new Error("La foto se tomó, pero no se pudo guardar en la aplicación.");
    }
  });
}

export function deletePhoto(id: string): Promise<void> {
  return enqueue(async () => {
    if (!/^[a-z0-9-]+$/i.test(id)) {
      throw new Error("No se pudo eliminar la fotografía.");
    }

    const directory = photosDirectory();
    const file = new File(directory, `${id}.jpg`);

    if (file.exists) {
      file.delete();
    }

    writeManifest(
      directory,
      readManifest(directory).filter((photo) => photo.id !== id),
    );
  });
}
