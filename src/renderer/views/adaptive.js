import { strings } from '../locales/es.js';
import { calculateBodyFat } from '../utils/body-fat.js';
import Chart from 'chart.js/auto';

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
      <h2>${strings.adaptive.deficitImpact}</h2>
      <div id="deficit-impact"><div class="empty-state"><p>${strings.adaptive.deficitImpactEmpty}</p></div></div>
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
    loadDeficitImpact();
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

    if (balance) {
      html += `
        <hr style="margin:12px 0;border-color:var(--border)">
        <div style="padding-left:12px;font-size:13px">
          <p style="margin:4px 0"><strong>${strings.energy.tdeeBreakdown}</strong></p>
          <p style="margin:2px 0">${strings.energy.bmr}: ${balance.bmr?.toFixed(0) || '--'} kcal</p>
          <p style="margin:2px 0">${strings.energy.sportCalories}: ${balance.sport_calories?.toFixed(0) || '--'} kcal</p>
          <p style="margin:2px 0">${strings.energy.neat}: ${balance.neat?.toFixed(0) || '--'} kcal</p>
          <p style="margin:2px 0">${strings.energy.totalTdee}: <strong>${balance.tdee?.toFixed(0) || '--'} kcal</strong></p>
        </div>`;
    }

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
    if (!weights || weights.length < 2) {
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.adherenceEmpty}</p></div>`;
      return;
    }

    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const recentWeights = sorted.slice(-14);
    const trendWeight = recentWeights.reduce((sum, w) => sum + w.weight_kg, 0) / recentWeights.length;

    const oldestWeight = sorted[0].weight_kg;
    const daysDiff = (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24);
    const actualRate = daysDiff > 0 ? ((oldestWeight - trendWeight) / daysDiff) * 7 : 0;
    const onTrack = Math.abs(actualRate - pace) < 0.2;

    // Consistency score: % of weekly intervals within 0.2kg of target
    let consistentWeeks = 0;
    let totalWeeks = 0;
    for (let i = 1; i < sorted.length; i++) {
      const dateDiff = (new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24);
      if (dateDiff >= 5 && dateDiff <= 10) {
        const weekRate = ((sorted[i - 1].weight_kg - sorted[i].weight_kg) / dateDiff) * 7;
        if (Math.abs(weekRate - pace) < 0.2) consistentWeeks++;
        totalWeeks++;
      }
    }
    const consistencyPct = totalWeeks > 0 ? Math.round((consistentWeeks / totalWeeks) * 100) : 0;

    // Gauge: % of target rate achieved
    const pctOfTarget = pace > 0 ? Math.min(100, Math.round((Math.abs(actualRate) / pace) * 100)) : 0;
    const gaugeColor = pctOfTarget < 50 ? 'var(--danger)' : pctOfTarget < 80 ? 'var(--warning)' : 'var(--success)';

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <p>${strings.adaptive.trendWeight}: <strong>${trendWeight.toFixed(1)} kg</strong></p>
          <p>${strings.adaptive.actualLossRate}: <strong>${Math.abs(actualRate).toFixed(2)} ${strings.adaptive.kgPerWeek}</strong></p>
          <p>${strings.adaptive.target}: <strong>${pace} ${strings.adaptive.kgPerWeek}</strong></p>
        </div>
        <div style="text-align:center">
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">${strings.adaptive.adherenceGauge}</div>
          <div style="width:100%;height:24px;background:var(--bg-tertiary);border-radius:12px;overflow:hidden;position:relative">
            <div style="width:${pctOfTarget}%;height:100%;background:${gaugeColor};border-radius:12px;transition:width 0.5s"></div>
          </div>
          <div style="font-size:24px;font-weight:700;margin-top:6px;color:${gaugeColor}">${pctOfTarget}%</div>
        </div>
      </div>
      <hr style="margin:12px 0;border-color:var(--border)">
      <div style="display:flex;gap:16px;align-items:center">
        <div>
          <span style="font-size:12px;color:var(--text-secondary)">${strings.adaptive.consistencyScore}</span>
          <div style="font-size:20px;font-weight:700">${consistencyPct}%</div>
          <div style="font-size:11px;color:var(--text-secondary)">${consistentWeeks} ${strings.adaptive.weeksOnTrack}</div>
        </div>
        <div style="flex:1;padding:8px 12px;background:var(--bg-tertiary);border-radius:8px">
          ${!onTrack ? `<span style="color:var(--warning)">⚠ ${strings.adaptive.needsAdjustment}</span>` : `<span style="color:var(--success)">✓ ${strings.adaptive.onTrack}</span>`}
          ${!onTrack && Math.abs(actualRate) < pace ? `<p style="font-size:12px;margin-top:4px">${strings.adaptive.increaseDeficit} ${Math.round((pace - Math.abs(actualRate)) * 7700 / 7)} ${strings.adaptive.kcalPerDay}</p>` : ''}
          ${onTrack ? `<p style="font-size:12px;margin-top:4px">${strings.adaptive.maintainPace}</p>` : ''}
        </div>
      </div>
    `;
  }

  async function loadRecomp() {
    const sets = await api.getMeasurementSets();
    const profile = await api.getProfile();
    const el = document.getElementById('recomp-detection');

    if (!sets || sets.length < 2 || !profile) {
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.recompMissingData}</p></div>`;
      return;
    }

    const sorted = [...sets].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const missingMetrics = [];
    if (!latest.waist_cm) missingMetrics.push(strings.measurements.waist);
    if (!latest.neck_cm) missingMetrics.push(strings.measurements.neck);
    if (!latest.hips_cm) missingMetrics.push(strings.measurements.hips);
    if (!latest.weight_kg) missingMetrics.push(strings.measurements.weight);

    if (sorted.length < 4) {
      el.innerHTML = `
        <div class="empty-state">
          <p>${strings.adaptive.recompMissingData}</p>
          <div class="sub">${sorted.length}/4 ${strings.general.created}</div>
          ${missingMetrics.length > 0 ? `<div class="sub" style="margin-top:6px">${strings.adaptive.recompMissingMetrics} ${missingMetrics.join(', ')}</div>` : ''}
        </div>
      `;
      return;
    }

    if (missingMetrics.length > 0) {
      el.innerHTML = `
        <div class="empty-state">
          <p style="color:var(--warning)">⚠ ${strings.adaptive.recompMissingMetrics} ${missingMetrics.join(', ')}</p>
          <div class="sub">${strings.adaptive.recompMissingData}</div>
        </div>
      `;
      return;
    }

    const recent = sorted.slice(-4);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const weightStable = Math.abs(last.weight_kg - first.weight_kg) < 1.0;
    let bfFirst = null, bfLast = null;
    if (first.neck_cm && first.hips_cm && last.neck_cm && last.hips_cm) {
      bfFirst = calculateBodyFat(first.neck_cm, first.waist_cm, first.hips_cm, profile.sex, profile.height_cm);
      bfLast = calculateBodyFat(last.neck_cm, last.waist_cm, last.hips_cm, profile.sex, profile.height_cm);
    }

    const waistDecreasing = last.waist_cm < first.waist_cm - 1;
    const isRecomp = weightStable && waistDecreasing;

    let html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <p>${strings.adaptive.period}: ${first.date} → ${last.date} (${recent.length} mediciones)</p>
          <p>${strings.adaptive.weightChange}: <strong>${(last.weight_kg - first.weight_kg).toFixed(1)} kg</strong> ${weightStable ? `(${strings.adaptive.stable})` : ''}</p>
          <p>${strings.adaptive.waistChange}: <strong>${(last.waist_cm - first.waist_cm).toFixed(1)} cm</strong> ${waistDecreasing ? `(${strings.adaptive.decreasing})` : ''}</p>
          ${bfFirst !== null && bfLast !== null ? `<p>${strings.adaptive.bodyFat}: ${bfFirst.toFixed(1)}% → ${bfLast.toFixed(1)}%</p>` : ''}
          <p>${strings.adaptive.status}: <strong style="color:${isRecomp ? 'var(--success)' : 'var(--text-secondary)'}">${isRecomp ? strings.adaptive.recompDetected : strings.adaptive.noRecomp}</strong></p>
        </div>
        <div>
          <canvas id="recomp-chart" width="280" height="180"></canvas>
        </div>
      </div>
    `;

    el.innerHTML = html;

    const ctx = document.getElementById('recomp-chart')?.getContext('2d');
    if (ctx) {
      const chartData = sorted.slice(-12);
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.map(s => s.date.slice(5)),
          datasets: [
            {
              label: strings.measurements.weight,
              data: chartData.map(s => s.weight_kg),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.1)',
              yAxisID: 'y',
              tension: 0.3,
            },
            {
              label: strings.measurements.waist,
              data: chartData.map(s => s.waist_cm),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.1)',
              yAxisID: 'y1',
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: { type: 'linear', position: 'left', title: { display: true, text: 'kg' } },
            y1: { type: 'linear', position: 'right', title: { display: true, text: 'cm' }, grid: { drawOnChartArea: false } },
          },
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
        },
      });
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

  async function loadDeficitImpact() {
    const el = document.getElementById('deficit-impact');
    const profile = await api.getProfile();
    if (!profile) {
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.completeProfileFirst}</p></div>`;
      return;
    }

    const templates = await api.getMealTemplates();
    if (!templates || templates.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.deficitImpactEmpty}</p></div>`;
      return;
    }

    let pdfBaselineKcal = 0;
    for (const tmpl of templates) {
      for (const comp of tmpl.components || []) {
        pdfBaselineKcal += (comp.default_grams / 100) * comp.kcal_per_100g;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const plan = await api.getDailyPlan(today);
    let currentIntakeKcal = 0;
    if (plan) {
      for (const entry of plan) {
        currentIntakeKcal += (entry.grams / 100) * entry.kcal_per_100g;
      }
    }

    const diff = currentIntakeKcal - pdfBaselineKcal;
    const diffPct = pdfBaselineKcal > 0 ? Math.round((diff / pdfBaselineKcal) * 100) : 0;

    el.innerHTML = `
      <p>${strings.adaptive.pdfBaseline}: <strong>${pdfBaselineKcal.toFixed(0)} kcal</strong></p>
      <p>${strings.adaptive.currentIntake} (hoy): <strong>${currentIntakeKcal > 0 ? currentIntakeKcal.toFixed(0) + ' kcal' : strings.general.noData}</strong></p>
      ${currentIntakeKcal > 0 ? `
        <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <span style="font-size:13px">${strings.adaptive.difference}:</span>
          <span style="font-weight:700;color:${diff < 0 ? 'var(--success)' : 'var(--danger)'}">${diff > 0 ? '+' : ''}${diff.toFixed(0)} kcal</span>
          <span style="font-size:12px;color:var(--text-secondary)">(${diffPct > 0 ? '+' : ''}${diffPct}%)</span>
        </div>
        <div style="width:100%;height:12px;background:var(--bg-tertiary);border-radius:6px;overflow:hidden;margin-top:6px">
          <div style="width:${Math.min(100, Math.abs(diffPct) * 3)}%;height:100%;background:${diff < 0 ? 'var(--success)' : 'var(--danger)'};border-radius:6px"></div>
        </div>
      ` : ''}
    `;
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
