export function init() {
  const container = document.getElementById('view-energy');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">Energy Balance</h2>
    <div class="card">
      <h2>TDEE Breakdown</h2>
      <div id="tdee-breakdown"><div class="empty-state"><p>Complete your profile and log some activity to see your TDEE breakdown</p></div></div>
    </div>
    <div class="card">
      <h2>Daily Balance</h2>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="balance-date" />
      </div>
      <div id="daily-balance"><div class="empty-state"><p>Select a date to view balance</p></div></div>
    </div>
    <div class="card">
      <h2>Weekly Balance</h2>
      <div id="weekly-balance"><div class="empty-state"><p>Log at least 5 days of data to see weekly balance</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  document.getElementById('balance-date').addEventListener('change', async (e) => {
    const balance = await api.getEnergyBalance(e.target.value);
    const el = document.getElementById('daily-balance');
    if (!balance) {
      el.innerHTML = `<div class="empty-state"><p>No data for this date</p></div>`;
      return;
    }
    const status = balance.tdee > balance.planned_intake ? 'Deficit' : balance.tdee < balance.planned_intake ? 'Surplus' : 'Maintenance';
    el.innerHTML = `
      <p>TDEE: <strong>${balance.tdee.toFixed(0)} kcal</strong></p>
      <p>Planned Intake: <strong>${balance.planned_intake.toFixed(0)} kcal</strong></p>
      <p>Gap: <strong>${(balance.tdee - balance.planned_intake) > 0 ? '+' : ''}${(balance.tdee - balance.planned_intake).toFixed(0)} kcal</strong></p>
      <p>Status: <strong>${status}</strong></p>
    `;
  });

  async function load() {
    const tdee = await api.getEnergyBalance(new Date().toISOString().split('T')[0]);
    const tdeeEl = document.getElementById('tdee-breakdown');
    if (tdee) {
      tdeeEl.innerHTML = `
        <p>BMR: ${tdee.bmr?.toFixed(0) ?? '--'} kcal</p>
        <p>Sport Calories: ${tdee.sport_calories?.toFixed(0) ?? '--'} kcal</p>
        <p>NEAT (steps): ${tdee.neat?.toFixed(0) ?? '--'} kcal</p>
        <p>Total TDEE: <strong>${tdee.tdee?.toFixed(0) ?? '--'} kcal</strong></p>
      `;
    }

    const weekly = await api.getWeeklyBalance();
    const weeklyEl = document.getElementById('weekly-balance');
    if (weekly) {
      weeklyEl.innerHTML = `
        <p>Net Balance: <strong>${weekly.net_balance > 0 ? '+' : ''}${weekly.net_balance.toFixed(0)} kcal</strong></p>
        <p>Days logged: ${weekly.days_logged} / 7</p>
        <p>${weekly.days_logged < 5 ? '<span style="color:#e94560">Warning: fewer than 5 days logged — results may be unreliable</span>' : ''}</p>
      `;
    }
  }

  load();
}
