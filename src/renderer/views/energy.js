import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-energy');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">${strings.energy.title}</h2>
    <div class="card">
      <h2>${strings.energy.tdeeBreakdown}</h2>
      <div id="tdee-breakdown"><div class="empty-state"><p>${strings.energy.tdeeEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.energy.dailyBalance}</h2>
      <div class="form-group">
        <label>${strings.energy.date || 'Fecha'}</label>
        <input type="date" id="balance-date" />
      </div>
      <div id="daily-balance"><div class="empty-state"><p>${strings.energy.selectDate}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.energy.weeklyBalance}</h2>
      <div id="weekly-balance"><div class="empty-state"><p>${strings.energy.weeklyEmpty}</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  document.getElementById('balance-date').addEventListener('change', async (e) => {
    const balance = await api.getEnergyBalance(e.target.value);
    const el = document.getElementById('daily-balance');
    if (!balance) {
      el.innerHTML = `<div class="empty-state"><p>${strings.energy.noDataForDate}</p></div>`;
      return;
    }
    const status = balance.tdee > balance.planned_intake ? strings.energy.deficit : balance.tdee < balance.planned_intake ? strings.energy.surplus : strings.energy.maintenance;
    el.innerHTML = `
      <p>${strings.energy.totalTdee}: <strong>${balance.tdee.toFixed(0)} kcal</strong></p>
      <p>${strings.energy.plannedIntake}: <strong>${balance.planned_intake.toFixed(0)} kcal</strong></p>
      <p>${strings.energy.gap}: <strong>${(balance.tdee - balance.planned_intake) > 0 ? '+' : ''}${(balance.tdee - balance.planned_intake).toFixed(0)} kcal</strong></p>
      <p>${strings.energy.status}: <strong>${status}</strong></p>
    `;
  });

  async function load() {
    const tdee = await api.getEnergyBalance(new Date().toISOString().split('T')[0]);
    const tdeeEl = document.getElementById('tdee-breakdown');
    if (tdee) {
      tdeeEl.innerHTML = `
        <p>${strings.energy.bmr}: ${tdee.bmr?.toFixed(0) ?? '--'} kcal</p>
        <p>${strings.energy.sportCalories}: ${tdee.sport_calories?.toFixed(0) ?? '--'} kcal</p>
        <p>${strings.energy.neat}: ${tdee.neat?.toFixed(0) ?? '--'} kcal</p>
        <p>${strings.energy.totalTdee}: <strong>${tdee.tdee?.toFixed(0) ?? '--'} kcal</strong></p>
      `;
    }

    const weekly = await api.getWeeklyBalance();
    const weeklyEl = document.getElementById('weekly-balance');
    if (weekly) {
      weeklyEl.innerHTML = `
        <p>${strings.energy.netBalance}: <strong>${weekly.net_balance > 0 ? '+' : ''}${weekly.net_balance.toFixed(0)} kcal</strong></p>
        <p>${strings.energy.daysLogged}: ${weekly.days_logged} / 7</p>
        <p>${weekly.days_logged < 5 ? `<span style="color:#e94560">${strings.energy.warningFewDays}</span>` : ''}</p>
      `;
    }
  }

  load();
}
