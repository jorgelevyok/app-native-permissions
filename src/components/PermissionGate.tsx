import { useEffect, useState, type ReactNode } from "react";
import { CameraView } from "expo-camera";
import { AccessMessage, type AccessAction } from "@/components/AccessMessage";
import { useCameraAccess } from "@/hooks/useCameraAccess";

type PermissionGateProps = {
  children: ReactNode;
  extraAction?: AccessAction;
};

const SETTINGS_HINT =
  "En Android con Expo Go el permiso es de Expo Go: Ajustes, Aplicaciones, Expo Go, Permisos, Cámara. Al volver, la app vuelve a leer el permiso sola.";

function withExtra(actions: AccessAction[], extraAction?: AccessAction) {
  if (!extraAction) {
    return actions;
  }

  return [...actions, { ...extraAction, variant: extraAction.variant ?? "secondary" }];
}

export function PermissionGate({ children, extraAction }: PermissionGateProps) {
  const { permission, isRequesting, error, askForPermission, openSettings, refresh } = useCameraAccess();
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    CameraView.isAvailableAsync()
      .then((available) => {
        if (active) {
          setCameraAvailable(available);
        }
      })
      .catch(() => {
        // isAvailableAsync solo está implementado en web. En Android se asume que hay cámara
        // y un fallo real aparece en onMountError.
        if (active) {
          setCameraAvailable(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (permission === null || cameraAvailable === null) {
    return (
      <AccessMessage
        loading
        eyebrow="Captura"
        title="Revisando la cámara"
        body="Estamos comprobando el permiso y si este dispositivo puede tomar fotografías."
      />
    );
  }

  if (!cameraAvailable) {
    return (
      <AccessMessage
        eyebrow="Captura"
        title="No hay una cámara disponible"
        body="Este equipo no tiene una cámara que la aplicación pueda usar. Probala en un teléfono Android con Expo Go."
        actions={withExtra([], extraAction)}
      />
    );
  }

  if (!permission.granted) {
    if (permission.status !== "denied") {
      return (
        <AccessMessage
          eyebrow="Actividad 6"
          title="Hace falta la cámara"
          body="Captura usa la cámara del dispositivo para mostrar la vista en vivo y sacar fotografías. El permiso se pide solo para eso. No se usa el micrófono."
          error={error}
          actions={withExtra(
            [
              {
                label: isRequesting ? "Solicitando permiso…" : "Permitir cámara",
                onPress: () => {
                  void askForPermission();
                },
                disabled: isRequesting,
              },
            ],
            extraAction,
          )}
        />
      );
    }

    const actions: AccessAction[] = permission.canAskAgain
      ? [
          {
            label: isRequesting ? "Solicitando permiso…" : "Volver a solicitar",
            onPress: () => {
              void askForPermission();
            },
            disabled: isRequesting,
          },
          {
            label: "Abrir configuración",
            onPress: () => {
              void openSettings();
            },
            variant: "secondary",
          },
        ]
      : [
          {
            label: "Abrir configuración",
            onPress: () => {
              void openSettings();
            },
          },
          {
            label: "Comprobar de nuevo",
            onPress: () => {
              void refresh();
            },
            variant: "secondary",
          },
        ];

    return (
      <AccessMessage
        eyebrow="Permiso rechazado"
        title="La cámara sigue desactivada"
        body={
          permission.canAskAgain
            ? "Rechazaste el acceso a la cámara. Sin ese permiso no se puede mostrar el visor ni guardar una fotografía. Podés concederlo otra vez, o habilitarlo desde la configuración del dispositivo."
            : "Rechazaste el acceso a la cámara y el sistema no va a volver a preguntar. Habilitalo desde la configuración del dispositivo y volvé a la aplicación."
        }
        hint={SETTINGS_HINT}
        error={error}
        actions={withExtra(actions, extraAction)}
      />
    );
  }

  return children;
}
