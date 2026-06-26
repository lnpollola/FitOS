import { Check, ArrowUp, ArrowDown, Minus, Activity, Footprints, Bike, Waves, Dumbbell, Heart, Scale, Moon, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Plus, Download, Upload, Menu, LayoutDashboard, Ruler, ScanLine, ChevronDown, ChevronUp, ArrowUpRightFromSquare, CircleUser, Circle, Layers, Flame, Trophy, Zap } from 'lucide';

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
  'arrow-up-right-from-square': ArrowUpRightFromSquare,
  'circle-user': CircleUser, circle: Circle, layers: Layers,
  flame: Flame, trophy: Trophy, zap: Zap,
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
