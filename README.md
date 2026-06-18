# FitOS: acompañante adaptativo de nutrición y entrenamiento

## Propósito

Construir una aplicación de escritorio que unifique datos de actividad de Apple Watch, un modelo de plan de dieta basado en slots, seguimiento del balance energético con GET real a partir de actividades deportivas, mediciones corporales con estimación de grasa corporal, y planes de entrenamiento de fuerza en un único sistema adaptativo para la pérdida de grasa y la recomposición corporal.

El producto debe ayudar al usuario a entender:

- cuánta energía gasta cada día (TMB + actividad deportiva real + NEAT por pasos)
- cuánta energía aporta su plan de dieta (modelo de comidas por slots con opciones intercambiables)
- si está manteniendo un déficit calórico, usando peso + mediciones corporales
- cómo ajustar el plan de dieta a nivel de slot/gramo para aumentar o disminuir el déficit de forma segura
- cómo interactúan su carga de entrenamiento, recuperación y nutrición a lo largo del tiempo

La aplicación no es solo un contador de calorías. Actúa como una capa de decisión guiada que convierte datos reales de actividad y mediciones en ajustes semanales del plan de dieta.

## Problema

Los usuarios suelen tener datos de salud fragmentados:

- los datos del wearable viven en Apple Watch / Health app
- los planes de dieta personalizados viven en PDFs o chats (ya extraídos en datos estructurados)
- las rutinas de gimnasio viven en notas, hojas de cálculo o mensajes de entrenadores
- las decisiones sobre pérdida de peso se toman manualmente sin un modelo fiable de balance energético
- las mediciones corporales se registran en notas o no se registran en absoluto

Esta fragmentación dificulta responder preguntas simples:

- ¿Estoy realmente en déficit?
- ¿Estoy comiendo según mi plan?
- ¿Mi entrenamiento está alineado con mi recuperación y objetivo?
- ¿Debería ajustar calorías reduciendo porciones de carbohidratos o grasas?
- ¿Estoy perdiendo grasa o músculo según las mediciones?

## Visión

Crear una aplicación de escritorio local (Electron + SQLite) que:

1. importe exportaciones CSV de Apple Watch con métricas diarias y desglose por deporte
2. modele la dieta como una plantilla basada en slots con opciones de alimentos intercambiables
3. calcule el GET a partir de calorías de actividad deportiva real (ciclismo, boxeo, HIIT, caminata, fútbol, pádel) más TMB
4. compare la ingesta planificada vs el GET a lo largo del tiempo
5. adapte el plan de dieta a nivel de slot/gramo hacia una pérdida de peso sostenible
6. registre 10 mediciones corporales más peso con gráficos de tendencia y grasa corporal estimada
7. almacene planes de fuerza, máquinas, cargas, rutinas e historial de progresión
8. aprenda nuevas opciones de alimentos y olvide las no utilizadas para mantener el plan relevante

## Alcance MVP

### 1. Ingesta de actividad
- Importar exportaciones CSV de Apple Watch con métricas diarias
- Normalizar pasos, frecuencia cardíaca, calorías activas, calorías en reposo, sesiones de entrenamiento, sueño y peso
- Analizar datos de entrenamiento por deporte (ciclismo, boxeo, HIIT, caminata, fútbol, pádel)
- Almacenar agregados históricos diarios con desglose por deporte

### 2. Gestión del plan de dieta
- Modelar la dieta como plantillas de comidas con slots (carbohidratos, proteína, grasa, verduras, fruta, extras)
- Cada slot tiene opciones de alimentos intercambiables con kcal/macros conocidos por 100g
- Calcular totales de comida y diarios a partir de opciones seleccionadas y cantidades en gramos
- Añadir nuevas opciones de alimentos con entrada manual de macros
- Ocultar/olvidar opciones de alimentos no utilizadas para reducir el desorden
- Ajustar manualmente cantidades en gramos por slot con recálculo en tiempo real

### 3. Balance energético
- Calcular TMB usando la fórmula de Mifflin-St Jeor
- Calcular GET como TMB + calorías de actividad deportiva + NEAT basado en pasos
- Comparar ingesta planificada vs GET para balance diario y semanal
- Mostrar clasificación de superávit, mantenimiento o déficit
- Mostrar desglose del GET (TMB + deporte + componentes NEAT)

### 4. Planificación adaptativa de pérdida de grasa
- Definir ritmo objetivo de pérdida de peso (0.25–1.0 kg/semana)
- Recomendar déficit calórico inicial
- Ajustar el plan de dieta a nivel de slot/gramo semanalmente usando peso de tendencia, mediciones corporales, actividad y grasa corporal estimada
- Detectar recomposición corporal (peso estable, mediciones mejorando)
- Prevenir reducciones inseguras con suelos mínimos de calorías
- Presentar ajustes como recomendaciones de aceptar/descartar/modificar

### 5. Mediciones corporales
- Registrar 10 métricas: pecho, cuello, hombros, bíceps (I/D), antebrazos (I/D), cintura, cadera, muslos (I/D), gemelos (I/D)
- Registrar peso de forma independiente entre sesiones completas de medición
- Mostrar gráficos de tendencia individuales por métrica
- Calcular porcentaje de grasa corporal estimado usando el método de circunferencia Navy
- Mostrar comparación antes/después con deltas
- Tendencia de peso como media móvil de 7 días

### 6. Entrenamiento de fuerza
- Almacenar rutinas por día con mapeo ejercicio-a-día
- Registrar máquinas, ejercicios, series, repeticiones, carga y progresión
- Biblioteca de ejercicios con 25+ ejercicios categorizados por grupo muscular y equipo
- Registro de sesiones con formulario de entrada de series
- Gráficos de progresión (1RM estimado o carga de volumen a lo largo del tiempo)
- Comparaciones delta entre sesiones

### 7. Aplicación de escritorio
- App de escritorio Electron con almacenamiento local SQLite
- Panel de control de ventana única con navegación lateral
- Exportación/importación de datos como JSON para copia de seguridad
- Menús nativos e integración con el sistema
- Cero dependencias en la nube

## No objetivos para v1
- Diagnóstico médico completo
- Chatbot de coaching en tiempo real como interfaz principal
- Reconocimiento de comidas por visión artificial
- Interpretación avanzada de hormonas o marcadores sanguíneos
- Mercado completo para entrenadores
- Aplicación móvil o PWA
- Sincronización en la nube o compartición de datos entre dispositivos
- Integración nativa con HealthKit (solo importación CSV)
- Escaneo de códigos de barras o API pública de bases de datos de alimentos

## Principios del producto
- Recomendaciones basadas en comportamiento, no solo paneles
- Modelo de dieta basado en estructura de planes real probada
- Lógica de calorías y adaptación explicable
- GET basado en actividades reales, no multiplicadores genéricos
- Revisión semanal del plan sobre fluctuaciones diarias ruidosas
- Valores predeterminados seguros para déficit y progresión de carga
- Las mediciones cuentan la historia completa, no solo la báscula

## Riesgos clave a explorar
- Estabilidad del formato de exportación CSV de Apple Watch entre versiones de watchOS
- Precisión de kcal/macros de la base de datos de alimentos
- Aproximaciones de la fórmula de grasa corporal Navy vs variación individual
- Adherencia vs plan de dieta prescrito (sin registro diario de alimentos)
- Cobertura del modelo basado en slots para comidas no planificadas
- Desarrollador único construyendo UI full-stack + datos + motor
