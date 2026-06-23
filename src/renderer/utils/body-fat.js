export function calculateBodyFat(neck, waist, hips, sex, height) {
  if (!neck || !waist || !sex || !height) return null;
  if (sex === 'male') {
    return Math.max(86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76, 3);
  } else {
    if (!hips) return null;
    return Math.max(163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387, 10);
  }
}
