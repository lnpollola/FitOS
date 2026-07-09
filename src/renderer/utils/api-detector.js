import { webAPI } from './web-api.js';

export function getAPI() {
  if (window.electronAPI) {
    return window.electronAPI;
  }
  return webAPI;
}

export const isElectron = !!window.electronAPI;
export const isWeb = !window.electronAPI;
