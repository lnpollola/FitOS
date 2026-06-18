# Apple Health Local Pipeline — Plan de Implementación

> **Propósito:** Instrucciones completas para que una IA (Open Code u otro agente) instale, configure y pruebe un pipeline local que consume `exportar.xml` de Apple Health, lo carga en SQLite y expone una API HTTP consultable. Incluye carga inicial y mecanismo de actualización incremental.
>
> **Leer este archivo antes de ejecutar cualquier tarea.**
> **Actualizar `worklog` al finalizar cada fase.**

---

## Contexto del proyecto

- **Archivo fuente:** `~/.projects/PersonalPollo/ImportData/apple-healt-export/exportar.xml` (export de Apple Health en español, puede venir como `.zip` con ese nombre)
- **Herramienta principal:** [`healthsync`](https://github.com/BRO3886/healthsync) — CLI en Go que parsea el XML usando un streaming parser de bajo consumo (~10MB RAM para archivos de 950MB+), inserta en SQLite con dedup automático (`INSERT OR IGNORE`) y expone un servidor HTTP local.
- **Base de datos:** SQLite en `~/.healthsync/healthsync.db`
- **Objetivo final:** Pipeline local funcional con carga inicial + actualizaciones incrementales, API HTTP para consumo desde dashboard/agentes, y skill instalada en Open Code.

---

## Arquitectura objetivo

```
exportar.xml / exportar.zip
        │
        ▼
  healthsync parse        ← carga inicial o incremental
        │
        ▼
~/.healthsync/healthsync.db   ← SQLite local, WAL mode
        │
   ┌────┴────┐
   │         │
CLI query   HTTP API       ← healthsync server --port 8080
   │         │
   └────┬────┘
        ▼
  Dashboard / Agente AI / Frontend
```

---

## Fase 0 — Verificación del entorno

**Objetivo:** Confirmar que el entorno tiene las dependencias necesarias.

### Tareas

1. Verificar sistema operativo y arquitectura:
   ```bash
   uname -sm
   ```
   Resultado esperado: `Linux x86_64` o `Linux aarch64` (o `Darwin arm64` en Mac).

2. Verificar si Go está instalado (requerido solo si se compila desde fuente):
   ```bash
   go version
   ```
   Versión mínima requerida: `go 1.24`.

3. Verificar si Homebrew está disponible (macOS/Linux):
   ```bash
   brew --version
   ```

4. Verificar que el archivo de exportación existe:
   ```bash
   ls -lh exportar.xml 2>/dev/null || ls -lh exportar.zip 2>/dev/null || echo "ARCHIVO NO ENCONTRADO"
   ```

5. **Criterio de éxito:** El archivo de exportación existe y el entorno tiene Go o Homebrew disponible.

---

## Fase 1 — Instalación de healthsync

**Objetivo:** Instalar el binario `healthsync` disponible en PATH.

### Opción A — Script automático (recomendado para Linux/macOS)

```bash
curl -fsSL https://healthsync.sidv.dev/install | bash
```

Verificar instalación:
```bash
healthsync version
```

### Opción B — Homebrew (macOS/Linux con Homebrew)

```bash
brew tap BRO3886/tap
brew install healthsync
healthsync version
```

### Opción C — Go install

```bash
go install github.com/BRO3886/healthsync@latest
# Asegurarse de que $GOPATH/bin está en PATH:
export PATH="$PATH:$(go env GOPATH)/bin"
healthsync version
```

### Opción D — Compilar desde fuente

```bash
git clone https://github.com/BRO3886/healthsync.git
cd healthsync
make build
# El binario queda en bin/healthsync
sudo mv bin/healthsync /usr/local/bin/healthsync
healthsync version
```

### Test de instalación

```bash
healthsync --help
```

**Criterio de éxito:** El comando `healthsync version` devuelve una versión >= `v0.5.0`.

---

## Fase 2 — Carga inicial del export

**Objetivo:** Parsear `exportar.xml` (o `exportar.zip`) y cargar todos los datos en SQLite.

### Notas técnicas importantes

- healthsync detecta el archivo XML por contenido, no por nombre. El nombre `exportar.xml` en español funciona sin renombrar.
- El parser es streaming (no carga el XML en RAM completo), por lo que archivos de 1-2 GB se procesan sin problema.
- La deduplicación es automática: múltiples importaciones del mismo export no crean duplicados (UNIQUE constraint + INSERT OR IGNORE).
- Los timestamps se normalizan al parsear: se eliminan los offsets de zona horaria (`±HHMM`) para compatibilidad con funciones de fecha de SQLite.

### Comando de carga

```bash
# Con archivo .zip (recomendado, suele ser lo que genera iPhone):
healthsync parse exportar.zip -v

# Con archivo .xml directo:
healthsync parse exportar.xml -v

# Sin verbose (silencioso):
healthsync parse exportar.zip
```

El flag `-v` muestra progreso tabla por tabla. Recomendado en la primera ejecución para diagnosticar si hay métricas no parseadas.

### Verificar la carga

```bash
# Ver info de la base de datos (tablas, número de filas):
healthsync db info

# Queries de muestra para validar datos:
healthsync query steps --limit 10
healthsync query heart-rate --limit 10
healthsync query body-mass --limit 30
healthsync query workouts --limit 5
healthsync query sleep --limit 10
```

### Ubicación de la base de datos

```bash
ls -lh ~/.healthsync/healthsync.db
```

**Criterio de éxito:** El archivo `~/.healthsync/healthsync.db` existe, tiene tamaño > 0, y al menos 3 de los queries de muestra devuelven datos.

---

## Fase 3 — Actualización incremental

**Objetivo:** Implementar el flujo para añadir nuevas mediciones del reloj sin duplicar datos.

### Estrategia de actualización

healthsync soporta re-importación idempotente: ejecutar `healthsync parse` sobre un export nuevo (con registros más recientes) añadirá solo los registros nuevos gracias a las constraints UNIQUE de SQLite. **No hay un comando de "sync delta" separado — simplemente se re-parsea el export completo**.

### Flujo de actualización manual

```bash
# 1. Exportar datos desde iPhone (Health app → perfil → Exportar datos de salud)
# 2. Copiar el nuevo exportar.zip al servidor local
# 3. Re-parsear:
healthsync parse exportar_nuevo.zip -v
# Solo se insertarán registros que no existían antes
```

### Flujo de actualización automática vía HTTP (recomendado para uso con reloj/iPhone Shortcuts)

healthsync incluye un servidor HTTP con endpoint de upload asíncrono. Permite enviar el export desde iPhone a través de la red local (o Tailscale):

```bash
# Iniciar el servidor:
healthsync server --port 8080 --host 0.0.0.0
```

Endpoints disponibles:
- `POST /api/upload` — sube `.zip` o `.xml` (multipart, campo `file`). Devuelve `202 Accepted` y parsea en background.
- `GET /api/upload/status` — consulta el estado del parseo en curso.
- `GET /api/health/{table}?from=&to=&limit=` — consulta datos como JSON.

Ejemplo de upload desde curl (o desde un Atajo de iOS):

```bash
# Upload desde la misma red local:
curl -F "file=@exportar.zip" http://localhost:8080/api/upload

# Verificar progreso:
curl http://localhost:8080/api/upload/status

# Query de ejemplo via API:
curl "http://localhost:8080/api/health/heart-rate?limit=5"
curl "http://localhost:8080/api/health/steps?from=2026-01-01&to=2026-06-30"
curl "http://localhost:8080/api/health/body-mass?limit=30"
```

### Atajo de iOS para actualización automática

Crear un Atajo en iPhone (app Atajos) con estos pasos:
1. Exportar datos de salud → guardar como archivo.
2. Acción "Obtener contenido de URL":
   - URL: `http://<IP_LOCAL>:8080/api/upload` (o dirección Tailscale)
   - Método: POST
   - Cuerpo: Multipart Form → campo `file` = el archivo del paso anterior.

**Criterio de éxito:** Al hacer upload de un export nuevo, `GET /api/upload/status` devuelve `{"status":"done"}` y una query posterior muestra datos del período más reciente.

---

## Fase 4 — Integración con agente AI (Open Code)

**Objetivo:** Instalar la skill de healthsync en Open Code para poder consultar los datos en lenguaje natural.

### Instalar la skill

```bash
healthsync skills install
```

Esto escribe el schema, referencia CLI y ejemplos SQL en `~/.claude/skills/healthsync/`. Open Code los cargará automáticamente en la próxima sesión.

### Verificar instalación de skills

```bash
healthsync skills status
```

### Consultas de ejemplo para Open Code

Una vez instalada la skill, Open Code puede responder preguntas como:

- "¿Cuál fue mi frecuencia cardíaca media la semana pasada?"
- "¿Cuántos pasos hice en promedio en junio?"
- "¿Cuál es mi tendencia de peso en los últimos 6 meses?"
- "Muéstrame mis sesiones de sueño del último mes ordenadas por duración"

El agente traduce cada pregunta en una query SQL sobre `~/.healthsync/healthsync.db`.

---

## Fase 5 — Pruebas completas

**Objetivo:** Validar que el pipeline está operativo de extremo a extremo.

### Test 1 — Integridad de datos

```bash
# Verificar que todas las tablas clave tienen datos:
healthsync query steps --limit 5
healthsync query heart-rate --limit 5
healthsync query resting-heart-rate --limit 5
healthsync query hrv --limit 5
healthsync query body-mass --limit 5
healthsync query sleep --limit 5
healthsync query workouts --limit 5
healthsync query active-energy --limit 5
```

Cada query debe devolver al menos 1 fila. Si alguna tabla aparece vacía, verificar con `-v` en el parse si healthsync encontró registros de ese tipo en el export.

### Test 2 — Totales diarios (dedup)

```bash
# Totales sin duplicados de pasos y energía:
healthsync query steps --total --from 2026-01-01
healthsync query active-energy --total --from 2026-01-01
healthsync query sleep --total --from 2026-01-01
```

**Criterio:** Los valores de pasos diarios deben ser plausibles (500–20000 pasos/día). Valores extremos (>100000) indican duplicados no deduplicados.

### Test 3 — API HTTP

```bash
# En una terminal, iniciar el servidor:
healthsync server --port 8080 &

# En otra terminal, probar los endpoints:
curl -s "http://localhost:8080/api/health/heart-rate?limit=3" | python3 -m json.tool
curl -s "http://localhost:8080/api/health/steps?from=2026-06-01" | python3 -m json.tool
curl -s "http://localhost:8080/api/health/body-mass?limit=5" | python3 -m json.tool
```

**Criterio:** Cada endpoint devuelve JSON válido con registros.

### Test 4 — Idempotencia (sin duplicados en re-importación)

```bash
# Contar filas antes:
sqlite3 ~/.healthsync/healthsync.db "SELECT COUNT(*) FROM steps;"

# Re-importar el mismo export:
healthsync parse exportar.zip

# Contar filas después:
sqlite3 ~/.healthsync/healthsync.db "SELECT COUNT(*) FROM steps;"
```

**Criterio:** El número de filas debe ser idéntico antes y después de la re-importación.

### Test 5 — Query SQL directa

```bash
# Conectar directamente a la DB para verificar schema:
sqlite3 ~/.healthsync/healthsync.db ".tables"
sqlite3 ~/.healthsync/healthsync.db ".schema body_mass"
sqlite3 ~/.healthsync/healthsync.db "SELECT * FROM body_mass ORDER BY start_date DESC LIMIT 10;"
```

---

## Fase 6 — Persistencia del servidor HTTP (opcional)

**Objetivo:** Dejar el servidor HTTP corriendo como proceso persistente para que el dashboard/agente siempre tenga acceso.

### Opción A — PM2 (recomendado si ya tienes PM2 en el proyecto)

```bash
pm2 start "healthsync server --port 8080 --host 0.0.0.0" --name healthsync-server
pm2 save
pm2 startup
```

### Opción B — systemd (Linux)

```bash
sudo tee /etc/systemd/system/healthsync.service > /dev/null << 'EOF'
[Unit]
Description=healthsync HTTP server
After=network.target

[Service]
ExecStart=/usr/local/bin/healthsync server --port 8080 --host 0.0.0.0
Restart=on-failure
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable healthsync
sudo systemctl start healthsync
sudo systemctl status healthsync
```

### Opción C — Docker Compose (si prefieres contenedor)

```yaml
# docker-compose.yml
version: "3.9"
services:
  healthsync:
    image: golang:1.24-alpine
    working_dir: /app
    command: >
      sh -c "go install github.com/BRO3886/healthsync@latest &&
             healthsync server --port 8080 --host 0.0.0.0 --db /data/healthsync.db"
    ports:
      - "8080:8080"
    volumes:
      - healthsync_data:/data
      - ./exports:/exports   # montar directorio con los exportar.zip
volumes:
  healthsync_data:
```

**Criterio de éxito:** `curl http://localhost:8080/api/health/steps?limit=1` devuelve JSON válido tras reiniciar el sistema.

---

## Tablas disponibles en SQLite

Las siguientes tablas son creadas automáticamente por healthsync al parsear el export. Usarlas directamente con SQL o vía CLI.

| Tabla | Métrica | Notas |
|---|---|---|
| `heart_rate` | Frecuencia cardíaca | BPM |
| `resting_heart_rate` | FC en reposo diaria | BPM |
| `hrv` | Variabilidad cardíaca | ms (SDNN) |
| `spo2` | Saturación de oxígeno | fracción 0-1 |
| `vo2_max` | VO2 máximo | mL/min·kg |
| `steps` | Pasos | `--total` soportado |
| `active_energy` | Calorías activas | kcal, `--total` soportado |
| `basal_energy` | Calorías basales | kcal, `--total` soportado |
| `workouts` | Entrenamientos | duración, distancia, energía |
| `body_mass` | Peso corporal | kg/lb |
| `body_mass_index` | IMC | — |
| `sleep` | Análisis de sueño | fases de sueño |
| `distance_walking_running` | Distancia caminada/corrida | km |
| `distance_cycling` | Distancia en bici | km |
| `exercise_time` | Tiempo de ejercicio | minutos |
| `blood_pressure` | Tensión arterial | sistólica/diastólica mmHg |
| `walking_steadiness` | Estabilidad al caminar | — |
| `wrist_temperature` | Temperatura de muñeca (sueño) | desviación °C |
| `time_in_daylight` | Tiempo al sol | minutos |

---

## Queries SQL útiles de referencia

```sql
-- Peso corporal últimos 90 días
SELECT date(start_date) as dia, value, unit
FROM body_mass
ORDER BY start_date DESC
LIMIT 90;

-- Media de pasos por semana en 2026
SELECT strftime('%Y-W%W', start_date) as semana, SUM(value) as pasos_totales
FROM steps
WHERE start_date >= '2026-01-01'
GROUP BY semana
ORDER BY semana;

-- Frecuencia cardíaca media por día
SELECT date(start_date) as dia, ROUND(AVG(value), 1) as fc_media
FROM heart_rate
GROUP BY dia
ORDER BY dia DESC
LIMIT 30;

-- Entrenamientos del último mes
SELECT date(start_date) as fecha, workout_activity_type, ROUND(duration/60.0, 1) as minutos,
       ROUND(total_energy_burned, 0) as kcal, ROUND(total_distance, 2) as km
FROM workouts
WHERE start_date >= date('now', '-30 days')
ORDER BY start_date DESC;

-- Sueño total por noche (deduplicated)
SELECT date(start_date, '-6 hours') as noche,
       ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as horas_dormido
FROM sleep
WHERE value LIKE '%Asleep%'
GROUP BY noche
ORDER BY noche DESC
LIMIT 30;

-- HRV semanal
SELECT strftime('%Y-W%W', start_date) as semana, ROUND(AVG(value), 1) as hrv_ms
FROM hrv
GROUP BY semana
ORDER BY semana DESC
LIMIT 12;
```

---

## Troubleshooting frecuente

| Problema | Causa probable | Solución |
|---|---|---|
| `ARCHIVO NO ENCONTRADO` en Fase 0 | El export no está en el directorio actual | Mover `exportar.xml`/`exportar.zip` al directorio de trabajo |
| Parse termina pero tablas vacías | El XML es de un dispositivo no-reloj o tiene métricas distintas | Ejecutar con `-v` para ver qué tipos encontró |
| Pasos duplicados / valores irreales | Datos de varias fuentes (iPhone + Watch) | Usar `--total` que aplica dedup por prioridad Watch > iPhone |
| Servidor HTTP no responde | Puerto 8080 ocupado | Cambiar: `healthsync server --port 9090` |
| `409 Conflict` en `/api/upload` | Ya hay un parse en curso | Esperar y consultar `/api/upload/status` |
| Fechas incorrectas en queries SQL | Offset de timezone en timestamps | healthsync v0.5.1+ normaliza automáticamente; actualizar si la versión es antigua |
| `permission denied` al instalar | Sin permisos en `/usr/local/bin` | Usar `sudo` o instalar en `~/bin` y añadir al PATH |

---

## Worklog

```
FASE 0 — Verificación del entorno
  Estado: [ ] PENDIENTE
  Fecha:
  Resultado:

FASE 1 — Instalación de healthsync
  Estado: [ ] PENDIENTE
  Opción usada:
  Versión instalada:

FASE 2 — Carga inicial
  Estado: [ ] PENDIENTE
  Archivo parseado:
  Tablas con datos:
  Tamaño DB:

FASE 3 — Actualización incremental
  Estado: [ ] PENDIENTE
  Método elegido: [ ] Manual  [ ] HTTP server  [ ] iOS Shortcut

FASE 4 — Skill Open Code
  Estado: [ ] PENDIENTE

FASE 5 — Pruebas completas
  Test 1 (integridad):   [ ] OK  [ ] FAIL
  Test 2 (totales):      [ ] OK  [ ] FAIL
  Test 3 (API HTTP):     [ ] OK  [ ] FAIL
  Test 4 (idempotencia): [ ] OK  [ ] FAIL
  Test 5 (SQL directa):  [ ] OK  [ ] FAIL

FASE 6 — Servidor persistente
  Estado: [ ] PENDIENTE / [ ] NO REQUERIDO
  Método elegido:
```

---

## Referencias

- Repositorio healthsync: https://github.com/BRO3886/healthsync
- Documentación healthsync: https://healthsync.sidv.dev
- CLAUDE.md del repo (schema y detalles técnicos): https://github.com/BRO3886/healthsync/blob/main/CLAUDE.md
- Parsing de Apple Health XML con Python (referencia alternativa): https://www.jonbusby.co.uk/2021/06/11/analysing-apple-health-data-in-python-part-1-extraction-and-sleep-data/
