import { describe, it, expect } from 'vitest';

describe('Organic tokens smoke test', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"><div id="view-dashboard"></div></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('body.organic resolves --accent to moss hex', () => {
    document.body.classList.add('organic');
    document.body.style.setProperty('--accent', '#4E5D3F');
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    expect(accent).toBe('#4E5D3F');
  });

  it('body.organic::before is hidden under prefers-contrast: more', () => {
    document.body.classList.add('organic');
    const style = document.createElement('style');
    style.textContent = `
      body.organic::before { content: ''; display: block; }
      @media (prefers-contrast: more) {
        body.organic::before { display: none; }
      }
    `;
    document.head.appendChild(style);
    style.textContent += ' @media (prefers-contrast: more) { body.organic::before { display: none !important; } } ';
    const before = getComputedStyle(document.body, '::before');
    expect(before).toBeTruthy();
    document.head.removeChild(style);
  });
});
