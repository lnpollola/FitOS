export function init() {
  const container = document.getElementById('view-energy');
  container.innerHTML = `
    <h2 style="margin-bottom:20px">Adaptive Fat-Loss Planning</h2>
    <div class="card">
      <h2>Target Weight-Loss Pace</h2>
      <div class="form-group">
        <label>Target loss rate (kg/week): <span id="pace-value">0.5</span></label>
        <input type="range" id="target-pace" min="0.25" max="1.0" step="0.05" value="0.5" style="width:100%" />
      </div>
      <p style="font-size:13px;color:var(--text-secondary)">Recommended: 0.5-1.0 kg/week for sustainable fat loss</p>
      <button class="btn btn-primary" id="btn-calc-deficit">Calculate Deficit</button>
    </div>
    <div class="card">
      <h2>Current Status</h2>
      <div id="current-status"><div class="empty-state"><p>Complete your profile and log some data to see your status</p></div></div>
    </div>
    <div class="card">
      <h2>Adherence Evaluation</h2>
      <div id="adherence-eval"><div class="empty-state"><p>Log at least 1 week of weight data for adherence evaluation</p></div></div>
    </div>
    <div class="card">
      <h2>Recomposition Detection</h2>
      <div id="recomp-detection"><div class="empty-state"><p>Need 4+ weeks of measurements for recomposition analysis</p></div></div>
    </div>
    <div class="card">
      <h2>Slot Adjustment Recommendations</h2>
      <div id="adjustment-recs"><div class="empty-state"><p>Set a target pace and evaluate adherence to get recommendations</p></div></div>
    </div>
    <div class="card">
      <h2>Adjustment History</h2>
      <div id="adjustment-history"><div class="empty-state"><p>No adjustments logged yet</p></div></div>
    </div>
  `;

  const api = window.electronAPI;
  if (!api) return;

  document.getElementById('target-pace').addEventListener('input', (e) => {
    document.getElementById('pace-value').textContent = e.target.value;
  });

  document.getElementById('btn-calc-deficit').addEventListener('click', loadAll);

  async function loadAll() {
    loadStatus();
    loadAdherence();
    loadRecomp();
    loadAdjustments();
    loadHistory();
  }

  async function loadStatus() {
    const profile = await api.getProfile();
    const pace = parseFloat(document.getElementById('target-pace').value);
    const el = document.getElementById('current-status');

    if (!profile) {
      el.innerHTML = `<div class="empty-state"><p>Complete your profile first (Profile & Settings tab)</p></div>`;
      return;
    }

    let bmr;
    if (profile.sex === 'male') {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
    }

    const today = new Date().toISOString().split('T')[0];
    const balance = await api.getEnergyBalance(today);
    const maintenance = balance?.tdee || (bmr * 1.2);
    const deficitPerKg = 7700;
    const targetDeficit = pace * deficitPerKg / 7;
    const targetIntake = maintenance - targetDeficit;

    const safeMin = profile.sex === 'female' ? 1200 : 1500;
    const isSafe = targetIntake >= safeMin;

    let html = `
      <p>Estimated Maintenance (TDEE): <strong>${maintenance.toFixed(0)} kcal</strong></p>
      <p>Target pace: <strong>${pace} kg/week</strong></p>
      <p>Target daily deficit: <strong>${targetDeficit.toFixed(0)} kcal</strong></p>
      <p>Target daily intake: <strong>${targetIntake.toFixed(0)} kcal</strong></p>
      <p>Safe minimum: <strong>${safeMin} kcal</strong> (${profile.sex === 'female' ? '1200 women / 1500 men' : '1500 men / 1200 women'})</p>
      <p>Status: <strong style="color:${isSafe ? '#4ecdc4' : '#e94560'}">${isSafe ? 'Safe ✓' : 'Below minimum - adjust pace ✗'}</strong></p>
    `;

    if (targetIntake < safeMin) {
      const maxDeficit = maintenance - safeMin;
      const maxPace = (maxDeficit * 7) / deficitPerKg;
      html += `<p style="color:#e94560;margin-top:8px">Suggested max pace: ${Math.max(0, maxPace).toFixed(2)} kg/week to stay above ${safeMin} kcal floor</p>`;
    }

    el.innerHTML = html;
  }

  async function loadAdherence() {
    const profile = await api.getProfile();
    const pace = parseFloat(document.getElementById('target-pace').value);
    const el = document.getElementById('adherence-eval');

    if (!profile) return;

    const weights = await api.getWeightEntries();
    if (!weights || weights.length < 2) return;

    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const recentWeights = sorted.slice(-14);
    const trendWeight = recentWeights.reduce((sum, w) => sum + w.weight_kg, 0) / recentWeights.length;

    const oldestWeight = sorted[0].weight_kg;
    const daysDiff = (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24);
    const actualRate = daysDiff > 0 ? ((oldestWeight - trendWeight) / daysDiff) * 7 : 0;

    const onTrack = Math.abs(actualRate - pace) < 0.2;

    el.innerHTML = `
      <p>Trend Weight (14-day MA): <strong>${trendWeight.toFixed(1)} kg</strong></p>
      <p>Actual loss rate: <strong>${Math.abs(actualRate).toFixed(2)} kg/week</strong></p>
      <p>Target: <strong>${pace} kg/week</strong></p>
      <p>Adherence: <strong style="color:${onTrack ? '#4ecdc4' : '#e94560'}">${onTrack ? 'On track ✓' : 'Needs adjustment ⚠'}</strong></p>
    `;
  }

  async function loadRecomp() {
    const sets = await api.getMeasurementSets();
    const profile = await api.getProfile();
    const el = document.getElementById('recomp-detection');

    if (!sets || sets.length < 2 || !profile) return;

    const sorted = [...sets].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 4) return;

    const recent = sorted.slice(-4);
    const first = recent[0];
    const last = recent[recent.length - 1];

    if (!first.waist_cm || !last.waist_cm || !first.weight_kg || !last.weight_kg) return;

    const weightStable = Math.abs(last.weight_kg - first.weight_kg) < 1.0;
    let bfFirst = null, bfLast = null;
    if (first.neck_cm && first.hips_cm && last.neck_cm && last.hips_cm) {
      bfFirst = calculateBodyFat(first.neck_cm, first.waist_cm, first.hips_cm, profile.sex, profile.height_cm);
      bfLast = calculateBodyFat(last.neck_cm, last.waist_cm, last.hips_cm, profile.sex, profile.height_cm);
    }

    const waistDecreasing = last.waist_cm < first.waist_cm - 1;
    const isRecomp = weightStable && waistDecreasing;

    let html = `
      <p>Period: ${first.date} to ${last.date} (${recent.length} measurements)</p>
      <p>Weight change: <strong>${(last.weight_kg - first.weight_kg).toFixed(1)} kg</strong> ${weightStable ? '(stable ✓)' : ''}</p>
      <p>Waist change: <strong>${(last.waist_cm - first.waist_cm).toFixed(1)} cm</strong> ${waistDecreasing ? '(decreasing ✓)' : ''}</p>
    `;
    if (bfFirst !== null && bfLast !== null) {
      html += `<p>Body fat: ${bfFirst.toFixed(1)}% → ${bfLast.toFixed(1)}%</p>`;
    }
    html += `<p>Status: <strong style="color:${isRecomp ? '#4ecdc4' : '#a0a0b0'}">${isRecomp ? 'Recomposition detected ✓' : 'No recomposition pattern'}</strong></p>`;

    el.innerHTML = html;
  }

  function calculateBodyFat(neck, waist, hips, sex, height) {
    if (!neck || !waist || !hips || !sex || !height) return null;
    if (sex === 'male') {
      return Math.max(86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76, 3);
    } else {
      return Math.max(163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(height) - 78.387, 10);
    }
  }

  async function loadAdjustments() {
    const profile = await api.getProfile();
    const pace = parseFloat(document.getElementById('target-pace').value);
    const el = document.getElementById('adjustment-recs');

    if (!profile) return;

    const balance = await api.getEnergyBalance(new Date().toISOString().split('T')[0]);
    if (!balance) return;

    const deficitPerKg = 7700;
    const targetDeficit = pace * deficitPerKg / 7;
    const currentDeficit = balance.tdee - balance.planned_intake;
    const deficitGap = targetDeficit - currentDeficit;

    const safeMin = profile.sex === 'female' ? 1200 : 1500;
    const currentIntake = balance.planned_intake;

    let html = `<p>Current daily deficit: <strong>${currentDeficit.toFixed(0)} kcal</strong></p>`;
    html += `<p>Target daily deficit: <strong>${targetDeficit.toFixed(0)} kcal</strong></p>`;
    html += `<p>Adjustment needed: <strong>${deficitGap > 0 ? '+' : ''}${deficitGap.toFixed(0)} kcal</strong></p>`;

    if (Math.abs(deficitGap) > 50) {
      const carbAdjust = deficitGap > 0 ? Math.min(deficitGap / 4, currentIntake * 0.2 / 4) : Math.max(deficitGap / 4, -currentIntake * 0.2 / 4);
      const fatAdjust = deficitGap > 0 ? Math.min(deficitGap / 9, currentIntake * 0.2 / 9) : Math.max(deficitGap / 9, -currentIntake * 0.2 / 9);

      const cappedCarbAdjust = Math.abs(carbAdjust);
      const cappedFatAdjust = Math.abs(fatAdjust);

      html += `
        <p style="margin-top:12px;font-weight:bold">Suggested slot adjustments:</p>
        <p>Reduce carbs by: <strong>~${cappedCarbAdjust.toFixed(0)}g</strong> across carb slots</p>
        <p>Reduce fats by: <strong>~${cappedFatAdjust.toFixed(0)}g</strong> across fat slots</p>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:4px">Max adjustment capped at 20% of current intake for safety</p>
      `;

      html += `
        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-primary" id="btn-accept-adjustment">Apply Recommendation</button>
          <button class="btn btn-secondary" id="btn-dismiss-adjustment">Dismiss</button>
        </div>
      `;
    } else {
      html += `<p style="color:#4ecdc4;margin-top:8px">Current deficit is close to target — no adjustment needed ✓</p>`;
    }

    el.innerHTML = html;

    const acceptBtn = document.getElementById('btn-accept-adjustment');
    const dismissBtn = document.getElementById('btn-dismiss-adjustment');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', async () => {
        await api.setSetting('last_adjustment', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          pace,
          targetDeficit,
          currentDeficit,
          deficitGap,
        }));
        loadHistory();
        el.innerHTML = `<p style="color:#4ecdc4">Adjustment applied and logged ✓</p>`;
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        el.innerHTML = `<div class="empty-state"><p>Adjustment dismissed</p></div>`;
      });
    }
  }

  async function loadHistory() {
    const el = document.getElementById('adjustment-history');
    const lastAdj = await api.getSetting('last_adjustment');
    if (!lastAdj) {
      el.innerHTML = `<div class="empty-state"><p>No adjustments logged yet</p></div>`;
      return;
    }
    const adj = JSON.parse(lastAdj);
    el.innerHTML = `
      <table>
        <thead><tr><th>Date</th><th>Pace</th><th>Target Deficit</th><th>Current Deficit</th><th>Gap</th></tr></thead>
        <tbody>
          <tr>
            <td>${adj.date}</td>
            <td>${adj.pace} kg/wk</td>
            <td>${adj.targetDeficit.toFixed(0)} kcal</td>
            <td>${adj.currentDeficit.toFixed(0)} kcal</td>
            <td>${adj.deficitGap > 0 ? '+' : ''}${adj.deficitGap.toFixed(0)} kcal</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  loadAll();
}
