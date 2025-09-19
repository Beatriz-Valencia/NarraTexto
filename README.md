# 🖼️ Narrador Visual

[![React](https://img.shields.io/badge/React-18%2F19-61DAFB?logo=react&logoColor=white&style=flat)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=white&style=flat)](https://vitejs.dev/)
[![CSS](https://img.shields.io/badge/CSS-Modules-1572B6?logo=css3&logoColor=white&style=flat)](https://developer.mozilla.org/docs/Web/CSS)


Aplicación web en React que **convierte texto en una narración hablada acompañada de un pase automático de imágenes relacionadas**, obtenidas desde Unsplash.  
Permite al usuario escribir un texto, elegir un tema visual y reproducir ambos sincronizadamente.

---

## ✨ Características

- 📝 **Editor de texto** para escribir o pegar contenido.
- 🖼️ **Búsqueda automática de imágenes** en Unsplash según el tema indicado.
- 🗣️ **Síntesis de voz (TTS)** usando la API `speechSynthesis` del navegador.
- 📸 **Rotación automática de imágenes** sincronizada con la narración.
- ⏯️ Controles de reproducción: reproducir, pausar, reanudar y detener.
- 💾 Persistencia mínima en `localStorage` (en el modo lector independiente).
- 📱 Compatible con dispositivos móviles (incluye gesto inicial para habilitar audio).

---

## ⚙️ Tecnologías utilizadas

- ⚛️ **React 18/19** (con soporte aplicado vía `@ant-design/v5-patch-for-react-19`)
- ⚡ **Vite** — Bundler y entorno de desarrollo
- 🧭 **React Router DOM** — Navegación SPA
- 🎨 **Ant Design (antd)** — Componentes UI (botones, inputs, tarjetas, tipografía…)
- 🧠 **Context API de React** — Estado global (`SessionContext`)
- 🎨 **CSS** — Estilos base y locales por componente
- 🌄 **Unsplash API — Obtiene imágenes relacionadas con el texto introducido

---

## 🧠 Flujo de funcionamiento

1. El usuario accede a la pantalla **Editor (`/`)** donde:
   - Escribe un texto narrativo largo en un `<TextArea>`.
   - Indica un **tema o categoría** que servirá para buscar imágenes.
2. Al pulsar el botón principal:
   - Se almacenan el **texto** y la **categoría** en el estado global (`SessionContext`).
   - Se navega a la pantalla **Player**, donde se construye un **deck de imágenes** (objetos `{url, authorName, unsplashLink}`) usando la API de Unsplash.
3. En **Player**:
   - Se reproduce una **secuencia automática de imágenes** (rotadas mediante `ImageRotator`).
   - También se puede **pausar, detener o reanudar** la reproducción.
4. Todo este flujo es **client-side**: no usa base de datos ni servidor.  
   El estado persiste **solo mientras dure la sesión** del navegador.

---

## 📌 Notas técnicas

- `SessionContext` permite que cualquier componente acceda y modifique `text` y `query`.
- Los componentes UI (`AppButton`, `AppInput`, etc.) son **wrappers ligeros de Ant Design** que centralizan estilos y logs de desarrollo.
- `ImageRotator` gestiona el renderizado de imágenes y sus créditos a Unsplash.
- El proyecto está preparado para **React 19** usando `@ant-design/v5-patch-for-react-19`.

---

## 🧩 Estructura principal

```plaintext
src/
│
├─ main.jsx                 # Punto de entrada (ReactDOM + Router + SessionContext)
├─ state/SessionContext.jsx # Estado global (texto y query compartidos entre pantallas)
│
├─ components/
│   ├─ ImageRotator.jsx     # Muestra y rota imágenes con créditos de Unsplash
│   ├─ Editor.jsx            # Pantalla de edición de texto y selección de tema
│   ├─ Player.jsx            # Pantalla que combina narración + pase de imágenes
│   ├─ VoiceReader.jsx       # Versión autónoma del reproductor con estado local
│   └─ Welcome.jsx            # Pantalla de bienvenida
│
├─ hooks/
│   ├─ useSpeechSynthesis.js # Control avanzado de TTS: speak/pause/resume/stop
│   └─ useImageRotation.js   # Hook para avanzar el índice de imagen cada X segundos
│
├─ styles/
│   ├─ index.css             # Estilos globales base
│   └─ *.module.css          # Estilos locales por componente
│
└─ lib/
    ├─ unsplash.js            # Búsqueda aleatoria de imágenes
    └─ preload.js              # Precarga de imágenes

```
---

## ⚙️ Requisitos

- Node.js 18+
- Navegador compatible con Web Speech API (`speechSynthesis`)

---

## 🚀 Instalación y uso

```
# Instalar dependencias
npm install

# Configurar clave de Unsplash (crear archivo .env)
echo "VITE_UNSPLASH_KEY=tu_clave_aquí" > .env

# Ejecutar en modo desarrollo
npm run dev
```

## 📌 Notas finales

Si no se proporciona una clave de Unsplash, la funcionalidad de imágenes podría no estar disponible.

La reproducción de audio puede requerir un gesto de usuario (clic/tap) en dispositivos móviles para desbloquear el contexto de audio.

## 💜 Tu Feedback
Si te ha gustado este proyecto o quieres comentar cualquier mejora conmigo, no dudes en contactarme por email o por Linkedin.