const DIABETES_API = 'http://127.0.0.1:5000/check_diabetes';

function setResult(el, text, ok = true) {
  if (!el) return;
  el.innerHTML = `<span class="badge ${ok ? 'bg-success' : 'bg-danger'} result-badge">${text}</span>`;
}

function renderDiabetesResult(container, status) {
  const map = { 'stage_1': { pct: 33, cls: 'severity-low', label: 'Stage 1' }, 'stage_2': { pct: 66, cls: 'severity-medium', label: 'Stage 2' }, 'stage_3': { pct: 100, cls: 'severity-high', label: 'Stage 3' } };
  const info = map[status] || { pct: 0, cls: 'severity-low', label: status };
  const ringStyle = `background: conic-gradient(var(--clr, #10b981) ${info.pct}%, rgba(0,0,0,0.08) ${info.pct}% 100%);`;
  const colorVar = info.cls === 'severity-high' ? '#ef4444' : (info.cls === 'severity-medium' ? '#f59e0b' : '#10b981');
  const html = `
    <div class="result-card">
      <div class="circle-ring" style="${ringStyle}; --clr: ${colorVar};">
        <div class="circle-inner">${info.pct}%</div>
      </div>
      <div>
        <p class="result-label">Diabetes prediction</p>
        <p class="result-sub">${info.label}</p>
      </div>
    </div>`;
  if (container) container.innerHTML = html;
}

// Auto-calc BMI for diabetes form
(function(){
  function computeBMI(heightCm, weightKg) {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w) return null;
    const m = h / 100.0;
    if (m <= 0) return null;
    return +(w / (m * m)).toFixed(1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // diabetes form fields
    const heightEl = document.getElementById('height-input');
    const weightEl = document.getElementById('weight-input');
    const bmiEl = document.getElementById('bmi-input');

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

    wire(heightEl, weightEl, bmiEl);
  });
})();

// Prefill diet score from questionnaire if available
document.addEventListener('DOMContentLoaded', () => {
  const dietEl = document.querySelector('input[name="diet_food_habits"]');
  const dietSourceEl = document.getElementById('diet-source');
  if (dietEl) {
    const s = localStorage.getItem('diet_score');
    if (s) {
      dietEl.value = s;
      dietEl.readOnly = true;
      dietEl.classList.add('bg-light');
      if (dietSourceEl) dietSourceEl.textContent = 'Diet score prefilled from questionnaire (not editable).';
    } else {
      dietEl.readOnly = false;
      dietEl.classList.remove('bg-light');
    }
  }
});


function renderDiabetesResultFull(container, data) {
  const status = (data?.diabetes_status || data?.status || 'unknown').toString();
  const probs = data?.probabilities || data?.prob || data?.probability;
  let pct = null;
  if (typeof probs === 'number') pct = Math.round(probs * 100);
  else if (probs && typeof probs === 'object') {
    const vals = Object.values(probs).map(v => Number(v) || 0);
    pct = Math.round(Math.max(...vals) * 100);
  }

  const guidanceMap = {
    'stage_1': {
      title: 'Stage 1 — Low risk',
      summary: 'Early-stage risk detected. Action on lifestyle can reduce progression.',
      actions: [
        'Adopt a balanced diet: reduce processed sugars and refined carbs.',
        'Increase physical activity: aim for 150 minutes of moderate exercise weekly.',
        'Weight management: gradual weight loss if BMI is elevated.',
        'Schedule routine follow-up and monitoring of glucose.'
      ],
      note: 'Review with your primary care clinician for personalised targets.'
    },
    'stage_2': {
      title: 'Stage 2 — Moderate risk',
      summary: 'Marked risk that may require clinical intervention and closer follow-up.',
      actions: [
        'Discuss medication options and follow clinician recommendations.',
        'Structured lifestyle program: dietary counseling and exercise plan.',
        'Monitor blood glucose regularly and keep a log for appointments.',
        'Check for comorbidities: blood pressure and lipid profile.'
      ],
      note: 'Consider specialist referral if risk factors are complex.'
    },
    'stage_3': {
      title: 'Stage 3 — High risk',
      summary: 'High risk detected. Timely medical assessment is recommended.',
      actions: [
        'Arrange urgent clinical review and discuss treatment intensification.',
        'Follow prescribed medications and obtain clear monitoring instructions.',
        'Assess for complications and consider specialist care.',
        'Keep emergency contact plan in case of acute symptoms.'
      ],
      note: 'If you experience severe symptoms (chest pain, breathlessness, sudden vision changes), seek emergency care.'
    }
  };

  const info = guidanceMap[status] || {
    title: 'Result', summary: 'Result available. Consult a healthcare professional for interpretation.', actions: ['Discuss results with your clinician.'], note: ''
  };

  const ringPct = pct ?? (status === 'stage_1' ? 33 : status === 'stage_2' ? 66 : status === 'stage_3' ? 100 : 0);
  const ringStyle = `background: conic-gradient(var(--clr, #10b981) ${ringPct}%, rgba(0,0,0,0.08) ${ringPct}% 100%);`;
  const colorVar = status === 'stage_3' ? '#ef4444' : (status === 'stage_2' ? '#f59e0b' : '#10b981');

  const actionsHtml = info.actions.map(a => `<li>${a}</li>`).join('');

  const html = `
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="d-flex align-items-center gap-3">
          <div class="circle-ring" style="${ringStyle}; --clr: ${colorVar};">
            <div class="circle-inner">${ringPct}%</div>
          </div>
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
              <li><a href="https://www.who.int/" target="_blank" rel="noopener">World Health Organization</a> — general guidance and resources.</li>
              <li><a href="https://www.cdc.gov/" target="_blank" rel="noopener">CDC</a> — diabetes prevention and management.</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-3">
          <div class="card-body">
            <h6>Next steps</h6>
            <div class="d-grid gap-2">
              <button id="print-report" class="btn btn-outline-secondary">Print report</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  container.innerHTML = html;

  // attach  handlers
  const printBtn = document.getElementById('print-report');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
  const savePdf = document.getElementById('save-pdf');
  if (savePdf) savePdf.addEventListener('click', () => alert('Use your browser print dialog to save as PDF.'));
}

// Diabetes form handler
const diabetesForm = document.getElementById('diabetes-form');
if (diabetesForm) {
  diabetesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = document.getElementById('diabetes-result');
    setResult(out, 'Sending...', true);
    const fd = new FormData(diabetesForm);
    const body = {};
    for (const [k, v] of fd.entries()) {
      if (k === 'gender') body[k] = (String(v).toLowerCase() === 'male') ? 1 : 0;
      else if (['blood_pressure', 'cholesterol_lipid_levels', 'vision_changes'].includes(k)) body[k] = (String(v).toLowerCase() === 'yes') ? 1 : 0;
      else body[k] = isNaN(v) ? v : parseFloat(v);
    }
    try {
      const res = await fetch(DIABETES_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('diabetes_result', JSON.stringify(data));
      localStorage.setItem('diabetes_input', JSON.stringify(body));
      setResult(out, 'Redirecting...', true);
      window.location.href = 'diabetes_result.html';
    } catch (err) {
      setResult(out, 'Error', false);
      console.error(err);
    }
  });
}

