# Especificación de Dieta Flexible para Pérdida de Peso
## Meta nutricional del plan
A partir del PDF de programación nutricional de Juanma Quiñones (el que has seguido estos 2 años), se identifica claramente la siguiente **meta de alto nivel**:

- Mantener un **déficit calórico moderado y sostenido** en el tiempo, mediante comidas estructuradas en porciones fijas (gramajes concretos) pero con **mucha flexibilidad de elección de alimentos dentro de cada comida**.[^1][^2][^3]
- Asegurar un **aporte suficiente de proteína** en todas las comidas (fuentes magras de pollo, pavo, pescados, huevo, lácteos, proteína en polvo) para preservar masa muscular mientras se pierde grasa, apoyado además por entrenamiento de fuerza.[^4][^5][^6]
- Repartir la ingesta en **4–5 comidas diarias** (desayuno, media mañana, comida, merienda, cena) con opciones especiales para **días de entrenamiento vs. días sin entreno**, manteniendo adherencia gracias a variedad (modo paella, fajitas, pizza, tortitas, paninis, etc.).
- Mantener la pérdida de peso dentro de rangos sostenibles de ~0,5–1 kg por semana (dependiendo del déficit real y la actividad), lo cual encaja con las recomendaciones de guías de salud pública y calculadoras de déficit calórico (500–1000 kcal/día por debajo del mantenimiento).[^7][^8][^9][^1]

Tu resultado (pasar de 108 kg a 94 kg en unos 2 años con ejercicio constante) es coherente con ese enfoque de déficit moderado y sostenido en el tiempo.[^9][^1]

Este `.md` está pensado como **input para una herramienta de IA** que pueda:

- Entender la lógica de la dieta.
- Estimar calorías y distribución de macros de cada comida/opción.
- Generar planes alimenticios personalizados (déficit, mantenimiento, superávit) manteniendo el estilo del plan original.
## Modelo de datos propuesto para la dieta
### Entidad `FoodItem`
Representa un alimento base.

```json
{
  "id": "string",                 // p.ej. "pan_blanco", "arroz_blanco", "pechuga_pollo"
  "name": "string",
  "category": "carb" | "protein" | "fat" | "mixed" | "fruit" | "vegetable",
  "kcal_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "notes": "string"              // info adicional, IG, procesado, etc.
}
```

La IA puede poblar esto desde una tabla nutricional externa (MyFitnessPal, OpenFoodFacts, etc.).[^2][^10]
### Entidad `MealComponent`
Un componente de comida es un **slot** que admite varias alternativas.

```json
{
  "slot_type": "carb" | "protein" | "vegetable" | "fat" | "fruit" | "extra",
  "weekday_grams": number | null,   // gramos o unidades en días de entreno/entre semana
  "restday_grams": number | null,   // gramos o unidades en días sin entreno
  "options": ["FoodItem.id"],       // alternativas válidas
  "mandatory": true | false         // si siempre debe aparecer en la comida
}
```
### Entidad `MealTemplate`
Define cada comida del día (desayuno, media mañana, etc.) según el PDF.

```json
{
  "id": "string",                   // "desayuno", "media_manana", "comida", "merienda", "cena"
  "name": "string",
  "time_of_day": "morning" | "mid_morning" | "noon" | "afternoon" | "evening",
  "components": [MealComponent],
  "examples": ["string"],           // ejemplos de combinaciones de texto libre (modo paella, modo fajitas...)
  "notes": "string"
}
```
### Entidad `DayNutritionPlan`
```json
{
  "id": "string",                  // "dia_entreno", "dia_no_entreno"
  "is_training_day": true | false,
  "meals": ["desayuno", "media_manana", "comida", "merienda", "cena"],
  "supplements": [
    {
      "name": "string",            // p.ej. "omega_3", "creatina"
      "dose": "string",           // "1 perla", "7g"
      "timing": "evening" | "anytime",
      "notes": "string"
    }
  ]
}
```
### Entidad `DietConstraints`
```json
{
  "target_status": "deficit" | "maintenance" | "surplus",
  "target_loss_rate_kg_per_week": 0.5,         // para la IA
  "estimated_maintenance_kcal": number,        // calculado por la IA
  "protein_target_g_per_kg": 1.6,             // dentro del rango recomendado 1.6–2.2 g/kg para pérdida de peso
  "fat_min_percent": 20,                      // % kcal mínimos de grasa saludable
  "carb_flex_percent": 35,                    // % variable para carbohidratos
  "training_days_per_week": 4,
  "height_cm": 175,
  "current_weight_kg": 94,
  "age_years": number,
  "sex": "male" | "female"
}
```

La IA usará esto junto con fórmulas de gasto energético (Mifflin-St Jeor, etc.) para ajustar gramos de cada slot y así crear el déficit deseado (500–1000 kcal/día para 0,5–1 kg/semana).[^1][^7][^8][^10][^11]
## Plantilla de comidas basada en tu PDF
Abajo se describe la lógica en texto estructurado; tu agente puede transformar esto a JSON siguiendo el modelo anterior.
### Desayuno (`desayuno`)
**Objetivo:** Aportar carbohidrato y proteína de moderado índice glucémico para empezar el día saciado y con energía, con ligera variación según entrenes o no.

**Estructura general (día de entreno / entre semana):**

- `carb_slot` (weekday_grams ≈ 100 g pan o 50 g harina de avena, 70 g pan, etc.).
- `protein_slot` (120 g fiambre pavo/pollo, 60 g jamón serrano/lomo, claras de huevo, etc.).
- `fat_slot` (10 g aceite de oliva o 40 g aguacate o 15 g frutos secos/crema cacahuete).
- `drink_slot` (té verde, café, bebida vegetal) sin calorías significativas.

**Componente ejemplo:**

```json
{
  "id": "desayuno",
  "time_of_day": "morning",
  "components": [
    {
      "slot_type": "carb",
      "weekday_grams": 100,
      "restday_grams": 70,
      "options": ["pan_blanco", "pan_integral", "tortas_arroz", "tortas_maiz", "harina_avena"],
      "mandatory": true
    },
    {
      "slot_type": "protein",
      "weekday_grams": 120,
      "restday_grams": 50,
      "options": ["jamon_cocido", "fiambre_pavo", "fiambre_pollo", "jamon_serrano", "lomo_embuchado", "claras_huevo"],
      "mandatory": true
    },
    {
      "slot_type": "fat",
      "weekday_grams": 10,
      "restday_grams": 10,
      "options": ["aceite_oliva", "aguacate", "frutos_secos", "crema_cacahuete_sin_azucar"],
      "mandatory": true
    },
    {
      "slot_type": "extra",
      "weekday_grams": null,
      "restday_grams": null,
      "options": ["te_verde", "cafe", "bebida_vegetal_sin_azucar"],
      "mandatory": false
    }
  ]
}
```
### Media mañana (`media_manana`)
**Objetivo:** Batido saciante con hidratos y proteína para mantener hambre a raya antes de la comida.

- `carb_slot`: 30 g harina de avena.
- `protein_slot`: 10 g proteína en polvo.
- `fat_slot`: 15 g frutos secos.
- `liquid_slot`: 300 ml bebida vegetal sin azúcar.

```json
{
  "id": "media_manana",
  "time_of_day": "mid_morning",
  "components": [
    { "slot_type": "carb", "weekday_grams": 30, "restday_grams": 30, "options": ["harina_avena"], "mandatory": true },
    { "slot_type": "protein", "weekday_grams": 10, "restday_grams": 10, "options": ["proteina_polvo"], "mandatory": true },
    { "slot_type": "fat", "weekday_grams": 15, "restday_grams": 15, "options": ["frutos_secos"], "mandatory": true },
    { "slot_type": "extra", "weekday_grams": 300, "restday_grams": 300, "options": ["bebida_vegetal_sin_azucar"], "mandatory": true }
  ]
}
```
### Comida (`comida` / mediodía)
**Objetivo:** Comida principal con ración clara de carbohidrato, proteína, verdura y fruta; el PDF añade múltiples modos (paella, macarrones con carne picada, estofado, salmorejo, etc.) que son básicamente distintas combinaciones de los mismos slots.

**Slots básicos día de entreno:**

- `carb_slot`: 60 g de arroz/pasta/cuscús/quinoa o 200 g patata o 100 g ñoquis o 200 g legumbre cocida.
- `protein_slot`: 150 g pescado azul o 150 g pechuga pollo/pavo o 200 g calamar/sepia o 200 g pescado blanco o 3 huevos o 150 g carne roja magra.
- `vegetable_slot`: verduras, ensalada, gazpacho, caldo, pisto, etc. (sin gramaje estricto, bajo impacto calórico).
- `fruit_slot`: 1 pieza de fruta.
- `fat_slot`: 10 g aceite de oliva o 40 g aguacate según opción.
- `extra_postre_slot` (en algunas opciones): yogur natural/desnatado/proteína o 1 onza de chocolate negro 85%.

En días sin entreno, se ajusta la cantidad de carbohidrato (ej. 200 g patata o 60 g pasta de colores) y se mantiene la estructura general.[^1][^8][^10]

La IA puede mapear cada "modo" (macarrones con carne, espaguetis a la mar, arroz a la cubana, estofado, salmorejo, paella, lasaña, albóndigas, barbacoa, ensaladilla rusa) como **combinaciones predefinidas** de estos slots con los mismos gramos totales aproximados.
### Merienda (`merienda`)
**Objetivo:** Merienda/batido pre-entreno o intermedia con carbohidrato rápido, proteína y algo de grasa.

- Versión entreno: crema de arroz Life Pro (50 g) + 20 g proteína + 150 g fruta o zumo natural; o avena + bebida vegetal + proteína.
- Versión descanso: tortas de arroz + jamón cocido/pavo + frutos secos/aguacate + fruta.

Se puede modelar como:

- `carb_slot`: 50 g crema arroz o 50 g harina avena o 50 g corn flakes.
- `protein_slot`: 20 g proteína en polvo o 80 g jamón cocido/pavo.
- `fat_slot`: 15–20 g frutos secos o 60 g aguacate.
- `fruit_slot`: 100–150 g fruta o zumo de naranja natural.
### Cena (`cena`)
**Objetivo:** Cerrar el día con proteína alta, carbohidrato moderado y verdura abundante, con muchas opciones estilo "comida real" (tortilla, panini, fajitas, hamburguesa, pizza, bocadillo, etc.).

**Slots básicos día de entreno:**

- `carb_slot`: 200 g patata o 100 g ñoquis o 100 g boniato o 60 g pasta de colores o arroz o 80–100 g pan.
- `protein_slot`: 150 g pechuga pollo/pavo o 200 g calamar/sepia o 200 g pescado blanco o 3 huevos o 150 g carne roja magra, o alternativas tipo hamburguesa/fiambres.
- `vegetable_slot`: verdura variada, ensalada, gazpacho, setas, sopa, caldo.
- `fat_slot`: 10 g aceite de oliva o 40 g aguacate o 20–40 g queso semi/mozzarella.
- `extra_slot`: postre de lácteo proteico (natillas, yogur proteína, yogur bebible desnatado) o 1 onza de chocolate negro 85%.

**Días sin entreno:** se mantiene estructura pero con algunos "cheats" controlados (hamburguesa con pan y patatas, pizza extrafina, fajitas, sándwich, quesadillas, panini, etc.) respetando cantidades y manteniendo proteínas altas.
### Suplementación
Del PDF:

- `omega_3`: 1 perla diaria por la noche.
- `creatina`: 7 g todos los días, da igual el momento.

```json
{
  "supplements": [
    { "name": "omega_3", "dose": "1_perla", "timing": "evening", "notes": "Tomar con la cena." },
    { "name": "creatina", "dose": "7g", "timing": "anytime", "notes": "Consumir diariamente para saturación muscular." }
  ]
}
```
## Cómo usar esto para calcular calorías y déficit
### 1. Estimar mantenimiento
La IA debería:

1. Recibir altura, peso, edad, sexo y nivel de actividad.
2. Calcular gasto energético de mantenimiento (TDEE) con una fórmula estándar (Mifflin-St Jeor u otra) y ajustar por ejercicio.[^1][^10][^12]
### 2. Fijar el objetivo de déficit
- Para bajar 0,5–1 kg/semana se suele recomendar un déficit de 500–1000 kcal/día, creando aproximadamente 3500–7700 kcal de déficit total por semana (≈ 0,5–1 kg de grasa, usando el valor estándar de ~7700 kcal/kg).[^1][^3][^8][^13][^14][^11]
- La IA puede permitirte elegir `target_loss_rate_kg_per_week` dentro de ese rango y derivar el déficit diario.
### 3. Traducir el plan actual a kcal y macros
Para cada `MealTemplate` y slot:

1. Tomar `weekday_grams` o `restday_grams` según tipo de día.
2. Leer de `FoodItem` las kcal y macros por 100 g.
3. Calcular aportes de la comida.
4. Sumar todas las comidas del día más suplementos calóricos (si los hay) para obtener kcal totales, gramos de proteína, carbohidratos y grasa.

Esto permite:

- Ver si tu plan actual está en **déficit, mantenimiento o superávit** respecto a tu TDEE.
- Ajustar sólo algunos slots (por ejemplo bajar de 60 g a 45 g de arroz en comida y de 200 g a 150 g patata en cena) para modificar las kcal totales manteniendo la estructura que ya sabes que te funciona.[^7][^3][^9]
### 4. Generar nuevos planes respetando la lógica original
Con el modelo anterior, la IA puede:

- Cambiar `DietConstraints.target_status` a mantenimiento o superávit (ganancia muscular) y escalar gramos de carb/fat manteniendo proteína en torno a 1.6–2.2 g/kg/día para preservar músculo.[^4][^5][^6]
- Crear versiones más simples (menos opciones) o más flexibles (más "modos" de comida) sin romper el total calórico.
- Adaptar el ratio carbos/días de entreno, aumentando ligeramente carbs en comidas pre/post-entreno y reduciéndolos en días descanso.
## Resumen utilizable para tu agente
En términos prácticos, tu herramienta de IA debería poder:

1. **Parsear este `.md`** para construir:
   - Tabla de `MealTemplate` y sus `MealComponent`.
   - Tabla de `DayNutritionPlan` para día con entreno y sin entreno.
2. **Enlazar con una base de datos de alimentos (`FoodItem`)** para obtener kcal/macros.
3. **Calcular TDEE y déficit** a partir de `DietConstraints` y tu estado actual.
4. **Escalar gramos por slot** (especialmente en `carb_slot` y `fat_slot`) para lograr el objetivo de kcal manteniendo:
   - Proteína diaria dentro del rango recomendado para pérdida de grasa.[^4][^5][^6]
   - Patrón de 4–5 comidas/día similar al que has seguido y con el que has tenido éxito.

Así podrás usar esta misma lógica que te llevó de 108 kg a 94 kg como **plantilla programable** sobre la que la IA genere nuevas variantes de dieta en déficit, mantenimiento o etapa de recomposición corporal.[^1][^8][^9]

---

## References

1. [Optimal Diet Strategies for Weight Loss and ... - PMC - NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC8017325/) - A low-calorie diet involves consumption of 1,000–1,500 calories per day; deficits of 500–750 calorie...

2. [Calories and weight loss - Better Health](https://www.nhs.uk/better-health/lose-weight/calorie-counting/) - To lose weight, you need to eat and drink fewer calories than you do now. Aim to reduce your intake ...

3. [Calorie Deficit: A Complete Guide](https://www.webmd.com/diet/calorie-deficit) - A good rule of thumb for healthy weight loss is a deficit of about 500 calories per day. That should...

4. [How Much Protein Do You Need to Eat Per Day?](https://blog.nasm.org/nutrition/how-much-protein-should-you-eat-per-day-for-weight-loss) - If you want to lose weight, aim for a daily protein intake between 1.6 and 2.2 grams of protein per ...

5. [A High-Protein Diet Plan to Lose Weight and Improve Health](https://www.healthline.com/nutrition/high-protein-diet-plan) - A 2015 review found that eating up to 1.6 g/kg/bw (0.7 g/lbs/bw) per day can help promote weight los...

6. [Protein may help boost weight loss and improve overall ...](https://www.kumc.edu/about/news/news-archive/protein-benefits.html) - Sullivan said the recommended dietary allowance (RDA) for protein is 0.80 grams per kilogram of body...

7. [Counting calories: Get back to weight-loss basics](https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calories/art-20048065) - In general, if you cut about 500 calories a day from your usual diet, you may lose about ½ to 1 poun...

8. [Calorie Deficit Calculator - Calorie Deficit for Weight Loss](https://onlinedoctor.superdrug.com/calorie-deficit-calculator.html) - For sustainable weight loss, a safe and recommended rate is 0.5 to 1kg per week, alongside a calorie...

9. [Steps for Losing Weight | Healthy Weight and Growth](https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html) - People who lose weight at a gradual, steady pace—about 1 to 2 pounds a week—are more likely to keep ...

10. [How Many Calories Should You Eat per Day to Lose Weight?](https://www.healthline.com/nutrition/how-many-calories-per-day) - Females typically require at least 1,600 calories, while males need at least 2,000 calories to maint...

11. [How many calories do you need to burn to lose 1kg? - Vinmec](https://www.vinmec.com/eng/blog/how-many-calories-do-you-need-to-burn-to-lose-1kg-en) - Studies show that you need to burn 7700 calories to lose 1 kilogram, or by reducing your intake by 1...

12. [What's a calorie deficit? A dietitian explains](https://www.mdanderson.org/cancerwise/whats-a-calorie-deficit.h00-159699912.html) - “With a well-balanced diet of whole foods and 150 to 300 minutes of moderate physical activity weekl...

13. [One Does not Simply Burn 7700 kcal to Lose 1 KG](https://www.mypersonaltrainermalta.com/post/one-does-not-simply-burn-7700-kcal-to-lose-1-kg-my-personal-trainer-malta-explains-the-complexities) - 1 kilogram ≈ 2.2 pounds. Therefore, 1 kg of body fat ≈ 3500 kcal × 2.2 ≈ 7700 kcal. This assumption ...

14. [Nutrition Blog - The Climbing Dietitian | Brisbane Dietitian & Nutritionist](https://www.theclimbingdietitian.com.au/nutrition-blog-dietitian-brisbane-nutritionist/how-many-calories-are-in-a-kilogram-of-body-fat-understanding-fat-loss-math-and-why-one-day-of-overeating-wont-ruin-your-progress) - So we know that there are 7700 calories in 1 kg of body fat. By a process of quick maths… This means...

