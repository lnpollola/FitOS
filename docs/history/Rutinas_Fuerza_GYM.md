# Especificación de Rutinas de Fuerza y Tonificación a partir de Ejercicios de Gimnasio
## Objetivo del documento
Este documento define una estructura de datos y metainformación para describir ejercicios y rutinas de entrenamiento de fuerza a partir de las capturas de pantalla proporcionadas (app de gimnasio) y de la evidencia científica/fitness disponible en la web. Está pensado como **input para una herramienta de IA** capaz de generar planes personalizados según:[^1][^2]

- Número de días por semana.
- Grupos musculares objetivo.
- Objetivo principal: pérdida de grasa, ganancia de masa muscular (hipertrofia), tonificación, salud general, etc.[^3]

La idea es que el sistema de IA consuma este esquema como "catálogo de ejercicios" y reglas básicas de programación de entrenamiento.
## Modelo de datos propuesto
### Entidad `Exercise`
Campos recomendados (formato JSON-like):

```json
{
  "id": "string",                // slug único: "cat-camel", "press-plano-mancuernas"
  "name": "string",              // nombre mostrado
  "category": "warmup" | "strength" | "mobility" | "stretch" | "core",
  "primary_muscles": ["string"],  // grupos musculares principales
  "secondary_muscles": ["string"],
  "equipment": ["string"],        // bodyweight, mancuernas, multipower, máquina, banda elástica...
  "movement_pattern": "string",   // squat, hip hinge, horizontal push, horizontal pull, vertical push, vertical pull, core-anti-extension, core-anti-rotación, etc.
  "is_unilateral": true | false,
  "default_sets": number,
  "default_reps_range": [min, max],
  "tempo": "string",              // opcional: 2-0-2, controlado, explosivo, etc.
  "rest_seconds": number,          // descanso recomendado entre series
  "difficulty": 1 | 2 | 3,         // 1 = principiante, 2 = intermedio, 3 = avanzado (aprox.)
  "notes": "string"               // indicaciones de técnica/seguridad en texto libre
}
```
### Entidad `WorkoutTemplate`
Cada pantalla de la app representa un **entrenamiento del día** con bloques de calentamiento, entrenamiento principal y, en un caso, trabajo específico de abdominales.

```json
{
  "id": "string",                 // p.ej. "tren-inferior-a", "tren-superior-a", "abs-7"
  "name": "string",
  "goal": ["strength", "hypertrophy", "fat_loss", "mobility"],
  "blocks": [
    {
      "name": "string",           // "Calentamiento", "Entrenamiento", "Core"
      "type": "warmup" | "strength" | "core" | "cooldown",
      "exercise_ids": ["string"], // referencia a Exercise.id
      "order": "sequential" | "circuit",
      "notes": "string"
    }
  ]
}
```
### Entidad `PlanConstraints`
Para que la IA genere planes personalizados:

```json
{
  "days_per_week": 3,
  "experience_level": "beginner" | "intermediate" | "advanced",
  "primary_goals": ["fat_loss", "hypertrophy", "strength", "health"],
  "available_equipment": ["gym_full", "home_dumbbells", "bands"],
  "session_duration_minutes": 45,
  "injury_limits": ["none", "knee", "shoulder", "lower_back"]
}
```

La IA puede usar estos constraints para seleccionar y combinar `WorkoutTemplate` y `Exercise` manteniendo volúmenes razonables por grupo muscular (p.ej. 10–20 series semanales por grupo para hipertrofia).[^3]
## Catálogo de ejercicios extraídos de las capturas
### Convenciones de nombres de grupos musculares
Se proponen etiquetas estándar (en inglés, más fácil de cruzar con literatura):

- `quads` (cuádriceps)
- `glutes` (glúteos)
- `hamstrings`
- `adductors` (aductores)
- `abductors`
- `calves`
- `chest`
- `back`
- `lats`
- `traps`
- `shoulders_front` / `shoulders_lateral` / `shoulders_rear`
- `biceps`
- `triceps`
- `core_rectus` (recto abdominal)
- `core_obliques`
- `core_transverse`
- `spinal_erectors`
### Ejercicios de movilidad / calentamiento espinal
#### `cat-camel`

- `name`: "Cat Camel"
- `category`: "warmup"
- `primary_muscles`: [`spinal_erectors`, `back`]
- `secondary_muscles`: [`core_transverse`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "spine-mobility"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^1][^4]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "Movimiento controlado en cuadrupedia alternando flexión y extensión de la columna para movilizar la espalda y calentar el core."[^5][^1]

#### `bird-dog`

- `name`: "Bird Dog"
- `category`: "warmup"
- `primary_muscles`: [`core_transverse`, `spinal_erectors`]
- `secondary_muscles`: [`glutes`, `shoulders_front`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "core-anti-rotacion"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^4][^1]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "En cuadrupedia, extender brazo y pierna contraria manteniendo la columna neutra para entrenar estabilidad de core y cadena posterior."[^2][^6]

#### `hip-stretch`

- `name`: "Hip Stretch" (zancada de estiramiento de cadera)
- `category`: "warmup"
- `primary_muscles`: [`hip_flexors`, `glutes`]
- `secondary_muscles`: [`hamstrings`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "hip-mobility"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^1][^4]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "Zancada en el suelo o posición de corredor para abrir cadera y activar glúteos antes del tren inferior."[^7]

#### `estiramiento-dorsal-pecho`

- `name`: "Estiramiento de Dorsal y Pecho"
- `category`: "warmup"
- `primary_muscles`: [`back`, `chest`]
- `secondary_muscles`: [`shoulders_front`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "upper-body-mobility"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^4][^1]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "Movimiento dinámico en cuadrupedia para abrir la zona de dorsal ancho y pectoral antes de los empujes y jalones."[^1]

#### `movilidad-peso-muerto-unilateral`

- `name`: "Movilidad de Peso Muerto Unilateral"
- `category`: "warmup"
- `primary_muscles`: [`hamstrings`, `glutes`]
- `secondary_muscles`: [`spinal_erectors`, `core_transverse`]
- `equipment`: ["bodyweight"]
- `movement_pattern`: "hip-hinge"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^4][^1]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "Patrón de bisagra de cadera a una pierna para activar isquios y glúteos, mejorando equilibrio y control del RDL posterior."[^8]

#### `elevaciones-laterales-elastico`

- `name`: "Elevaciones Laterales con Elástico"
- `category`: "warmup"
- `primary_muscles`: [`shoulders_lateral`]
- `secondary_muscles`: [`traps`]
- `equipment`: ["band"]
- `movement_pattern`: "lateral-raise"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^1][^4]
- `rest_seconds`: 30
- `difficulty`: 1
- `notes`: "Elevaciones laterales con banda para activar deltoides medio antes de press y elevaciones con carga."[^9]
### Ejercicios de fuerza tren inferior (piernas)
#### `aductor-maquina-sentado`

- `name`: "Aductor en Máquina Sentado"
- `category`: "strength"
- `primary_muscles`: [`adductors`]
- `secondary_muscles`: [`glutes`]
- `equipment`: ["machine"]
- `movement_pattern`: "hip-adduction"
- `is_unilateral`: false
- `default_sets`: 2–3 (en capturas aparece 2–3 series)
- `default_reps_range`:[^1][^10]
- `rest_seconds`: 60–90
- `difficulty`: 1
- `notes`: "En máquina de aductores, cerrar las piernas contra la resistencia para reforzar muslo interior y estabilidad de pelvis."[^11]

#### `abductor-maquina-sentado`

- `name`: "Abductor en Máquina Sentado"
- `category`: "strength"
- `primary_muscles`: [`abductors`, `glutes`]
- `secondary_muscles`: []
- `equipment`: ["machine"]
- `movement_pattern`: "hip-abduction"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 60–90
- `difficulty`: 1
- `notes`: "Empujar las rodillas hacia fuera contra la carga para trabajar glúteo medio y estabilizadores de cadera."[^11]

#### `femoral-tumbado` / `femoral-sentado`

- `name`: "Femoral Tumbado" / "Femoral Sentado" (lying / seated leg curl)
- `category`: "strength"
- `primary_muscles`: [`hamstrings`]
- `secondary_muscles`: [`calves`]
- `equipment`: ["machine"]
- `movement_pattern`: "knee-flexion"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 60–90
- `difficulty`: 1
- `notes`: "Flexión de rodilla contra resistencia para aislar isquiosurales; controlar la fase excéntrica."[^13]

#### `sentadilla-multipower`

- `name`: "Sentadilla en Multipower" (Smith machine squat)
- `category`: "strength"
- `primary_muscles`: [`quads`, `glutes`]
- `secondary_muscles`: [`hamstrings`, `calves`]
- `equipment`: ["smith_machine"]
- `movement_pattern`: "squat"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^14][^1]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "Sentadilla guiada con barra en multipower, énfasis en cuádriceps; usar rango completo sin redondear la espalda."[^15]

#### `sentadilla-hack`

- `name`: "Sentadilla Hack" (hack squat machine)
- `category`: "strength"
- `primary_muscles`: [`quads`]
- `secondary_muscles`: [`glutes`, `hamstrings`, `calves`]
- `equipment`: ["machine"]
- `movement_pattern`: "squat"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^14][^1]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "En máquina inclinada, bajar controlado hasta que rodillas lleguen a ~90° y empujar fuerte con los pies para desarrollar cuádriceps."[^16][^17]

#### `sentadilla-hack-prensa-45`

- `name`: "Prensa de 45 Grados" (45° leg press)
- `category`: "strength"
- `primary_muscles`: [`quads`]
- `secondary_muscles`: [`glutes`, `hamstrings`, `adductors`]
- `equipment`: ["machine"]
- `movement_pattern`: "squat"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 90–120
- `difficulty`: 1–2
- `notes`: "Pies a anchura de hombros en plataforma inclinada a 45°, bajar la plataforma hacia el pecho y empujar a través de los talones."[^7][^11]

#### `peso-muerto-multipower`

- `name`: "Peso Muerto Multipower" (Smith Romanian deadlift)
- `category`: "strength"
- `primary_muscles`: [`hamstrings`, `glutes`]
- `secondary_muscles`: [`spinal_erectors`, `adductors`, `core_transverse`]
- `equipment`: ["smith_machine"]
- `movement_pattern`: "hip-hinge"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^1][^14]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "Bisagra de cadera con rodillas ligeramente flexionadas, barra pegada al cuerpo, énfasis en estiramiento de isquios y empuje de cadera."[^8]

#### `prensa-pendular-unilateral`

- `name`: "Prensa Pendular Unilateral"
- `category`: "strength"
- `primary_muscles`: [`quads`, `glutes`]
- `secondary_muscles`: [`hamstrings`]
- `equipment`: ["machine"]
- `movement_pattern`: "squat"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "Prensa en máquina pendular trabajando una pierna cada vez para mejorar simetría y fuerza unilateral."[^11]

#### `bulgara-multipower`

- `name`: "Búlgara en Multipower" (Smith Bulgarian split squat)
- `category`: "strength"
- `primary_muscles`: [`quads`, `glutes`]
- `secondary_muscles`: [`hamstrings`, `calves`]
- `equipment`: ["smith_machine", "bench"]
- `movement_pattern`: "split-squat"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 90–120
- `difficulty`: 2–3
- `notes`: "Pierna trasera elevada, descenso controlado hasta que la rodilla delantera quede cercana a 90°, empujando fuerte con el talón delantero."[^18]

#### `extension-cuadriceps`

- `name`: "Extensión de Cuádriceps" (leg extension)
- `category`: "strength"
- `primary_muscles`: [`quads`]
- `secondary_muscles`: []
- `equipment`: ["machine"]
- `movement_pattern`: "knee-extension"
- `is_unilateral`: false (se puede hacer unilateral)
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 60–90
- `difficulty`: 1
- `notes`: "Extender rodillas en máquina para aislar cuádriceps; evitar bloquear las rodillas al final del recorrido."[^11]
### Ejercicios de fuerza tren superior
#### `remo-pendlay`

- `name`: "Remo Pendlay"
- `category`: "strength"
- `primary_muscles`: [`back`, `lats`, `spinal_erectors`]
- `secondary_muscles`: [`biceps`, `rear_delts`]
- `equipment`: ["barbell"]
- `movement_pattern`: "horizontal-pull"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^14][^1]
- `rest_seconds`: 90–120
- `difficulty`: 3
- `notes`: "Remo con torso paralelo al suelo, barra en el suelo en cada repetición; tirar explosivo hacia el abdomen manteniendo la espalda plana."[^19]

#### `remo-unilateral-maquina-neutro`

- `name`: "Remo Unilateral Máquina Neutro"
- `category`: "strength"
- `primary_muscles`: [`lats`, `back`]
- `secondary_muscles`: [`biceps`, `rear_delts`]
- `equipment`: ["machine"]
- `movement_pattern`: "horizontal-pull"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 90
- `difficulty`: 2
- `notes`: "Remo en máquina con agarre neutro, enfatizando recorrido completo y escápulas hacia atrás al final."[^20]

#### `remo-bilateral-prono`

- `name`: "Remo Bilateral Prono" (seated row pronated grip)
- `category`: "strength"
- `primary_muscles`: [`back`, `lats`]
- `secondary_muscles`: [`biceps`, `rear_delts`, `traps`]
- `equipment`: ["machine", "cable"]
- `movement_pattern`: "horizontal-pull"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 90
- `difficulty`: 2
- `notes`: "Remo sentado con agarre prono, tirando el agarre hacia el abdomen sin encoger hombros."[^20]

#### `jalon-neutro`

- `name`: "Jalón Neutro" (neutral grip lat pulldown)
- `category`: "strength"
- `primary_muscles`: [`lats`]
- `secondary_muscles`: [`biceps`, `traps`, `rear_delts`, `rhomboids`]
- `equipment`: ["machine", "cable"]
- `movement_pattern`: "vertical-pull"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 90
- `difficulty`: 2
- `notes`: "Jalón en polea con agarre neutro hacia la parte superior del pecho, manteniendo el pecho alto y evitando balanceos."[^21]

#### `elevaciones-laterales-mancuerna`

- `name`: "Elevaciones Laterales Mancuerna"
- `category`: "strength"
- `primary_muscles`: [`shoulders_lateral`]
- `secondary_muscles`: [`traps`, `shoulders_front`]
- `equipment`: ["dumbbells"]
- `movement_pattern`: "lateral-raise"
- `is_unilateral`: false (se puede alternar)
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 60
- `difficulty`: 2
- `notes`: "Con mancuernas a los lados, elevar los brazos hasta ~90° sin encoger hombros, controlando la bajada."[^9]

#### `press-plano-mancuernas`

- `name`: "Press Plano Mancuernas" (flat dumbbell bench press)
- `category`: "strength"
- `primary_muscles`: [`chest`]
- `secondary_muscles`: [`triceps`, `shoulders_front`]
- `equipment`: ["dumbbells", "bench"]
- `movement_pattern`: "horizontal-push"
- `is_unilateral`: false (puede hacerse alterno)
- `default_sets`: 3
- `default_reps_range`:[^1][^14]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "Acostado en banco plano, empujar las mancuernas desde el pecho hacia arriba con control, evitando extender codos en exceso."[^22]

#### `press-inclinado-45-multipower`

- `name`: "Press Inclinado a 45° en Multipower" (Smith incline bench press)
- `category`: "strength"
- `primary_muscles`: [`chest`, "upper_chest"]
- `secondary_muscles`: [`shoulders_front`, `triceps`]
- `equipment`: ["smith_machine", "bench"]
- `movement_pattern`: "horizontal-push"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 90–120
- `difficulty`: 2
- `notes`: "Banco inclinado ~45°, barra guiada en multipower; bajar hasta el pecho alto y empujar sin perder control de escápulas."[^15]

#### `mancuernas` (press banco plano máquina de gimnasio)

- `name`: "Press con Mancuernas en Banco Plano" (ya cubierto por `press-plano-mancuernas`)
- Mapear a `press-plano-mancuernas`.

#### `tiron-triceps-barra`

- `name`: "Tirón Tríceps Barra" (cable tricep pushdown)
- `category`: "strength"
- `primary_muscles`: [`triceps`]
- `secondary_muscles`: []
- `equipment`: ["cable", "bar"]
- `movement_pattern`: "elbow-extension"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 60–90
- `difficulty`: 1–2
- `notes`: "Con barra en polea alta, extender codos manteniendo los brazos pegados al cuerpo para aislar tríceps."[^23]

#### `biceps-extension-mancuernas`

- `name`: "Bíceps en Extensión con Mancuernas" (seated incline dumbbell curl)
- `category`: "strength"
- `primary_muscles`: [`biceps`]
- `secondary_muscles`: [`forearms`]
- `equipment`: ["dumbbells", "bench"]
- `movement_pattern`: "elbow-flexion"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 60–90
- `difficulty`: 2
- `notes`: "Curl de bíceps con respaldo inclinado para mayor estiramiento del bíceps, sin balancear el torso."[^20]

#### `curl-biceps-de-pie`

- `name`: "Curl de Bíceps de Pie" (standing dumbbell/barbell curl)
- `category`: "strength"
- `primary_muscles`: [`biceps`]
- `secondary_muscles`: [`forearms`]
- `equipment`: ["dumbbells" | "barbell"]
- `movement_pattern`: "elbow-flexion"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^4][^12]
- `rest_seconds`: 60–90
- `difficulty`: 1–2
- `notes`: "De pie, flexionar codos llevando la carga hacia los hombros sin mover los codos hacia delante."[^20]

#### `press-frances-mancuernas`

- `name`: "Press Francés con Mancuernas" (lying triceps extension)
- `category`: "strength"
- `primary_muscles`: [`triceps`]
- `secondary_muscles`: []
- `equipment`: ["dumbbells", "bench"]
- `movement_pattern`: "elbow-extension"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^12][^4]
- `rest_seconds`: 60–90
- `difficulty`: 2
- `notes`: "Acostado en banco, flexionar codos llevando mancuernas hacia la frente y extender de nuevo para trabajar intensamente tríceps."[^23]
### Ejercicios específicos de core / abdominales
Basado en la pantalla "Abdominales 7".

#### `abdomen-pasar-peso-pies-manos`

- `name`: "Abdomen Pasar el Peso de Pies a Manos" (weighted transfer crunch)
- `category`: "core"
- `primary_muscles`: [`core_rectus`]
- `secondary_muscles`: [`core_obliques`, `hip_flexors`]
- `equipment`: ["bodyweight" o "dumbbell/plate"]
- `movement_pattern`: "core-flexion"
- `is_unilateral`: false
- `default_sets`: 3
- `default_reps_range`:[^1][^4]
- `rest_seconds`: 0–20 (según descripción app, sin descanso entre ejercicios dentro de la ronda)
- `difficulty`: 2
- `notes`: "En decúbito supino, pasar una carga entre manos y pies mientras se flexiona el tronco para mantener tensión continua en abdominales."[^24]

#### `plancha-lateral`

- `name`: "Plancha Lateral" (side plank)
- `category`: "core"
- `primary_muscles`: [`core_obliques`]
- `secondary_muscles`: [`core_transverse`, `shoulders_front`, `glutes`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "core-anti-lateral-flexion"
- `is_unilateral`: true
- `default_sets`: 3
- `default_reps_range`:  (segundos)[^15]
- `rest_seconds`: 30
- `difficulty`: 2
- `notes`: "Apoyo sobre antebrazo o mano, cuerpo en línea recta; sostener la posición para trabajar oblicuos y estabilidad lateral."[^25]

#### `bicycle-crunch`

- `name`: "Bicycle Crunch"
- `category`: "core"
- `primary_muscles`: [`core_rectus`, `core_obliques`]
- `secondary_muscles`: [`hip_flexors`]
- `equipment`: ["bodyweight", "mat"]
- `movement_pattern`: "core-rotation"
- `is_unilateral`: true (alternante)
- `default_sets`: 3
- `default_reps_range`:  por lado[^4][^1]
- `rest_seconds`: 0–20 dentro del bloque
- `difficulty`: 2
- `notes`: "Crunch alterno llevando codo a rodilla contraria en patrón de pedaleo, enfatizando rotación controlada de tronco sin tirar del cuello."[^24]
## Ejemplos de `WorkoutTemplate` basados en las capturas
### Ejemplo: Día de Tren Inferior A (capturas con: aductor, femoral tumbado, sentadilla en multipower, prensa 45°, remo pendlay, remo unilateral, jalón neutro, curl bíceps de pie)
```json
{
  "id": "lower-body-a",
  "name": "Tren Inferior A + Espalda/Bíceps",
  "goal": ["strength", "hypertrophy"],
  "blocks": [
    {
      "name": "Calentamiento",
      "type": "warmup",
      "order": "sequential",
      "exercise_ids": [
        "cat-camel",
        "bird-dog",
        "hip-stretch",
        "movilidad-peso-muerto-unilateral"
      ],
      "notes": "3 series de 10–12 repeticiones por ejercicio antes de cargar pesado." 
    },
    {
      "name": "Pierna principal",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "aductor-maquina-sentado",
        "femoral-tumbado",
        "sentadilla-multipower",
        "prensa-45-grados"
      ],
      "notes": "2–3 series de 8–12 repeticiones; descanso 60–120 s según ejercicio y objetivo. Usar cargas cercanas al fallo técnico para hipertrofia." 
    },
    {
      "name": "Espalda y bíceps",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "remo-pendlay",
        "remo-unilateral-maquina-neutro",
        "jalon-neutro",
        "curl-biceps-de-pie"
      ],
      "notes": "3 series de 7–12 repeticiones por ejercicio." 
    }
  ]
}
```
### Ejemplo: Día de Tren Superior A (capturas con: estiramiento dorsal/pecho, elevaciones laterales con elástico, elevaciones laterales mancuernas, press plano mancuernas)
```json
{
  "id": "upper-body-a",
  "name": "Tren Superior A",
  "goal": ["strength", "hypertrophy"],
  "blocks": [
    {
      "name": "Calentamiento",
      "type": "warmup",
      "order": "sequential",
      "exercise_ids": [
        "estiramiento-dorsal-pecho",
        "elevaciones-laterales-elastico"
      ],
      "notes": "3 series de 10–12 repeticiones." 
    },
    {
      "name": "Pecho y hombro",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "press-plano-mancuernas",
        "press-inclinado-45-multipower",
        "elevaciones-laterales-mancuerna"
      ],
      "notes": "3 series de 7–12 repeticiones; añadir un ejercicio de tríceps si el objetivo es hipertrofia de brazo." 
    }
  ]
}
```
### Ejemplo: Día de Pierna B (capturas con: aductor, femoral sentado, sentadilla hack, búlgara multipower, extensión de cuádriceps, peso muerto multipower, prensa pendular unilateral, abductor máquina)
```json
{
  "id": "lower-body-b",
  "name": "Tren Inferior B",
  "goal": ["strength", "hypertrophy"],
  "blocks": [
    {
      "name": "Calentamiento",
      "type": "warmup",
      "order": "sequential",
      "exercise_ids": [
        "cat-camel",
        "bird-dog",
        "hip-stretch"
      ],
      "notes": "3 series de 10–12 repeticiones." 
    },
    {
      "name": "Pierna dominante",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "aductor-maquina-sentado",
        "femoral-sentado",
        "sentadilla-hack",
        "bulgara-multipower",
        "extension-cuadriceps",
        "peso-muerto-multipower",
        "prensa-pendular-unilateral",
        "abductor-maquina-sentado"
      ],
      "notes": "Distribuir el volumen según objetivo; para hipertrofia, apuntar a 10–20 series semanales por grupos principales (cuádriceps, isquios, glúteos)." 
    }
  ]
}
```
### Ejemplo: Día de Tren Superior B (capturas con: press plano, press inclinado, tirón tríceps, extensión de cuádriceps aparece pero podría omitirse, peso muerto multipower, prensa pendular unilateral, abductor, remo bilateral prono, bíceps en extensión, press francés)
```json
{
  "id": "upper-body-b",
  "name": "Tren Superior B + Empuje y Brazos",
  "goal": ["strength", "hypertrophy"],
  "blocks": [
    {
      "name": "Calentamiento",
      "type": "warmup",
      "order": "sequential",
      "exercise_ids": [
        "estiramiento-dorsal-pecho",
        "elevaciones-laterales-elastico"
      ],
      "notes": "3 series de 10–12 repeticiones." 
    },
    {
      "name": "Pecho y tríceps",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "press-plano-mancuernas",
        "press-inclinado-45-multipower",
        "tiron-triceps-barra",
        "press-frances-mancuernas"
      ],
      "notes": "3 series de 8–12 repeticiones manteniendo 1–3 repeticiones en recámara." 
    },
    {
      "name": "Espalda y bíceps",
      "type": "strength",
      "order": "sequential",
      "exercise_ids": [
        "remo-bilateral-prono",
        "biceps-extension-mancuernas"
      ],
      "notes": "3 series de 8–12 repeticiones." 
    }
  ]
}
```
### Ejemplo: Día específico de Core "Abdominales 7"
```json
{
  "id": "abs-7",
  "name": "Abdominales 7",
  "goal": ["core_endurance", "fat_loss_support"],
  "blocks": [
    {
      "name": "Core circuit",
      "type": "core",
      "order": "circuit",
      "exercise_ids": [
        "abdomen-pasar-peso-pies-manos",
        "plancha-lateral",
        "bicycle-crunch"
      ],
      "notes": "3 rondas de 10–12 repeticiones por ejercicio (o 30–60 s en plancha lateral) sin descanso entre ejercicios y 2 min entre rondas, como describe la pantalla de la app." 
    }
  ]
}
```
## Reglas de programación para la IA
### Selección de ejercicios según objetivo
- **Pérdida de grasa (fat_loss)**: priorizar
  - Volumen moderado-alto (p.ej. 3–4 días/semana, 8–15 repeticiones).[^3]
  - Ejercicios multiarticulares (sentadillas, prensa, peso muerto, press, remos, jalones) que impliquen gran masa muscular.
  - Incorporar bloques tipo circuito o tiempos de descanso más cortos (30–60 s) para aumentar el gasto energético.

- **Hipertrofia (hypertrophy/tonificación)**:
  - 10–20 series efectivas por grupo muscular y semana, con 6–20 repeticiones, dejando 0–3 repeticiones en recámara.[^3]
  - Combinar básicos pesados (7–10 repeticiones) con accesorios más ligeros (10–15 repeticiones).

- **Fuerza (strength)**:
  - Mantener patrones básicos (sentadilla, bisagra, empuje, tirón) en rangos 3–6 repeticiones con más descanso (2–3 min) y cargas altas.
  - Usar los mismos ejercicios de catálogo pero con menos repeticiones y más peso.

- **Salud / movilidad (health)**:
  - Aumentar peso de ejercicios de movilidad y core, añadir más calentamiento y trabajo de estabilidad (bird dog, planchas, estiramientos dinámicos).[^1][^2]
### Distribución por grupos musculares
La IA puede llevar un contador de series semanales por etiqueta de `primary_muscles` y `secondary_muscles` y ajustar:

- No exceder ~20–25 series semanales por músculo principal en usuarios intermedios.[^3]
- Asegurar al menos 6–8 series semanales para músculos que el usuario marque como prioridad estética (p.ej. glúteos, hombros, espalda).
### Lógica de generación de plan
1. Recibir `PlanConstraints` y prioridades de grupos musculares.
2. Seleccionar `WorkoutTemplate` base para cubrir patrones de movimiento de forma equilibrada (p.ej. en 3 días: lower-body-a, upper-body-a, lower-body-b + abs-7).
3. Ajustar número de ejercicios por bloque según `session_duration_minutes`.
4. Ajustar `default_sets` y `default_reps_range` para cumplir el volumen objetivo semanal por músculo.
5. Insertar calentamiento estándar al inicio (cat-camel, bird-dog, hip-stretch, movilidad específica).
6. Generar output final para el usuario con detalle por día: lista de ejercicios, series, repeticiones y descansos.

Con este esquema, la herramienta de IA puede leer tanto el **catálogo de ejercicios** (con sus grupos musculares y parámetros) como los **templates de rutina** y los **constraints del usuario** para crear programas personalizados coherentes y progresivos.[^3]

---

## References

1. [Cat Camel Exercise – Osteopath Dr. Rebecca Naylor explains ...](https://www.holisticbodyworks.com.au/cat-camel-exercise/) - The Cat Camel back exercise, or also known as happy cat/angry cat, is a gentle mobilisation for your...

2. [Bird Dog Exercise: Benefits, Tips, & Variations](https://www.onepeloton.com/blog/bird-dog-exercise) - While the exercise is simple and accessible, it works a ton of muscles, including those in your shou...

3. [Is the weekly sets volume training performed by ...](https://www.scielo.br/j/motriz/a/mHgY83THKzb4rx46c7p3FGD/?lang=en) - Accordingly, some guidelines suggest the performance up to 30 sets per muscle group depending on the...

4. [How to Do Cat-Camel Stretch: Video, Form, Muscles ...](https://www.zing.coach/exercises/cat-camel-stretch) - A beginner-friendly upper body exercise that primarily targets the upper back muscles, helping to re...

5. [Cat And Camel - The Best Exercise For The Back And ...](https://www.aafs.net/blog/cat-and-camel/) - The cat and camel exercise effectively develops the muscles that support the spine and directly affe...

6. [Bird dog : r/orangetheory](https://www.reddit.com/r/orangetheory/comments/w271mt/bird_dog/) - It works the posterior chain (back, glutes, hammies) as well as core stabilizers. Move slow and cont...

7. [Mastering the 45-Degree Leg Press: Benefits, Form, and ...](https://gym-mikolo.com/blogs/home-gym/mastering-the-45-degree-leg-press-benefits-form-and-common-mistakes) - The machine enables controlled, high-volume training, perfect for muscle growth in the quads, glutes...

8. [RDL Muscles Worked: What Romanian Deadlifts Really ...](https://sweat.com/blogs/fitness/rdl-muscles-worked) - Wondering which muscles RDLs work? Learn how Romanian deadlifts target glutes, hamstrings and core —...

9. [What Muscles Do Lateral Raises Work? A Complete Guide](https://kefl.co.uk/blogs/news/what-muscles-do-lateral-raises-work-a-complete-guide) - The main purpose of the lateral raise is to target the lateral deltoid, also known as the middle del...

10. [Enhance Spinal Health with the Cat-Camel Stretch](https://thechiro.co.nz/blog/cat-camel-stretch) - This exercise targets the muscles and joints of the spine, providing flexibility, tension relief, an...

11. [What Muscles Does The Leg Press Work?](https://sportscienceinsider.com/what-muscles-does-the-leg-press-work/) - The leg press stands as an excellent exercise for building lower limb strength and size, targeting t...

12. [photo_4_2026-06-18_14-17-29-8.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/34160243/cb6dce48-a2e2-49d7-9a1b-aa3bd2f47d87/photo_4_2026-06-18_14-17-29-8.jpg?AWSAccessKeyId=ASIA2F3EMEYEVDC5NQPA&Signature=AxjMfTGw61xeUMclGFVQ3NQT6ww%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEN3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICWvjeY7w5NfffPyW9GE7O5HEsZuxJN6p16dxfVnmOUXAiBt35dFNalIGhnJiUZvcMa5O8C9WCcL2Vds46eplnasKir8BAim%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMTNL7oeyYVnK5VNNmKtAEdSwEeQB73XaDjL8QoF32TTF5KakIi2bI3MZrkZU2g%2BEzlqPlNJSKj0tl93mLW3TOJVaIvskmLxOJlBSnkcHIycGmfkGfFDnQKol7OqOrQ9BD0qtdDxEYhygPDz6IsmzIL7Eyosc05wD%2FfhphjMZVaxzbxdJExXlVQ3u5Oft7z3dxUPf9Nuzjf3iJDoFHFqPi4EmGfY5TDiDbA4m%2BJJzt4IZt3WHDbcjL9%2FhljSVv9vwX7fxHgka801kkcqFWpp3xLVUbZrA3MGND%2F3YpMPfZrEBGNsLUybdGrypWmJGBxDVEhaAcKXDtwdXl2VSAerGqkXcAk%2BIsAk5q%2BVdaa19pF1PRYxwT5DHBkJsbTsrcGaFh8zQgMhnGpE842BZHF0gVtJ6JJxF70XBxGKYRs7aL16nms9R6AnE0lUe2dM5xJZNDD%2FPId6xwuoDscEB7J0a8Nk6gxSthUEuffcny3cF0YeHS6V9PWfjXo1uwMs6zYPqeBvU%2FX4%2FP0sTFRLtYUOgxYCv8BORR%2BwzlWZpAa%2BF33ApBgI2qpT93%2F2HvO8nkPd5vpg6NUDvngCwd%2Fu1%2B%2FsnMAceDE9AvlGxr3HpHuXWpLa65Non%2FXky5IcxQcxIJ4mAyZ%2BdHPtpML9wKUDzAWKr2O81p9wiJpYe%2BzmAtxexnbs9pzKzfg8wofksJISxv8KpgK6fD9kzaFb1WQp0Bo2gzVx02Z9tGsXbL3F1AfYg1EnuVgnk6u%2F%2BdMm7FY0PI9v3LpxSx9%2BZd4T6OO9EWZUDlScoaH%2BByudaXV5O4k%2BZUMDD4yc%2FRBjqZAf0k09CLSWfaZVsSCp5Z2rbHQxxb1iWC0IoqKTnaER9X4rmkX5NjI%2F5Jv5j63yTPX9r2u%2FXvmP%2Fj635s78dEwy3Wn5n0c6Cs1y19Kd7nQqXk47pz%2BS9k%2BDIcT3%2FHRqiqWhh%2FhgdkjSSQmxVAmfw%2F2m1TOj4dAulGDHjezqjRzZQm4nIn%2BceEXXhKaUPILr8AsVYCQ0TwJBUtlQ%3D%3D&Expires=1781789387)

13. [Lying Leg Curl: Technique, Benefits, and Muscles Worked](https://repfitness.com/blogs/training/lying-leg-curl) - Leg curls work your hamstrings, which lie on the backs of your upper legs. Your hamstrings, or bicep...

14. [photo_3_2026-06-18_14-17-29-7.jpg](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/34160243/397b5d06-9560-4a20-965e-f6d47f388018/photo_3_2026-06-18_14-17-29-7.jpg?AWSAccessKeyId=ASIA2F3EMEYEVDC5NQPA&Signature=60BtG3L8k3FUxZtkzRXscaE2JMU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEN3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICWvjeY7w5NfffPyW9GE7O5HEsZuxJN6p16dxfVnmOUXAiBt35dFNalIGhnJiUZvcMa5O8C9WCcL2Vds46eplnasKir8BAim%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMTNL7oeyYVnK5VNNmKtAEdSwEeQB73XaDjL8QoF32TTF5KakIi2bI3MZrkZU2g%2BEzlqPlNJSKj0tl93mLW3TOJVaIvskmLxOJlBSnkcHIycGmfkGfFDnQKol7OqOrQ9BD0qtdDxEYhygPDz6IsmzIL7Eyosc05wD%2FfhphjMZVaxzbxdJExXlVQ3u5Oft7z3dxUPf9Nuzjf3iJDoFHFqPi4EmGfY5TDiDbA4m%2BJJzt4IZt3WHDbcjL9%2FhljSVv9vwX7fxHgka801kkcqFWpp3xLVUbZrA3MGND%2F3YpMPfZrEBGNsLUybdGrypWmJGBxDVEhaAcKXDtwdXl2VSAerGqkXcAk%2BIsAk5q%2BVdaa19pF1PRYxwT5DHBkJsbTsrcGaFh8zQgMhnGpE842BZHF0gVtJ6JJxF70XBxGKYRs7aL16nms9R6AnE0lUe2dM5xJZNDD%2FPId6xwuoDscEB7J0a8Nk6gxSthUEuffcny3cF0YeHS6V9PWfjXo1uwMs6zYPqeBvU%2FX4%2FP0sTFRLtYUOgxYCv8BORR%2BwzlWZpAa%2BF33ApBgI2qpT93%2F2HvO8nkPd5vpg6NUDvngCwd%2Fu1%2B%2FsnMAceDE9AvlGxr3HpHuXWpLa65Non%2FXky5IcxQcxIJ4mAyZ%2BdHPtpML9wKUDzAWKr2O81p9wiJpYe%2BzmAtxexnbs9pzKzfg8wofksJISxv8KpgK6fD9kzaFb1WQp0Bo2gzVx02Z9tGsXbL3F1AfYg1EnuVgnk6u%2F%2BdMm7FY0PI9v3LpxSx9%2BZd4T6OO9EWZUDlScoaH%2BByudaXV5O4k%2BZUMDD4yc%2FRBjqZAf0k09CLSWfaZVsSCp5Z2rbHQxxb1iWC0IoqKTnaER9X4rmkX5NjI%2F5Jv5j63yTPX9r2u%2FXvmP%2Fj635s78dEwy3Wn5n0c6Cs1y19Kd7nQqXk47pz%2BS9k%2BDIcT3%2FHRqiqWhh%2FhgdkjSSQmxVAmfw%2F2m1TOj4dAulGDHjezqjRzZQm4nIn%2BceEXXhKaUPILr8AsVYCQ0TwJBUtlQ%3D%3D&Expires=1781789387)

15. [5 Benefits of Smith Machine Squats: A Comprehensive ...](https://nutroone.com/en/2024/04/11/smith-machine-squat-variations/) - The Smith Machine Squat is effective in targeting the quadriceps, hamstrings, glutes, and even the c...

16. [How to Do Hack Squats to Build Up Quad Muscle and Leg ...](https://www.menshealth.com/uk/how-tos/a61557189/how-to-hack-squat/) - Muscles Worked by the Hack Squat · Quadriceps: The quads are the primary mover in the hack squat, co...

17. [7+ Hack Squat Muscles Worked: Ultimate Guide](https://valegas.sedes.ma.gov.br/hack-squat-muscles-targeted/) - 2. Glutes. While the quadriceps are the primary focus of the hack squat, gluteal muscle engagement p...

18. [Master the Smith Machine Bulgarian Split Squat - Altas Strength](https://altasstrength.com/blogs/altas-strength-community/smith-machine-bulgarian-split-squat-guide) - 2. Primary Muscles Targeted by the Smith Machine Bulgarian Split Squat · 2.1 Quadriceps · 2.2 Gluteu...

19. [The Pendlay Row Is a Secret Weapon for Building a Strong ...](https://www.menshealth.com/uk/building-muscle/train-smarter/a69794874/pendlay-row-benefits-how-to/) - Because the torso remains parallel to the floor, the Pendlay row places a high demand on the mid-bac...

20. [Seated Cable Row With Neutral Grip: The Overview](https://bonytobombshell.com/seated-cable-row-neutral-grip/) - Like other horizontal rowing variations, the main muscles it works are the lats, rhomboids, forearms...

21. [Neutral Grip Pulldowns: Benefits, Muscles Worked ...](https://honehealth.com/edge/neutral-grip-lat-pulldowns/) - Muscles Worked by Neutral Grip Lat Pulldown · Lats (Latissimus dorsi) · Traps (Trapezius) · Teres (T...

22. [Dumbbell Bench Press | Better Chest Activation](https://learn.athleanx.com/articles/dumbbell-bench-press) - The DB bench press is good for building unilateral strength in your chest, triceps or anterior delts...

23. [Tricep Pushdowns: Muscles Worked, Benefits, and ...](https://gym-mikolo.com/blogs/home-gym/tricep-pushdowns-muscles-worked-benefits-and-execution-guide) - Straight bar pushdowns typically emphasize the lateral and medial heads. Rope pushdowns allow for a ...

24. [How to Do Bicycle Crunches](https://www.hingehealth.com/resources/articles/bicycle-crunch/) - 1. The bicycle crunch is an effective core exercise that targets multiple abdominal muscles, includi...

25. [Side Planks: Muscles Worked, Variations, and Form Tips](https://www.onepeloton.com/blog/side-planks) - Side planks help to strengthen your core—from your shoulders to glutes,” says Peloton instructor Kir...

