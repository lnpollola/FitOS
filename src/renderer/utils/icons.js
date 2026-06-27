import { Check, ArrowUp, ArrowDown, Minus, Activity, Footprints, Bike, Waves, Dumbbell, Heart, Scale, Moon, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Plus, Download, Upload, Menu, LayoutDashboard, Ruler, ScanLine, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUpRightFromSquare, CircleUser, Circle, CircleDot, Layers, Flame, Trophy, Zap, Medal, Target, Share2, Swords, Flower2, Sparkles, Lightbulb, HeartPulse, Bed } from 'lucide';

const iconRegistry = {
  check: Check, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
  minus: Minus, activity: Activity, footprints: Footprints,
  bike: Bike, waves: Waves, dumbbell: Dumbbell,
  heart: Heart, scale: Scale, moon: Moon,
  'trending-up': TrendingUp, 'trending-down': TrendingDown,
  'alert-circle': AlertCircle, 'refresh-cw': RefreshCw,
  plus: Plus, download: Download, upload: Upload,
  menu: Menu, 'layout-dashboard': LayoutDashboard,
  ruler: Ruler, 'scan-line': ScanLine,
  'chevron-down': ChevronDown, 'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'arrow-up-right-from-square': ArrowUpRightFromSquare,
  'circle-user': CircleUser, circle: Circle, 'circle-dot': CircleDot, layers: Layers,
  flame: Flame, trophy: Trophy, zap: Zap,
  medal: Medal, target: Target, 'share-2': Share2,
  swords: Swords, 'flower-2': Flower2,
  sparkles: Sparkles, lightbulb: Lightbulb,
  'heart-pulse': HeartPulse, bed: Bed,
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
