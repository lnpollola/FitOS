import { getAPI } from "../utils/api-detector.js";
import { strings } from '../locales/es.js';
import { calculateBodyFat } from '../utils/body-fat.js';
import { calculateBMR } from '../utils/bmr.js';
import Chart from 'chart.js/auto';
import { safeCall } from '../utils/safe-call.js';
import { chartColors, chartColorWithAlpha } from '../utils/chart-theme.js';
import { skeletonCard, skeletonChart } from '../utils/skeleton.js';
import { renderStateCard } from '../utils/state-card.js';

export async function init() {
  const container = document.getElementById('view-energy');
  container.innerHTML = `
    <h2 class="view-title">${strings.adaptive.title}</h2>
    <div class="card">
      <h2>${strings.adaptive.targetPace}</h2>
      <div class="form-group">
        <label>${strings.adaptive.targetPace}: <span id="pace-value">0.5</span> ${strings.adaptive.kgPerWeek}</label>
        <input type="range" id="target-pace" min="0.25" max="1.0" step="0.05" value="0.5" style="width:100%" />
      </div>
      <p class="text-sm text-muted">${strings.adaptive.targetPaceDesc}</p>
      <button class="btn btn-primary" id="btn-calc-deficit">${strings.adaptive.calculateDeficit}</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch">
      <div class="card">
        <h2>${strings.energy.currentState}</h2>
        <div id="current-status" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.statusEmpty}</p></div></div>
      </div>
      <div class="card">
        <h2>${strings.energy.tdeeBreakdownTitle}</h2>
        <div id="tdee-breakdown" aria-live="polite"><div class="empty-state"><p>${strings.energy.tdeeEmpty}</p></div></div>
      </div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.adherenceEval}</h2>
      <div id="adherence-eval" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.adherenceEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.recompDetection}</h2>
      <div id="recomp-detection" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.recompEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.slotAdjustments}</h2>
      <div id="adjustment-recs" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.slotEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.deficitImpact}</h2>
      <div id="deficit-impact" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.deficitImpactEmpty}</p></div></div>
    </div>
    <div class="card">
      <h2>${strings.adaptive.adjustmentHistory}</h2>
      <div id="adjustment-history" aria-live="polite"><div class="empty-state"><p>${strings.adaptive.historyEmpty}</p></div></div>
    </div>
  `;

  const api = getAPI();
  if (!api) return;

  if (window._loadingEnergy) return;
  window._loadingEnergy = true;
  try {

  document.getElementById('target-pace').addEventListener('input', (e) => {
    document.getElementById('pace-value').textContent = e.target.value;
  });

  document.getElementById('btn-calc-deficit').addEventListener('click', loadAll);

  async function loadAll() {
    await Promise.allSettled([
      loadStatus(),
      loadAdherence(),
      loadRecomp(),
      loadAdjustments(),
      loadDeficitImpact(),
      loadHistory()
    ]);
  }

  async function loadStatus() {
    const statusEl = document.getElementById('current-status');
    const tdeeEl = document.getElementById('tdee-breakdown');
    statusEl.innerHTML = skeletonCard();
    tdeeEl.innerHTML = skeletonCard();
    try {
      const profile = await safeCall(api.getProfile(), null);
      const pace = parseFloat(document.getElementById('target-pace').value);

      if (!profile) {
        renderStateCard(statusEl, { title: strings.energy.currentState, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStatus });
        renderStateCard(tdeeEl, { title: strings.energy.tdeeBreakdownTitle, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStatus });
        return;
      }

      const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.sex);

      const today = new Date().toISOString().split('T')[0];
      const balance = await safeCall(api.getEnergyBalance(today), null);
      const maintenance = balance?.tdee ?? (bmr * 1.2);
      const deficitPerKg = 7700;
      const targetDeficit = pace * deficitPerKg / 7;
      const targetIntake = maintenance - targetDeficit;

      const safeMin = profile.sex === 'female' ? 1200 : 1500;
      const isSafe = targetIntake >= safeMin;

      let statusHtml = `
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
        statusHtml += `<p class="text-danger mt-2">${strings.adaptive.suggestedMaxPace}: ${Math.max(0, maxPace).toFixed(2)} ${strings.adaptive.kgPerWeek}</p>`;
      }

      statusEl.innerHTML = statusHtml;

      if (balance) {
        tdeeEl.innerHTML = `
          <div class="text-sm" style="padding-left:12px">
            <p style="margin:4px 0">${strings.energy.bmr}: ${balance.bmr?.toFixed(0) || '--'} kcal</p>
            <p style="margin:2px 0">${strings.energy.sportCalories}: ${balance.sport_calories?.toFixed(0) || '--'} kcal</p>
            <p style="margin:2px 0">${strings.energy.neat}: ${balance.neat?.toFixed(0) || '--'} kcal</p>
            <p style="margin:2px 0">${strings.energy.totalTdee}: <strong>${balance.tdee?.toFixed(0) || '--'} kcal</strong></p>
          </div>`;
      } else {
        renderStateCard(tdeeEl, { title: strings.energy.tdeeBreakdownTitle, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStatus });
      }
    } catch (e) {
      console.error('loadStatus error:', e);
      renderStateCard(statusEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStatus });
      renderStateCard(tdeeEl, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadStatus });
    }
  }

  async function loadAdherence() {
    const el = document.getElementById('adherence-eval');
    el.innerHTML = skeletonCard();
    try {
      const profile = await safeCall(api.getProfile(), null);
      const pace = parseFloat(document.getElementById('target-pace').value);
      if (!profile) {
        renderStateCard(el, { title: strings.adaptive.adherenceEval, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdherence });
        return;
      }

      const weights = await safeCall(api.getWeightEntries(), []);
      if (!weights || weights.length < 2) {
        el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.adherenceEmpty}</p></div>`;
        return;
      }

      const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
      const recentWeights = sorted.slice(-14);
      const trendWeight = recentWeights.reduce((sum, w) => sum + w.weight_kg, 0) / recentWeights.length;

      const oldestRecent = recentWeights[0];
      const newestRecent = recentWeights[recentWeights.length - 1];
      const daysDiff = recentWeights.length > 1
        ? (new Date(newestRecent.date) - new Date(oldestRecent.date)) / (1000 * 60 * 60 * 24)
        : 0;
      const actualRate = daysDiff > 0 ? ((oldestRecent.weight_kg - newestRecent.weight_kg) / daysDiff) * 7 : 0;
      const onTrack = Math.abs(actualRate - pace) < 0.2;

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

      const pctOfTarget = pace > 0 ? Math.min(100, Math.round((Math.abs(actualRate) / pace) * 100)) : 0;
      const gaugeColor = pctOfTarget < 50 ? 'var(--danger)' : pctOfTarget < 80 ? 'var(--warning)' : 'var(--success)';

      const rateStr = actualRate < 0
        ? strings.energy.gainingRate.replace('{rate}', Math.abs(actualRate).toFixed(2))
        : strings.energy.actualLossRate.replace('{rate}', actualRate.toFixed(2));

      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <p>${strings.adaptive.trendWeight}: <strong>${trendWeight.toFixed(1)} kg</strong></p>
            <p><strong>${rateStr}</strong></p>
            <p>${strings.adaptive.target}: <strong>${pace} ${strings.adaptive.kgPerWeek}</strong></p>
          </div>
          <div style="text-align:center">
            <div class="text-xs text-muted" style="margin-bottom:4px">${strings.adaptive.adherenceGauge}</div>
            <div style="width:100%;height:24px;background:var(--bg-tertiary);border-radius:12px;overflow:hidden;position:relative">
              <div style="width:${pctOfTarget}%;height:100%;background:${gaugeColor};border-radius:12px;transition:width 0.5s"></div>
            </div>
            <div style="font-size:24px;font-weight:700;margin-top:6px;color:${gaugeColor}">${pctOfTarget}%</div>
          </div>
        </div>
        <hr class="mt-3 mb-3" style="border-color:var(--border)">
        <div class="flex-gap-md">
          <div>
            <span class="text-xs text-muted">${strings.adaptive.consistencyScore}</span>
            <div style="font-size:20px;font-weight:700">${consistencyPct}%</div>
            <span class="text-xs text-muted">${consistentWeeks} ${strings.adaptive.weeksOnTrack}</span>
          </div>
          <div style="flex:1;padding:8px 12px;background:var(--bg-tertiary);border-radius:8px">
            ${!onTrack ? `<span style="color:var(--warning)">⚠ ${strings.adaptive.needsAdjustment}</span>` : `<span style="color:var(--success)">✓ ${strings.adaptive.onTrack}</span>`}
            ${!onTrack && Math.abs(actualRate) < pace ? `<p class="text-xs" style="margin-top:4px">${strings.adaptive.increaseDeficit} ${Math.round((pace - Math.abs(actualRate)) * 7700 / 7)} ${strings.adaptive.kcalPerDay}</p>` : ''}
            ${onTrack ? `<p class="text-xs" style="margin-top:4px">${strings.adaptive.maintainPace}</p>` : ''}
          </div>
        </div>
      `;
    } catch (e) {
      console.error('loadAdherence error:', e);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdherence });
    }
  }

  async function loadRecomp() {
    if (window._recompChart) { window._recompChart.destroy(); window._recompChart = null; }
    const el = document.getElementById('recomp-detection');
    el.innerHTML = skeletonChart();
    try {
      const sets = await safeCall(api.getMeasurementSets(), []);
      const profile = await safeCall(api.getProfile(), null);

      if (!sets || sets.length < 2 || !profile) {
        renderStateCard(el, { title: strings.adaptive.recompDetection, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadRecomp });
        return;
      }

      const descSorted = [...sets].sort((a, b) => b.date.localeCompare(a.date));
      const recent = descSorted.slice(0, 4).reverse();

      const latest = recent[recent.length - 1];
      const missingMetrics = [];
      if (!latest.waist_cm) missingMetrics.push(strings.measurements.waist);
      if (!latest.neck_cm) missingMetrics.push(strings.measurements.neck);
      if (!latest.hips_cm) missingMetrics.push(strings.measurements.hips);
      if (!latest.weight_kg) missingMetrics.push(strings.measurements.weight);

      if (recent.length < 4) {
        el.innerHTML = `
          <div class="empty-state">
            <p>${strings.adaptive.recompMissingData}</p>
            <div class="sub">${recent.length}/4 ${strings.general.created}</div>
            ${missingMetrics.length > 0 ? `<div class="sub mt-2">${strings.adaptive.recompMissingMetrics} ${missingMetrics.join(', ')}</div>` : ''}
          </div>
        `;
        return;
      }

      if (missingMetrics.length > 0) {
        el.innerHTML = `
          <div class="empty-state">
            <p class="text-warning">⚠ ${strings.adaptive.recompMissingMetrics} ${missingMetrics.join(', ')}</p>
            <div class="sub">${strings.adaptive.recompMissingData}</div>
          </div>
        `;
        return;
      }

      const first = recent[0];
      const last = recent[recent.length - 1];

      const weightChange = last.weight_kg - first.weight_kg;
      const weightStable = Math.abs(weightChange) <= 0.5;
      const waistDecrease = (first.waist_cm - last.waist_cm) >= 1;
      const hipsDecrease = (first.hips_cm - last.hips_cm) >= 1;
      const isRecomp = weightStable && (waistDecrease || hipsDecrease);

      let bfFirst = null, bfLast = null;
      if (first.neck_cm && first.hips_cm && last.neck_cm && last.hips_cm) {
        bfFirst = calculateBodyFat(first.neck_cm, first.waist_cm, first.hips_cm, profile.sex, profile.height_cm);
        bfLast = calculateBodyFat(last.neck_cm, last.waist_cm, last.hips_cm, profile.sex, profile.height_cm);
      }

      const measurementsLabel = strings.energy.recompMeasurements.replace('{count}', recent.length);

      let html = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <p>${strings.adaptive.period}: ${first.date} → ${last.date} (${measurementsLabel})</p>
            <p>${strings.adaptive.weightChange}: <strong>${weightChange.toFixed(1)} kg</strong> ${weightStable ? `(${strings.adaptive.stable})` : ''}</p>
            <p>${strings.adaptive.waistChange}: <strong>${(last.waist_cm - first.waist_cm).toFixed(1)} cm</strong> ${waistDecrease ? `(${strings.adaptive.decreasing})` : ''}</p>
            ${bfFirst !== null && bfLast !== null ? `<p>${strings.adaptive.bodyFat}: ${bfFirst.toFixed(1)}% → ${bfLast.toFixed(1)}%</p>` : ''}
            <p>${strings.adaptive.status}: <strong style="color:${isRecomp ? 'var(--success)' : 'var(--text-secondary)'}">${isRecomp ? strings.adaptive.recompDetected : strings.adaptive.noRecomp}</strong></p>
          </div>
          <div>
            <div class="chart-container" style="height:200px"><canvas id="recomp-chart"></canvas></div>
          </div>
        </div>
      `;

      el.innerHTML = html;

      const ctx = document.getElementById('recomp-chart')?.getContext('2d');
      if (ctx) {
        window._recompChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: recent.map(s => s.date.slice(5)),
            datasets: [
              {
                label: strings.measurements.weight,
                data: recent.map(s => s.weight_kg),
                borderColor: chartColors.danger,
                backgroundColor: chartColorWithAlpha(chartColors.danger, 0.1),
                yAxisID: 'y',
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
              },
              {
                label: strings.measurements.waist,
                data: recent.map(s => s.waist_cm),
                borderColor: chartColors.warning,
                backgroundColor: chartColorWithAlpha(chartColors.warning, 0.1),
                yAxisID: 'y1',
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { type: 'linear', position: 'left', title: { display: true, text: strings.dashboard.unitKg } },
              y1: { type: 'linear', position: 'right', title: { display: true, text: strings.measurements.unitCm }, grid: { drawOnChartArea: false } },
              x: { grid: { display: false } },
            },
            plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, titleColor: chartColors.textPrimary, bodyColor: chartColors.textSecondary } },
          },
        });
      }
    } catch (e) {
      console.error('loadRecomp error:', e);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadRecomp });
    }
  }

  async function loadAdjustments() {
    const el = document.getElementById('adjustment-recs');
    el.innerHTML = skeletonCard();
    try {
      const profile = await safeCall(api.getProfile(), null);
      const pace = parseFloat(document.getElementById('target-pace').value);

      if (!profile) {
        renderStateCard(el, { title: strings.adaptive.slotAdjustments, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdjustments });
        return;
      }

      const balance = await safeCall(api.getEnergyBalance(new Date().toISOString().split('T')[0]), null);
      if (!balance) {
        renderStateCard(el, { title: strings.adaptive.slotAdjustments, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdjustments });
        return;
      }

      if (!balance.planned_intake || balance.planned_intake === 0) {
        renderStateCard(el, { title: strings.adaptive.slotAdjustments, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdjustments });
        return;
      }

      const deficitPerKg = 7700;
      const targetDeficit = pace * deficitPerKg / 7;
      const currentDeficit = balance.tdee - balance.planned_intake;
      const deficitGap = targetDeficit - currentDeficit;

      const safeMin = profile.sex === 'female' ? 1200 : 1500;
      const currentIntake = balance.planned_intake;

      let html = `<p>${strings.adaptive.currentDailyDeficit}: <strong>${currentDeficit.toFixed(0)} kcal</strong></p>`;
      html += `<p>${strings.adaptive.targetDailyDeficitLabel}: <strong>${targetDeficit.toFixed(0)} kcal</strong></p>`;
      html += `<p>${strings.adaptive.adjustmentNeeded}: <strong>${deficitGap > 0 ? '+' : ''}${deficitGap.toFixed(0)} kcal</strong></p>`;

      const carbAdjust = deficitGap > 0 ? Math.min(deficitGap / 4, currentIntake * 0.2 / 4) : Math.max(deficitGap / 4, -currentIntake * 0.2 / 4);
      const fatAdjust = deficitGap > 0 ? Math.min(deficitGap / 9, currentIntake * 0.2 / 9) : Math.max(deficitGap / 9, -currentIntake * 0.2 / 9);

      if (Math.abs(deficitGap) > 50) {
        const cappedCarbAdjust = Math.abs(carbAdjust);
        const cappedFatAdjust = Math.abs(fatAdjust);

        html += `
          <p class="mt-3" style="font-weight:bold">${strings.adaptive.slotAdjustments}:</p>
          <p>${strings.adaptive.reduceCarbs}: <strong>~${cappedCarbAdjust.toFixed(0)}g</strong></p>
          <p>${strings.adaptive.reduceFats}: <strong>~${cappedFatAdjust.toFixed(0)}g</strong></p>
          <p class="text-xs text-muted" style="margin-top:4px">${strings.adaptive.maxAdjustment}</p>
        `;

        html += `
          <div class="mt-4 flex-gap-sm">
            <button class="btn btn-primary" id="btn-accept-adjustment">${strings.adaptive.applyRecommendation}</button>
            <button class="btn btn-secondary" id="btn-dismiss-adjustment">${strings.adaptive.dismiss}</button>
          </div>
        `;
      } else {
        html += `<p class="text-success mt-2">${strings.adaptive.adjustmentApplied}</p>`;
      }

      el.innerHTML = html;

      const acceptBtn = document.getElementById('btn-accept-adjustment');
      const dismissBtn = document.getElementById('btn-dismiss-adjustment');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', async () => {
          const result = await safeCall(api.adjustMealGrams({ carbDelta: -carbAdjust, fatDelta: -fatAdjust }), null);
          if (!result || !result.ok) {
            renderStateCard(el, { title: strings.adaptive.slotAdjustments, state: 'error', subtitle: strings.states.errorLoading });
            return;
          }
          if (result.ok) {
            let changesHtml = `<p class="text-success" style="font-weight:bold">${strings.diet.adjustApplied}</p>`;
            if (result.changes && result.changes.length > 0) {
              changesHtml += `<ul class="text-sm" style="margin-top:8px;padding-left:20px">`;
              for (const ch of result.changes) {
                changesHtml += `<li>${ch.name}: ${ch.oldGrams} → ${ch.newGrams}</li>`;
              }
              changesHtml += `</ul>`;
            }
            el.innerHTML = changesHtml;
            await safeCall(api.setSetting('last_adjustment', JSON.stringify({
              date: new Date().toISOString().split('T')[0],
              pace,
              targetDeficit,
              currentDeficit,
              deficitGap,
            })), null);
            loadHistory();
          }
        });
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.adjustmentDismissed}</p></div>`;
        });
      }
    } catch (e) {
      console.error('loadAdjustments error:', e);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadAdjustments });
    }
  }

  async function loadDeficitImpact() {
    const el = document.getElementById('deficit-impact');
    el.innerHTML = skeletonCard();
    try {
      const profile = await safeCall(api.getProfile(), null);
      if (!profile) {
        renderStateCard(el, { title: strings.adaptive.deficitImpact, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDeficitImpact });
        return;
      }

      const templates = await safeCall(api.getMealTemplates(), []);
      if (!templates || templates.length === 0) {
        renderStateCard(el, { title: strings.adaptive.deficitImpact, state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDeficitImpact });
        return;
      }

      const seenSlots = new Set();
      const defaultTemplates = [];
      for (const tmpl of templates) {
        if (!seenSlots.has(tmpl.slot_order)) {
          seenSlots.add(tmpl.slot_order);
          defaultTemplates.push(tmpl);
        }
      }

      let pdfBaselineKcal = 0;
      for (const tmpl of defaultTemplates) {
        for (const comp of tmpl.components || []) {
          pdfBaselineKcal += (comp.default_grams / 100) * comp.kcal_per_100g;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const plan = await safeCall(api.getDailyPlan(today), null);
      let currentIntakeKcal = 0;
      if (!plan) {
        el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.deficitImpactEmpty}</p></div>`;
        return;
      }
      for (const entry of plan) {
        currentIntakeKcal += (entry.grams / 100) * entry.kcal_per_100g;
      }

      const diff = currentIntakeKcal - pdfBaselineKcal;
      const diffPct = pdfBaselineKcal > 0 ? Math.round((diff / pdfBaselineKcal) * 100) : 0;

      el.innerHTML = `
        <p>${strings.adaptive.pdfBaseline}: <strong>${pdfBaselineKcal.toFixed(0)} kcal</strong></p>
        <p>${strings.adaptive.currentIntake} (hoy): <strong>${currentIntakeKcal > 0 ? currentIntakeKcal.toFixed(0) + ' kcal' : strings.general.noData}</strong></p>
        ${currentIntakeKcal > 0 ? `
          <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
            <span class="text-sm">${strings.adaptive.difference}:</span>
            <span style="font-weight:700;color:${diff < 0 ? 'var(--success)' : 'var(--danger)'}">${diff > 0 ? '+' : ''}${diff.toFixed(0)} kcal</span>
            <span class="text-xs text-muted">(${diffPct > 0 ? '+' : ''}${diffPct}%)</span>
          </div>
          <div style="width:100%;height:12px;background:var(--bg-tertiary);border-radius:6px;overflow:hidden;margin-top:6px">
            <div style="width:${Math.min(100, Math.abs(diffPct) * 3)}%;height:100%;background:${diff < 0 ? 'var(--success)' : 'var(--danger)'};border-radius:6px"></div>
          </div>
        ` : ''}
      `;
    } catch (e) {
      console.error('loadDeficitImpact error:', e);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadDeficitImpact });
    }
  }

  async function loadHistory() {
    const el = document.getElementById('adjustment-history');
    el.innerHTML = skeletonCard();
    try {
      const lastAdj = await safeCall(api.getSetting('last_adjustment'), null);
      if (!lastAdj) {
        el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.historyEmpty}</p></div>`;
        return;
      }
      let adj;
      try {
        adj = JSON.parse(lastAdj);
      } catch {
        el.innerHTML = `<div class="empty-state"><p>${strings.adaptive.historyEmpty}</p></div>`;
        return;
      }
      el.innerHTML = `
        <div class="data-table-wrapper"><table class="data-table">
          <thead><tr><th>${strings.adaptive.adjDate}</th><th>${strings.adaptive.adjPace}</th><th>${strings.adaptive.adjTargetDeficit}</th><th>${strings.adaptive.adjCurrentDeficit}</th><th>${strings.adaptive.adjGap}</th></tr></thead>
          <tbody>
            <tr>
              <td>${adj.date}</td>
              <td>${adj.pace} ${strings.adaptive.kgPerWeekShort}</td>
              <td>${adj.targetDeficit.toFixed(0)} kcal</td>
              <td>${adj.currentDeficit.toFixed(0)} kcal</td>
              <td>${adj.deficitGap > 0 ? '+' : ''}${adj.deficitGap.toFixed(0)} kcal</td>
            </tr>
          </tbody>
        </table></div>
      `;
    } catch (e) {
      console.error('loadHistory error:', e);
      renderStateCard(el, { state: 'error', subtitle: strings.states.errorLoading, onRetry: loadHistory });
    }
  }

  loadAll();
  } finally {
    window._loadingEnergy = false;
  }
}
