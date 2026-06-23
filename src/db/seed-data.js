const FOOD_ITEMS = [

  // ─── Cereales y Pan ───
  { name: 'Pan Blanco', kcal_per_100g: 265, protein_per_100g: 9.0, carbs_per_100g: 49, fat_per_100g: 3.2, fiber_per_100g: 2.7, category: 'Cereales y Pan' },
  { name: 'Pan Integral', kcal_per_100g: 247, protein_per_100g: 13.0, carbs_per_100g: 41, fat_per_100g: 3.4, fiber_per_100g: 6.5, category: 'Cereales y Pan' },
  { name: 'Pan de Molde Integral', kcal_per_100g: 250, protein_per_100g: 11.0, carbs_per_100g: 42, fat_per_100g: 3.5, fiber_per_100g: 6.0, category: 'Cereales y Pan' },
  { name: 'Pan de Centeno', kcal_per_100g: 240, protein_per_100g: 9.0, carbs_per_100g: 45, fat_per_100g: 3.2, fiber_per_100g: 7.5, category: 'Cereales y Pan' },
  { name: 'Pan de Espelta', kcal_per_100g: 255, protein_per_100g: 12.0, carbs_per_100g: 43, fat_per_100g: 3.0, fiber_per_100g: 5.5, category: 'Cereales y Pan' },
  { name: 'Pan de Hamburguesa', kcal_per_100g: 280, protein_per_100g: 9.0, carbs_per_100g: 48, fat_per_100g: 5.5, fiber_per_100g: 2.0, category: 'Cereales y Pan' },
  { name: 'Tortitas de Arroz', kcal_per_100g: 382, protein_per_100g: 7.5, carbs_per_100g: 81, fat_per_100g: 2.8, fiber_per_100g: 1.5, category: 'Cereales y Pan' },
  { name: 'Tortitas de Maíz', kcal_per_100g: 375, protein_per_100g: 7.0, carbs_per_100g: 80, fat_per_100g: 3.0, fiber_per_100g: 1.2, category: 'Cereales y Pan' },
  { name: 'Avena en Copos', kcal_per_100g: 370, protein_per_100g: 13.0, carbs_per_100g: 62, fat_per_100g: 7.0, fiber_per_100g: 10.0, category: 'Cereales y Pan' },
  { name: 'Harina de Avena', kcal_per_100g: 375, protein_per_100g: 13.5, carbs_per_100g: 65, fat_per_100g: 7.0, fiber_per_100g: 7.5, category: 'Cereales y Pan' },
  { name: 'Arroz Blanco', kcal_per_100g: 325.0, protein_per_100g: 6.8, carbs_per_100g: 70.0, fat_per_100g: 0.8, fiber_per_100g: 1.0, category: 'Cereales y Pan' },
  { name: 'Arroz Integral', kcal_per_100g: 307.5, protein_per_100g: 6.8, carbs_per_100g: 65.0, fat_per_100g: 2.5, fiber_per_100g: 4.5, category: 'Cereales y Pan' },
  { name: 'Pasta Integral', kcal_per_100g: 345.4, protein_per_100g: 12.1, carbs_per_100g: 66.0, fat_per_100g: 1.8, fiber_per_100g: 8.8, category: 'Cereales y Pan' },
  { name: 'Pasta Blanca', kcal_per_100g: 341.0, protein_per_100g: 11.0, carbs_per_100g: 68.2, fat_per_100g: 1.3, fiber_per_100g: 4.0, category: 'Cereales y Pan' },
  { name: 'Patata', kcal_per_100g: 65.5, protein_per_100g: 1.7, carbs_per_100g: 14.4, fat_per_100g: 0.1, fiber_per_100g: 1.7, category: 'Cereales y Pan' },
  { name: 'Boniato', kcal_per_100g: 73.1, protein_per_100g: 1.4, carbs_per_100g: 17.0, fat_per_100g: 0.1, fiber_per_100g: 2.5, category: 'Cereales y Pan' },
  { name: 'Ñoquis', kcal_per_100g: 130, protein_per_100g: 3.0, carbs_per_100g: 28, fat_per_100g: 0.5, fiber_per_100g: 1.5, category: 'Cereales y Pan' },
  { name: 'Cuscús', kcal_per_100g: 280.0, protein_per_100g: 9.5, carbs_per_100g: 57.5, fat_per_100g: 0.5, fiber_per_100g: 3.5, category: 'Cereales y Pan' },
  { name: 'Cuscús Integral', kcal_per_100g: 270.0, protein_per_100g: 10.0, carbs_per_100g: 52.5, fat_per_100g: 2.0, fiber_per_100g: 8.8, category: 'Cereales y Pan' },
  { name: 'Quinoa', kcal_per_100g: 336.0, protein_per_100g: 12.3, carbs_per_100g: 58.8, fat_per_100g: 5.3, fiber_per_100g: 7.8, category: 'Cereales y Pan' },
  { name: 'Muesli sin Azúcar', kcal_per_100g: 360, protein_per_100g: 10.0, carbs_per_100g: 67, fat_per_100g: 6.0, fiber_per_100g: 8.0, category: 'Cereales y Pan' },
  { name: 'Corn Flakes', kcal_per_100g: 357, protein_per_100g: 7.0, carbs_per_100g: 84, fat_per_100g: 0.4, fiber_per_100g: 0.9, category: 'Cereales y Pan' },
  { name: 'Crema de Arroz', kcal_per_100g: 360, protein_per_100g: 7.0, carbs_per_100g: 80, fat_per_100g: 0.5, fiber_per_100g: 1.0, category: 'Cereales y Pan' },
  { name: 'Trigo Sarraceno', kcal_per_100g: 230.0, protein_per_100g: 8.5, carbs_per_100g: 50.0, fat_per_100g: 1.5, fiber_per_100g: 6.8, category: 'Cereales y Pan' },
  { name: 'Cebada Perlada', kcal_per_100g: 307.5, protein_per_100g: 9.0, carbs_per_100g: 70.0, fat_per_100g: 1.0, fiber_per_100g: 9.5, category: 'Cereales y Pan' },
  { name: 'Maíz Dulce', kcal_per_100g: 86, protein_per_100g: 3.2, carbs_per_100g: 19, fat_per_100g: 1.2, fiber_per_100g: 2.4, category: 'Cereales y Pan' },
  { name: 'Centeno en Grano', kcal_per_100g: 338.0, protein_per_100g: 10.0, carbs_per_100g: 76.0, fat_per_100g: 1.6, fiber_per_100g: 15.0, category: 'Cereales y Pan' },

  // ─── Proteínas ───
  { name: 'Pechuga de Pollo', kcal_per_100g: 165, protein_per_100g: 31.0, carbs_per_100g: 0, fat_per_100g: 3.6, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Muslo de Pollo', kcal_per_100g: 185, protein_per_100g: 24.0, carbs_per_100g: 0, fat_per_100g: 9.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Alitas de Pollo', kcal_per_100g: 220, protein_per_100g: 22.0, carbs_per_100g: 0, fat_per_100g: 14.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Pechuga de Pavo', kcal_per_100g: 135, protein_per_100g: 29.0, carbs_per_100g: 0, fat_per_100g: 1.5, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Pavo Molido', kcal_per_100g: 140, protein_per_100g: 28.0, carbs_per_100g: 0, fat_per_100g: 3.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Fiambre de Pavo', kcal_per_100g: 100, protein_per_100g: 20.0, carbs_per_100g: 1.0, fat_per_100g: 2.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Jamón Cocido', kcal_per_100g: 145, protein_per_100g: 20.0, carbs_per_100g: 1.0, fat_per_100g: 7.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Jamón Serrano', kcal_per_100g: 240, protein_per_100g: 30.0, carbs_per_100g: 0.5, fat_per_100g: 13.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Lomo Embuchado', kcal_per_100g: 200, protein_per_100g: 30.0, carbs_per_100g: 0.5, fat_per_100g: 9.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Solomillo de Cerdo', kcal_per_100g: 155, protein_per_100g: 26.0, carbs_per_100g: 0, fat_per_100g: 5.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Lomo de Cerdo Magro', kcal_per_100g: 165, protein_per_100g: 27.0, carbs_per_100g: 0, fat_per_100g: 6.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Carne Roja Magra (Ternera)', kcal_per_100g: 180, protein_per_100g: 26.0, carbs_per_100g: 0, fat_per_100g: 8.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Ternera Picada Magra', kcal_per_100g: 175, protein_per_100g: 25.0, carbs_per_100g: 0, fat_per_100g: 8.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Chuletón de Ternera', kcal_per_100g: 250, protein_per_100g: 22.0, carbs_per_100g: 0, fat_per_100g: 18.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Conejo', kcal_per_100g: 175, protein_per_100g: 33.0, carbs_per_100g: 0, fat_per_100g: 4.5, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Salmón', kcal_per_100g: 208, protein_per_100g: 20.0, carbs_per_100g: 0, fat_per_100g: 13.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Merluza', kcal_per_100g: 85, protein_per_100g: 18.0, carbs_per_100g: 0, fat_per_100g: 0.7, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Bacalao Fresco', kcal_per_100g: 82, protein_per_100g: 18.0, carbs_per_100g: 0, fat_per_100g: 0.7, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Atún al Natural', kcal_per_100g: 116, protein_per_100g: 26.0, carbs_per_100g: 0, fat_per_100g: 0.8, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Atún en Aceite', kcal_per_100g: 200, protein_per_100g: 24.0, carbs_per_100g: 0, fat_per_100g: 11.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Sardinas al Natural', kcal_per_100g: 210, protein_per_100g: 24.0, carbs_per_100g: 0, fat_per_100g: 12.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Caballa', kcal_per_100g: 205, protein_per_100g: 19.0, carbs_per_100g: 0, fat_per_100g: 14.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Calamar / Sepia', kcal_per_100g: 92, protein_per_100g: 17.0, carbs_per_100g: 0, fat_per_100g: 1.5, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Langostinos', kcal_per_100g: 95, protein_per_100g: 20.0, carbs_per_100g: 0.5, fat_per_100g: 0.9, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Gambas', kcal_per_100g: 85, protein_per_100g: 18.0, carbs_per_100g: 0, fat_per_100g: 0.6, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Mejillones', kcal_per_100g: 86, protein_per_100g: 12.0, carbs_per_100g: 4.0, fat_per_100g: 2.2, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Huevo Entero', kcal_per_100g: 155, protein_per_100g: 13.0, carbs_per_100g: 1.1, fat_per_100g: 11.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Claras de Huevo', kcal_per_100g: 52, protein_per_100g: 11.0, carbs_per_100g: 0.7, fat_per_100g: 0.2, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Tofu Firme', kcal_per_100g: 76, protein_per_100g: 8.0, carbs_per_100g: 2.0, fat_per_100g: 4.8, fiber_per_100g: 0.3, category: 'Proteínas' },
  { name: 'Tempeh', kcal_per_100g: 193, protein_per_100g: 19.0, carbs_per_100g: 9.0, fat_per_100g: 11.0, fiber_per_100g: 4.6, category: 'Proteínas' },
  { name: 'Seitán', kcal_per_100g: 130, protein_per_100g: 25.0, carbs_per_100g: 4.0, fat_per_100g: 2.0, fiber_per_100g: 0.6, category: 'Proteínas' },
  { name: 'Edamame', kcal_per_100g: 122, protein_per_100g: 11.0, carbs_per_100g: 10.0, fat_per_100g: 5.2, fiber_per_100g: 5.0, category: 'Proteínas' },
  { name: 'Proteína en Polvo (Whey)', kcal_per_100g: 380, protein_per_100g: 80.0, carbs_per_100g: 6.0, fat_per_100g: 5.0, fiber_per_100g: 0, category: 'Proteínas' },
  { name: 'Proteína Vegana en Polvo', kcal_per_100g: 360, protein_per_100g: 70.0, carbs_per_100g: 10.0, fat_per_100g: 6.0, fiber_per_100g: 3.0, category: 'Proteínas' },

  // ─── Legumbres ───
  { name: 'Lentejas', kcal_per_100g: 290.0, protein_per_100g: 22.5, carbs_per_100g: 50.0, fat_per_100g: 1.0, fiber_per_100g: 19.8, category: 'Legumbres' },
  { name: 'Garbanzos', kcal_per_100g: 347.5, protein_per_100g: 22.2, carbs_per_100g: 57.5, fat_per_100g: 6.5, fiber_per_100g: 19.0, category: 'Legumbres' },
  { name: 'Alubias', kcal_per_100g: 317.5, protein_per_100g: 21.8, carbs_per_100g: 57.5, fat_per_100g: 1.2, fiber_per_100g: 15.8, category: 'Legumbres' },
  { name: 'Habas', kcal_per_100g: 220.0, protein_per_100g: 19.0, carbs_per_100g: 35.0, fat_per_100g: 1.0, fiber_per_100g: 13.5, category: 'Legumbres' },
  { name: 'Soja', kcal_per_100g: 432.5, protein_per_100g: 40.0, carbs_per_100g: 24.8, fat_per_100g: 22.5, fiber_per_100g: 15.0, category: 'Legumbres' },
  { name: 'Guisantes', kcal_per_100g: 121.5, protein_per_100g: 8.1, carbs_per_100g: 21.0, fat_per_100g: 0.6, fiber_per_100g: 8.2, category: 'Legumbres' },

  // ─── Grasas Saludables ───
  { name: 'Aceite de Oliva Virgen Extra', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100.0, fiber_per_100g: 0, category: 'Grasas Saludables' },
  { name: 'Aceite de Coco Virgen', kcal_per_100g: 862, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100.0, fiber_per_100g: 0, category: 'Grasas Saludables' },
  { name: 'Aguacate', kcal_per_100g: 160, protein_per_100g: 2.0, carbs_per_100g: 8.5, fat_per_100g: 15.0, fiber_per_100g: 6.7, category: 'Grasas Saludables' },
  { name: 'Almendras', kcal_per_100g: 579, protein_per_100g: 21.0, carbs_per_100g: 22.0, fat_per_100g: 50.0, fiber_per_100g: 12.5, category: 'Grasas Saludables' },
  { name: 'Nueces', kcal_per_100g: 654, protein_per_100g: 15.0, carbs_per_100g: 14.0, fat_per_100g: 65.0, fiber_per_100g: 6.7, category: 'Grasas Saludables' },
  { name: 'Anacardos', kcal_per_100g: 553, protein_per_100g: 18.0, carbs_per_100g: 30.0, fat_per_100g: 44.0, fiber_per_100g: 3.3, category: 'Grasas Saludables' },
  { name: 'Pistachos', kcal_per_100g: 560, protein_per_100g: 20.0, carbs_per_100g: 28.0, fat_per_100g: 45.0, fiber_per_100g: 10.3, category: 'Grasas Saludables' },
  { name: 'Avellanas', kcal_per_100g: 628, protein_per_100g: 15.0, carbs_per_100g: 17.0, fat_per_100g: 61.0, fiber_per_100g: 9.7, category: 'Grasas Saludables' },
  { name: 'Frutos Secos Mixtos (sin sal)', kcal_per_100g: 607, protein_per_100g: 20.0, carbs_per_100g: 20.0, fat_per_100g: 54.0, fiber_per_100g: 8.0, category: 'Grasas Saludables' },
  { name: 'Crema de Cacahuete sin Azúcar', kcal_per_100g: 588, protein_per_100g: 25.0, carbs_per_100g: 20.0, fat_per_100g: 50.0, fiber_per_100g: 6.0, category: 'Grasas Saludables' },
  { name: 'Crema de Almendras sin Azúcar', kcal_per_100g: 614, protein_per_100g: 21.0, carbs_per_100g: 20.0, fat_per_100g: 56.0, fiber_per_100g: 10.0, category: 'Grasas Saludables' },
  { name: 'Semillas de Chía', kcal_per_100g: 486, protein_per_100g: 17.0, carbs_per_100g: 42.0, fat_per_100g: 31.0, fiber_per_100g: 34.4, category: 'Grasas Saludables' },
  { name: 'Semillas de Lino', kcal_per_100g: 534, protein_per_100g: 18.0, carbs_per_100g: 29.0, fat_per_100g: 42.0, fiber_per_100g: 27.3, category: 'Grasas Saludables' },
  { name: 'Semillas de Sésamo', kcal_per_100g: 573, protein_per_100g: 18.0, carbs_per_100g: 23.0, fat_per_100g: 50.0, fiber_per_100g: 11.8, category: 'Grasas Saludables' },
  { name: 'Pipas de Calabaza (sin cáscara)', kcal_per_100g: 559, protein_per_100g: 30.0, carbs_per_100g: 11.0, fat_per_100g: 49.0, fiber_per_100g: 6.0, category: 'Grasas Saludables' },
  { name: 'Pipas de Girasol (sin cáscara)', kcal_per_100g: 584, protein_per_100g: 21.0, carbs_per_100g: 20.0, fat_per_100g: 51.0, fiber_per_100g: 8.6, category: 'Grasas Saludables' },
  { name: 'Mantequilla', kcal_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81.0, fiber_per_100g: 0, category: 'Grasas Saludables' },

  // ─── Lácteos ───
  { name: 'Yogur Natural Desnatado', kcal_per_100g: 55, protein_per_100g: 5.0, carbs_per_100g: 7.0, fat_per_100g: 0.2, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Yogur Griego Natural', kcal_per_100g: 97, protein_per_100g: 9.0, carbs_per_100g: 4.0, fat_per_100g: 5.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Yogur Griego 0%', kcal_per_100g: 65, protein_per_100g: 10.0, carbs_per_100g: 4.5, fat_per_100g: 0.3, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Batido 0%', kcal_per_100g: 60, protein_per_100g: 10.0, carbs_per_100g: 4.5, fat_per_100g: 0.2, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Cottage', kcal_per_100g: 98, protein_per_100g: 11.0, carbs_per_100g: 3.4, fat_per_100g: 4.3, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Fresco', kcal_per_100g: 155, protein_per_100g: 18.0, carbs_per_100g: 2.0, fat_per_100g: 8.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Mozzarella', kcal_per_100g: 280, protein_per_100g: 22.0, carbs_per_100g: 2.0, fat_per_100g: 21.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Semi', kcal_per_100g: 350, protein_per_100g: 25.0, carbs_per_100g: 1.0, fat_per_100g: 28.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Curado', kcal_per_100g: 450, protein_per_100g: 30.0, carbs_per_100g: 1.0, fat_per_100g: 36.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Queso Parmesano', kcal_per_100g: 431, protein_per_100g: 38.0, carbs_per_100g: 4.0, fat_per_100g: 29.0, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Kéfir', kcal_per_100g: 64, protein_per_100g: 3.3, carbs_per_100g: 5.0, fat_per_100g: 3.5, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Leche Entera', kcal_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.7, fat_per_100g: 3.3, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Leche Semidesnatada', kcal_per_100g: 46, protein_per_100g: 3.1, carbs_per_100g: 4.7, fat_per_100g: 1.6, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Leche Desnatada', kcal_per_100g: 35, protein_per_100g: 3.4, carbs_per_100g: 4.8, fat_per_100g: 0.1, fiber_per_100g: 0, category: 'Lácteos' },
  { name: 'Nata Líquida', kcal_per_100g: 180, protein_per_100g: 2.0, carbs_per_100g: 4.0, fat_per_100g: 18.0, fiber_per_100g: 0, category: 'Lácteos' },

  // ─── Frutas ───
  { name: 'Manzana', kcal_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14.0, fat_per_100g: 0.2, fiber_per_100g: 2.4, category: 'Frutas' },
  { name: 'Pera', kcal_per_100g: 57, protein_per_100g: 0.4, carbs_per_100g: 15.0, fat_per_100g: 0.1, fiber_per_100g: 3.1, category: 'Frutas' },
  { name: 'Plátano', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23.0, fat_per_100g: 0.3, fiber_per_100g: 2.6, category: 'Frutas' },
  { name: 'Naranja', kcal_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12.0, fat_per_100g: 0.1, fiber_per_100g: 2.4, category: 'Frutas' },
  { name: 'Pomelo', kcal_per_100g: 42, protein_per_100g: 0.8, carbs_per_100g: 11.0, fat_per_100g: 0.1, fiber_per_100g: 1.6, category: 'Frutas' },
  { name: 'Kiwi', kcal_per_100g: 61, protein_per_100g: 1.1, carbs_per_100g: 15.0, fat_per_100g: 0.5, fiber_per_100g: 3.0, category: 'Frutas' },
  { name: 'Fresas', kcal_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 8.0, fat_per_100g: 0.3, fiber_per_100g: 2.0, category: 'Frutas' },
  { name: 'Arándanos', kcal_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14.0, fat_per_100g: 0.3, fiber_per_100g: 2.4, category: 'Frutas' },
  { name: 'Frambuesas', kcal_per_100g: 52, protein_per_100g: 1.2, carbs_per_100g: 12.0, fat_per_100g: 0.7, fiber_per_100g: 6.5, category: 'Frutas' },
  { name: 'Moras', kcal_per_100g: 43, protein_per_100g: 1.4, carbs_per_100g: 10.0, fat_per_100g: 0.5, fiber_per_100g: 5.3, category: 'Frutas' },
  { name: 'Uvas', kcal_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18.0, fat_per_100g: 0.2, fiber_per_100g: 0.9, category: 'Frutas' },
  { name: 'Mango', kcal_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15.0, fat_per_100g: 0.4, fiber_per_100g: 1.6, category: 'Frutas' },
  { name: 'Piña', kcal_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13.0, fat_per_100g: 0.1, fiber_per_100g: 1.4, category: 'Frutas' },
  { name: 'Papaya', kcal_per_100g: 43, protein_per_100g: 0.5, carbs_per_100g: 11.0, fat_per_100g: 0.3, fiber_per_100g: 1.7, category: 'Frutas' },
  { name: 'Melón', kcal_per_100g: 34, protein_per_100g: 0.8, carbs_per_100g: 8.0, fat_per_100g: 0.2, fiber_per_100g: 0.9, category: 'Frutas' },
  { name: 'Sandía', kcal_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 7.5, fat_per_100g: 0.2, fiber_per_100g: 0.4, category: 'Frutas' },
  { name: 'Cerezas', kcal_per_100g: 50, protein_per_100g: 1.0, carbs_per_100g: 12.0, fat_per_100g: 0.3, fiber_per_100g: 1.6, category: 'Frutas' },
  { name: 'Melocotón / Nectarina', kcal_per_100g: 39, protein_per_100g: 0.9, carbs_per_100g: 9.5, fat_per_100g: 0.3, fiber_per_100g: 1.5, category: 'Frutas' },
  { name: 'Ciruela', kcal_per_100g: 46, protein_per_100g: 0.7, carbs_per_100g: 11.0, fat_per_100g: 0.3, fiber_per_100g: 1.4, category: 'Frutas' },
  { name: 'Albaricoque', kcal_per_100g: 48, protein_per_100g: 1.4, carbs_per_100g: 11.0, fat_per_100g: 0.4, fiber_per_100g: 2.0, category: 'Frutas' },
  { name: 'Higos Frescos', kcal_per_100g: 74, protein_per_100g: 0.8, carbs_per_100g: 19.0, fat_per_100g: 0.3, fiber_per_100g: 2.9, category: 'Frutas' },
  { name: 'Granada', kcal_per_100g: 83, protein_per_100g: 1.7, carbs_per_100g: 19.0, fat_per_100g: 1.2, fiber_per_100g: 4.0, category: 'Frutas' },
  { name: 'Limón', kcal_per_100g: 29, protein_per_100g: 1.1, carbs_per_100g: 9.0, fat_per_100g: 0.3, fiber_per_100g: 2.8, category: 'Frutas' },
  { name: 'Lima', kcal_per_100g: 30, protein_per_100g: 0.7, carbs_per_100g: 11.0, fat_per_100g: 0.2, fiber_per_100g: 2.8, category: 'Frutas' },
  { name: 'Dátiles (secos)', kcal_per_100g: 282, protein_per_100g: 2.5, carbs_per_100g: 75.0, fat_per_100g: 0.4, fiber_per_100g: 8.0, category: 'Frutas' },
  { name: 'Pasas', kcal_per_100g: 299, protein_per_100g: 3.1, carbs_per_100g: 79.0, fat_per_100g: 0.5, fiber_per_100g: 3.7, category: 'Frutas' },
  { name: 'Coco Rallado (sin azúcar)', kcal_per_100g: 660, protein_per_100g: 7.0, carbs_per_100g: 24.0, fat_per_100g: 65.0, fiber_per_100g: 16.3, category: 'Frutas' },

  // ─── Verduras ───
  { name: 'Espinacas', kcal_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, fiber_per_100g: 2.2, category: 'Verduras' },
  { name: 'Brócoli', kcal_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7.0, fat_per_100g: 0.4, fiber_per_100g: 2.6, category: 'Verduras' },
  { name: 'Coliflor', kcal_per_100g: 25, protein_per_100g: 1.9, carbs_per_100g: 5.0, fat_per_100g: 0.3, fiber_per_100g: 2.0, category: 'Verduras' },
  { name: 'Lechuga', kcal_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2, fiber_per_100g: 1.3, category: 'Verduras' },
  { name: 'Rúcula', kcal_per_100g: 25, protein_per_100g: 2.6, carbs_per_100g: 3.7, fat_per_100g: 0.7, fiber_per_100g: 1.6, category: 'Verduras' },
  { name: 'Canónigos', kcal_per_100g: 20, protein_per_100g: 2.0, carbs_per_100g: 3.0, fat_per_100g: 0.4, fiber_per_100g: 1.2, category: 'Verduras' },
  { name: 'Acelgas', kcal_per_100g: 19, protein_per_100g: 1.8, carbs_per_100g: 3.7, fat_per_100g: 0.2, fiber_per_100g: 1.6, category: 'Verduras' },
  { name: 'Tomate', kcal_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, fiber_per_100g: 1.2, category: 'Verduras' },
  { name: 'Pepino', kcal_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1, fiber_per_100g: 0.5, category: 'Verduras' },
  { name: 'Pimiento Rojo', kcal_per_100g: 31, protein_per_100g: 1.0, carbs_per_100g: 6.0, fat_per_100g: 0.3, fiber_per_100g: 2.1, category: 'Verduras' },
  { name: 'Pimiento Verde', kcal_per_100g: 20, protein_per_100g: 0.9, carbs_per_100g: 4.6, fat_per_100g: 0.2, fiber_per_100g: 1.7, category: 'Verduras' },
  { name: 'Cebolla', kcal_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.0, fat_per_100g: 0.1, fiber_per_100g: 1.7, category: 'Verduras' },
  { name: 'Ajo', kcal_per_100g: 149, protein_per_100g: 6.4, carbs_per_100g: 33.0, fat_per_100g: 0.5, fiber_per_100g: 2.1, category: 'Verduras' },
  { name: 'Zanahoria', kcal_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10.0, fat_per_100g: 0.2, fiber_per_100g: 2.8, category: 'Verduras' },
  { name: 'Calabacín', kcal_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3, fiber_per_100g: 1.0, category: 'Verduras' },
  { name: 'Berenjena', kcal_per_100g: 25, protein_per_100g: 1.0, carbs_per_100g: 5.9, fat_per_100g: 0.2, fiber_per_100g: 3.0, category: 'Verduras' },
  { name: 'Repollo', kcal_per_100g: 25, protein_per_100g: 1.3, carbs_per_100g: 5.8, fat_per_100g: 0.1, fiber_per_100g: 2.5, category: 'Verduras' },
  { name: 'Coles de Bruselas', kcal_per_100g: 43, protein_per_100g: 3.4, carbs_per_100g: 9.0, fat_per_100g: 0.3, fiber_per_100g: 3.8, category: 'Verduras' },
  { name: 'Espárragos', kcal_per_100g: 20, protein_per_100g: 2.2, carbs_per_100g: 3.9, fat_per_100g: 0.1, fiber_per_100g: 2.1, category: 'Verduras' },
  { name: 'Judías Verdes', kcal_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7.0, fat_per_100g: 0.2, fiber_per_100g: 2.7, category: 'Verduras' },
  { name: 'Champiñones', kcal_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3, fiber_per_100g: 1.0, category: 'Verduras' },
  { name: 'Setas Variadas', kcal_per_100g: 30, protein_per_100g: 3.0, carbs_per_100g: 4.0, fat_per_100g: 0.5, fiber_per_100g: 2.5, category: 'Verduras' },
  { name: 'Remolacha', kcal_per_100g: 43, protein_per_100g: 1.6, carbs_per_100g: 10.0, fat_per_100g: 0.2, fiber_per_100g: 2.8, category: 'Verduras' },
  { name: 'Apio', kcal_per_100g: 16, protein_per_100g: 0.7, carbs_per_100g: 3.0, fat_per_100g: 0.2, fiber_per_100g: 1.6, category: 'Verduras' },
  { name: 'Puerro', kcal_per_100g: 61, protein_per_100g: 1.5, carbs_per_100g: 14.0, fat_per_100g: 0.3, fiber_per_100g: 1.8, category: 'Verduras' },
  { name: 'Alcachofa', kcal_per_100g: 53, protein_per_100g: 3.3, carbs_per_100g: 11.0, fat_per_100g: 0.2, fiber_per_100g: 5.4, category: 'Verduras' },
  { name: 'Kale / Col Rizada', kcal_per_100g: 35, protein_per_100g: 2.9, carbs_per_100g: 4.4, fat_per_100g: 0.7, fiber_per_100g: 4.1, category: 'Verduras' },
  { name: 'Cebolla Morada', kcal_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9.0, fat_per_100g: 0.1, fiber_per_100g: 1.7, category: 'Verduras' },
  { name: 'Tomate Cherry', kcal_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, fiber_per_100g: 1.2, category: 'Verduras' },
  { name: 'Calabaza', kcal_per_100g: 22.1, protein_per_100g: 0.8, carbs_per_100g: 5.5, fat_per_100g: 0.1, fiber_per_100g: 0.4, category: 'Verduras' },
  { name: 'Nabo', kcal_per_100g: 28, protein_per_100g: 0.9, carbs_per_100g: 6.4, fat_per_100g: 0.1, fiber_per_100g: 1.8, category: 'Verduras' },
  { name: 'Alga Nori', kcal_per_100g: 35, protein_per_100g: 5.8, carbs_per_100g: 5.0, fat_per_100g: 0.3, fiber_per_100g: 2.0, category: 'Verduras' },

  // ─── Bebidas y Extras ───
  { name: 'Bebida de Avena sin Azúcar', kcal_per_100g: 40, protein_per_100g: 1.0, carbs_per_100g: 7.0, fat_per_100g: 0.8, fiber_per_100g: 0.3, category: 'Bebidas y Extras' },
  { name: 'Bebida de Almendra sin Azúcar', kcal_per_100g: 15, protein_per_100g: 0.5, carbs_per_100g: 0.5, fat_per_100g: 1.1, fiber_per_100g: 0.4, category: 'Bebidas y Extras' },
  { name: 'Bebida de Soja sin Azúcar', kcal_per_100g: 33, protein_per_100g: 3.3, carbs_per_100g: 0.9, fat_per_100g: 1.8, fiber_per_100g: 0.5, category: 'Bebidas y Extras' },
  { name: 'Horchata Natural', kcal_per_100g: 55, protein_per_100g: 0.5, carbs_per_100g: 8.0, fat_per_100g: 2.5, fiber_per_100g: 0.5, category: 'Bebidas y Extras' },
  { name: 'Zumo de Naranja Natural', kcal_per_100g: 45, protein_per_100g: 0.7, carbs_per_100g: 10.0, fat_per_100g: 0.2, fiber_per_100g: 0.2, category: 'Bebidas y Extras' },
  { name: 'Refresco Light / Zero', kcal_per_100g: 2, protein_per_100g: 0, carbs_per_100g: 0.2, fat_per_100g: 0, fiber_per_100g: 0, category: 'Bebidas y Extras' },
  { name: 'Agua con Gas', kcal_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, fiber_per_100g: 0, category: 'Bebidas y Extras' },
  { name: 'Té Verde', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, fiber_per_100g: 0, category: 'Bebidas y Extras' },
  { name: 'Café', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0, fiber_per_100g: 0, category: 'Bebidas y Extras' },

  // ─── Salsas y Condimentos ───
  { name: 'Tomate Frito Casero', kcal_per_100g: 60, protein_per_100g: 1.5, carbs_per_100g: 10.0, fat_per_100g: 2.0, fiber_per_100g: 1.5, category: 'Salsas y Condimentos' },
  { name: 'Mostaza Dijon', kcal_per_100g: 66, protein_per_100g: 4.0, carbs_per_100g: 6.0, fat_per_100g: 3.5, fiber_per_100g: 3.0, category: 'Salsas y Condimentos' },
  { name: 'Ketchup', kcal_per_100g: 110, protein_per_100g: 1.0, carbs_per_100g: 27.0, fat_per_100g: 0.1, fiber_per_100g: 0.3, category: 'Salsas y Condimentos' },
  { name: 'Salsa de Soja', kcal_per_100g: 53, protein_per_100g: 8.0, carbs_per_100g: 4.7, fat_per_100g: 0, fiber_per_100g: 0, category: 'Salsas y Condimentos' },
  { name: 'Vinagre Balsámico', kcal_per_100g: 88, protein_per_100g: 0.5, carbs_per_100g: 17.0, fat_per_100g: 0, fiber_per_100g: 0, category: 'Salsas y Condimentos' },
  { name: 'Vinagre de Manzana', kcal_per_100g: 22, protein_per_100g: 0, carbs_per_100g: 0.9, fat_per_100g: 0, fiber_per_100g: 0, category: 'Salsas y Condimentos' },
  { name: 'Pesto', kcal_per_100g: 490, protein_per_100g: 8.0, carbs_per_100g: 8.0, fat_per_100g: 48.0, fiber_per_100g: 1.5, category: 'Salsas y Condimentos' },
  { name: 'Hummus', kcal_per_100g: 166, protein_per_100g: 7.9, carbs_per_100g: 14.0, fat_per_100g: 9.6, fiber_per_100g: 6.0, category: 'Salsas y Condimentos' },
  { name: 'Mayonesa', kcal_per_100g: 700, protein_per_100g: 1.0, carbs_per_100g: 1.0, fat_per_100g: 75.0, fiber_per_100g: 0, category: 'Salsas y Condimentos' },
  { name: 'Salsa de Yogur (tzatziki)', kcal_per_100g: 80, protein_per_100g: 3.0, carbs_per_100g: 6.0, fat_per_100g: 5.0, fiber_per_100g: 0.3, category: 'Salsas y Condimentos' },
  { name: 'Guacamole Casero', kcal_per_100g: 155, protein_per_100g: 2.0, carbs_per_100g: 9.0, fat_per_100g: 14.0, fiber_per_100g: 6.5, category: 'Salsas y Condimentos' },
  { name: 'Salsa Sriracha', kcal_per_100g: 93, protein_per_100g: 1.8, carbs_per_100g: 20.0, fat_per_100g: 1.0, fiber_per_100g: 1.0, category: 'Salsas y Condimentos' },

  // ─── Especias y Condimentos ───
  { name: 'Jengibre', kcal_per_100g: 80, protein_per_100g: 1.8, carbs_per_100g: 18.0, fat_per_100g: 0.8, fiber_per_100g: 2.0, category: 'Especias y Condimentos' },
  { name: 'Cúrcuma en Polvo', kcal_per_100g: 354, protein_per_100g: 8.0, carbs_per_100g: 64.0, fat_per_100g: 9.9, fiber_per_100g: 22.0, category: 'Especias y Condimentos' },
  { name: 'Canela en Polvo', kcal_per_100g: 247, protein_per_100g: 4.0, carbs_per_100g: 81.0, fat_per_100g: 1.2, fiber_per_100g: 53.0, category: 'Especias y Condimentos' },
  { name: 'Pimentón (dulce/picante)', kcal_per_100g: 282, protein_per_100g: 14.1, carbs_per_100g: 54.0, fat_per_100g: 12.9, fiber_per_100g: 34.9, category: 'Especias y Condimentos' },
  { name: 'Wasabi', kcal_per_100g: 115, protein_per_100g: 5.0, carbs_per_100g: 24.0, fat_per_100g: 0.5, fiber_per_100g: 7.8, category: 'Especias y Condimentos' },

  // ─── Dulces y Caprichos ───
  { name: 'Chocolate Negro 85%+', kcal_per_100g: 598, protein_per_100g: 8.0, carbs_per_100g: 16.0, fat_per_100g: 55.0, fiber_per_100g: 10.9, category: 'Dulces y Caprichos' },
  { name: 'Chocolate con Leche', kcal_per_100g: 540, protein_per_100g: 7.0, carbs_per_100g: 53.0, fat_per_100g: 31.0, fiber_per_100g: 1.5, category: 'Dulces y Caprichos' },
  { name: 'Cacao en Polvo sin Azúcar', kcal_per_100g: 228, protein_per_100g: 20.0, carbs_per_100g: 12.0, fat_per_100g: 14.0, fiber_per_100g: 33.0, category: 'Dulces y Caprichos' },
  { name: 'Miel', kcal_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82.0, fat_per_100g: 0, fiber_per_100g: 0.2, category: 'Dulces y Caprichos' },
  { name: 'Sirope de Arce', kcal_per_100g: 260, protein_per_100g: 0, carbs_per_100g: 67.0, fat_per_100g: 0, fiber_per_100g: 0, category: 'Dulces y Caprichos' },
  { name: 'Mermelada Light', kcal_per_100g: 120, protein_per_100g: 0.5, carbs_per_100g: 30.0, fat_per_100g: 0.1, fiber_per_100g: 0.5, category: 'Dulces y Caprichos' },
  { name: 'Galletas Digestive', kcal_per_100g: 470, protein_per_100g: 7.0, carbs_per_100g: 65.0, fat_per_100g: 20.0, fiber_per_100g: 3.0, category: 'Dulces y Caprichos' },

  // ─── Platos Preparados ───
  { name: 'Caldo de Pollo Casero', kcal_per_100g: 15, protein_per_100g: 1.5, carbs_per_100g: 0.5, fat_per_100g: 0.8, fiber_per_100g: 0, category: 'Platos Preparados' },
  { name: 'Sopa de Verduras', kcal_per_100g: 30, protein_per_100g: 1.2, carbs_per_100g: 4.0, fat_per_100g: 0.8, fiber_per_100g: 1.5, category: 'Platos Preparados' },
  { name: 'Tortilla de Patatas', kcal_per_100g: 190, protein_per_100g: 8.0, carbs_per_100g: 15.0, fat_per_100g: 12.0, fiber_per_100g: 1.0, category: 'Platos Preparados' },
  { name: 'Pizza Margarita', kcal_per_100g: 260, protein_per_100g: 11.0, carbs_per_100g: 30.0, fat_per_100g: 10.0, fiber_per_100g: 2.0, category: 'Platos Preparados' },
  { name: 'Hamburguesa de Carne (sin pan)', kcal_per_100g: 280, protein_per_100g: 20.0, carbs_per_100g: 12.0, fat_per_100g: 17.0, fiber_per_100g: 0, category: 'Platos Preparados' },
  { name: 'Lasaña', kcal_per_100g: 150, protein_per_100g: 8.0, carbs_per_100g: 16.0, fat_per_100g: 6.0, fiber_per_100g: 1.0, category: 'Platos Preparados' },
  { name: 'Croquetas de Jamón', kcal_per_100g: 200, protein_per_100g: 10.0, carbs_per_100g: 18.0, fat_per_100g: 11.0, fiber_per_100g: 0.8, category: 'Platos Preparados' },
];

const EXERCISES = [

  // ─── Movilidad y Calentamiento ───
  { name: 'Movilidad Columna (Gato-Camello)', muscle_group: 'Columna', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Columna', category: 'Movilidad', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: [] },
  { name: 'Perro de Caza (Bird Dog)', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Rotación Core', category: 'Core', difficulty: 'Principiante', intensity: 'Baja', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Core', 'Glúteos', 'Hombros'] },
  { name: 'Estiramiento de Cadera', muscle_group: 'Cadera', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Cadera', category: 'Movilidad', difficulty: 'Principiante', intensity: 'Baja', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Psoas', 'Glúteos'] },
  { name: 'Estiramiento Dorsal y Pecho', muscle_group: 'Espalda/Pecho', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Tren Superior', category: 'Movilidad', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Bíceps', 'Hombros'] },
  { name: 'Movilidad Peso Muerto Unilateral', muscle_group: 'Isquios', equipment: 'Peso Corporal', movement_pattern: 'Bisagra de Cadera', category: 'Movilidad', difficulty: 'Principiante', intensity: 'Baja', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Glúteos', 'Columna'] },

  // ─── Accesorios con Banda Elástica ───
  { name: 'Elevaciones Laterales con Elástico', muscle_group: 'Hombros', equipment: 'Banda Elástica', movement_pattern: 'Elevación Lateral', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Trapecio', 'Manguito Rotador'] },
  { name: 'Aductores con Banda Elástica', muscle_group: 'Aductores', equipment: 'Banda Elástica', movement_pattern: 'Aducción de Cadera', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Ingle'] },
  { name: 'Abductores con Banda Elástica', muscle_group: 'Abductores', equipment: 'Banda Elástica', movement_pattern: 'Abducción de Cadera', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Glúteo Medio'] },

  // ─── Piernas — Isquios / Glúteos / Cuádriceps ───
  { name: 'Peso Muerto a Una Pierna', muscle_group: 'Isquios', equipment: 'Mancuernas', movement_pattern: 'Bisagra de Cadera', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Glúteos', 'Core', 'Gemelos'] },
  { name: 'Curl Femoral con Mancuerna', muscle_group: 'Isquios', equipment: 'Mancuernas', movement_pattern: 'Flexión de Rodilla', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Glúteos'] },
  { name: 'Sentadilla con Barra', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Barra', movement_pattern: 'Sentadilla', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Isquios', 'Core', 'Gemelos'] },
  { name: 'Sentadilla Goblet', muscle_group: 'Cuádriceps', equipment: 'Mancuernas', movement_pattern: 'Sentadilla', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Glúteos', 'Core', 'Isquios'] },
  { name: 'Zancadas con Mancuernas', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Sentadilla', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Isquios', 'Core'] },
  { name: 'Peso Muerto Rumano (RDL)', muscle_group: 'Isquios/Glúteos', equipment: 'Barra', movement_pattern: 'Bisagra de Cadera', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Erector Espinal', 'Trapecio'] },
  { name: 'Peso Muerto Unilateral', muscle_group: 'Isquios/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Bisagra de Cadera', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Core', 'Trapecio'] },
  { name: 'Puente de Glúteos', muscle_group: 'Glúteos', equipment: 'Peso Corporal', movement_pattern: 'Extensión de Cadera', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Isquios', 'Core'] },
  { name: 'Elevación de Talones Sentado', muscle_group: 'Gemelos', equipment: 'Mancuernas', movement_pattern: 'Flexión Plantar', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Sóleo'] },
  { name: 'Elevación de Talones de Pie', muscle_group: 'Gemelos', equipment: 'Barra', movement_pattern: 'Flexión Plantar', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Sóleo'] },
  { name: 'Sentadilla Isométrica (Pared)', muscle_group: 'Cuádriceps', equipment: 'Peso Corporal', movement_pattern: 'Sentadilla Isométrica', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Glúteos', 'Core'] },
  { name: 'Zancada Búlgara', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Sentadilla', category: 'Fuerza Principal', difficulty: 'Avanzado', intensity: 'Alta', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Isquios', 'Core'] },

  // ─── Pecho, Hombros, Tríceps ───
  { name: 'Empuje de Cadera (Hip Thrust)', muscle_group: 'Glúteos', equipment: 'Barra', movement_pattern: 'Extensión de Cadera', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Isquios', 'Core'] },
  { name: 'Press Plano con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Empuje Horizontal', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Tríceps', 'Hombros'] },
  { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Empuje Horizontal', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Hombros', 'Tríceps'] },
  { name: 'Press Banca con Barra', muscle_group: 'Pecho', equipment: 'Barra', movement_pattern: 'Empuje Horizontal', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Tríceps', 'Hombros'] },
  { name: 'Aperturas con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Apertura Horizontal', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Hombros anteriores'] },
  { name: 'Press Militar con Barra', muscle_group: 'Hombros', equipment: 'Barra', movement_pattern: 'Empuje Vertical', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Tríceps', 'Trapecio', 'Core'] },
  { name: 'Press Arnold', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Empuje Vertical', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Tríceps', 'Trapecio'] },
  { name: 'Elevaciones Laterales', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Elevación Lateral', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Trapecio Superior'] },
  { name: 'Elevaciones Frontales', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Elevación Frontal', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Pecho superior'] },
  { name: 'Fondos en Paralelas', muscle_group: 'Pecho/Tríceps', equipment: 'Peso Corporal', movement_pattern: 'Empuje Vertical', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Hombros'] },

  // ─── Espalda y Bíceps ───
  { name: 'Dominadas', muscle_group: 'Espalda', equipment: 'Peso Corporal', movement_pattern: 'Tirón Vertical', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Bíceps', 'Core'] },
  { name: 'Remo Invertido (Barra)', muscle_group: 'Espalda', equipment: 'Peso Corporal', movement_pattern: 'Tirón Horizontal', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Bíceps', 'Core'] },
  { name: 'Remo con Barra', muscle_group: 'Espalda', equipment: 'Barra', movement_pattern: 'Tirón Horizontal', category: 'Fuerza Principal', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Bíceps', 'Isquios', 'Core'] },
  { name: 'Remo con Mancuerna', muscle_group: 'Espalda', equipment: 'Mancuernas', movement_pattern: 'Tirón Horizontal', category: 'Fuerza Principal', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Bíceps', 'Core'] },
  { name: 'Face Pull con Banda Elástica', muscle_group: 'Hombros/Delts Posteriores', equipment: 'Banda Elástica', movement_pattern: 'Tirón Horizontal', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Manguito Rotador', 'Trapecio Medio'] },
  { name: 'Peso Muerto', muscle_group: 'Espalda/Isquios', equipment: 'Barra', movement_pattern: 'Bisagra de Cadera', category: 'Fuerza Principal', difficulty: 'Avanzado', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Glúteos', 'Core', 'Trapecio', 'Cuádriceps'] },
  { name: 'Curl de Bíceps con Barra', muscle_group: 'Bíceps', equipment: 'Barra', movement_pattern: 'Flexión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Braquial', 'Braquiorradial'] },
  { name: 'Curl de Bíceps con Mancuerna', muscle_group: 'Bíceps', equipment: 'Mancuernas', movement_pattern: 'Flexión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Braquial'] },
  { name: 'Curl Martillo', muscle_group: 'Bíceps', equipment: 'Mancuernas', movement_pattern: 'Flexión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Braquiorradial', 'Braquial'] },
  { name: 'Extensión de Tríceps con Mancuerna', muscle_group: 'Tríceps', equipment: 'Mancuernas', movement_pattern: 'Extensión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: [] },
  { name: 'Press Francés', muscle_group: 'Tríceps', equipment: 'Barra', movement_pattern: 'Extensión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Intermedio', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: [] },
  { name: 'Fondos en Banco', muscle_group: 'Tríceps', equipment: 'Banco', movement_pattern: 'Extensión de Codo', category: 'Fuerza Auxiliar', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Pecho', 'Hombros'] },

  // ─── Core ───
  { name: 'Plancha', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Extensión Core', category: 'Core', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Hombros', 'Glúteos'] },
  { name: 'Plancha Lateral', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Flexión Lateral Core', category: 'Core', difficulty: 'Principiante', intensity: 'Media', bilateral: false, explosive: false, unilateral: true, secondary_muscles: ['Oblicuos', 'Cuadrado Lumbar'] },
  { name: 'Elevación de Piernas', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Flexión Core', category: 'Core', difficulty: 'Intermedio', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Psoas', 'Recto Abdominal'] },
  { name: 'Giro Ruso (Russian Twist)', muscle_group: 'Core', equipment: 'Mancuernas', movement_pattern: 'Rotación Core', category: 'Core', difficulty: 'Principiante', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Oblicuos'] },
  { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Rueda', movement_pattern: 'Anti-Extensión Core', category: 'Core', difficulty: 'Avanzado', intensity: 'Alta', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Dorsales', 'Hombros'] },
  { name: 'Encogimiento (Crunch)', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Flexión Core', category: 'Core', difficulty: 'Principiante', intensity: 'Baja', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Recto Abdominal'] },
  { name: 'Pallof Press con Banda', muscle_group: 'Core', equipment: 'Banda Elástica', movement_pattern: 'Anti-Rotación Core', category: 'Core', difficulty: 'Intermedio', intensity: 'Media', bilateral: true, explosive: false, unilateral: false, secondary_muscles: ['Oblicuos', 'Hombros'] },

  // ─── Cardio / Explosivo / Funcional ───
  { name: 'Burpees', muscle_group: 'Cuerpo Completo', equipment: 'Peso Corporal', movement_pattern: 'Explosivo', category: 'Cardio/Funcional', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: true, unilateral: false, secondary_muscles: ['Pecho', 'Hombros', 'Core', 'Piernas'] },
  { name: 'Saltos de Cuerda', muscle_group: 'Gemelos/Cuerpo Completo', equipment: 'Cuerda', movement_pattern: 'Pliométrico', category: 'Cardio/Funcional', difficulty: 'Principiante', intensity: 'Alta', bilateral: true, explosive: true, unilateral: false, secondary_muscles: ['Hombros', 'Muñecas', 'Core'] },
  { name: 'Saltos al Cajón', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Cajón', movement_pattern: 'Pliométrico', category: 'Cardio/Funcional', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: true, unilateral: false, secondary_muscles: ['Gemelos', 'Core'] },
  { name: 'Kettlebell Swing', muscle_group: 'Glúteos/Isquios', equipment: 'Kettlebell', movement_pattern: 'Bisagra de Cadera', category: 'Cardio/Funcional', difficulty: 'Intermedio', intensity: 'Alta', bilateral: true, explosive: true, unilateral: false, secondary_muscles: ['Core', 'Espalda', 'Hombros'] },
];


const WORKOUT_PLANS = [
  {
    name: '2x Superior/Inferior',
    type: 'Fuerza', style: 'Upper/Lower',
    min_sessions: 2, max_sessions: 2,
    level: 'Principiante', estimated_duration_min: 50,
    goal: ['Hipertrofia', 'Fuerza Base'],
    days: [
      { day_number: 1, focus_area: 'Superior — Pecho, Hombros, Tríceps', exercise_ids: '22,26,24,28,40,37' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Isquios, Glúteos', exercise_ids: '11,13,14,21,9,51' },
    ]
  },
  {
    name: '3x Empuje/Tracción/Piernas',
    type: 'Fuerza', style: 'Push/Pull/Legs',
    min_sessions: 3, max_sessions: 3,
    level: 'Principiante-Intermedio', estimated_duration_min: 55,
    goal: ['Hipertrofia', 'Fuerza'],
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '24,23,26,28,41,30' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps, Delts Posteriores', exercise_ids: '31,33,32,35,37,38' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos, Gemelos', exercise_ids: '11,13,14,21,18,17' },
    ]
  },
  {
    name: '4x Superior/Inferior (2x cada uno)',
    type: 'Fuerza', style: 'Upper/Lower',
    min_sessions: 4, max_sessions: 4,
    level: 'Intermedio', estimated_duration_min: 60,
    goal: ['Hipertrofia', 'Fuerza'],
    days: [
      { day_number: 1, focus_area: 'Superior — Empuje (Pecho, Hombros, Tríceps)', exercise_ids: '22,23,26,28,41,30' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Glúteos, Gemelos', exercise_ids: '11,13,20,21,18,19' },
      { day_number: 3, focus_area: 'Superior — Tracción (Espalda, Bíceps, Delts)', exercise_ids: '31,32,33,35,38,39' },
      { day_number: 4, focus_area: 'Inferior — Isquios, Glúteos, Core', exercise_ids: '14,15,9,21,43,47' },
    ]
  },
  {
    name: '5x Push/Pull/Legs/Upper/Lower',
    type: 'Fuerza', style: 'PPL + Upper/Lower',
    min_sessions: 5, max_sessions: 5,
    level: 'Avanzado', estimated_duration_min: 65,
    goal: ['Hipertrofia', 'Fuerza Avanzada'],
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '23,22,26,28,30,41' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '31,33,32,34,37,38' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '11,13,14,15,20,9' },
      { day_number: 4, focus_area: 'Superior — Espalda, Hombros, Bíceps, Tríceps', exercise_ids: '22,27,28,35,39,40' },
      { day_number: 5, focus_area: 'Inferior — Isquios, Glúteos, Gemelos, Core', exercise_ids: '14,21,17,9,43,47' },
    ]
  },
  {
    name: '6x Push/Pull/Legs/Upper/Lower/Full Body',
    type: 'Fuerza', style: 'PPL + Upper/Lower + Full Body',
    min_sessions: 6, max_sessions: 6,
    level: 'Avanzado', estimated_duration_min: 70,
    goal: ['Hipertrofia Máxima', 'Fuerza Avanzada'],
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '22,23,26,28,30,41' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '31,33,32,35,37,38' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '11,13,14,21,20,9' },
      { day_number: 4, focus_area: 'Superior completo', exercise_ids: '22,26,28,31,33,37,40' },
      { day_number: 5, focus_area: 'Inferior completo', exercise_ids: '11,14,15,21,17,51' },
      { day_number: 6, focus_area: 'Cuerpo completo — ejercicios compuestos', exercise_ids: '22,23,31,33,11,9,36,47' },
    ]
  },
];


// ─── Rutinas de Alta Intensidad: WOD / METCON / HYBRID / HIIT ───
const HIIT_WOD_PLANS = [
  {
    name: 'WOD Clásico — AMRAP 20min',
    type: 'WOD', style: 'AMRAP',
    min_sessions: 1, max_sessions: 3,
    level: 'Intermedio', estimated_duration_min: 25,
    format: 'AMRAP 20 minutos: máximas rondas posibles',
    notes: 'Anota rondas completadas para superar la próxima sesión. Mantén ritmo sostenible.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body — Resistencia + Fuerza',
        exercise_ids: '50,31,11,43',
        prescribed_reps: '10,10,10,30s',
        scaling_beginner: 'Burpees → Sentadillas; Dominadas → Remo Invertido',
        scaling_advanced: 'Chaleco lastrado, aumenta a 15 reps'
      },
    ]
  },
  {
    name: 'WOD For Time — Chipper',
    type: 'WOD', style: 'For Time',
    min_sessions: 1, max_sessions: 3,
    level: 'Intermedio-Avanzado', estimated_duration_min: 30,
    format: 'For Time: completa todo el volumen lo más rápido posible',
    notes: 'Chipper: completas todas las reps de un ejercicio antes de pasar al siguiente. Registra tu tiempo.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body — Resistencia Total',
        exercise_ids: '51,50,31,36,50,51',
        prescribed_reps: '50,30,20,15,30,50',
        scaling_beginner: 'Reduce todo al 50%. Dominadas → Remo Invertido',
        scaling_advanced: 'Peso Muerto al 80-85% del 1RM'
      },
    ]
  },
  {
    name: 'WOD EMOM — Every Minute On the Minute',
    type: 'WOD', style: 'EMOM',
    min_sessions: 1, max_sessions: 3,
    level: 'Intermedio', estimated_duration_min: 20,
    format: 'EMOM 20 min: al inicio de cada minuto ejecuta las reps, el tiempo restante es descanso',
    notes: 'Min impares: KB Swing x15. Min pares: Dominadas x8. Si no terminas en 50s, reduce carga.',
    days: [
      {
        day_number: 1,
        focus_area: 'Alternado Piernas / Tren Superior',
        exercise_ids: '53,31',
        prescribed_reps: '15,8',
        scaling_beginner: 'KB Swing 12-16kg, Remo Invertido en vez de Dominadas',
        scaling_advanced: 'KB Swing 24-32kg, Dominadas con lastre'
      },
    ]
  },
  {
    name: 'METCON — Cindy',
    type: 'METCON', style: 'AMRAP',
    min_sessions: 1, max_sessions: 3,
    level: 'Intermedio', estimated_duration_min: 22,
    format: 'AMRAP 20 minutos: Remo Invertido 5 / Burpees 10 / Sentadillas 15',
    notes: 'WOD clásico de CrossFit. Objetivo >15 rondas avanzados, >10 intermedios. Ritmo sostenible.',
    days: [
      {
        day_number: 1,
        focus_area: 'Pull + Push + Squat',
        exercise_ids: '31,50,11',
        prescribed_reps: '5,10,15',
        scaling_beginner: 'Remo Invertido, Burpees sin salto, Sentadilla Goblet',
        scaling_advanced: 'Dominadas strict, HSPUs en vez de Burpees'
      },
    ]
  },
  {
    name: 'METCON — Kettlebell Complejo',
    type: 'METCON', style: 'Circuito por Tiempo',
    min_sessions: 1, max_sessions: 3,
    level: 'Intermedio', estimated_duration_min: 30,
    format: '5 rondas: KB Swing x20 / Remo Mancuerna x10 por lado / Cuerda x30 / Burpees x10. Descanso 60s.',
    notes: 'Usa el mismo peso durante todo el complejo. Registra tiempo total.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body — Kettlebell + Cardio',
        exercise_ids: '53,34,51,50',
        prescribed_reps: '20,10,30,10',
        scaling_beginner: 'KB con peso ligero, sin salto cajón',
        scaling_advanced: 'KB 24kg+, double-unders en cuerda'
      },
    ]
  },
  {
    name: 'METCON — Triplete Funcional',
    type: 'METCON', style: 'For Rounds',
    min_sessions: 1, max_sessions: 3,
    level: 'Avanzado', estimated_duration_min: 35,
    format: '4 rondas: Peso Muerto x10 / Dominadas x10 / Box Jump x10. Descanso 90s entre rondas.',
    notes: 'Peso moderado para mantener técnica bajo fatiga. Registra tiempo total.',
    days: [
      {
        day_number: 1,
        focus_area: 'Empuje + Pull + Bisagra',
        exercise_ids: '36,31,52',
        prescribed_reps: '10,10,10',
        scaling_beginner: 'RDL en vez de Peso Muerto, Remo Invertido, Step-up',
        scaling_advanced: 'Peso Muerto al 70% 1RM, Dominadas con lastre, Cajón 60cm+'
      },
    ]
  },
  {
    name: 'HYBRID — Fuerza + Cardio (Día 1 Lower)',
    type: 'HYBRID', style: 'Strength + Conditioning',
    min_sessions: 1, max_sessions: 4,
    level: 'Intermedio', estimated_duration_min: 70,
    format: 'Parte A Fuerza (35min): Sentadilla 4x6 / RDL 3x8 / Hip Thrust 3x10 → Parte B AMRAP 10min: KB Swing x20 / Cuerda x30 / Burpees x10',
    notes: 'Primero fuerza cuando el SN está fresco. Conditioning al final. Parte del bloque de 3-4 días híbrido.',
    days: [
      {
        day_number: 1,
        focus_area: 'Lower Strength + HIIT Cardio',
        exercise_ids: '11,14,21,53,51,50',
        prescribed_reps: '6,8,10,20,30,10',
        scaling_beginner: 'Sentadilla Goblet, reduce reps 30%',
        scaling_advanced: 'Sentadilla frontal, doble cuerda'
      },
    ]
  },
  {
    name: 'HYBRID — Fuerza + Cardio (Día 2 Upper)',
    type: 'HYBRID', style: 'Strength + Conditioning',
    min_sessions: 1, max_sessions: 4,
    level: 'Intermedio', estimated_duration_min: 70,
    format: 'Parte A Fuerza (35min): Press Banca 4x5 / Remo Barra 4x8 / Press Militar 3x6 / Dominadas 3x8 → Parte B EMOM 12min: Burpees x10 / Plancha 30s',
    notes: 'Superset Press + Remo para eficiencia. EMOM al final como finisher cardiovascular.',
    days: [
      {
        day_number: 1,
        focus_area: 'Upper Strength + EMOM Cardio',
        exercise_ids: '24,33,26,31,50,43',
        prescribed_reps: '5,8,6,8,10,30s',
        scaling_beginner: 'Press Mancuernas, Remo Invertido, Dominadas con banda',
        scaling_advanced: 'Superset Press+Remo, Burpees con salto alto'
      },
    ]
  },
  {
    name: 'HYBRID — Fuerza + Cardio (Día 3 Full Body)',
    type: 'HYBRID', style: 'Strength + Conditioning',
    min_sessions: 1, max_sessions: 4,
    level: 'Avanzado', estimated_duration_min: 70,
    format: 'Parte A Fuerza (35min): Peso Muerto 5x5 / Press Militar 3x5 / Sentadilla 3x5 → Parte B 3 rondas for time: KB Swing x15 / Box Jump x10 / Burpees x10',
    notes: 'Los 3 grandes movimientos al 80-85% del 1RM. Conditioning explosivo de potencia al final.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body Compound + Metcon Explosivo',
        exercise_ids: '36,26,11,53,52,50',
        prescribed_reps: '5,5,5,15,10,10',
        scaling_beginner: 'Reduce cargas al 60%, 2 rondas en Parte B',
        scaling_advanced: 'Peso Muerto al 85% 1RM, Parte B for time sin descanso'
      },
    ]
  },
  {
    name: 'HIIT — Tabata Clásico',
    type: 'HIIT', style: 'Tabata',
    min_sessions: 2, max_sessions: 4,
    level: 'Principiante-Intermedio', estimated_duration_min: 25,
    format: '4 bloques × (8 rondas de 20s trabajo / 10s descanso) = 4 min por ejercicio. Descanso 60s entre bloques.',
    notes: 'Intensidad 9/10 en los 20s de trabajo. Bloques: Burpees / KB Swing / Cuerda / Sentadillas.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body — 4 ejercicios Tabata',
        exercise_ids: '50,53,51,11',
        prescribed_reps: 'max_20s,max_20s,max_20s,max_20s',
        scaling_beginner: 'Burpees sin salto, KB ligero, saltar sin cuerda',
        scaling_advanced: 'Lastre en chaleco, double-unders'
      },
    ]
  },
  {
    name: 'HIIT — Intervalos 30/30',
    type: 'HIIT', style: 'Intervalos',
    min_sessions: 2, max_sessions: 4,
    level: 'Principiante', estimated_duration_min: 25,
    format: '6 ejercicios × 30s trabajo / 30s descanso × 4 rondas. Descanso 90s entre rondas.',
    notes: 'Más accesible que Tabata. Mantén buena técnica en cada intervalo. Ideal para empezar HIIT.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body HIIT — 6 ejercicios',
        exercise_ids: '50,11,53,43,52,51',
        prescribed_reps: '30s,30s,30s,30s,30s,30s',
        scaling_beginner: '3 rondas. Burpees sin salto. Step-up en vez de Box Jump.',
        scaling_advanced: '5 rondas. Descanso 20s. Lastre en sentadilla.'
      },
    ]
  },
  {
    name: 'HIIT — Pirámide de Potencia',
    type: 'HIIT', style: 'Pirámide',
    min_sessions: 2, max_sessions: 3,
    level: 'Avanzado', estimated_duration_min: 30,
    format: 'Pirámide 1-2-3-4-5-4-3-2-1: en cada escalón haz N reps de Box Jump + N Burpees + N KB Swing. Descanso 60s entre escalones.',
    notes: 'Máxima explosividad en cada rep. El pico son 5 reps de cada ejercicio. 9 escalones totales.',
    days: [
      {
        day_number: 1,
        focus_area: 'Explosividad — Pirámide Full Body',
        exercise_ids: '52,50,53',
        prescribed_reps: '1-2-3-4-5-4-3-2-1',
        scaling_beginner: 'Step-up en vez de Box Jump. Pirámide solo hasta 3.',
        scaling_advanced: 'Pirámide hasta 7. KB a una mano. Burpees con pull-up.'
      },
    ]
  },
  {
    name: 'HIIT — Cuerpo Completo Sin Equipamiento',
    type: 'HIIT', style: 'Circuito',
    min_sessions: 2, max_sessions: 5,
    level: 'Principiante-Intermedio', estimated_duration_min: 30,
    format: '8 ejercicios de peso corporal × 40s trabajo / 20s descanso × 3-4 rondas. Descanso 90s entre rondas.',
    notes: 'Sin equipamiento. Perfecto para casa, viaje o días sin acceso al gym.',
    days: [
      {
        day_number: 1,
        focus_area: 'Full Body — Cuerpo Libre',
        exercise_ids: '50,11,2,43,16,45,44,48',
        prescribed_reps: '40s,40s,40s,40s,40s,40s,40s,40s',
        scaling_beginner: '3 rondas. Burpees sin salto.',
        scaling_advanced: '4 rondas. Reduce descanso a 10s.'
      },
    ]
  },
];

function seedIfEmpty(db) {

  const foodCount = db.prepare('SELECT COUNT(*) as count FROM food_items').get().count;
  if (foodCount === 0) {
    const insertFood = db.prepare(
      'INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const mealSlots = [
      { name: 'Desayuno', slot_order: 1 },
      { name: 'Media Mañana', slot_order: 2 },
      { name: 'Comida', slot_order: 3 },
      { name: 'Merienda', slot_order: 4 },
      { name: 'Cena', slot_order: 5 },
    ];

    const transaction = db.transaction(() => {
      for (const food of FOOD_ITEMS) {
        insertFood.run(food.name, food.kcal_per_100g, food.protein_per_100g, food.carbs_per_100g, food.fat_per_100g, food.fiber_per_100g ?? 0, food.category ?? null);
      }
      for (const meal of mealSlots) {
        db.prepare('INSERT INTO meal_templates (name, slot_order) VALUES (?, ?)').run(meal.name, meal.slot_order);
      }
    });
    transaction();
    console.log(`Seeded ${FOOD_ITEMS.length} food items and ${mealSlots.length} meal templates`);
  }

  const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercise_library').get().count;
  if (exerciseCount === 0) {
    // INSERT incluye los nuevos campos enriquecidos; la tabla debe tenerlos (ver migration)
    const insertExercise = db.prepare(
      `INSERT INTO exercise_library
        (name, muscle_group, equipment, movement_pattern,
         category, difficulty, intensity, bilateral, explosive, unilateral, secondary_muscles)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const transaction = db.transaction(() => {
      for (const ex of EXERCISES) {
        insertExercise.run(
          ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern,
          ex.category ?? null,
          ex.difficulty ?? null,
          ex.intensity ?? null,
          ex.bilateral ? 1 : 0,
          ex.explosive ? 1 : 0,
          ex.unilateral ? 1 : 0,
          ex.secondary_muscles ? JSON.stringify(ex.secondary_muscles) : null
        );
      }
    });
    transaction();
    console.log(`Seeded ${EXERCISES.length} exercises`);
  }

  const plansCount = db.prepare('SELECT COUNT(*) as count FROM workout_plans').get().count;
  if (plansCount === 0) {
    // INSERT incluye los nuevos campos enriquecidos; la tabla debe tenerlos (ver migration)
    const insertPlan = db.prepare(
      `INSERT INTO workout_plans (name, min_sessions, max_sessions, type, style, level, estimated_duration_min, goal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertDay = db.prepare(
      'INSERT INTO workout_plan_days (plan_id, day_number, focus_area, exercise_ids, prescribed_reps, scaling_beginner, scaling_advanced) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const transaction = db.transaction(() => {
      for (const plan of [...WORKOUT_PLANS, ...HIIT_WOD_PLANS]) {
        const result = insertPlan.run(
          plan.name, plan.min_sessions, plan.max_sessions,
          plan.type ?? 'Fuerza',
          plan.style ?? null,
          plan.level ?? null,
          plan.estimated_duration_min ?? null,
          plan.goal ? JSON.stringify(plan.goal) : null
        );
        const planId = result.lastInsertRowid;
        for (const day of plan.days) {
          insertDay.run(planId, day.day_number, day.focus_area, day.exercise_ids, day.prescribed_reps ?? null, day.scaling_beginner ?? null, day.scaling_advanced ?? null);
        }
      }
    });
    transaction();
    console.log(`Seeded ${WORKOUT_PLANS.length} fuerza plans + ${HIIT_WOD_PLANS.length} HIIT/WOD/METCON/HYBRID plans`);
  }

  const compCount = db.prepare('SELECT COUNT(*) as count FROM meal_components').get().count;
  if (compCount === 0) {
    const insertComp = db.prepare('INSERT INTO meal_components (meal_template_id, food_item_id, default_grams, restday_grams, sort_order) VALUES (?, ?, ?, ?, ?)');
    const insertOption = db.prepare('INSERT INTO meal_options (meal_component_id, food_item_id) VALUES (?, ?)');
    const transaction = db.transaction(() => {
      for (const comp of MEAL_COMPONENTS) {
        const result = insertComp.run(comp.meal_template_id, comp.food_item_id, comp.default_grams, comp.restday_grams, comp.sort_order);
        const compId = result.lastInsertRowid;
        for (const optId of comp.options) {
          insertOption.run(compId, optId);
        }
      }
    });
    transaction();
    console.log(`Seeded ${MEAL_COMPONENTS.length} meal components with options`);
  }

  const dishCount = db.prepare('SELECT COUNT(*) as count FROM elaborated_dishes').get().count;
  if (dishCount === 0) {
    const insertDish = db.prepare('INSERT INTO elaborated_dishes (name, description, total_kcal, total_protein, total_carbs, total_fat, servings) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertIngredient = db.prepare('INSERT INTO dish_ingredients (dish_id, food_item_id, grams) VALUES (?, ?, ?)');
    const dishes = [
      { name: 'Batido Proteico de Frutas', description: 'Batido con leche vegetal, fruta, avena y proteína', ingredients: [{ food_id: 40, grams: 300 }, { food_id: 5, grams: 50 }, { food_id: 32, grams: 150 }, { food_id: 32, grams: 30 }] },
      { name: 'Bowl de Avena y Plátano', description: 'Avena con plátano, proteína y frutos secos', ingredients: [{ food_id: 5, grams: 60 }, { food_id: 41, grams: 150 }, { food_id: 32, grams: 30 }, { food_id: 35, grams: 15 }] },
      { name: 'Ensalada de Pollo y Quinoa', description: 'Pollo con quinoa, verduras y aceite de oliva', ingredients: [{ food_id: 20, grams: 150 }, { food_id: 14, grams: 80 }, { food_id: 45, grams: 200 }, { food_id: 33, grams: 10 }] },
      { name: 'Salmón con Verduras al Horno', description: 'Salmón con verduras variadas y aceite de oliva', ingredients: [{ food_id: 25, grams: 180 }, { food_id: 45, grams: 250 }, { food_id: 33, grams: 15 }] },
    ];
    const transaction = db.transaction(() => {
      for (const dish of dishes) {
        let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        for (const ing of dish.ingredients) {
          const food = FOOD_ITEMS[ing.food_id - 1];
          if (food) {
            totalKcal += (ing.grams / 100) * food.kcal_per_100g;
            totalProtein += (ing.grams / 100) * food.protein_per_100g;
            totalCarbs += (ing.grams / 100) * food.carbs_per_100g;
            totalFat += (ing.grams / 100) * food.fat_per_100g;
          }
        }
        const result = insertDish.run(dish.name, dish.description, Math.round(totalKcal), Math.round(totalProtein), Math.round(totalCarbs), Math.round(totalFat), 1);
        const dishId = result.lastInsertRowid;
        for (const ing of dish.ingredients) {
          insertIngredient.run(dishId, ing.food_id, ing.grams);
        }
      }
    });
    transaction();
    console.log(`Seeded ${dishes.length} example elaborated dishes`);
  }
}

function migrateSeedData(db) {
  const SEED_VERSION = 3;
  const current = db.prepare("SELECT value FROM settings WHERE key = 'seed_version'").get()?.value;
  if (current && parseInt(current) >= SEED_VERSION) return;

  let changes = 0;

  // Food items: upsert by name
  const findFood = db.prepare('SELECT id FROM food_items WHERE name = ?');
  const updateFood = db.prepare('UPDATE food_items SET fiber_per_100g = ?, category = ? WHERE id = ?');
  const insertFood = db.prepare(
    'INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const food of FOOD_ITEMS) {
    const existing = findFood.get(food.name);
    if (existing) {
      updateFood.run(food.fiber_per_100g ?? 0, food.category ?? null, existing.id);
    } else {
      insertFood.run(food.name, food.kcal_per_100g, food.protein_per_100g, food.carbs_per_100g, food.fat_per_100g, food.fiber_per_100g ?? 0, food.category ?? null);
      changes++;
    }
  }
  console.log(`Seed migrate: ${FOOD_ITEMS.length} foods processed (${changes} new)`);

  // Exercises: upsert by name, enrich existing
  const findEx = db.prepare('SELECT id FROM exercise_library WHERE name = ?');
  const updateEx = db.prepare(`UPDATE exercise_library SET
    muscle_group = ?, equipment = ?, movement_pattern = ?,
    category = ?, difficulty = ?, intensity = ?,
    bilateral = ?, explosive = ?, unilateral = ?,
    secondary_muscles = ? WHERE id = ?`);
  const insertEx = db.prepare(
    `INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern,
      category, difficulty, intensity, bilateral, explosive, unilateral, secondary_muscles)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  changes = 0;
  for (const ex of EXERCISES) {
    const existing = findEx.get(ex.name);
    if (existing) {
      updateEx.run(
        ex.muscle_group, ex.equipment, ex.movement_pattern,
        ex.category ?? null, ex.difficulty ?? null, ex.intensity ?? null,
        ex.bilateral ? 1 : 0, ex.explosive ? 1 : 0, ex.unilateral ? 1 : 0,
        ex.secondary_muscles ? JSON.stringify(ex.secondary_muscles) : null,
        existing.id
      );
    } else {
      insertEx.run(
        ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern,
        ex.category ?? null, ex.difficulty ?? null, ex.intensity ?? null,
        ex.bilateral ? 1 : 0, ex.explosive ? 1 : 0, ex.unilateral ? 1 : 0,
        ex.secondary_muscles ? JSON.stringify(ex.secondary_muscles) : null
      );
      changes++;
    }
  }
  console.log(`Seed migrate: ${EXERCISES.length} exercises processed (${changes} new)`);

  // Workout plans: insert new ones by name
  const findPlan = db.prepare('SELECT id FROM workout_plans WHERE name = ?');
  const insertPlan = db.prepare(
    `INSERT INTO workout_plans (name, min_sessions, max_sessions, type, style, level, estimated_duration_min, goal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertDay = db.prepare(
    'INSERT INTO workout_plan_days (plan_id, day_number, focus_area, exercise_ids, prescribed_reps, scaling_beginner, scaling_advanced) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  changes = 0;
  const txn = db.transaction(() => {
    for (const plan of [...WORKOUT_PLANS, ...HIIT_WOD_PLANS]) {
      if (findPlan.get(plan.name)) continue;
      const result = insertPlan.run(
        plan.name, plan.min_sessions, plan.max_sessions,
        plan.type ?? 'Fuerza', plan.style ?? null, plan.level ?? null,
        plan.estimated_duration_min ?? null,
        plan.goal ? JSON.stringify(plan.goal) : null
      );
      const planId = result.lastInsertRowid;
      for (const day of plan.days) {
        insertDay.run(planId, day.day_number, day.focus_area, day.exercise_ids,
          day.prescribed_reps ?? null, day.scaling_beginner ?? null, day.scaling_advanced ?? null);
      }
      changes++;
    }
  });
  txn();
  console.log(`Seed migrate: ${changes} new workout plans added`);

  // Template reset: re-seed meal_components, workout_plans, elaborated_dishes with new IDs
  resetSeedTemplates(db);

  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seed_version', '3')").run();
}

function resetSeedTemplates(db) {
  const TPL_VERSION = 2;
  const currentTpl = db.prepare("SELECT value FROM settings WHERE key = 'seed_template_version'").get()?.value;
  if (currentTpl && parseInt(currentTpl) >= TPL_VERSION) return;

  // 0. Save old data for remapping
  const oldMealComponents = db.prepare('SELECT id, meal_template_id, food_item_id, sort_order FROM meal_components').all();
  const oldDishes = db.prepare('SELECT id, name FROM elaborated_dishes').all();
  const oldExercises = db.prepare('SELECT id, name FROM exercise_library ORDER BY id').all();
  const oldIdByName = new Map(oldExercises.map(e => [e.name, e.id]));

  // 1. Delete in FK order (children first)
  db.exec('DELETE FROM daily_plan_entries');
  db.exec('DELETE FROM meal_options');
  db.exec('DELETE FROM meal_components');
  db.exec('DELETE FROM meal_dish_options');
  db.exec('DELETE FROM dish_ingredients');
  db.exec('DELETE FROM elaborated_dishes');
  db.exec('DELETE FROM training_sets');
  db.exec('DELETE FROM exercise_library');
  db.exec('DELETE FROM workout_plan_days');
  db.exec('DELETE FROM workout_plans');

  // 2. Insert new meal_components + meal_options
  const insertComp = db.prepare('INSERT INTO meal_components (meal_template_id, food_item_id, default_grams, restday_grams, sort_order) VALUES (?, ?, ?, ?, ?)');
  const insertOption = db.prepare('INSERT INTO meal_options (meal_component_id, food_item_id) VALUES (?, ?)');
  const newCompKeyToId = new Map();
  const txn1 = db.transaction(() => {
    for (const comp of MEAL_COMPONENTS) {
      const result = insertComp.run(comp.meal_template_id, comp.food_item_id, comp.default_grams, comp.restday_grams, comp.sort_order);
      const compId = result.lastInsertRowid;
      newCompKeyToId.set(`${comp.meal_template_id}|${comp.food_item_id}|${comp.sort_order}`, compId);
      for (const optId of comp.options) {
        insertOption.run(compId, optId);
      }
    }
  });
  txn1();
  console.log(`Template reset: ${MEAL_COMPONENTS.length} meal components re-seeded`);

  // 3. Insert new exercise_library
  const insertEx = db.prepare(
    `INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern,
      category, difficulty, intensity, bilateral, explosive, unilateral, secondary_muscles)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const exTxn = db.transaction(() => {
    for (const ex of EXERCISES) {
      insertEx.run(
        ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern,
        ex.category ?? null, ex.difficulty ?? null, ex.intensity ?? null,
        ex.bilateral ? 1 : 0, ex.explosive ? 1 : 0, ex.unilateral ? 1 : 0,
        ex.secondary_muscles ? JSON.stringify(ex.secondary_muscles) : null
      );
    }
  });
  exTxn();
  console.log(`Template reset: ${EXERCISES.length} exercises re-seeded`);

  // 4. Insert new workout_plans + workout_plan_days
  const insertPlan = db.prepare(
    `INSERT INTO workout_plans (name, min_sessions, max_sessions, type, style, level, estimated_duration_min, goal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertDay = db.prepare(
    'INSERT INTO workout_plan_days (plan_id, day_number, focus_area, exercise_ids, prescribed_reps, scaling_beginner, scaling_advanced) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const txn2 = db.transaction(() => {
    for (const plan of [...WORKOUT_PLANS, ...HIIT_WOD_PLANS]) {
      const result = insertPlan.run(
        plan.name, plan.min_sessions, plan.max_sessions,
        plan.type ?? 'Fuerza', plan.style ?? null, plan.level ?? null,
        plan.estimated_duration_min ?? null,
        plan.goal ? JSON.stringify(plan.goal) : null
      );
      const planId = result.lastInsertRowid;
      for (const day of plan.days) {
        insertDay.run(planId, day.day_number, day.focus_area, day.exercise_ids,
          day.prescribed_reps ?? null, day.scaling_beginner ?? null, day.scaling_advanced ?? null);
      }
    }
  });
  txn2();
  console.log(`Template reset: ${WORKOUT_PLANS.length + HIIT_WOD_PLANS.length} workout plans re-seeded`);

  // 5. Insert new elaborated_dishes + dish_ingredients
  const insertDish = db.prepare('INSERT INTO elaborated_dishes (name, description, total_kcal, total_protein, total_carbs, total_fat, servings) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertIngredient = db.prepare('INSERT INTO dish_ingredients (dish_id, food_item_id, grams) VALUES (?, ?, ?)');
  const newDishNameToId = new Map();
  const dishes = [
    { name: 'Batido Proteico de Frutas', description: 'Leche desnatada, plátano, avena y whey', ingredients: [{ food_id: 98, grams: 300 }, { food_id: 102, grams: 150 }, { food_id: 9, grams: 50 }, { food_id: 60, grams: 30 }] },
    { name: 'Bowl de Avena y Plátano', description: 'Avena con plátano, whey y almendras', ingredients: [{ food_id: 9, grams: 60 }, { food_id: 102, grams: 150 }, { food_id: 60, grams: 30 }, { food_id: 71, grams: 15 }] },
    { name: 'Ensalada de Pollo y Quinoa', description: 'Pechuga con quinoa, espinacas y aceite de oliva', ingredients: [{ food_id: 28, grams: 150 }, { food_id: 20, grams: 80 }, { food_id: 127, grams: 200 }, { food_id: 68, grams: 10 }] },
    { name: 'Salmón con Verduras al Horno', description: 'Salmón con espinacas y aceite de oliva', ingredients: [{ food_id: 43, grams: 180 }, { food_id: 127, grams: 250 }, { food_id: 68, grams: 15 }] }
  ];
  const txn3 = db.transaction(() => {
    for (const dish of dishes) {
      let totalKcal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      for (const ing of dish.ingredients) {
        const food = FOOD_ITEMS[ing.food_id - 1];
        if (food) {
          totalKcal += (ing.grams / 100) * food.kcal_per_100g;
          totalProtein += (ing.grams / 100) * food.protein_per_100g;
          totalCarbs += (ing.grams / 100) * food.carbs_per_100g;
          totalFat += (ing.grams / 100) * food.fat_per_100g;
        }
      }
      const result = insertDish.run(dish.name, dish.description, Math.round(totalKcal), Math.round(totalProtein), Math.round(totalCarbs), Math.round(totalFat), 1);
      const dishId = result.lastInsertRowid;
      newDishNameToId.set(dish.name, dishId);
      for (const ing of dish.ingredients) {
        insertIngredient.run(dishId, ing.food_id, ing.grams);
      }
    }
  });
  txn3();
  console.log(`Template reset: ${dishes.length} elaborated dishes re-seeded`);

  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seed_template_version', '2')").run();
}

function seedStats() {
  const db = require('./database').getHealthsyncDb();
  const tables = ['heart_rate','steps','body_mass','workouts','sleep','hrv'];
  const stats = {};
  for (const table of tables) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      stats[table] = row.count;
    } catch {
      stats[table] = 0;
    }
  }
  console.table(stats);
  return stats;
}

const inRange = (start, end, exclude = []) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    if (!exclude.includes(i)) result.push(i);
  }
  return result;
};

const MEAL_COMPONENTS = [
  // Desayuno (1) — Carbs + Proteína + Lácteo + Grasa + Fruta
  { meal_template_id: 1, food_item_id: 1, default_grams: 80, restday_grams: 60, sort_order: 1, options: inRange(1, 27, [1]) },
  { meal_template_id: 1, food_item_id: 54, default_grams: 120, restday_grams: 100, sort_order: 2, options: inRange(28, 61, [54]) },
  { meal_template_id: 1, food_item_id: 86, default_grams: 0, restday_grams: 0, sort_order: 3, options: inRange(85, 99, [86]) },
  { meal_template_id: 1, food_item_id: 70, default_grams: 30, restday_grams: 30, sort_order: 4, options: inRange(68, 84, [70]) },
  { meal_template_id: 1, food_item_id: 100, default_grams: 0, restday_grams: 0, sort_order: 5, options: inRange(100, 126, [100]) },
  // Media Mañana (2) — Snack + Frutos secos + Fruta + Bebida
  { meal_template_id: 2, food_item_id: 9, default_grams: 30, restday_grams: 30, sort_order: 1, options: inRange(1, 27, [9]) },
  { meal_template_id: 2, food_item_id: 71, default_grams: 20, restday_grams: 20, sort_order: 2, options: [...inRange(71, 76), ...inRange(79, 83)] },
  { meal_template_id: 2, food_item_id: 102, default_grams: 100, restday_grams: 100, sort_order: 3, options: inRange(100, 126, [102]) },
  { meal_template_id: 2, food_item_id: 159, default_grams: 200, restday_grams: 200, sort_order: 4, options: inRange(159, 167, [159]) },
  // Comida (3) — Carbs + Proteína + Verdura + Grasa + Salsas
  { meal_template_id: 3, food_item_id: 11, default_grams: 80, restday_grams: 80, sort_order: 1, options: [...inRange(11, 20, [11]), ...inRange(24, 27), ...inRange(62, 67), 192, 193] },
  { meal_template_id: 3, food_item_id: 28, default_grams: 150, restday_grams: 150, sort_order: 2, options: inRange(28, 61, [28]) },
  { meal_template_id: 3, food_item_id: 127, default_grams: 150, restday_grams: 200, sort_order: 3, options: inRange(127, 158, [127]) },
  { meal_template_id: 3, food_item_id: 68, default_grams: 10, restday_grams: 10, sort_order: 4, options: [69, 70, 77, 78, 84] },
  { meal_template_id: 3, food_item_id: 168, default_grams: 0, restday_grams: 0, sort_order: 5, options: inRange(168, 179, [168]) },
  // Merienda (4) — Carbs + Lácteo + Frutos secos + Fruta + Dulce
  { meal_template_id: 4, food_item_id: 2, default_grams: 50, restday_grams: 30, sort_order: 1, options: inRange(1, 27, [2]) },
  { meal_template_id: 4, food_item_id: 86, default_grams: 150, restday_grams: 200, sort_order: 2, options: inRange(85, 99, [86]) },
  { meal_template_id: 4, food_item_id: 71, default_grams: 20, restday_grams: 20, sort_order: 3, options: [...inRange(71, 76), ...inRange(79, 83)] },
  { meal_template_id: 4, food_item_id: 100, default_grams: 100, restday_grams: 100, sort_order: 4, options: inRange(100, 126, [100]) },
  { meal_template_id: 4, food_item_id: 185, default_grams: 0, restday_grams: 0, sort_order: 5, options: inRange(185, 191, [185]) },
  // Cena (5) — Carbs + Proteína + Verdura + Grasa + Salsas
  { meal_template_id: 5, food_item_id: 16, default_grams: 150, restday_grams: 100, sort_order: 1, options: [...inRange(11, 20, [16]), ...inRange(24, 27), ...inRange(62, 67), 192, 193, 194, 195, 197, 198] },
  { meal_template_id: 5, food_item_id: 43, default_grams: 150, restday_grams: 150, sort_order: 2, options: inRange(28, 61, [43]) },
  { meal_template_id: 5, food_item_id: 127, default_grams: 150, restday_grams: 200, sort_order: 3, options: inRange(127, 158, [127]) },
  { meal_template_id: 5, food_item_id: 68, default_grams: 10, restday_grams: 10, sort_order: 4, options: [69, 70, 77, 78, 84] },
  { meal_template_id: 5, food_item_id: 168, default_grams: 0, restday_grams: 0, sort_order: 5, options: inRange(168, 179, [168]) },
];

module.exports = { seedIfEmpty, migrateSeedData, seedStats, EXERCISES, FOOD_ITEMS, HIIT_WOD_PLANS };
