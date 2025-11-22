
#  MiBarrio - Backend & API

Este repositorio contiene el servidor API y la lógica de negocio de **MiBarrio**, una plataforma de entrega de comida diseñada para digitalizar pequeños negocios peruanos. El sistema gestiona usuarios, pedidos, restaurantes y el seguimiento en tiempo real mediante WebSockets.

---

##  Integrantes del equipo

- **Alexander Josef Soto Ojanasta** - U22228774
- **Erixon Ayrthon Castillo Gabriel** - U20228504
- **Elmer Josue Calizaya Bendezu** - U22220308
- **Bryan Alexis Toribio Soca** - U22210022

---

## 📖 Resumen y Alcance del Sistema

El backend implementa una arquitectura **MVC (Modelo-Vista-Controlador)** robusta sobre Node.js, encargada de orquestar el flujo de datos entre la base de datos, los clientes móviles y los servicios externos.

### Propósito del Sistema
La API soporta tres roles principales con funcionalidades específicas:
| Rol | Funciones Principales |
| :--- | :--- |
| **Cliente** | Explorar catálogo, gestionar carrito, realizar pedidos y rastrear envíos. |
| **Cocinero** | Administrar menú, cambiar estados de órdenes (preparando/listo) y asignar repartidores. |
| **Repartidor** | Recibir asignaciones, actualizar ubicación GPS en tiempo real y confirmar entregas. |

---

## Arquitectura Técnica

El sistema sigue una estructura en capas para separar responsabilidades:

### 1. Puntos de Entrada
- **`server.js`**: Inicializa el servidor HTTP y el servicio de **Socket.IO** (tiempo real). Es el punto de arranque para producción.

### 2. Capas del Sistema
- **Rutas (`/routes`)**: Mapean los endpoints HTTP a los controladores. Aplican middlewares de autenticación (`auth.js`) para proteger recursos.
- **Controladores (`/controllers`)**: Contienen la lógica de negocio. El `ordenController` es el núcleo que gestiona el ciclo de vida del pedido.
- **Modelos (`/models`)**: Definen el esquema de datos utilizando **Sequelize ORM**.

### 3. Capacidades en Tiempo Real (Socket.IO)
El backend gestiona una comunicación bidireccional para:
- **Tracking GPS:** Recibe coordenadas del repartidor cada 2 segundos y las transmite al cliente.
- **Notificaciones:** Alerta al cocinero cuando llega un pedido y al repartidor cuando se le asigna uno.
- **Salas Privadas:** Utiliza "rooms" de Socket.IO para aislar los eventos de cada orden específica.

---

## Stack Tecnológico

| Componente | Tecnología | Versión | Uso |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | ≥18.x | Entorno de ejecución |
| **Framework** | Express | ^5.1.0 | API REST y enrutamiento |
| **Base de Datos** | MySQL | ^3.15.2 | Almacenamiento relacional |
| **ORM** | Sequelize | ^6.37.7 | Modelado de datos |
| **Tiempo Real** | Socket.IO | ^4.8.1 | WebSockets para tracking |
| **Seguridad** | JWT + Bcrypt | ^9.0.2 | Autenticación y hashing |
| **Mapas** | Google Maps API | (Vía Axios) | Geocodificación y rutas |

---

## Base de Datos

El esquema relacional incluye los siguientes modelos clave:
* **Usuarios:** Gestiona los 3 roles mediante un campo `tipo`.
* **Ordenes:** Máquina de estados (`pendiente` ➝ `preparando` ➝ `lista` ➝ `en_ruta` ➝ `entregada`).
* **Restaurantes y Platillos:** Gestión de catálogo y categorías.
* **Direcciones:** Almacena ubicaciones de entrega geocodificadas.

---

## Guía de Instalación y Ejecución

Sigue estos pasos para levantar el servidor en tu entorno local.

### Prerrequisitos
* Node.js (v18 o superior)
* MySQL Server en ejecución

### 1. Instalación

```bash
# Clonar el repositorio
git clone [https://github.com/CBElmer28/MiBarrio-backend.git]
cd mibarrio-backend

# Instalar dependencias
npm install
````

### 2\. Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=mibarrio_db
JWT_SECRET=tu_clave_secreta
GOOGLE_MAPS_API_KEY=tu_api_key_de_google
```

### 3\. Ejecución del Servidor

Para desarrollo (con reinicio automático):

```bash
npm run dev
# o
npx nodemon server.js
```

Para producción:

```bash
node server.js
```

El backend estará disponible en: `http://localhost:3000`

-----

## Flujo de trabajo (Gitflow)

  - `main`: Rama principal y estable para producción.
  - `feats`: Rama base para el desarrollo de nuevas funcionalidades.
  - **Commits:** Deben ser claros y descriptivos.
  - **Pull Requests:** Se realizan desde ramas de características hacia `main` con revisión de código.

-----

## Referencia: Instalación del Frontend (App Móvil)

Si necesitas levantar la aplicación móvil complementaria:

1.  Clona el repositorio del frontend:
    ```bash
    git clone [https://github.com/CBElmer28/MiBarrio.git]
    cd mibarrio-app
    ```
2.  Instala dependencias y ejecuta:
    ```bash
    npm install
    npx expo start
    ```
3.  Escanea el código QR con la app **Expo Go** en tu dispositivo para visualizar la version movil. 
