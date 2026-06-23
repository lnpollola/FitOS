import { describe, it, expect } from 'vitest';

const CATEGORY_KEYWORDS = {
  breads: ['pan', 'arroz', 'pasta', 'avena', 'cereal', 'cuscús', 'couscous', 'quinoa', 'quínoa', 'patata', 'papa', 'boniato', 'ñoqui', 'gnocchi', 'torta', 'harina', 'corn flakes', 'crema de arroz'],
  proteins: ['pollo', 'pavo', 'jamón', 'jamon', 'lomo', 'pescado', 'salmón', 'salmon', 'merluza', 'calamar', 'sepia', 'carne', 'huevo', 'clara', 'proteína', 'proteina', 'atún', 'atun', 'tuna', 'tofu', 'tempeh', 'seitán', 'seitan', 'chicken', 'fish', 'turkey', 'beef', 'egg', 'whey'],
  fats: ['aceite', 'aguacate', 'avocado', 'fruto seco', 'frutos secos', 'frutos', 'cacahuete', 'crema de cacahuete', 'almendra', 'almendras', 'nuez', 'nueces', 'queso', 'mozzarella', 'oil', 'nut', 'peanut', 'cheese', 'chocolate'],
  fruits: ['manzana', 'plátano', 'platano', 'naranja', 'pera', 'uva', 'uvas', 'fresa', 'fresas', 'fruta', 'apple', 'banana', 'orange'],
  vegetables: ['brócoli', 'brocoli', 'espinaca', 'espinacas', 'lechuga', 'tomate', 'tomates', 'pepino', 'verdura', 'verduras', 'ensalada', 'vegetable', 'salad'],
  legumes: ['lenteja', 'lentejas', 'garbanzo', 'garbanzos', 'alubia', 'alubias', 'judía', 'judías', 'judias', 'poroto', 'frijol', 'legumbre', 'legumbres'],
  drinks: ['té', 'te', 'café', 'cafe', 'infusión', 'infusion', 'tea', 'coffee'],
};

function getFoodCategory(name) {
  const lower = (name || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return null;
}

describe('food category mapping', () => {
  it('classifies breads/grains correctly', () => {
    expect(getFoodCategory('pan integral')).toBe('breads');
    expect(getFoodCategory('arroz blanco')).toBe('breads');
    expect(getFoodCategory('pasta de trigo')).toBe('breads');
    expect(getFoodCategory('avena')).toBe('breads');
    expect(getFoodCategory('quinoa')).toBe('breads');
    expect(getFoodCategory('patata')).toBe('breads');
  });

  it('classifies proteins correctly', () => {
    expect(getFoodCategory('pollo')).toBe('proteins');
    expect(getFoodCategory('salmón')).toBe('proteins');
    expect(getFoodCategory('huevo')).toBe('proteins');
    expect(getFoodCategory('tofu')).toBe('proteins');
    expect(getFoodCategory('lomo de cerdo')).toBe('proteins');
  });

  it('classifies fats correctly', () => {
    expect(getFoodCategory('aceite de oliva')).toBe('fats');
    expect(getFoodCategory('aguacate')).toBe('fats');
    expect(getFoodCategory('almendras')).toBe('fats');
    expect(getFoodCategory('queso')).toBe('fats');
    expect(getFoodCategory('chocolate')).toBe('fats');
  });

  it('classifies fruits correctly', () => {
    expect(getFoodCategory('manzana')).toBe('fruits');
    expect(getFoodCategory('plátano')).toBe('fruits');
    expect(getFoodCategory('naranja')).toBe('fruits');
    expect(getFoodCategory('fresas')).toBe('fruits');
  });

  it('classifies vegetables correctly', () => {
    expect(getFoodCategory('brócoli')).toBe('vegetables');
    expect(getFoodCategory('espinacas')).toBe('vegetables');
    expect(getFoodCategory('lechuga')).toBe('vegetables');
    expect(getFoodCategory('tomate')).toBe('vegetables');
  });

  it('classifies drinks correctly', () => {
    expect(getFoodCategory('té verde')).toBe('drinks');
    expect(getFoodCategory('café')).toBe('drinks');
    expect(getFoodCategory('infusiones')).toBe('drinks');
  });

  it('classifies legumes correctly', () => {
    expect(getFoodCategory('lentejas')).toBe('legumes');
    expect(getFoodCategory('garbanzos')).toBe('legumes');
    expect(getFoodCategory('alubias')).toBe('legumes');
    expect(getFoodCategory('judías verdes')).toBe('legumes');
    expect(getFoodCategory('frijoles')).toBe('legumes');
  });

  it('returns null for unknown foods', () => {
    expect(getFoodCategory('xyzunknown')).toBeNull();
    expect(getFoodCategory('')).toBeNull();
    expect(getFoodCategory(null)).toBeNull();
  });
});
