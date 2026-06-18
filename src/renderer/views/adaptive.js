import { strings } from '../locales/es.js';

export function init() {
  const container = document.getElementById('view-energy');
  container.innerHTML = `
    <h2 class="view-title">${strings.adaptive.title}</h2>
    <div class="card">
      <h2>${strings.adaptive.targetPace}</h2>
      <div class="form-group">
        <label>${strings.adaptive.targetPace}: <span id="pace-value">0.5</span> ${strings.adaptive.kgPerWeek}</label>
        <input type="range" id="target-pace" min="0.25" max="1.0" step="0.05" value="0.5" style="width:100%" />
      </div>
      <p style="font-size:13px;color:var(--text-secondary)">${strings.adaptive.targetPaceDesc}</p>
      <button class="btn btn-primary" id="btn-calc-deficit">${strings.adaptive.calculateDeficit}</button>
    </div>
    <div class="card">
      <h2>${strings.adaptive.currentStatus}</h2>
      <div id="current-status"><div class="empty-state"><p>${strings.adaptive.statusEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.adherenceEval}</h2>
      <div id="adherence-eval"><div class="empty-state"><p>${strings.adaptive.adherenceEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.recompDetection}</h2>
      <div id="recomp-detection"><div class="empty-state"><p>${strings.adaptive.recompEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.slotAdjustments}</h2>
      <div id="adjustment-recs"><div class="empty-state"><p>${strings.adaptive.slotEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.adjustmentHistory}</h2>
      <div id="adjustment-history"><div class="empty-state"><p>${strings.adaptive.historyEmpty}</p></div></div>
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
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.completeProfileFirst}</p></div>`;
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
      <p>${strings.adaptive.estimatedMaintenance}: <strong>${maintenance.toFixed(0)} kcal</strong></p>
      <p>${strings.adaptive.targetPaceLabel}: <strong>${pace} ${strings.adaptive.kgPerWeek}</strong></p>
      <p>${strings.adaptive.targetDailyDeficit}: <strong>${targetDeficit.toFixed(0)} kcal</strong></p>
      <p>${strings.adaptive.targetDailyIntake}: <strong>${targetIntake.toFixed(0)} kcal</strong></p>
      <p>${strings.adaptive.safeMinimum}: <strong>${safeMin} kcal</strong></p>
      <p>${strings.adaptive.status}: <strong style="color:${isSafe ? 'var(--success)' : 'var(--danger)'}">${isSafe ? strings.adaptive.statusSafe : strings.adaptive.statusBelowMin}</strong></p>
    `;

    if (targetIntake < safeMin) {
      const maxDeficit = maintenance - safeMin;
      const maxPace = (maxDeficit * 7) / deficitPerKg;
      html += `<p style="color:var(--danger);margin-top:8px">${strings.adaptive.suggestedMaxPace}: ${Math.max(0, maxPace).toFixed(2)} ${strings.adaptive.kgPerWeek}</p>`;
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
      <p>${strings.adaptive.trendWeight}: <strong>${trendWeight.toFixed(1)} kg</strong></p>
      <p>${strings.adaptive.actualLossRate}: <strong>${Math.abs(actualRate).toFixed(2)} ${strings.adaptive.kgPerWeek}</strong></p>
      <p>${strings.adaptive.target}: <strong>${pace} ${strings.adaptive.kgPerWeek}</strong></p>
      <p>${strings.adaptive.adherence}: <strong style="color:${onTrack ? 'var(--success)' : 'var(--danger)'}">${onTrack ? strings.adaptive.onTrack : strings.adaptive.needsAdjustment}</strong></p>
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
      <p>${strings.adaptive.period}: ${first.date} → ${last.date} (${recent.length} mediciones)</p>
      <p>${strings.adaptive.weightChange}: <strong>${(last.weight_kg - first.weight_kg).toFixed(1)} kg</strong> ${weightStable ? `(${strings.adaptive.stable})` : ''}</p>
      <p>${strings.adaptive.waistChange}: <strong>${(last.waist_cm - first.waist_cm).toFixed(1)} cm</strong> ${waistDecreasing ? `(${strings.adaptive.decreasing})` : ''}</p>
    `;
    if (bfFirst !== null && bfLast !== null) {
      html += `<p>${strings.adaptive.bodyFat}: ${bfFirst.toFixed(1)}% → ${bfLast.toFixed(1)}%</p>`;
    }
    html += `<p>${strings.adaptive.status}: <strong style="color:${isRecomp ? 'var(--success)' : 'var(--text-secondary)'}">${isRecomp ? strings.adaptive.recompDetected : strings.adaptive.noRecomp}</strong></p>`;

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

    let html = `<p>${strings.adaptive.currentDailyDeficit}: <strong>${currentDeficit.toFixed(0)} kcal</strong></p>`;
    html += `<p>${strings.adaptive.targetDailyDeficitLabel}: <strong>${targetDeficit.toFixed(0)} kcal</strong></p>`;
    html += `<p>${strings.adaptive.adjustmentNeeded}: <strong>${deficitGap > 0 ? '+' : ''}${deficitGap.toFixed(0)} kcal</strong></p>`;

    if (Math.abs(deficitGap) > 50) {
      const carbAdjust = deficitGap > 0 ? Math.min(deficitGap / 4, currentIntake * 0.2 / 4) : Math.max(deficitGap / 4, -currentIntake * 0.2 / 4);
      const fatAdjust = deficitGap > 0 ? Math.min(deficitGap / 9, currentIntake * 0.2 / 9) : Math.max(deficitGap / 9, -currentIntake * 0.2 / 9);

      const cappedCarbAdjust = Math.abs(carbAdjust);
      const cappedFatAdjust = Math.abs(fatAdjust);

      html += `
        <p style="margin-top:12px;font-weight:bold">${strings.adaptive.slotAdjustments}:</p>
        <p>${strings.adaptive.reduceCarbs}: <strong>~${cappedCarbAdjust.toFixed(0)}g</strong></p>
        <p>${strings.adaptive.reduceFats}: <strong>~${cappedFatAdjust.toFixed(0)}g</strong></p>
        <p style="font-size:12px;color:var(--text-secondary);margin-top:4px">${strings.adaptive.maxAdjustment}</p>
      `;

      html += `
        <div style="margin-top:16px;display:flex;gap:8px">
          <button class="btn btn-primary" id="btn-accept-adjustment">${strings.adaptive.applyRecommendation}</button>
          <button class="btn btn-secondary" id="btn-dismiss-adjustment">${strings.adaptive.dismiss}</button>
        </div>
      `;
    } else {
      html += `<p style="color:var(--success);margin-top:8px">${strings.adaptive.adjustmentApplied}</p>`;
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
        el.innerHTML = `<p style="color:var(--success)">${strings.adaptive.adjustmentApplied}</p>`;
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.adjustmentDismissed}</p></div>`;
      });
    }
  }

  async function loadHistory() {
    const el = document.getElementById('adjustment-history');
    const lastAdj = await api.getSetting('last_adjustment');
    if (!lastAdj) {
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.historyEmpty}</p></div>`;
      return;
    }
    const adj = JSON.parse(lastAdj);
    el.innerHTML = `
      <table>
        <thead><tr><th>Fecha</th><th>Ritmo</th><th>Déficit Objetivo</th><th>Déficit Actual</th><th>Brecha</th></tr></thead>
        <tbody>
          <tr>
            <td>${adj.date}</td>
            <td>${adj.pace} kg/sem</td>
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
