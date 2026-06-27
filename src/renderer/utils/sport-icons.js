import { icon } from './icons.js';
import { getSportDisplayName } from '../locales/es.js';
export { getSportDisplayName };

const SPORT_ICON_MAP = {
  running: 'footprints',
  cycling: 'bike',
  walking: 'activity',
  swimming: 'waves',
  yoga: 'flower-2',
  HIIT: 'trending-up',
  strength: 'dumbbell',
  football: 'circle',
  paddle: 'circle-dot',
  boxing: 'swords',
  other: 'activity',
};

export function sportIcon(sportType, size = 16) {
  const iconName = SPORT_ICON_MAP[sportType] || 'activity';
  return icon(iconName, size);
}

export function sportIconHtml(sportType, size = 16) {
  return `${sportIcon(sportType, size)} ${getSportDisplayName(sportType)}`;
}
