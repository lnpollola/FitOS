# FitOS - Guía de Despliegue

FitOS soporta dos modos de ejecución: **Web (producción)** y **Electron (desarrollo)**.

## 🎯 Configuración Recomendada

**Web como modo principal** (producción, multi-dispositivo):
```bash
npm run switch:web
npm run build:web
npm run start:web
```

**Electron solo para desarrollo** (debugging, testing):
```bash
npm run switch:electron
npm run dev
```

## ⚠️ Importante: Recompilación de better-sqlite3

better-sqlite3 es un módulo nativo que debe compilarse específicamente para cada entorno.

**Script automático de cambio de modo (recomendado):**
```bash
# Cambiar a modo Web
npm run switch:web && npm run build:web && npm run start:web

# Cambiar a modo Electron
npm run switch:electron && npm run dev
```

El script `switch:web` y `switch:electron` detecta automáticamente si necesitas recompilar y solo lo hace cuando cambias de modo.

**Recompilación manual (si es necesario):**
- Para Web: `npm run rebuild:web`
- Para Electron: `npm run rebuild:electron`

## 📊 Base de Datos Compartida

Ambos modos usan la **misma base de datos** ubicada en:
```
~/.fitos-data/health-data.db
```

**Ventajas:**
- ✅ No necesitas sincronizar datos entre modos
- ✅ Los datos persisten al cambiar de modo
- ✅ Una sola fuente de verdad

## Modos de Ejecución

### 1. Modo Web (Producción - Multi-dispositivo)
Servidor web accesible desde cualquier dispositivo en la red.

**Producción:**
```bash
npm run switch:web
npm run build:web
npm run start:web
```

**Desarrollo (Vite + Express):**
```bash
npm run switch:web
npm run dev:web:full
```

**Acceso desde la red:**
- Desde el mismo equipo: `http://localhost:3000`
- Desde otros dispositivos: `http://<IP-DEL-SERVIDOR>:3000`

Para encontrar tu IP en WSL:
```bash
hostname -I
```

### 2. Modo Electron (Desarrollo)
Aplicación de escritorio para debugging y testing.

**Desarrollo:**
```bash
npm run switch:electron
npm run dev
```

**Build de producción (instaladores):**
```bash
npm run switch:electron
npm run build
```
Esto genera instaladores en `release/` (NSIS para Windows, AppImage para Linux, dmg para Mac).

## Arquitectura

```
┌─────────────────────────────────────────────┐
│  Servidor Express (puerto 3000)             │
│  ├─ API REST (/api/*)                       │
│  ├─ Archivos estáticos (dist/renderer/)     │
│  └─ SQLite (~/.fitos-data/health-data.db)  │
└─────────────────────────────────────────────┘
         ↑ HTTP/REST
         │
┌────────┴────────┬──────────────┐
│ Navegador       │ Electron     │
│ (cualquier      │ (desarrollo) │
│ dispositivo)    │              │
└─────────────────┴──────────────┘
```

## Características por Modo

| Característica | Web (Producción) | Electron (Desarrollo) |
|----------------|------------------|------------------------|
| Acceso a datos | ✅ Compartido | ✅ Compartido |
| Multi-dispositivo | ✅ | ❌ |
| Apple Health Sync | ⚠️ Limitado | ✅ Completo |
| Notificaciones nativas | ❌ | ✅ |
| Offline | ❌ | ✅ |
| Acceso remoto | ✅ | ❌ |
| Instalación | No requerida | Requerida |

## Configuración Avanzada

### Cambiar puerto del servidor web
```bash
PORT=8080 npm run start:web
```

### Acceso desde internet (exponer servidor)
Para acceder desde fuera de tu red local, necesitas:
1. Configurar port forwarding en tu router (puerto 3000)
2. O usar un servicio como ngrok:
```bash
ngrok http 3000
```

### Producción con PM2 (recomendado para servidores)
```bash
npm install -g pm2
pm2 start src/server/start-web.js --name fitos
pm2 save
pm2 startup
```

## Flujo de Trabajo Recomendado

### Desarrollo diario
```bash
# Iniciar servidor web (accesible desde todos los dispositivos)
npm run start:web

# En otra terminal, si necesitas debuggear con Electron
npm run switch:electron
npm run dev
```

### Publicar nueva versión
```bash
# 1. Cambiar a modo web
npm run switch:web

# 2. Compilar frontend
npm run build:web

# 3. Iniciar servidor
npm run start:web

# 4. (Opcional) Usar PM2 para producción
pm2 start src/server/start-web.js --name fitos
```

## Notas Importantes

- **Datos compartidos**: Ambos modos usan la misma base de datos en `~/.fitos-data/`
- **Backup**: Usa la función de exportar datos desde Perfil & Settings
- **Seguridad**: Para producción, considera añadir autenticación y HTTPS
- **HealthSync**: La sincronización completa con Apple Health solo funciona en Electron

## Troubleshooting

**"Sin conexión" desde Windows host:**
- Asegúrate de que el servidor escucha en `0.0.0.0` (ya configurado)
- Verifica que el firewall de WSL permite el puerto 3000
- Usa `http://<IP-WSL>:3000` en lugar de `localhost`

**Puerto 3000 ocupado:**
```bash
PORT=3001 npm run start:web
```

**Error de módulos nativos (better-sqlite3):**
```bash
# Para modo web
npm run rebuild:web

# Para modo electron
npm run rebuild:electron
```

**Cambio de modo lento:**
- La primera vez que cambias de modo, se recompila better-sqlite3 (~30s)
- Las siguientes veces es instantáneo si no cambias de modo
