# Sistema de Seed y Datos Maestros

Documentación técnica del sistema que mantiene los datos semilla (alimentos, ejercicios, planes, plantillas) sincronizados entre el código y la base de datos local.

## Índice

1. [Arquitectura general](#arquitectura-general)
2. [Versionado y migraciones](#versionado-y-migraciones)
3. [Cómo agregar o actualizar alimentos](#cómo-agregar-o-actualizar-alimentos)
4. [Cómo agregar o actualizar ejercicios](#cómo-agregar-o-actualizar-ejercicios)
5. [Cómo agregar o actualizar planes de entrenamiento](#cómo-agregar-o-actualizar-planes-de-entrenamiento)
6. [Cómo agregar o actualizar plantillas de comidas](#cómo-agregar-o-actualizar-plantillas-de-comidas)
7. [Cómo agregar o actualizar platos elaborados](#cómo-agregar-o-actualizar-platos-elaborados)
8. [Flujo completo de un cambio de seed](#flujo-completo-de-un-cambio-de-seed)
9. [Problemas conocidos y gotchas](#problemas-conocidos-y-gotchas)

---

## Arquitectura general

El sistema de seed vive en `src/db/seed-data.js` y se ejecuta desde `src/db/database.js` durante `initDatabase()`. Tiene dos componentes principales:

```
src/db/seed-data.js
├── FOOD_ITEMS[]           # Lista maestra de alimentos (198 items)
├── EXERCISES[]            # Lista maestra de ejercicios (53 items)
├── WORKOUT_PLANS[]        # Planes de fuerza (5 planes)
├── HIIT_WOD_PLANS[]       # Planes HIIT/WOD/METCON/HYBRID (12 planes)
├── MEAL_COMPONENTS[]      # Plantilla de 5 comidas × 5 slots
├── inRange()              # Helper para generar opciones por categoría
└── Funciones:
    ├── seedIfEmpty(db)            # Solo si las tablas están vacías (instalación limpia)
    ├── migrateSeedData(db)        # Upsert idempotente de foods/exercises/plans
    └── resetSeedTemplates(db)     # Reset completo de templates (FK-safe)

src/db/database.js
├── initDatabase()         # Llama seedIfEmpty + migrateSeedData
├── runMigrations()        # Schema v1 → v5 (columnas, índices)
└── createTables()         # Crea schema inicial
```

### Flujo al iniciar la app

```
initDatabase()
  ↓
createTables()  →  Crea schema + corre migraciones v1..v5
  ↓
seedIfEmpty(db)  →  Solo si la DB está vacía (instalación nueva)
  ↓
migrateSeedData(db)
  ↓  ¿seed_version >= 3?
  ├─ Sí  →  return (ya está actualizado)
  └─ No  →  Upsert de foods/exercises/plans
            ↓
            resetSeedTemplates(db)
              ↓  ¿seed_template_version >= 2?
              ├─ Sí  →  return
              └─ No  →  Reset completo de templates
```

### Versionado

Dos settings independientes en la tabla `settings`:

| Setting | Propósito | Cuándo bumpear |
|---|---|---|
| `schema_version` | Versión del schema (columnas, tablas) | Cambios en `database.js` migraciones |
| `seed_version` | Versión de los datos upsert (foods/exercises/plans) | Cambios incrementales en arrays de seed |
| `seed_template_version` | Versión del reset de templates (meal_components, etc.) | Reset completo de plantillas/platos |

Valores actuales:
- `schema_version = 5`
- `seed_version = 3`
- `seed_template_version = 2`

---

## Versionado y migraciones

### Cuándo agregar una migración de schema (v6, v7, ...)

Solo si necesitás agregar/renombrar columnas o tablas. Editá `src/db/database.js` en la función `runMigrations()`:

```js
if (!schemaVersion || parseInt(schemaVersion) < 6) {
  // Migration N: descripción
  const newCols = [
    ['column_name', 'TYPE DEFAULT ...'],
  ];
  for (const [col, type] of newCols) {
    const exists = db.prepare(`SELECT COUNT(*) as cnt FROM pragma_table_info('tabla') WHERE name='${col}'`).get();
    if (exists.cnt === 0) db.exec(`ALTER TABLE tabla ADD COLUMN ${col} ${type}`);
  }
  
  // Si la columna es crítica para el seed, llamá resetSeedTemplates(db) o migrateSeedData(db) acá
  
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '6')").run();
}
```

**Importante:** todas las migraciones son idempotentes (chequean si la columna existe antes de agregar). Si agregás una columna que el seed necesita y la migración ya corrió en versiones anteriores, agregá un bloque idempotente FUERA del `if (parseInt(schemaVersion) < N)` para asegurarte que se ejecute.

### Cuándo bumpear `seed_version`

Cuando agregás o modificás items en `FOOD_ITEMS`, `EXERCISES`, `WORKOUT_PLANS`, o `HIIT_WOD_PLANS` (cambios incrementales que se aplican con upsert). Cambiá `SEED_VERSION` en `migrateSeedData`:

```js
function migrateSeedData(db) {
  const SEED_VERSION = 4;  // ← bumpear acá
  // ...
}
```

### Cuándo bumpear `seed_template_version`

Cuando necesitás un reset completo de `meal_components`, `exercise_library`, `workout_plans`, o `elaborated_dishes` (ej: cambios estructurales grandes, nuevos campos requeridos, IDs que cambian). Cambiá `TPL_VERSION` en `resetSeedTemplates`:

```js
function resetSeedTemplates(db) {
  const TPL_VERSION = 3;  // ← bumpear acá
  // ...
}
```

**Advertencia:** bumpear `seed_template_version` borra datos del usuario (daily plans, training sets, custom templates). Solo hacerlo cuando sea necesario.

---

## Cómo agregar o actualizar alimentos

### Agregar un alimento nuevo

Editá `src/db/seed-data.js` en el array `FOOD_ITEMS`. Elegí el ID correcto según la categoría:

| Rango | Categoría |
|---|---|
| 1-27 | Cereales y Pan |
| 28-61 | Proteínas |
| 62-67 | Legumbres |
| 68-84 | Grasas Saludables |
| 85-99 | Lácteos |
| 100-126 | Frutas |
| 127-158 | Verduras |
| 159-167 | Bebidas y Extras |
| 168-179 | Salsas y Condimentos |
| 180-184 | Especias y Condimentos |
| 185-191 | Dulces y Caprichos |
| 192-198 | Platos Preparados |

**Si agregás al final:** usá `foods.length + 1` como ID (1-indexed). El array es 0-indexed en JS pero los IDs en la DB son 1-indexed.

**Si querés insertar en una posición específica:** mové los items siguientes y actualizá los IDs en `MEAL_COMPONENTS.options` que los referencien.

```js
const FOOD_ITEMS = [
  // ... existentes ...
  { name: 'Nuevo Alimento', kcal_per_100g: 100, protein_per_100g: 10, carbs_per_100g: 15, fat_per_100g: 2, fiber_per_100g: 3, category: 'Categoría' },
];
```

### Modificar un alimento existente

Simplemente editá el objeto en `FOOD_ITEMS`. El `migrateSeedData` hace upsert por nombre: si el nombre existe, actualiza los campos; si no, lo inserta.

### Ver los IDs actuales

```bash
node -e "const sd = require('./src/db/seed-data.js'); sd.FOOD_ITEMS.forEach((f, i) => console.log(\`\${i+1}: \${f.name} [\${f.category}]\`));"
```

### Bumpear versión

Si agregaste alimentos nuevos, bumpeá `SEED_VERSION` en `migrateSeedData`. Si agregaste una categoría nueva o cambiaste IDs significativamente, bumpeá `seed_template_version` para resetear `MEAL_COMPONENTS`.

---

## Cómo agregar o actualizar ejercicios

### Agregar un ejercicio nuevo

Editá `src/db/seed-data.js` en el array `EXERCISES`. Campos obligatorios:

```js
{ 
  name: 'Nombre del Ejercicio',           // único, se usa para upsert
  muscle_group: 'Pecho',                  // grupo muscular principal
  equipment: 'Barra',                     // equipamiento
  movement_pattern: 'Empuje Horizontal',  // patrón de movimiento
  category: 'Fuerza Principal',           // Movilidad | Fuerza Principal | Fuerza Auxiliar | Core | Cardio/Funcional
  difficulty: 'Intermedio',               // Principiante | Intermedio | Avanzado
  intensity: 'Alta',                      // Baja | Media | Alta
  bilateral: true,                        // true si es bilateral, false si unilateral
  explosive: false,                       // true si es pliométrico/explosivo
  unilateral: false,                      // true si es unilateral
  secondary_muscles: ['Tríceps', 'Core']  // array de músculos secundarios (se guarda como JSON)
}
```

### Modificar un ejercicio existente

Editá el objeto en `EXERCISES`. El `migrateSeedData` hace upsert por nombre y actualiza todos los campos (incluido `category`, `difficulty`, `intensity`, `secondary_muscles`, etc.).

### Vincular con planes de entrenamiento

Los `workout_plan_days` referencian ejercicios por ID (CSV en `exercise_ids`). Si agregás un ejercicio al final del array, su ID será `EXERCISES.length`. Actualizá los `workout_plan_days` correspondientes en `WORKOUT_PLANS` o `HIIT_WOD_PLANS`.

**Importante:** los exercise_ids en los planes asumen que el orden de `EXERCISES` es estable. Si reordenás ejercicios, los planes apuntarán a ejercicios incorrectos. En ese caso, bumpeá `seed_template_version` para resetear los planes.

---

## Cómo agregar o actualizar planes de entrenamiento

### Agregar un plan nuevo

Editá `src/db/seed-data.js` en `WORKOUT_PLANS` (fuerza) o `HIIT_WOD_PLANS` (HIIT/WOD/METCON/HYBRID):

```js
{
  name: 'Mi Plan 7x Custom',
  type: 'Fuerza',              // Fuerza | HIIT | WOD | METCON | HYBRID
  style: 'Upper/Lower',        // estilo de entrenamiento
  min_sessions: 4, max_sessions: 4,
  level: 'Intermedio',         // nivel
  estimated_duration_min: 60,  // duración estimada
  goal: ['Hipertrofia'],       // array de objetivos (se guarda como JSON)
  days: [
    { 
      day_number: 1, 
      focus_area: 'Pierna', 
      exercise_ids: '11,13,14,21',  // CSV de IDs de exercise_library
      prescribed_reps: '8,10,8,12',  // opcional, para planes HIIT/WOD
      scaling_beginner: '...',       // opcional
      scaling_advanced: '...'        // opcional
    }
  ]
}
```

### Ver los IDs de ejercicios

```bash
node -e "const sd = require('./src/db/seed-data.js'); sd.EXERCISES.forEach((e, i) => console.log(\`\${i+1}: \${e.name}\`));"
```

### Bumpear versión

Si agregaste un plan nuevo (sin tocar los existentes), bumpeá `SEED_VERSION`. Si modificaste planes existentes o sus `exercise_ids`, bumpeá `seed_template_version` para resetear.

---

## Cómo agregar o actualizar plantillas de comidas

### Estructura de MEAL_COMPONENTS

Cada meal template (1=Desayuno, 2=Media Mañana, 3=Comida, 4=Merienda, 5=Cena) tiene N componentes. Cada componente es un slot (Carbs, Proteína, etc.) con un alimento primario y alternativas:

```js
{ 
  meal_template_id: 1,            // 1-5
  food_item_id: 1,                // ID del alimento primario
  default_grams: 80,              // gramos en día de entrenamiento
  restday_grams: 60,              // gramos en día de descanso
  sort_order: 1,                  // orden dentro de la comida
  options: [2, 3, 4, ...]         // IDs de alimentos alternativos
}
```

### Helper inRange

Para generar arrays de opciones por categoría, usá el helper:

```js
inRange(1, 27, [1])     // Cereales y Pan, excluyendo el ID 1
inRange(28, 61, [54])   // Proteínas, excluyendo el ID 54 (Huevo Entero)
inRange(85, 99, [86])   // Lácteos, excluyendo el ID 86
```

Rangos disponibles (ver tabla de alimentos arriba).

### Ejemplo: agregar opción de bebida al Desayuno

```js
{ meal_template_id: 1, food_item_id: 86, default_grams: 0, restday_grams: 0, sort_order: 3, options: inRange(85, 99, [86]) },
//                                                                              ↑
//                                                                  cambiar a: [...inRange(85, 99, [86]), 167]
//                                                                  para agregar Café como opción
```

### Bumpear versión

Cualquier cambio en `MEAL_COMPONENTS` requiere bumpear `seed_template_version` (reset completo). El upsert de foods no toca MEAL_COMPONENTS.

---

## Cómo agregar o actualizar platos elaborados

Los platos elaborados están definidos dentro de `seedIfEmpty` (instalación limpia) y `resetSeedTemplates` (reset). Si los modificás, sincronizá ambos bloques.

```js
const dishes = [
  { 
    name: 'Mi Plato Nuevo', 
    description: 'Descripción', 
    ingredients: [
      { food_id: 28, grams: 150 },   // Pechuga de Pollo 150g
      { food_id: 127, grams: 200 },  // Espinacas 200g
      { food_id: 68, grams: 10 }     // Aceite de Oliva 10g
    ]
  }
];
```

Las calorías y macros se calculan automáticamente desde `FOOD_ITEMS`.

### Bumpear versión

Cambios en dishes requieren bumpear `seed_template_version`.

---

## Flujo completo de un cambio de seed

Ejemplo: agregar 5 alimentos nuevos a la categoría "Frutas".

1. **Editar `FOOD_ITEMS`** en `src/db/seed-data.js` (agregar al final del array Frutas o donde corresponda):
   ```js
   { name: 'Fruta Nueva 1', kcal_per_100g: 50, protein_per_100g: 1, carbs_per_100g: 12, fat_per_100g: 0, fiber_per_100g: 2, category: 'Frutas' },
   ```

2. **Si querés que aparezcan en MEAL_COMPONENTS** como opciones, actualizar `MEAL_COMPONENTS`:
   ```js
   { meal_template_id: 1, food_item_id: 100, ..., options: inRange(100, 126, [100]) },
   //                                                                              ↑
   //                                              actualizar el rango a 100-131 si agregás 5 frutas
   ```

3. **Bumpear `SEED_VERSION`** en `migrateSeedData`:
   ```js
   const SEED_VERSION = 4;  // era 3
   ```

4. **Si tocaste MEAL_COMPONENTS**, bumpear `seed_template_version`:
   ```js
   const TPL_VERSION = 3;  // era 2
   ```

5. **Probar localmente:**
   ```bash
   npm run dev
   ```
   
   En consola deberías ver:
   ```
   Seed migrate: 203 foods processed (5 new)  # o similar
   Template reset: 24 meal components re-seeded
   ```

6. **Correr tests:**
   ```bash
   npx vitest run
   ```

7. **Commitear con mensaje descriptivo** (los cambios de seed suelen ser grandes y beneficiosos tenerlos en commits separados).

---

## Problemas conocidos y gotchas

### Foreign Key constraints

SQLite tiene FKs activos (`PRAGMA foreign_keys = ON`). El orden de DELETE importa. Si ves errores tipo `FOREIGN KEY constraint failed`, asegurate de borrar las tablas hijas antes que las padres:

```
daily_plan_entries → meal_components
meal_options → meal_components
meal_dish_options → elaborated_dishes
dish_ingredients → elaborated_dishes
training_sets → exercise_library
workout_plan_days → workout_plans
```

### exercise_ids en workout_plans

Los `exercise_ids` son CSV de IDs que asumen el orden de `EXERCISES`. Si reordenás ejercicios, los planes se rompen silenciosamente (apuntan a ejercicios diferentes). Si necesitás reordenar, bumpeá `seed_template_version` para resetear.

### IDs de food_items en MEAL_COMPONENTS

Similar a exercise_ids: si reordenás alimentos en `FOOD_ITEMS`, los `food_item_id` y `options` en `MEAL_COMPONENTS` se rompen. Bumpeá `seed_template_version` si hacés cambios de orden.

### Migraciones idempotentes

Siempre usá este patrón para columnas nuevas:

```js
const exists = db.prepare(`SELECT COUNT(*) as cnt FROM pragma_table_info('tabla') WHERE name='columna'`).get();
if (exists.cnt === 0) db.exec(`ALTER TABLE tabla ADD COLUMN columna TYPE`);
```

Si una migración falla a mitad de camino, los `INSERT OR REPLACE INTO settings ('schema_version', N)` no se ejecutan, y la migración se reintenta en el siguiente inicio.

### Datos del usuario

Las migraciones agresivas (reset de templates) borran:
- `daily_plan_entries` (planes diarios concretos)
- `training_sets` (series detalladas de entrenamiento)
- `meal_components` y `meal_options` custom
- `workout_plans` y `workout_plan_days` custom
- `elaborated_dishes` y `dish_ingredients` custom

Se preservan:
- `user_profile`, `activity_days`, `sport_activities`
- `weight_entries`, `measurement_sets`
- `training_sessions` (fecha, plan, notas — sin series)
- `food_items` custom (upsert por nombre, no se borran)

### Verificar el estado del seed

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('./userData/health-data.db');  // ajustar path
console.log('schema_version:', db.prepare(\"SELECT value FROM settings WHERE key='schema_version'\").get());
console.log('seed_version:', db.prepare(\"SELECT value FROM settings WHERE key='seed_version'\").get());
console.log('seed_template_version:', db.prepare(\"SELECT value FROM settings WHERE key='seed_template_version'\").get());
console.log('foods:', db.prepare('SELECT COUNT(*) as c FROM food_items').get().c);
console.log('exercises:', db.prepare('SELECT COUNT(*) as c FROM exercise_library').get().c);
console.log('plans:', db.prepare('SELECT COUNT(*) as c FROM workout_plans').get().c);
console.log('meal_components:', db.prepare('SELECT COUNT(*) as c FROM meal_components').get().c);
"
```

### Forzar un reset completo

Si querés forzar la re-ejecución de `resetSeedTemplates` sin bumpear código:

```sql
DELETE FROM settings WHERE key = 'seed_template_version';
```

Próximo `npm run dev` ejecutará el reset.

---

## Resumen rápido

| Cambio | Dónde | Versión a bumpear |
|---|---|---|
| Nuevo alimento | `FOOD_ITEMS` | `SEED_VERSION` |
| Modificar alimento existente | `FOOD_ITEMS` (mismo nombre) | `SEED_VERSION` |
| Nuevo ejercicio | `EXERCISES` | `SEED_VERSION` |
| Modificar ejercicio existente | `EXERCISES` (mismo nombre) | `SEED_VERSION` |
| Nuevo plan de entrenamiento | `WORKOUT_PLANS` o `HIIT_WOD_PLANS` | `SEED_VERSION` |
| Modificar plan existente | mismo array | `SEED_VERSION` |
| Cambios en `MEAL_COMPONENTS` | `MEAL_COMPONENTS` | `seed_template_version` |
| Cambios en `dishes` (elaborated) | bloque `dishes` en `seedIfEmpty` + `resetSeedTemplates` | `seed_template_version` |
| Nueva columna en schema | `database.js` migraciones | `schema_version` + bloque idempotente si es crítica |
