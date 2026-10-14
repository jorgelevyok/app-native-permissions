# Captura

Aplicación de fotografías para la actividad 6 de la UTN. Abre la cámara del dispositivo, pide el permiso correspondiente y muestra la foto que se acaba de sacar.

El proyecto vive en la carpeta `app-native-permissions`. En el teléfono, la app se llama **Captura**.

## Objetivo de la actividad

La consigna de **Manipulación nativa** pide usar una API del dispositivo desde React Native. En esta entrega se usa la cámara: pedir el permiso, mostrar el visor, sacar una fotografía y volver a sacar otra. Si el permiso se rechaza, la app explica qué pasa y ofrece abrir la configuración del sistema.

## Tecnologías

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- `expo-camera`
- `expo-file-system`
- `expo-image`

## Funcionalidades

- Consulta el permiso de cámara al abrir la app y muestra un estado de carga mientras lo hace.
- Pide el permiso con el diálogo del sistema.
- Muestra la cámara trasera o frontal y permite cambiar el flash (apagado, activo o automático).
- Saca una fotografía recién cuando la cámara está lista.
- Muestra la vista previa con el tamaño de la imagen.
- Guarda cada fotografía en la app para verla después.
- Muestra las fotos guardadas en una galería.
- Permite eliminar una fotografía, con confirmación.
- Permite sacar otra fotografía.
- Si el permiso se rechaza, explica el motivo y abre la configuración del dispositivo. Al volver, vuelve a leer el permiso.
- Si la cámara no arranca o la captura falla, muestra el error y deja reintentar.

## Requisitos previos

- Node.js instalado.
- La app **Expo Go** en un teléfono Android, actualizada para el SDK 57.
- El teléfono y la computadora en la misma red, o un cable USB si se usa `npx expo start --android`.

La cámara hay que probarla en un dispositivo físico. Un emulador sin cámara web no puede sacar la foto.

## Instalación y ejecución

Desde la carpeta `app-native-permissions`:

```bash
npm install
npx expo start
```

En la terminal de Expo, presioná `a` para abrir Android o escaneá el QR con Expo Go.

`expo-camera` viene incluido en Expo Go. No hace falta un development build para esta actividad.

## Permisos de cámara

La app no abre la cámara por su cuenta. Primero lee el estado con `useCameraPermissions`, de `expo-camera`.

1. Si todavía no se pidió, aparece la pantalla **Permitir cámara**. Ese botón llama a `requestPermission()` y el sistema muestra el diálogo.
2. Si la persona acepta, se monta `CameraView` y se puede fotografiar.
3. Si rechaza y el sistema todavía deja volver a preguntar (`canAskAgain`), se puede solicitar de nuevo o abrir la configuración.
4. Si rechaza y el sistema no va a volver a preguntar, el único camino es la configuración. El botón **Abrir configuración** usa `Linking.openSettings()`.

En Android con Expo Go el permiso no es de una app instalada aparte: es el permiso de **Expo Go**. El camino es Ajustes, Aplicaciones, Expo Go, Permisos, Cámara, Permitir.

Cuando la app vuelve a primer plano, lee el permiso otra vez. Si ya está concedido, el visor aparece sin reiniciar Expo.

En `app.json`, el plugin `expo-camera` declara el permiso `CAMERA` para un build nativo y deja `recordAudioAndroid` en `false`, porque esta app no graba audio. En Expo Go ese manifiesto ya está resuelto por Expo Go; lo que decide la pantalla es el permiso en tiempo de ejecución.

La fotografía que devuelve `takePictureAsync` queda primero en la caché. La app la copia al directorio de documentos, en `captura-photos`, y anota el ancho, el alto y la fecha en un manifiesto. Desde **Fotos** se pueden ver y, con **Eliminar**, se borran el archivo y la entrada. Siguen disponibles al cerrar y volver a abrir la app.

## Estructura de carpetas

```text
app-native-permissions/
├── assets/images/          ícono, splash y favicon
├── docs/capturas/          espacio para las capturas de la entrega
├── src/
│   ├── app/
│   │   ├── _layout.tsx     navegación y barra de estado
│   │   └── index.tsx       pantalla principal
│   ├── components/
│   │   ├── AccessMessage.tsx
│   │   ├── AppButton.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── PermissionGate.tsx
│   │   ├── PhotoGallery.tsx
│   │   └── PhotoPreview.tsx
│   ├── constants/theme.ts
│   ├── hooks/
│   │   ├── useCameraAccess.ts
│   │   └── usePhotoLibrary.ts
│   ├── lib/photoStorage.ts
│   └── types/photo.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Cómo probarla

1. Instalá las dependencias y ejecutá `npx expo start`.
2. Abrí el proyecto en Expo Go, en un Android con cámara.
3. En la primera pantalla, tocá **Permitir cámara** y aceptá el diálogo.
4. Esperá a que desaparezca **Iniciando cámara…**.
5. Tocá el botón circular y comprobá que aparece la vista previa con las medidas de la foto.
6. Tocá **Ver fotos** y confirmá que la fotografía está en la galería. También se abre con el botón **Fotos** del visor.
7. Abrí una foto y tocá **Eliminar**. Después de confirmar, no tiene que seguir en la lista.
8. Tocá **Sacar otra fotografía** y repetí la captura.
9. Cerrá y volvé a abrir la app: las fotos que no borraste siguen en **Fotos**.
10. Probá el cambio entre cámara trasera y frontal, y los modos de flash.
11. Para el rechazo: cerrá la app, entrá a los ajustes de Expo Go, desactivá la cámara y volvé a abrirla. Tiene que verse el mensaje y el botón **Abrir configuración**. Si ya había fotos, también aparece **Ver fotos**.
12. Habilitá la cámara desde ese botón, volvé a Expo Go y confirmá que el visor aparece.

## Capturas de pantalla

Guardá las imágenes en `docs/capturas/` con estos nombres. Cuando los archivos estén, se pueden mostrar así:

### Permiso de cámara

![Pantalla para permitir la cámara](docs/capturas/permiso.png)

### Permiso rechazado

![Mensaje cuando el permiso está rechazado](docs/capturas/permiso-rechazado.png)

### Vista de la cámara

![Visor con el botón para fotografiar](docs/capturas/camara.png)

### Vista previa

![Fotografía capturada y botón para sacar otra](docs/capturas/vista-previa.png)

### Galería

![Fotos guardadas](docs/capturas/galeria.png)
