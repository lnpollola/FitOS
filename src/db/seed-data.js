const FOOD_ITEMS = [
  // Breads & grains (carbs)
  { name: 'Pan Blanco', kcal_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2 },
  { name: 'Pan Integral', kcal_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4 },
  { name: 'Tortas de Arroz', kcal_per_100g: 380, protein_per_100g: 8, carbs_per_100g: 80, fat_per_100g: 2.5 },
  { name: 'Tortas de Maíz', kcal_per_100g: 375, protein_per_100g: 7, carbs_per_100g: 80, fat_per_100g: 3 },
  { name: 'Harina de Avena', kcal_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 6.9 },
  { name: 'Arroz Blanco', kcal_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3 },
  { name: 'Pasta Integral', kcal_per_100g: 350, protein_per_100g: 14, carbs_per_100g: 65, fat_per_100g: 2.5 },
  { name: 'Pasta de Colores', kcal_per_100g: 350, protein_per_100g: 12, carbs_per_100g: 70, fat_per_100g: 1.5 },
  { name: 'Patata', kcal_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1 },
  { name: 'Boniato', kcal_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20, fat_per_100g: 0.1 },
  { name: 'Ñoquis', kcal_per_100g: 130, protein_per_100g: 3, carbs_per_100g: 28, fat_per_100g: 0.5 },
  { name: 'Cuscús', kcal_per_100g: 112, protein_per_100g: 3.8, carbs_per_100g: 23, fat_per_100g: 0.2 },
  { name: 'Quinoa', kcal_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21, fat_per_100g: 1.9 },
  { name: 'Legumbre Cocida', kcal_per_100g: 116, protein_per_100g: 8, carbs_per_100g: 20, fat_per_100g: 0.4 },
  { name: 'Corn Flakes', kcal_per_100g: 357, protein_per_100g: 7, carbs_per_100g: 84, fat_per_100g: 0.4 },
  { name: 'Crema de Arroz', kcal_per_100g: 360, protein_per_100g: 7, carbs_per_100g: 80, fat_per_100g: 0.5 },
  // Proteins
  { name: 'Pechuga de Pollo', kcal_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6 },
  { name: 'Pechuga de Pavo', kcal_per_100g: 135, protein_per_100g: 29, carbs_per_100g: 0, fat_per_100g: 1.5 },
  { name: 'Fiambre de Pavo', kcal_per_100g: 100, protein_per_100g: 20, carbs_per_100g: 1, fat_per_100g: 2 },
  { name: 'Jamón Cocido', kcal_per_100g: 145, protein_per_100g: 20, carbs_per_100g: 1, fat_per_100g: 7 },
  { name: 'Jamón Serrano', kcal_per_100g: 240, protein_per_100g: 30, carbs_per_100g: 0.5, fat_per_100g: 13 },
  { name: 'Lomo Embuchado', kcal_per_100g: 200, protein_per_100g: 30, carbs_per_100g: 0.5, fat_per_100g: 9 },
  { name: 'Pescado Azul (Salmón)', kcal_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13 },
  { name: 'Pescado Blanco (Merluza)', kcal_per_100g: 85, protein_per_100g: 18, carbs_per_100g: 0, fat_per_100g: 0.7 },
  { name: 'Calamar / Sepia', kcal_per_100g: 92, protein_per_100g: 17, carbs_per_100g: 0, fat_per_100g: 1.5 },
  { name: 'Carne Roja Magra', kcal_per_100g: 180, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 8 },
  { name: 'Huevos', kcal_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11 },
  { name: 'Claras de Huevo', kcal_per_100g: 52, protein_per_100g: 11, carbs_per_100g: 0.7, fat_per_100g: 0.2 },
  { name: 'Proteína en Polvo', kcal_per_100g: 380, protein_per_100g: 80, carbs_per_100g: 6, fat_per_100g: 5 },
  // Fats
  { name: 'Aceite de Oliva', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'Aguacate', kcal_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 8.5, fat_per_100g: 15 },
  { name: 'Frutos Secos Variados', kcal_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 20, fat_per_100g: 54 },
  { name: 'Crema de Cacahuete sin Azúcar', kcal_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50 },
  { name: 'Queso Semi', kcal_per_100g: 350, protein_per_100g: 25, carbs_per_100g: 1, fat_per_100g: 28 },
  { name: 'Mozzarella', kcal_per_100g: 280, protein_per_100g: 22, carbs_per_100g: 2, fat_per_100g: 21 },
  // Fruits
  { name: 'Fruta (Manzana)', kcal_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2 },
  { name: 'Plátano', kcal_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3 },
  { name: 'Naranja', kcal_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1 },
  // Vegetables
  { name: 'Verduras Variadas', kcal_per_100g: 25, protein_per_100g: 2, carbs_per_100g: 4, fat_per_100g: 0.3 },
  // Drinks & extras
  { name: 'Bebida Vegetal sin Azúcar', kcal_per_100g: 30, protein_per_100g: 1, carbs_per_100g: 3, fat_per_100g: 1 },
  { name: 'Yogur Natural Desnatado', kcal_per_100g: 55, protein_per_100g: 5, carbs_per_100g: 7, fat_per_100g: 0.2 },
  { name: 'Chocolate Negro 85%', kcal_per_100g: 598, protein_per_100g: 8, carbs_per_100g: 16, fat_per_100g: 55 },
  { name: 'Te Verde', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
  { name: 'Café', kcal_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
  // Extended: Breads & grains
  { name: 'Pan de Molde Integral', kcal_per_100g: 250, protein_per_100g: 11, carbs_per_100g: 42, fat_per_100g: 3.5 },
  { name: 'Pan de Centeno', kcal_per_100g: 240, protein_per_100g: 9, carbs_per_100g: 45, fat_per_100g: 3.2 },
  { name: 'Pan de Espelta', kcal_per_100g: 255, protein_per_100g: 12, carbs_per_100g: 43, fat_per_100g: 3.0 },
  { name: 'Arroz Integral', kcal_per_100g: 123, protein_per_100g: 2.7, carbs_per_100g: 26, fat_per_100g: 1.0 },
  { name: 'Pasta Blanca', kcal_per_100g: 355, protein_per_100g: 11, carbs_per_100g: 72, fat_per_100g: 1.3 },
  { name: 'Cuscús Integral', kcal_per_100g: 108, protein_per_100g: 4.0, carbs_per_100g: 21, fat_per_100g: 0.8 },
  { name: 'Muesli', kcal_per_100g: 360, protein_per_100g: 10, carbs_per_100g: 67, fat_per_100g: 6.0 },
  { name: 'Galletas Digestive', kcal_per_100g: 470, protein_per_100g: 7, carbs_per_100g: 65, fat_per_100g: 20 },
  { name: 'Cebada Perlada', kcal_per_100g: 123, protein_per_100g: 3.6, carbs_per_100g: 28, fat_per_100g: 0.4 },
  { name: 'Centeno en Grano', kcal_per_100g: 338, protein_per_100g: 10, carbs_per_100g: 76, fat_per_100g: 1.6 },
  { name: 'Maíz Dulce', kcal_per_100g: 86, protein_per_100g: 3.2, carbs_per_100g: 19, fat_per_100g: 1.2 },
  { name: 'Pan de Hamburguesa', kcal_per_100g: 280, protein_per_100g: 9, carbs_per_100g: 48, fat_per_100g: 5.5 },
  // Extended: Proteins (additional)
  { name: 'Atún al Natural', kcal_per_100g: 116, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 0.8 },
  { name: 'Atún en Aceite', kcal_per_100g: 200, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 11 },
  { name: 'Sardinas', kcal_per_100g: 210, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 12 },
  { name: 'Caballa', kcal_per_100g: 205, protein_per_100g: 19, carbs_per_100g: 0, fat_per_100g: 14 },
  { name: 'Bacalao Fresco', kcal_per_100g: 82, protein_per_100g: 18, carbs_per_100g: 0, fat_per_100g: 0.7 },
  { name: 'Langostinos', kcal_per_100g: 95, protein_per_100g: 20, carbs_per_100g: 0.5, fat_per_100g: 0.9 },
  { name: 'Gambas', kcal_per_100g: 85, protein_per_100g: 18, carbs_per_100g: 0, fat_per_100g: 0.6 },
  { name: 'Mejillones', kcal_per_100g: 86, protein_per_100g: 12, carbs_per_100g: 4, fat_per_100g: 2.2 },
  { name: 'Ternera Picada Magra', kcal_per_100g: 175, protein_per_100g: 25, carbs_per_100g: 0, fat_per_100g: 8 },
  { name: 'Lomo de Cerdo Magro', kcal_per_100g: 165, protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 6 },
  { name: 'Conejo', kcal_per_100g: 175, protein_per_100g: 33, carbs_per_100g: 0, fat_per_100g: 4.5 },
  { name: 'Muslo de Pollo', kcal_per_100g: 185, protein_per_100g: 24, carbs_per_100g: 0, fat_per_100g: 9 },
  { name: 'Alitas de Pollo', kcal_per_100g: 220, protein_per_100g: 22, carbs_per_100g: 0, fat_per_100g: 14 },
  { name: 'Tofu Firme', kcal_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 2, fat_per_100g: 4.8 },
  { name: 'Tempeh', kcal_per_100g: 193, protein_per_100g: 19, carbs_per_100g: 9, fat_per_100g: 11 },
  { name: 'Seitán', kcal_per_100g: 130, protein_per_100g: 25, carbs_per_100g: 4, fat_per_100g: 2 },
  { name: 'Pavo Molido', kcal_per_100g: 140, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 3 },
  { name: 'Solomillo de Cerdo', kcal_per_100g: 155, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 5 },
  { name: 'Chuletón de Ternera', kcal_per_100g: 250, protein_per_100g: 22, carbs_per_100g: 0, fat_per_100g: 18 },
  // Extended: Fats & nuts
  { name: 'Aceite de Coco', kcal_per_100g: 862, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'Aceite de Oliva Virgen Extra', kcal_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100 },
  { name: 'Almendras', kcal_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50 },
  { name: 'Nueces', kcal_per_100g: 654, protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65 },
  { name: 'Anacardos', kcal_per_100g: 553, protein_per_100g: 18, carbs_per_100g: 30, fat_per_100g: 44 },
  { name: 'Pistachos', kcal_per_100g: 560, protein_per_100g: 20, carbs_per_100g: 28, fat_per_100g: 45 },
  { name: 'Avellanas', kcal_per_100g: 628, protein_per_100g: 15, carbs_per_100g: 17, fat_per_100g: 61 },
  { name: 'Semillas de Chía', kcal_per_100g: 486, protein_per_100g: 17, carbs_per_100g: 42, fat_per_100g: 31 },
  { name: 'Semillas de Lino', kcal_per_100g: 534, protein_per_100g: 18, carbs_per_100g: 29, fat_per_100g: 42 },
  { name: 'Semillas de Sésamo', kcal_per_100g: 573, protein_per_100g: 18, carbs_per_100g: 23, fat_per_100g: 50 },
  { name: 'Pipas de Calabaza', kcal_per_100g: 559, protein_per_100g: 30, carbs_per_100g: 11, fat_per_100g: 49 },
  { name: 'Queso Fresco', kcal_per_100g: 155, protein_per_100g: 18, carbs_per_100g: 2, fat_per_100g: 8 },
  { name: 'Queso Curado', kcal_per_100g: 450, protein_per_100g: 30, carbs_per_100g: 1, fat_per_100g: 36 },
  { name: 'Queso Parmesano', kcal_per_100g: 431, protein_per_100g: 38, carbs_per_100g: 4, fat_per_100g: 29 },
  { name: 'Nata Líquida', kcal_per_100g: 180, protein_per_100g: 2, carbs_per_100g: 4, fat_per_100g: 18 },
  { name: 'Mantequilla', kcal_per_100g: 717, protein_per_100g: 0.5, carbs_per_100g: 0, fat_per_100g: 81 },
  { name: 'Queso Cottage', kcal_per_100g: 98, protein_per_100g: 11, carbs_per_100g: 3.4, fat_per_100g: 4.3 },
  { name: 'Coco Rallado', kcal_per_100g: 660, protein_per_100g: 7, carbs_per_100g: 24, fat_per_100g: 65 },
  // Extended: Fruits
  { name: 'Pera', kcal_per_100g: 57, protein_per_100g: 0.4, carbs_per_100g: 15, fat_per_100g: 0.1 },
  { name: 'Uvas', kcal_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18, fat_per_100g: 0.2 },
  { name: 'Fresas', kcal_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 8, fat_per_100g: 0.3 },
  { name: 'Arándanos', kcal_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14, fat_per_100g: 0.3 },
  { name: 'Frambuesas', kcal_per_100g: 52, protein_per_100g: 1.2, carbs_per_100g: 12, fat_per_100g: 0.7 },
  { name: 'Moras', kcal_per_100g: 43, protein_per_100g: 1.4, carbs_per_100g: 10, fat_per_100g: 0.5 },
  { name: 'Kiwi', kcal_per_100g: 61, protein_per_100g: 1.1, carbs_per_100g: 15, fat_per_100g: 0.5 },
  { name: 'Mango', kcal_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15, fat_per_100g: 0.4 },
  { name: 'Piña', kcal_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13, fat_per_100g: 0.1 },
  { name: 'Melón', kcal_per_100g: 34, protein_per_100g: 0.8, carbs_per_100g: 8, fat_per_100g: 0.2 },
  { name: 'Sandía', kcal_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 7.5, fat_per_100g: 0.2 },
  { name: 'Cerezas', kcal_per_100g: 50, protein_per_100g: 1.0, carbs_per_100g: 12, fat_per_100g: 0.3 },
  { name: 'Melocotón', kcal_per_100g: 39, protein_per_100g: 0.9, carbs_per_100g: 9.5, fat_per_100g: 0.3 },
  { name: 'Ciruela', kcal_per_100g: 46, protein_per_100g: 0.7, carbs_per_100g: 11, fat_per_100g: 0.3 },
  { name: 'Albaricoque', kcal_per_100g: 48, protein_per_100g: 1.4, carbs_per_100g: 11, fat_per_100g: 0.4 },
  { name: 'Pomelo', kcal_per_100g: 42, protein_per_100g: 0.8, carbs_per_100g: 11, fat_per_100g: 0.1 },
  { name: 'Limón', kcal_per_100g: 29, protein_per_100g: 1.1, carbs_per_100g: 9, fat_per_100g: 0.3 },
  { name: 'Lima', kcal_per_100g: 30, protein_per_100g: 0.7, carbs_per_100g: 11, fat_per_100g: 0.2 },
  { name: 'Higos Frescos', kcal_per_100g: 74, protein_per_100g: 0.8, carbs_per_100g: 19, fat_per_100g: 0.3 },
  { name: 'Dátiles', kcal_per_100g: 282, protein_per_100g: 2.5, carbs_per_100g: 75, fat_per_100g: 0.4 },
  { name: 'Pasas', kcal_per_100g: 299, protein_per_100g: 3.1, carbs_per_100g: 79, fat_per_100g: 0.5 },
  { name: 'Papaya', kcal_per_100g: 43, protein_per_100g: 0.5, carbs_per_100g: 11, fat_per_100g: 0.3 },
  { name: 'Granada', kcal_per_100g: 83, protein_per_100g: 1.7, carbs_per_100g: 19, fat_per_100g: 1.2 },
  // Extended: Vegetables
  { name: 'Brócoli', kcal_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4 },
  { name: 'Espinacas', kcal_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4 },
  { name: 'Lechuga', kcal_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2 },
  { name: 'Tomate', kcal_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2 },
  { name: 'Pepino', kcal_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1 },
  { name: 'Pimiento Rojo', kcal_per_100g: 31, protein_per_100g: 1.0, carbs_per_100g: 6, fat_per_100g: 0.3 },
  { name: 'Pimiento Verde', kcal_per_100g: 20, protein_per_100g: 0.9, carbs_per_100g: 4.6, fat_per_100g: 0.2 },
  { name: 'Cebolla', kcal_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9, fat_per_100g: 0.1 },
  { name: 'Ajo', kcal_per_100g: 149, protein_per_100g: 6.4, carbs_per_100g: 33, fat_per_100g: 0.5 },
  { name: 'Zanahoria', kcal_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2 },
  { name: 'Calabacín', kcal_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3 },
  { name: 'Berenjena', kcal_per_100g: 25, protein_per_100g: 1.0, carbs_per_100g: 5.9, fat_per_100g: 0.2 },
  { name: 'Coliflor', kcal_per_100g: 25, protein_per_100g: 1.9, carbs_per_100g: 5, fat_per_100g: 0.3 },
  { name: 'Repollo', kcal_per_100g: 25, protein_per_100g: 1.3, carbs_per_100g: 5.8, fat_per_100g: 0.1 },
  { name: 'Coles de Bruselas', kcal_per_100g: 43, protein_per_100g: 3.4, carbs_per_100g: 9, fat_per_100g: 0.3 },
  { name: 'Espárragos', kcal_per_100g: 20, protein_per_100g: 2.2, carbs_per_100g: 3.9, fat_per_100g: 0.1 },
  { name: 'Judías Verdes', kcal_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7, fat_per_100g: 0.2 },
  { name: 'Guisantes', kcal_per_100g: 81, protein_per_100g: 5.4, carbs_per_100g: 14, fat_per_100g: 0.4 },
  { name: 'Remolacha', kcal_per_100g: 43, protein_per_100g: 1.6, carbs_per_100g: 10, fat_per_100g: 0.2 },
  { name: 'Apio', kcal_per_100g: 16, protein_per_100g: 0.7, carbs_per_100g: 3, fat_per_100g: 0.2 },
  { name: 'Champiñones', kcal_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3 },
  { name: 'Setas Variadas', kcal_per_100g: 30, protein_per_100g: 3.0, carbs_per_100g: 4, fat_per_100g: 0.5 },
  { name: 'Puerro', kcal_per_100g: 61, protein_per_100g: 1.5, carbs_per_100g: 14, fat_per_100g: 0.3 },
  { name: 'Alcachofa', kcal_per_100g: 53, protein_per_100g: 3.3, carbs_per_100g: 11, fat_per_100g: 0.2 },
  { name: 'Rúcula', kcal_per_100g: 25, protein_per_100g: 2.6, carbs_per_100g: 3.7, fat_per_100g: 0.7 },
  { name: 'Canónigos', kcal_per_100g: 20, protein_per_100g: 2.0, carbs_per_100g: 3, fat_per_100g: 0.4 },
  { name: 'Acelgas', kcal_per_100g: 19, protein_per_100g: 1.8, carbs_per_100g: 3.7, fat_per_100g: 0.2 },
  // Extended: Legumes
  { name: 'Lentejas Cocidas', kcal_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4 },
  { name: 'Garbanzos Cocidos', kcal_per_100g: 139, protein_per_100g: 8.9, carbs_per_100g: 23, fat_per_100g: 2.6 },
  { name: 'Alubias Cocidas', kcal_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 23, fat_per_100g: 0.5 },
  { name: 'Habas Cocidas', kcal_per_100g: 88, protein_per_100g: 7.6, carbs_per_100g: 14, fat_per_100g: 0.4 },
  { name: 'Soja Cocida', kcal_per_100g: 173, protein_per_100g: 16, carbs_per_100g: 9.9, fat_per_100g: 9 },
  // Extended: Dairy & drinks
  { name: 'Leche Entera', kcal_per_100g: 61, protein_per_100g: 3.2, carbs_per_100g: 4.7, fat_per_100g: 3.3 },
  { name: 'Leche Semidesnatada', kcal_per_100g: 46, protein_per_100g: 3.1, carbs_per_100g: 4.7, fat_per_100g: 1.6 },
  { name: 'Yogur Griego Natural', kcal_per_100g: 97, protein_per_100g: 9, carbs_per_100g: 4, fat_per_100g: 5 },
  { name: 'Queso Batido 0%', kcal_per_100g: 60, protein_per_100g: 10, carbs_per_100g: 4.5, fat_per_100g: 0.2 },
  { name: 'Kéfir', kcal_per_100g: 64, protein_per_100g: 3.3, carbs_per_100g: 5, fat_per_100g: 3.5 },
  { name: 'Horchata Natural', kcal_per_100g: 55, protein_per_100g: 0.5, carbs_per_100g: 8, fat_per_100g: 2.5 },
  { name: 'Zumo de Naranja Natural', kcal_per_100g: 45, protein_per_100g: 0.7, carbs_per_100g: 10, fat_per_100g: 0.2 },
  { name: 'Refresco Light', kcal_per_100g: 2, protein_per_100g: 0, carbs_per_100g: 0.2, fat_per_100g: 0 },
  { name: 'Agua con Gas', kcal_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 0 },
  // Extended: Sauces & condiments
  { name: 'Tomate Frito', kcal_per_100g: 60, protein_per_100g: 1.5, carbs_per_100g: 10, fat_per_100g: 2 },
  { name: 'Mayonesa', kcal_per_100g: 700, protein_per_100g: 1, carbs_per_100g: 1, fat_per_100g: 75 },
  { name: 'Mostaza', kcal_per_100g: 66, protein_per_100g: 4, carbs_per_100g: 6, fat_per_100g: 3.5 },
  { name: 'Ketchup', kcal_per_100g: 110, protein_per_100g: 1, carbs_per_100g: 27, fat_per_100g: 0.1 },
  { name: 'Vinagre Balsámico', kcal_per_100g: 88, protein_per_100g: 0.5, carbs_per_100g: 17, fat_per_100g: 0 },
  { name: 'Salsa de Soja', kcal_per_100g: 53, protein_per_100g: 8, carbs_per_100g: 4.7, fat_per_100g: 0 },
  { name: 'Pesto', kcal_per_100g: 490, protein_per_100g: 8, carbs_per_100g: 8, fat_per_100g: 48 },
  { name: 'Hummus', kcal_per_100g: 166, protein_per_100g: 7.9, carbs_per_100g: 14, fat_per_100g: 9.6 },
  { name: 'Salsa de Yogur', kcal_per_100g: 80, protein_per_100g: 3, carbs_per_100g: 6, fat_per_100g: 5 },
  // Extended: Sweets & extras
  { name: 'Chocolate con Leche', kcal_per_100g: 540, protein_per_100g: 7, carbs_per_100g: 53, fat_per_100g: 31 },
  { name: 'Chocolate Blanco', kcal_per_100g: 560, protein_per_100g: 6, carbs_per_100g: 56, fat_per_100g: 33 },
  { name: 'Cacao en Polvo', kcal_per_100g: 228, protein_per_100g: 20, carbs_per_100g: 12, fat_per_100g: 14 },
  { name: 'Miel', kcal_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82, fat_per_100g: 0 },
  { name: 'Sirope de Arce', kcal_per_100g: 260, protein_per_100g: 0, carbs_per_100g: 67, fat_per_100g: 0 },
  { name: 'Mermelada Light', kcal_per_100g: 120, protein_per_100g: 0.5, carbs_per_100g: 30, fat_per_100g: 0.1 },
  { name: 'Helado de Vainilla', kcal_per_100g: 207, protein_per_100g: 3.5, carbs_per_100g: 24, fat_per_100g: 11 },
  // Extended: Ready & miscellaneous
  { name: 'Sopa de Verduras', kcal_per_100g: 30, protein_per_100g: 1.2, carbs_per_100g: 4, fat_per_100g: 0.8 },
  { name: 'Caldo de Pollo', kcal_per_100g: 15, protein_per_100g: 1.5, carbs_per_100g: 0.5, fat_per_100g: 0.8 },
  { name: 'Pizza Margarita', kcal_per_100g: 260, protein_per_100g: 11, carbs_per_100g: 30, fat_per_100g: 10 },
  { name: 'Lasaña', kcal_per_100g: 150, protein_per_100g: 8, carbs_per_100g: 16, fat_per_100g: 6 },
  { name: 'Hamburguesa de Carne', kcal_per_100g: 280, protein_per_100g: 20, carbs_per_100g: 12, fat_per_100g: 17 },
  { name: 'Tortilla de Patatas', kcal_per_100g: 190, protein_per_100g: 8, carbs_per_100g: 15, fat_per_100g: 12 },
  { name: 'Croquetas de Jamón', kcal_per_100g: 200, protein_per_100g: 10, carbs_per_100g: 18, fat_per_100g: 11 },
  { name: 'Palitos de Merluza', kcal_per_100g: 210, protein_per_100g: 12, carbs_per_100g: 18, fat_per_100g: 11 },
  { name: 'Alga Nori', kcal_per_100g: 35, protein_per_100g: 5.8, carbs_per_100g: 5, fat_per_100g: 0.3 },
  { name: 'Wasabi', kcal_per_100g: 115, protein_per_100g: 5, carbs_per_100g: 24, fat_per_100g: 0.5 },
  { name: 'Jengibre', kcal_per_100g: 80, protein_per_100g: 1.8, carbs_per_100g: 18, fat_per_100g: 0.8 },
];

const EXERCISES = [
  { name: 'Movilidad Columna (Gato-Camello)', muscle_group: 'Columna', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Columna' },
  { name: 'Perro de Caza (Bird Dog)', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Rotación Core' },
  { name: 'Estiramiento de Cadera', muscle_group: 'Cadera', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Cadera' },
  { name: 'Estiramiento Dorsal y Pecho', muscle_group: 'Espalda/Pecho', equipment: 'Peso Corporal', movement_pattern: 'Movilidad Tren Superior' },
  { name: 'Movilidad Peso Muerto Unilateral', muscle_group: 'Isquios', equipment: 'Peso Corporal', movement_pattern: 'Bisagra de Cadera' },
  { name: 'Elevaciones Laterales con Elástico', muscle_group: 'Hombros', equipment: 'Banda Elástica', movement_pattern: 'Elevación Lateral' },
  { name: 'Aductores con Banda Elástica', muscle_group: 'Aductores', equipment: 'Banda Elástica', movement_pattern: 'Adcción de Cadera' },
  { name: 'Abductores con Banda Elástica', muscle_group: 'Abductores', equipment: 'Banda Elástica', movement_pattern: 'Abducción de Cadera' },
  { name: 'Peso Muerto a Una Pierna', muscle_group: 'Isquios', equipment: 'Mancuernas', movement_pattern: 'Bisagra de Cadera' },
  { name: 'Curl Femoral con Mancuerna', muscle_group: 'Isquios', equipment: 'Mancuernas', movement_pattern: 'Flexión de Rodilla' },
  { name: 'Sentadilla con Barra', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Barra', movement_pattern: 'Sentadilla' },
  { name: 'Sentadilla Goblet', muscle_group: 'Cuádriceps', equipment: 'Mancuernas', movement_pattern: 'Sentadilla' },
  { name: 'Zancadas con Mancuernas', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Sentadilla' },
  { name: 'Peso Muerto Rumano (RDL)', muscle_group: 'Isquios/Glúteos', equipment: 'Barra', movement_pattern: 'Bisagra de Cadera' },
  { name: 'Peso Muerto Unilateral', muscle_group: 'Isquios/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Bisagra de Cadera' },
  { name: 'Puente de Glúteos', muscle_group: 'Glúteos', equipment: 'Peso Corporal', movement_pattern: 'Extensión de Cadera' },
  { name: 'Elevación de Talones Sentado', muscle_group: 'Gemelos', equipment: 'Mancuernas', movement_pattern: 'Flexión Plantar' },
  { name: 'Elevación de Talones de Pie', muscle_group: 'Gemelos', equipment: 'Barra', movement_pattern: 'Flexión Plantar' },
  { name: 'Sentadilla Isométrica (Pared)', muscle_group: 'Cuádriceps', equipment: 'Peso Corporal', movement_pattern: 'Sentadilla Isométrica' },
  { name: 'Zancada Búlgara', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Mancuernas', movement_pattern: 'Sentadilla' },
  { name: 'Empuje de Cadera (Hip Thrust)', muscle_group: 'Glúteos', equipment: 'Barra', movement_pattern: 'Extensión de Cadera' },
  { name: 'Press Plano con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Empuje Horizontal' },
  { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Empuje Horizontal' },
  { name: 'Press Banca con Barra', muscle_group: 'Pecho', equipment: 'Barra', movement_pattern: 'Empuje Horizontal' },
  { name: 'Aperturas con Mancuernas', muscle_group: 'Pecho', equipment: 'Mancuernas', movement_pattern: 'Apertura Horizontal' },
  { name: 'Press Militar con Barra', muscle_group: 'Hombros', equipment: 'Barra', movement_pattern: 'Empuje Vertical' },
  { name: 'Press Arnold', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Empuje Vertical' },
  { name: 'Elevaciones Laterales', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Elevación Lateral' },
  { name: 'Elevaciones Frontales', muscle_group: 'Hombros', equipment: 'Mancuernas', movement_pattern: 'Elevación Frontal' },
  { name: 'Fondos en Paralelas', muscle_group: 'Pecho/Tríceps', equipment: 'Peso Corporal', movement_pattern: 'Empuje Vertical' },
  { name: 'Dominadas', muscle_group: 'Espalda', equipment: 'Peso Corporal', movement_pattern: 'Tirón Vertical' },
  { name: 'Remo Invertido (Barra)', muscle_group: 'Espalda', equipment: 'Peso Corporal', movement_pattern: 'Tirón Horizontal' },
  { name: 'Remo con Barra', muscle_group: 'Espalda', equipment: 'Barra', movement_pattern: 'Tirón Horizontal' },
  { name: 'Remo con Mancuerna', muscle_group: 'Espalda', equipment: 'Mancuernas', movement_pattern: 'Tirón Horizontal' },
  { name: 'Face Pull con Banda Elástica', muscle_group: 'Hombros/Delts Posteriores', equipment: 'Banda Elástica', movement_pattern: 'Tirón Horizontal' },
  { name: 'Peso Muerto', muscle_group: 'Espalda/Isquios', equipment: 'Barra', movement_pattern: 'Bisagra de Cadera' },
  { name: 'Curl de Bíceps con Barra', muscle_group: 'Bíceps', equipment: 'Barra', movement_pattern: 'Flexión de Codo' },
  { name: 'Curl de Bíceps con Mancuerna', muscle_group: 'Bíceps', equipment: 'Mancuernas', movement_pattern: 'Flexión de Codo' },
  { name: 'Curl Martillo', muscle_group: 'Bíceps', equipment: 'Mancuernas', movement_pattern: 'Flexión de Codo' },
  { name: 'Extensión de Tríceps con Mancuerna', muscle_group: 'Tríceps', equipment: 'Mancuernas', movement_pattern: 'Extensión de Codo' },
  { name: 'Press Francés', muscle_group: 'Tríceps', equipment: 'Barra', movement_pattern: 'Extensión de Codo' },
  { name: 'Fondos en Banco', muscle_group: 'Tríceps', equipment: 'Banco', movement_pattern: 'Extensión de Codo' },
  { name: 'Plancha', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Extensión Core' },
  { name: 'Plancha Lateral', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Anti-Flexión Lateral Core' },
  { name: 'Elevación de Piernas', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Flexión Core' },
  { name: 'Giro Ruso (Russian Twist)', muscle_group: 'Core', equipment: 'Mancuernas', movement_pattern: 'Rotación Core' },
  { name: 'Ab Wheel Rollout', muscle_group: 'Core', equipment: 'Rueda', movement_pattern: 'Anti-Extensión Core' },
  { name: 'Encogimiento (Crunch)', muscle_group: 'Core', equipment: 'Peso Corporal', movement_pattern: 'Flexión Core' },
  { name: 'Pallof Press con Banda', muscle_group: 'Core', equipment: 'Banda Elástica', movement_pattern: 'Anti-Rotación Core' },
  { name: 'Burpees', muscle_group: 'Cuerpo Completo', equipment: 'Peso Corporal', movement_pattern: 'Explosivo' },
  { name: 'Saltos de Cuerda', muscle_group: 'Gemelos/Cuerpo Completo', equipment: 'Cuerda', movement_pattern: 'Pliométrico' },
  { name: 'Saltos al Cajón', muscle_group: 'Cuádriceps/Glúteos', equipment: 'Cajón', movement_pattern: 'Pliométrico' },
  { name: 'Kettlebell Swing', muscle_group: 'Glúteos/Isquios', equipment: 'Kettlebell', movement_pattern: 'Bisagra de Cadera' },
];

const WORKOUT_PLANS = [
  {
    name: '2x Superior/Inferior',
    min_sessions: 2, max_sessions: 2,
    days: [
      { day_number: 1, focus_area: 'Superior — Pecho, Hombros, Tríceps', exercise_ids: '79,80,83,85,97,100' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,73,75,105' },
    ]
  },
  {
    name: '3x Empuje/Tracción/Piernas',
    min_sessions: 3, max_sessions: 3,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '79,81,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps, Delts Posteriores', exercise_ids: '89,90,91,94,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos, Gemelos', exercise_ids: '67,69,70,71,73,74' },
    ]
  },
  {
    name: '4x Superior/Inferior (2x cada uno)',
    min_sessions: 4, max_sessions: 4,
    days: [
      { day_number: 1, focus_area: 'Superior — Empuje (Pecho, Hombros, Tríceps)', exercise_ids: '79,80,83,85,100,102' },
      { day_number: 2, focus_area: 'Inferior — Cuádriceps, Glúteos, Gemelos', exercise_ids: '67,69,75,76,73,112' },
      { day_number: 3, focus_area: 'Superior — Tracción (Espalda, Bíceps, Delts)', exercise_ids: '89,91,92,94,97,99' },
      { day_number: 4, focus_area: 'Inferior — Isquios, Glúteos, Core', exercise_ids: '70,71,77,104,106,114' },
    ]
  },
  {
    name: '5x Push/Pull/Legs/Upper/Lower',
    min_sessions: 5, max_sessions: 5,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '81,82,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '89,90,91,93,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,71,76,77' },
      { day_number: 4, focus_area: 'Superior — Espalda, Hombros, Bíceps, Tríceps', exercise_ids: '79,84,85,94,99,102' },
      { day_number: 5, focus_area: 'Inferior — Isquios, Glúteos, Gemelos, Core', exercise_ids: '70,73,74,77,104,114' },
    ]
  },
  {
    name: '6x Push/Pull/Legs/Upper/Lower/Full Body',
    min_sessions: 6, max_sessions: 6,
    days: [
      { day_number: 1, focus_area: 'Empuje — Pecho, Hombros, Tríceps', exercise_ids: '79,81,83,85,100,101' },
      { day_number: 2, focus_area: 'Tracción — Espalda, Bíceps', exercise_ids: '89,90,91,94,97,98' },
      { day_number: 3, focus_area: 'Piernas — Cuádriceps, Isquios, Glúteos', exercise_ids: '67,69,70,71,76,77' },
      { day_number: 4, focus_area: 'Superior completo', exercise_ids: '79,83,85,89,91,97,100' },
      { day_number: 5, focus_area: 'Inferior completo', exercise_ids: '67,70,71,73,74,105' },
      { day_number: 6, focus_area: 'Cuerpo completo — ejercicios compuestos', exercise_ids: '79,81,89,91,69,77,112,114' },
    ]
  },
];

function seedIfEmpty(db) {

  const foodCount = db.prepare('SELECT COUNT(*) as count FROM food_items').get().count;
  if (foodCount === 0) {
    const insertFood = db.prepare(
      'INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES (?, ?, ?, ?, ?)'
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
        insertFood.run(food.name, food.kcal_per_100g, food.protein_per_100g, food.carbs_per_100g, food.fat_per_100g);
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
    const insertExercise = db.prepare(
      'INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern) VALUES (?, ?, ?, ?)'
    );
    const transaction = db.transaction(() => {
      for (const ex of EXERCISES) {
        insertExercise.run(ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern);
      }
    });
    transaction();
    console.log(`Seeded ${EXERCISES.length} exercises`);
  }

  const plansCount = db.prepare('SELECT COUNT(*) as count FROM workout_plans').get().count;
  if (plansCount === 0) {
    const insertPlan = db.prepare('INSERT INTO workout_plans (name, min_sessions, max_sessions) VALUES (?, ?, ?)');
    const insertDay = db.prepare('INSERT INTO workout_plan_days (plan_id, day_number, focus_area, exercise_ids) VALUES (?, ?, ?, ?)');
    const transaction = db.transaction(() => {
      for (const plan of WORKOUT_PLANS) {
        const result = insertPlan.run(plan.name, plan.min_sessions, plan.max_sessions);
        const planId = result.lastInsertRowid;
        for (const day of plan.days) {
          insertDay.run(planId, day.day_number, day.focus_area, day.exercise_ids);
        }
      }
    });
    transaction();
    console.log(`Seeded ${WORKOUT_PLANS.length} workout plans`);
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

const MEAL_COMPONENTS = [
  // Desayuno (meal_template_id=1)
  { meal_template_id: 1, food_item_id: 1, default_grams: 100, restday_grams: 70, sort_order: 1, options: [2, 5, 3, 4] },
  { meal_template_id: 1, food_item_id: 20, default_grams: 120, restday_grams: 50, sort_order: 2, options: [19, 21, 22, 28] },
  { meal_template_id: 1, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 3, options: [31, 32, 33] },
  { meal_template_id: 1, food_item_id: 43, default_grams: 0, restday_grams: 0, sort_order: 4, options: [44, 40] },
  // Media Mañana (meal_template_id=2)
  { meal_template_id: 2, food_item_id: 5, default_grams: 30, restday_grams: 30, sort_order: 1, options: [] },
  { meal_template_id: 2, food_item_id: 29, default_grams: 10, restday_grams: 10, sort_order: 2, options: [] },
  { meal_template_id: 2, food_item_id: 32, default_grams: 15, restday_grams: 15, sort_order: 3, options: [] },
  { meal_template_id: 2, food_item_id: 40, default_grams: 300, restday_grams: 300, sort_order: 4, options: [] },
  // Comida (meal_template_id=3)
  { meal_template_id: 3, food_item_id: 6, default_grams: 60, restday_grams: 60, sort_order: 1, options: [7, 13, 9, 10, 14] },
  { meal_template_id: 3, food_item_id: 17, default_grams: 150, restday_grams: 150, sort_order: 2, options: [18, 23, 24, 27, 26] },
  { meal_template_id: 3, food_item_id: 39, default_grams: 0, restday_grams: 0, sort_order: 3, options: [] },
  { meal_template_id: 3, food_item_id: 36, default_grams: 150, restday_grams: 150, sort_order: 4, options: [37, 38] },
  { meal_template_id: 3, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 5, options: [31] },
  // Merienda (meal_template_id=4)
  { meal_template_id: 4, food_item_id: 16, default_grams: 50, restday_grams: 30, sort_order: 1, options: [5, 15] },
  { meal_template_id: 4, food_item_id: 29, default_grams: 20, restday_grams: 20, sort_order: 2, options: [20, 19] },
  { meal_template_id: 4, food_item_id: 32, default_grams: 15, restday_grams: 20, sort_order: 3, options: [31] },
  { meal_template_id: 4, food_item_id: 36, default_grams: 120, restday_grams: 120, sort_order: 4, options: [37, 38] },
  // Cena (meal_template_id=5)
  { meal_template_id: 5, food_item_id: 9, default_grams: 200, restday_grams: 80, sort_order: 1, options: [10, 7, 1] },
  { meal_template_id: 5, food_item_id: 17, default_grams: 150, restday_grams: 150, sort_order: 2, options: [18, 24, 27, 26] },
  { meal_template_id: 5, food_item_id: 39, default_grams: 0, restday_grams: 0, sort_order: 3, options: [] },
  { meal_template_id: 5, food_item_id: 30, default_grams: 10, restday_grams: 10, sort_order: 4, options: [31, 34] },
  { meal_template_id: 5, food_item_id: 41, default_grams: 0, restday_grams: 0, sort_order: 5, options: [42] },
];

module.exports = { seedIfEmpty, seedStats, EXERCISES, FOOD_ITEMS };
