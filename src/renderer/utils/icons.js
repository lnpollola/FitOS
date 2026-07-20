import { Check, ArrowUp, ArrowDown, Minus, Activity, Footprints, Bike, Waves, Dumbbell, Heart, Scale, Moon, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Plus, LayoutDashboard, Ruler, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Circle, CircleDot, Layers, Flame, Trophy, Medal, Target, Share2, Swords, Flower2, Sparkles, HeartPulse, Bed, Info, AlertTriangle, CheckCircle, BadgeCheck, Pencil, Trash2, Archive, X } from 'lucide';

const iconRegistry = {
  check: Check, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  minus: Minus, activity: Activity, footprints: Footprints,
  bike: Bike, waves: Waves, dumbbell: Dumbbell,
  heart: Heart, scale: Scale, moon: Moon,
  'trending-up': TrendingUp, 'trending-down': TrendingDown,
  'alert-circle': AlertCircle, 'refresh-cw': RefreshCw,
  plus: Plus, 'layout-dashboard': LayoutDashboard,
  ruler: Ruler,
  'chevron-down': ChevronDown, 'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  circle: Circle, 'circle-dot': CircleDot, layers: Layers,
  flame: Flame, trophy: Trophy,
  medal: Medal, target: Target, 'share-2': Share2,
  swords: Swords, 'flower-2': Flower2,
  sparkles: Sparkles,
  'heart-pulse': HeartPulse, bed: Bed,
  info: Info, 'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle, 'badge-check': BadgeCheck,
  pencil: Pencil, 'trash-2': Trash2,
  archive: Archive, x: X,
};

function renderAttributes(attrs) {
  return Object.entries(attrs || {})
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('');
}

function renderNode(node) {
  if (!node || !Array.isArray(node)) return '';
  const [tag, attrs, children] = node;
  if (!tag) return '';
  const attrStr = renderAttributes(attrs);
  if (children && children.length) {
    return `<${tag}${attrStr}>${children.map(c => renderNode(c)).join('')}</${tag}>`;
  }
  return `<${tag}${attrStr} />`;
}

export function icon(name, size = 16) {
  const iconData = iconRegistry[name];
  if (!iconData) return '';
  const [, attrs, children] = iconData;
  const mergedAttrs = { ...attrs, width: String(size), height: String(size) };
  const attrStr = renderAttributes(mergedAttrs);
  if (children && children.length) {
    return `<svg${attrStr}>${children.map(c => renderNode(c)).join('')}</svg>`;
  }
  return `<svg${attrStr} />`;
}
