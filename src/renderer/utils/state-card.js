import { strings } from '../locales/es.js';

export function renderStateCard(container, { title, state, valueHtml, subtitle, onRetry }) {
  if (state === 'loading') {
    container.innerHTML = `<div class="dashboard-card skeleton" aria-hidden="true" style="min-height:100px"><span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${strings.states.loading}</span></div>`;
    return;
  }

  if (state === 'empty') {
    container.innerHTML = `
      <div class="dashboard-card" style="text-align:center;padding:24px">
        <p style="color:var(--text-secondary);margin-bottom:8px;font-size:13px">${subtitle || strings.states.noData}</p>
        <button class="btn btn-primary" data-empty-action>${strings.states.retry}</button>
      </div>`;
    const btn = container.querySelector('[data-empty-action]');
    if (btn && onRetry) btn.addEventListener('click', onRetry);
    return;
  }

  if (state === 'error') {
    container.innerHTML = `
      <div class="dashboard-card" style="border-color:var(--danger)">
        <h3>${title || ''}</h3>
        <div role="alert" style="font-size:13px;color:var(--danger);margin-bottom:8px">${subtitle || strings.states.errorLoading}</div>
        <button class="btn btn-secondary" data-retry-action>${strings.states.retry}</button>
      </div>`;
    const btn = container.querySelector('[data-retry-action]');
    if (btn && onRetry) btn.addEventListener('click', onRetry);
    return;
  }

  container.innerHTML = `
    <div class="dashboard-card">
      <h3>${title || ''}</h3>
      <div class="value">${valueHtml || '--'}</div>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
    </div>`;
}
