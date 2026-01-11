const HYPERTENSION_API = 'http://127.0.0.1:5000/check_hypertension';

function setResult(el, text, ok = true) {
  if (!el) return;
  el.innerHTML = `<span class="badge ${ok ? 'bg-success' : 'bg-danger'} result-badge">${text}</span>`;
}

function computeBMI(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const m = h / 100.0;
  if (m <= 0) return null;
  return +(w / (m * m)).toFixed(1);
}

// Auto-calc BMI for hypertension form
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // hypertension form fields
    const heightHyp = document.getElementById('height-hyp');
    const weightHyp = document.getElementById('weight-hyp');
    const bmiHyp = document.getElementById('bmi-hyp');

    function wire(hEl, wEl, bEl) {
      if (!hEl || !wEl || !bEl) return;
      function update() {
        const bmi = computeBMI(hEl.value, wEl.value);
        if (bmi === null) bEl.value = '';
        else bEl.value = bmi;
      }
      hEl.addEventListener('input', update);
      wEl.addEventListener('input', update);
      update();
    }

    wire(heightHyp, weightHyp, bmiHyp);
  });
})();

// Prefill diet score from questionnaire if available
document.addEventListener('DOMContentLoaded', () => {
  // prefill stress score for hypertension form
  const stressEl = document.querySelector('input[name="stress_score"]');
  const stressSourceEl = document.getElementById('stress-source');
  if (stressEl) {
    const sc = localStorage.getItem('stress_score');
    if (sc) {
      stressEl.value = sc;
      stressEl.readOnly = true;
      stressEl.classList.add('bg-light');
      if (stressSourceEl) stressSourceEl.textContent = 'Stress score prefilled from questionnaire (not editable).';
    } else {
      stressEl.readOnly = false;
      stressEl.classList.remove('bg-light');
    }
  }
  // prefill salt score for hypertension form
  const saltEl = document.querySelector('input[name="salt"]');
  const saltSourceEl = document.getElementById('salt-source');
  if (saltEl) {
    const ss = localStorage.getItem('salt_score');
    if (ss) {
      saltEl.value = ss;
      saltEl.readOnly = true;
      saltEl.classList.add('bg-light');
      if (saltSourceEl) saltSourceEl.textContent = 'Salt score prefilled from questionnaire (not editable).';
    } else {
      saltEl.readOnly = false;
      saltEl.classList.remove('bg-light');
    }
  }
});

function renderHypertensionResult(container, status) {
  const yes = String(status).toLowerCase() === 'yes';
  const cls = yes ? 'status-yes' : 'status-no';
  const icon = yes ? '<i class="ri-heart-pulse-fill" style="font-size:18px"></i>' : '<i class="ri-shield-check-fill" style="font-size:18px"></i>';
  const html = `
    <div class="result-card">
      <div class="result-circle ${cls}">${icon}</div>
      <div>
        <p class="result-label">Hypertension</p>
        <p class="result-sub">${yes ? 'Yes' : 'No'}</p>
      </div>
    </div>`;
  if (container) container.innerHTML = html;
}


function renderHypertensionResultFull(container, data) {
  const raw = data || {};
  // determine category
  const statusRaw = (raw.hypertension_status || raw.status || raw.category || '').toString().toLowerCase();
  // map multiple possible outputs to normalized keys
  let category = 'normal';
  if (statusRaw.includes('hypert') || statusRaw === 'yes') category = 'hypertension';
  else if (statusRaw.includes('pre') || statusRaw === 'prehypertension' || statusRaw === 'pre-hypertension') category = 'prehypertension';
  else if (statusRaw.includes('normal') || statusRaw === 'no' || statusRaw === '') category = 'normal';

  const prob = raw?.probability ?? raw?.prob ?? raw?.probabilities?.hypertension ?? null;
  const pct = (typeof prob === 'number') ? Math.round(prob * 100) : null;

  const guidance = {
    'normal': {
      title: 'Normal blood pressure',
      summary: 'No current evidence of hypertension based on provided information.',
      actions: [
        'Maintain a balanced diet low in salt.',
        'Exercise regularly and manage weight.',
        'Check blood pressure periodically (home or clinic).' 
      ],
      note: 'If symptoms develop or readings change, seek medical advice.'
    },
    'prehypertension': {
      title: 'Elevated blood pressure (Prehypertension)',
      summary: 'Elevated readings; lifestyle changes recommended and monitoring advised.',
      actions: [
        'Reduce dietary salt and limit processed foods.',
        'Increase physical activity and aim for weight reduction if needed.',
        'Monitor blood pressure at home and keep a log for clinicians.'
      ],
      note: 'Discuss results with your clinician for early intervention.'
    },
    'hypertension': {
      title: 'Hypertension — Action recommended',
      summary: 'Findings suggest probable hypertension; timely clinical review is advised.',
      actions: [
        'Arrange clinical assessment and discuss treatment options.',
        'Adhere to prescribed medications and lifestyle recommendations.',
        'Monitor blood pressure closely and check for related conditions.'
      ],
      note: 'If you have symptoms like severe headache, chest pain, or breathlessness, seek immediate care.'
    }
  };

  const info = guidance[category] || guidance.normal;
  const statusLabel = category === 'hypertension' ? 'Likely Hypertension' : (category === 'prehypertension' ? 'Elevated blood pressure' : 'Normal');
  const statusClass = category === 'hypertension' ? 'status-yes' : 'status-no';
  const icon = category === 'hypertension' ? '<i class="ri-heart-pulse-fill" style="font-size:20px"></i>' : '<i class="ri-shield-check-fill" style="font-size:20px"></i>';

  const actionsHtml = info.actions.map(a => `<li>${a}</li>`).join('');

  const html = `
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3">
          <div class="result-circle ${statusClass}">${icon}</div>
          <div>
            <h4 class="mb-1">${info.title}</h4>
            <p class="mb-1">${info.summary}</p>
            <p class="small text-muted mb-0">Probability: ${pct !== null ? pct + '%' : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="card mb-3">
          <div class="card-body">
            <h5>Recommended actions</h5>
            <ul>${actionsHtml}</ul>
            <p class="small text-muted">${info.note}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <h6>Resources</h6>
            <ul>
              <li><a href="https://www.heart.org/" target="_blank" rel="noopener">American Heart Association</a></li>
              <li><a href="https://www.who.int/health-topics/hypertension" target="_blank" rel="noopener">WHO — Hypertension</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-3">
          <div class="card-body">
            <h6>Next steps</h6>
            <div class="d-grid gap-2">
              <button id="print-report-hyp" class="btn btn-outline-secondary">Print report</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  container.innerHTML = html;

  const printBtn = document.getElementById('print-report-hyp');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
  const savePdf = document.getElementById('save-pdf-hyp');
  if (savePdf) savePdf.addEventListener('click', () => alert('Use your browser print dialog to save as PDF.'));
}


// Hypertension form handler
const hypForm = document.getElementById('hypertension-form');
if (hypForm) {
  hypForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = document.getElementById('hypertension-result');
    setResult(out, 'Checking...', true);
    const fd = new FormData(hypForm);
    const body = {};
    for (const [k, v] of fd.entries()) {
      // Exclude height/weight fields 
      if (/height|weight/i.test(k)) continue;
      if (['bp', 'family_history', 'smoke'].includes(k)) body[k] = v;
      else body[k] = isNaN(v) ? v : parseFloat(v);
    }

    // If the quiz previously computed scores, 
    if (body.stress_score === undefined) {
      const sc = localStorage.getItem('stress_score');
      if (sc !== null) body.stress_score = parseFloat(sc);
    }
    if (body.salt === undefined) {
      const ss = localStorage.getItem('salt_score');
      if (ss !== null) body.salt = parseFloat(ss);
    }

    // If BMI is missing, attempt to compute it 
    if (body.bmi === undefined || body.bmi === '' || Number.isNaN(Number(body.bmi))) {
      // Try common form names first, then fall back to DOM IDs
      const hCandidates = [fd.get('height'), fd.get('height_cm'), fd.get('height-hyp'), fd.get('height_hyp'), document.getElementById('height-hyp')?.value, document.getElementById('height')?.value];
      const wCandidates = [fd.get('weight'), fd.get('weight_kg'), fd.get('weight-hyp'), fd.get('weight_hyp'), document.getElementById('weight-hyp')?.value, document.getElementById('weight')?.value];
      const h = hCandidates.find(v => v !== null && v !== undefined && v !== '');
      const w = wCandidates.find(v => v !== null && v !== undefined && v !== '');
      const bmiCalc = (h && w) ? computeBMI(h, w) : null;
      if (bmiCalc !== null) body.bmi = bmiCalc;
    }
    try {
      const res = await fetch(HYPERTENSION_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('hypertension_result', JSON.stringify(data));
      localStorage.setItem('hypertension_input', JSON.stringify(body));
      setResult(out, 'Redirecting...', true);
      window.location.href = 'hypertension_result.html';
    } catch (err) {
      setResult(out, 'Error', false);
      console.error(err);
    }
  });
}
