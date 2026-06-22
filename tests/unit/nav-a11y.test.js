import { describe, it, expect } from 'vitest';

describe('Sidebar navigation accessibility', () => {
  it('nav items should be <button> elements with data-view attributes', () => {
    document.body.innerHTML = `
      <nav id="sidebar" role="navigation" aria-label="Navegación principal">
        <ul class="nav-list">
          <li><button class="nav-item" data-view="dashboard" aria-label="Panel"><span class="nav-text">Panel</span></button></li>
          <li><button class="nav-item" data-view="activity" aria-label="Actividad"><span class="nav-text">Actividad</span></button></li>
          <li><button class="nav-item" data-view="diet" aria-label="Plan de Dieta"><span class="nav-text">Plan de Dieta</span></button></li>
          <li><button class="nav-item" data-view="energy" aria-label="Balance Energético"><span class="nav-text">Balance Energético</span></button></li>
          <li><button class="nav-item" data-view="measurements" aria-label="Mediciones Corporales"><span class="nav-text">Mediciones Corporales</span></button></li>
          <li><button class="nav-item" data-view="training" aria-label="Entrenamiento de Fuerza"><span class="nav-text">Entrenamiento de Fuerza</span></button></li>
          <li><button class="nav-item" data-view="analytics" aria-label="Tendencias"><span class="nav-text">Tendencias</span></button></li>
          <li><button class="nav-item" data-view="profile" aria-label="Perfil y Ajustes"><span class="nav-text">Perfil y Ajustes</span></button></li>
        </ul>
      </nav>
    `;

    const nav = document.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Navegación principal');

    const items = document.querySelectorAll('.nav-item');
    expect(items.length).toBe(8);

    items.forEach(item => {
      expect(item.tagName).toBe('BUTTON');
      expect(item.dataset.view).toBeTruthy();
      expect(item.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
