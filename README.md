# 📱 MiBarrio - Proyecto Universitario

Aplicación móvil multiplataforma desarrollada en el curso de Desarrollo de Aplicaciones Móviles en la Universidad Tecnológica del Perú. El objetivo es facilitar la digitalización de pequeños negocios peruanos mediante una plataforma accesible, intuitiva y enfocada en la economía local.

## 👥 Integrantes del equipo

- Alexander Josef Soto Ojanasta - U22228774
- Erixon Ayrthon Castillo Gabriel - U20228504
- Elmer Josue Calizaya Bendezu - U22220308
- Bryan Alexis Toribio Soca - U22210022

---

## 🚀 Tecnologías utilizadas

- Frontend: React Native + Expo Go
- Backend: Node.js + Express
- Navegación: React Navigation + Native Stack
- Almacenamiento local: AsyncStorage
- APIs: RESTful con Axios y Fetch
- Build: EAS Build

---

## 🧭 Flujo de trabajo (Gitflow)

- `main`: rama principal y estable
- `feats`: rama para desarrollo de nuevas funcionalidades
- Commits deben ser claros y descriptivos
- Pull Requests desde `feats` hacia `main` con revisión entre pares

---

## 📦 Instalación del Frontend

1. Clona el repositorio:

```bash
   git clone https://github.com/CBElmer28/MiBarrio.git
   cd mibarrio-app
```

2. Instala las dependencias:

```bash
    npm install
```
 3. Instala Expo CLI si no lo tienes:

 ```bash
    npm install -g expo-cli
```
4. Ejecuta la app en modo desarrollo:
```bash
    expo start
```
5. Escanea el QR con Expo Go en tu dispositivo móvil (Android/iOS).

## 🛠️ Construcción con EAS Build

1. Instala EAS CLI:

```bash
    npm install -g eas-cli
```
2. Autentícate con tu cuenta de Expo:

```bash
    eas login
```
 3. Configura el proyecto:

 ```bash
    eas init
```
4. Realiza el build para Android:
```bash
    eas build --platform android
```
5. Para iOS (requiere cuenta Apple Developer):
```bash
    eas build --platform ios
```
6. El archivo .apk o .ipa estará disponible en tu cuenta de Expo.

## 🔧 Instalación del Backend (Node.js)

1. Asegúrate de tener Node.js instalado (versión recomendada: ≥ 18.x):

```bash
    node -v
    npm -v
```
2. Clona el repositorio backend:

```bash
    git clone https://github.com/CBElmer28/MiBarrio-backend.git
    cd mibarrio-backend
```
 3. Instala las dependencias:

 ```bash
    npm install
```
4. Ejecuta el servidor:
```bash
    node app.js
```
5. El backend estará corriendo en http://localhost:3000 por defecto.
