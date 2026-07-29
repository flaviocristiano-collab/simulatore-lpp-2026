



(function() {
    const dropZone = document.getElementById('bpDropZone');
    const preview = document.getElementById('bpPreview');
    const fileInput = document.getElementById('bpFileInput');

    // Drag & drop events
    ['dragenter','dragover','dragleave','drop'].forEach(evt => {
      dropZone.addEventListener(evt, preventDefaults, false);
    });
    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter','dragover'].forEach(evt => {
      dropZone.addEventListener(evt, () => dropZone.classList.add('drag-over'), false);
    });
    ['dragleave','drop'].forEach(evt => {
      dropZone.addEventListener(evt, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) handleBPFile(files[0]);
    }, false);

    window.handleBPFile = function(file) {
      if (!file) return;
      document.getElementById('bpFileName').textContent = file.name;
      const size = file.size < 1024*1024 ? (file.size/1024).toFixed(1) + ' KB' : (file.size/(1024*1024)).toFixed(1) + ' MB';
      const ext = file.name.split('.').pop().toLowerCase();
      const icon = ext === 'pdf' ? '📕' : (['png','jpg','jpeg','webp'].includes(ext) ? '🖼️' : '📄');
      document.getElementById('bpFileMeta').textContent = ext.toUpperCase() + ' • ' + size;
      document.getElementById('bpFileIcon').textContent = icon;

      // Se è un'immagine, mostra anteprima
      if (['png','jpg','jpeg','webp'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '200px';
          img.style.maxHeight = '120px';
          img.style.borderRadius = '8px';
          img.style.border = '1px solid #e2e8f0';
          const info = document.querySelector('.bp-file-info');
          if (!info.querySelector('img')) {
            info.appendChild(img);
          } else {
            info.querySelector('img').src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }

      // Simula parsing per file PDF testuali
      if (ext === 'pdf' || ext === 'txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          // Estrazione euristica
          const salarioMatch = text.match(/(?:Salario mensile|salario)[^\d]*(\d[\d\'\.]*\d)/i);
          const lppMatch = text.match(/(?:Cassa pensione|cassa pensione)[^\d]*(\d[\d\'\.]*\d)/i);
          const avsMatch = text.match(/(?:AVS\/AI\/IPG)[^\d]*(\d[\d\'\.]*\d)/i);
          if (salarioMatch) {
            const val = parseFloat(salarioMatch[1].replace(/[\'\.]/g,'').replace(',','.'));
            if (val > 1000) document.getElementById('bp-salario-mese').value = val;
          }
          if (lppMatch) {
            const val = parseFloat(lppMatch[1].replace(/[\'\.]/g,'').replace(',','.'));
            if (val > 10) {
              document.getElementById('bp-lpp-mese').value = val;
              document.getElementById('bp-lpp-anno').value = (val * 12).toFixed(2);
            }
          }
          if (avsMatch) {
            const val = parseFloat(avsMatch[1].replace(/[\'\.]/g,'').replace(',','.'));
            if (val > 0) document.getElementById('bp-avs').value = val;
          }
          // Ricalcola annuo
          const sm = parseFloat(document.getElementById('bp-salario-mese').value) || 0;
          document.getElementById('bp-salario-anno').value = Math.round(sm * 13);
        };
        reader.readAsText(file);
      }

      dropZone.style.display = 'none';
      preview.classList.add('active');
    };

    window.resetBP = function() {
      dropZone.style.display = 'block';
      preview.classList.remove('active');
      fileInput.value = '';
      const info = document.querySelector('.bp-file-info');
      const img = info.querySelector('img');
      if (img) img.remove();
    };

    window.fillBPDefaults = function() {
      document.getElementById('bp-salario-mese').value = 1890;
      document.getElementById('bp-salario-anno').value = 24570;
      document.getElementById('bp-lpp-mese').value = 229.15;
      document.getElementById('bp-lpp-anno').value = 2749.80;
      document.getElementById('bp-avs').value = 100.17;
      document.getElementById('bp-ad').value = 20.79;
      document.getElementById('bp-cm').value = 11.53;
      document.getElementById('bp-uvg').value = 21.11;
    };

    window.applyBPToSimulator = function() {
      const salarioAnno = parseFloat(document.getElementById('bp-salario-anno').value) || 0;
      const lppMese = parseFloat(document.getElementById('bp-lpp-mese').value) || 0;

      // Compila i campi del simulatore principale
      const salaryInput = document.getElementById('salary');
      if (salaryInput) salaryInput.value = Math.round(salarioAnno);

      // Stima capitale LPP attuale (approssimazione: 10 anni di contributi)
      const currentCapitalInput = document.getElementById('currentCapital');
      if (currentCapitalInput) {
        const stima = lppMese * 12 * 10;
        currentCapitalInput.value = Math.round(stima);
      }

      // Stima età dal numero AVS se presente (non possiamo, usiamo default)
      // Calcola e aggiorna
      if (typeof calculateLPP === 'function') calculateLPP();

      // Scroll su
      document.getElementById('salary').scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Feedback visivo
      const btn = document.querySelector('.bp-btn-primary');
      const orig = btn.textContent;
      btn.textContent = '✅ Simulatore compilato!';
      btn.style.background = '#059669';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '#1e293b';
      }, 2000);
    };
  })();

function switchRiskTab(tab) {
        document.querySelectorAll('.risk-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.risk-panel').forEach(p => p.classList.remove('active'));
        event.target.classList.add('active');
        document.getElementById('risk-' + tab).classList.add('active');
      }

      function calcAI() {
        const base = parseFloat(document.getElementById('ai-avs-base').value) || 0;
        const grade = parseFloat(document.getElementById('ai-grade').value) || 0;
        const result = base * 0.8 * (grade / 100);
        document.getElementById('ai-result').textContent = 'CHF ' + Math.round(result).toLocaleString('de-CH') + '/mese';
      }

      function calcLPPInv() {
        const cap = parseFloat(document.getElementById('lpp-cap').value) || 0;
        const age = parseFloat(document.getElementById('lpp-age').value) || 45;
        const coord = parseFloat(document.getElementById('lpp-coord').value) || 50000;
        const rate = 0.07;
        const interest = 0.02;
        const yearsTo65 = Math.max(0, 65 - age);
        let projected = cap;
        for (let i = 0; i < yearsTo65; i++) {
          projected = projected * (1 + interest) + (coord * rate);
        }
        const monthly = (projected * 0.068) / 12;
        document.getElementById('lpp-proj').textContent = 'CHF ' + Math.round(projected).toLocaleString('de-CH');
        document.getElementById('lpp-rend').textContent = 'CHF ' + Math.round(monthly).toLocaleString('de-CH') + '/mese';
      }

      function calcMalattia() {
        const mesi = parseFloat(document.getElementById('mal-mesi').value) || 0;
        const contrib = parseFloat(document.getElementById('mal-contrib').value) || 0;
        const rate = (parseFloat(document.getElementById('mal-rate').value) || 2) / 100;
        let perso = 0;
        if (mesi > 24) {
          const anniExtra = (mesi - 24) / 12;
          perso = contrib * anniExtra;
        }
        document.getElementById('mal-perso').textContent = 'CHF ' + Math.round(perso).toLocaleString('de-CH');
        document.getElementById('mal-copertura').textContent = mesi <= 24 ? 'Sì (entro 24 mesi)' : '⚠️ Oltre 24 mesi — verifica cassa';
        document.getElementById('mal-copertura').style.color = mesi <= 24 ? '#059669' : '#dc2626';
      }

      function calcInfortunio() {
        const salary = parseFloat(document.getElementById('inf-salary').value) || 0;
        const grade = parseFloat(document.getElementById('inf-grade').value) || 0;
        const indennita = (salary * 0.8) / 12;
        const rendita = (salary * 0.9 * (grade / 100)) / 12;
        document.getElementById('inf-indennita').textContent = 'CHF ' + Math.round(indennita).toLocaleString('de-CH') + '/mese';
        document.getElementById('inf-rendita').textContent = 'CHF ' + Math.round(rendita).toLocaleString('de-CH') + '/mese';
      }

      // Init
      calcAI(); calcLPPInv(); calcMalattia(); calcInfortunio();

(function() {
  const CONSTANTS = {
    SOGLIA_INGRESSO: 22680,
    DEDUZIONE_COORDINAMENTO: 26460,
    TETTO_MAX: 90720,
    SALARIO_COORD_MIN: 3780,
    SALARIO_COORD_MAX: 64260,
    TASSO_INTERESSE_MIN: 0.0125,
    ALIQUOTA_CONVERSIONE_BASE: 0.068,
    RENDITA_AVS_MAX_MENSILE: 2520,
    RENDITA_AVS_MIN_MENSILE: 1260,
    ANNI_CONTRIBUZIONE_AVS_PIENA: 44,
    RIDUZIONE_AVS_PER_ANNO_LACUNA: 1 / 44,
    ANNO_CORRENTE: 2026
  };

  window.syncBirthYear = function() {
    const age = parseInt(document.getElementById('currentAge').value);
    if (!isNaN(age) && age >= 0 && age <= 120) {
      document.getElementById('birthYear').value = CONSTANTS.ANNO_CORRENTE - age;
    }
  };

  window.syncAge = function() {
    const year = parseInt(document.getElementById('birthYear').value);
    if (!isNaN(year) && year >= 1900 && year <= CONSTANTS.ANNO_CORRENTE) {
      document.getElementById('currentAge').value = CONSTANTS.ANNO_CORRENTE - year;
    }
  };

  function getAccreditoRate(age) {
    if (age < 25) return 0;
    if (age <= 34) return 0.07;
    if (age <= 44) return 0.10;
    if (age <= 54) return 0.15;
    if (age <= 65) return 0.18;
    return 0;
  }

  function getEtaRiferimento(gender, birthYear) {
    if (gender === 'M') return 65;
    if (birthYear <= 1960) return 64;
    if (birthYear === 1961) return 64.25;
    if (birthYear === 1962) return 64.5;
    if (birthYear === 1963) return 64.75;
    return 65;
  }

  function getEtaRiferimentoAVS(gender, birthYear) {
    return getEtaRiferimento(gender, birthYear);
  }

  function getAliquotaConversione(retirementAge, baseAge) {
    const diff = retirementAge - baseAge;
    const adjustment = diff * (diff < 0 ? -0.0018 : 0.0012);
    return CONSTANTS.ALIQUOTA_CONVERSIONE_BASE + adjustment;
  }

  function calculateCoordinatedSalary(salary) {
    if (salary < CONSTANTS.SOGLIA_INGRESSO) return 0;
    const raw = Math.min(salary, CONSTANTS.TETTO_MAX) - CONSTANTS.DEDUZIONE_COORDINAMENTO;
    if (salary <= 30240) return CONSTANTS.SALARIO_COORD_MIN;
    return Math.max(CONSTANTS.SALARIO_COORD_MIN, Math.min(raw, CONSTANTS.SALARIO_COORD_MAX));
  }

  function formatCHF(value) {
    return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  window.calculateLPP = function() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const currentAge = parseInt(document.getElementById('currentAge').value) || 35;
    const birthYear = parseInt(document.getElementById('birthYear').value) || 1991;
    const gender = document.getElementById('gender').value;
    const currentCapital = parseFloat(document.getElementById('currentCapital').value) || 0;
    const interestRate = (parseFloat(document.getElementById('interestRate').value) || 2.0) / 100;
    const retirementAge = parseInt(document.getElementById('retirementAge').value) || 65;
    const capitalPayout = (parseFloat(document.getElementById('capitalPayout').value) || 25) / 100;
    const employeeSharePct = (parseFloat(document.getElementById('employeeShare').value) || 50) / 100;

    const lacuneAVS = parseFloat(document.getElementById('lacuneAVS').value) || 0;
    let lacuneLPP = parseFloat(document.getElementById('lacuneLPP').value);
    if (isNaN(lacuneLPP)) lacuneLPP = lacuneAVS;
    const anniRiscattati = parseFloat(document.getElementById('anniRiscattati').value) || 0;

    const lacuneNetAVS = Math.max(0, lacuneAVS - anniRiscattati);
    const lacuneNetLPP = Math.max(0, lacuneLPP - anniRiscattati);

    const etaRiferimento = getEtaRiferimento(gender, birthYear);
    const etaRiferimentoAVS = getEtaRiferimentoAVS(gender, birthYear);
    const coordSalary = calculateCoordinatedSalary(salary);
    const isInsured = coordSalary > 0;

    // ========== CALCOLO AVS ==========
    const fattoreAVS = Math.min(1, Math.max(0, (CONSTANTS.ANNI_CONTRIBUZIONE_AVS_PIENA - lacuneNetAVS) / CONSTANTS.ANNI_CONTRIBUZIONE_AVS_PIENA));
    const renditaAVSMensileLorda = CONSTANTS.RENDITA_AVS_MAX_MENSILE * fattoreAVS;
    const renditaAVSAnnua = renditaAVSMensileLorda * 13;

    // ========== CALCOLO LPP ==========
    const startSavingAge = Math.max(currentAge, 25);
    let capital = currentCapital;
    const yearlyData = [];
    const anniTotaliLPP = Math.max(0, retirementAge - startSavingAge);
    const anniEffettiviLPP = Math.max(0, anniTotaliLPP - lacuneNetLPP);
    const fattoreLPP = anniTotaliLPP > 0 ? (anniEffettiviLPP / anniTotaliLPP) : 0;

    if (isInsured && anniEffettiviLPP > 0) {
      for (let age = startSavingAge; age < retirementAge; age++) {
        const rate = getAccreditoRate(age);
        const annualContribution = coordSalary * rate;
        const adjustedContribution = annualContribution * fattoreLPP;
        capital = capital * (1 + interestRate) + adjustedContribution;
        yearlyData.push({ age, capital: Math.round(capital), contribution: Math.round(adjustedContribution) });
      }
    } else if (currentAge >= retirementAge) {
      capital = currentCapital * Math.pow(1 + interestRate, Math.max(0, retirementAge - currentAge));
    }

    const aliquota = getAliquotaConversione(retirementAge, etaRiferimento);
    const capitalForAnnuity = capital * (1 - capitalPayout);
    const annualPension = capitalForAnnuity * aliquota;
    const monthlyPension = annualPension / 12;
    const capitalPayoutAmount = capital * capitalPayout;

    // ========== LACUNA PREVIDENZIALE ==========
    const targetIncome = salary * 0.60;
    const totalPension = renditaAVSAnnua + annualPension;
    const gap = Math.max(0, targetIncome - totalPension);
    const gapPercent = targetIncome > 0 ? (gap / targetIncome * 100) : 0;

    const currentRate = getAccreditoRate(currentAge);
    const currentAnnualContribution = coordSalary * currentRate;
    const employeeShare = currentAnnualContribution * employeeSharePct;
    const employerShare = currentAnnualContribution * (1 - employeeSharePct);

    // ========== RENDER ==========
    let html = '';

    if (!isInsured) {
      html += `<div class="alert">
        <div class="icon">⚠️</div>
        <div class="title">Non assicurato obbligatoriamente</div>
        <div class="sub">Il salario è inferiore alla soglia d'ingresso di ${formatCHF(CONSTANTS.SOGLIA_INGRESSO)}</div>
      </div>`;
    } else {
      // KPI
      html += `<div class="kpi-grid">`;

      html += `<div class="kpi kpi-blue">
        <div class="label">Salario Coordinato</div>
        <div class="value">${formatCHF(coordSalary)}</div>
        <div class="sub">su ${formatCHF(salary)} lordo</div>
      </div>`;

      html += `<div class="kpi kpi-green">
        <div class="label">Capitale Previsto</div>
        <div class="value">${formatCHF(Math.round(capital))}</div>
        <div class="sub">a ${retirementAge} anni</div>
      </div>`;

      html += `<div class="kpi kpi-yellow">
        <div class="label">Rendita LPP Mensile</div>
        <div class="value">${formatCHF(Math.round(monthlyPension))}</div>
        <div class="sub">Aliquota ${(aliquota*100).toFixed(2)}%</div>
      </div>`;

      html += `<div class="kpi ${gap > 0 ? 'kpi-red' : 'kpi-purple'}">
        <div class="label">${gap > 0 ? 'Lacuna Prev.' : 'Surplus Prev.'}</div>
        <div class="value">${formatCHF(Math.round(Math.abs(gap)/12))}/mese</div>
        <div class="sub">${gap > 0 ? gapPercent.toFixed(0) + '% del target' : 'Copertura OK'}</div>
      </div>`;

      html += `</div>`;

      // Lacune highlight
      if (lacuneNetAVS > 0 || lacuneNetLPP > 0) {
        html += `<div class="lacune-highlight">
          <div class="title">🕳️ Impatto delle lacune previdenziali</div>
          <div class="row">
            <span>Rendita AVS senza lacune:</span>
            <strong>${formatCHF(Math.round(CONSTANTS.RENDITA_AVS_MAX_MENSILE * 13 / 12))}/mese</strong>
          </div>
          <div class="row">
            <span>Rendita AVS con lacune (${lacuneNetAVS.toFixed(1)} anni):</span>
            <strong>${formatCHF(Math.round(renditaAVSAnnua / 12))}/mese</strong>
          </div>
          <div class="row">
            <span>Riduzione AVS:</span>
            <strong style="color:#dc2626">−${((1-fattoreAVS)*100).toFixed(1)}%</strong>
          </div>
          ${lacuneNetLPP > 0 ? `<div class="row">
            <span>Anni LPP persi:</span>
            <strong style="color:#dc2626">${lacuneNetLPP.toFixed(1)} anni</strong>
          </div>` : ''}
        </div>`;
      }

      // Detail grid
      html += `<div class="detail-grid" style="margin-top:16px;">`;

      html += `<div class="detail-box">
        <h4>💰 Dettaglio contributi annuali</h4>
        <div class="detail-inner">
          <div class="detail-row">
            <span>Accredito di vecchiaia (${(currentRate*100).toFixed(0)}% del coord.):</span>
            <strong>${formatCHF(Math.round(currentAnnualContribution))}</strong>
          </div>
          <div class="detail-row" style="color:#475569">
            <span>→ Quota dipendente (${(employeeSharePct*100).toFixed(0)}%):</span>
            <span style="font-weight:600;color:#1e40af">${formatCHF(Math.round(employeeShare))}</span>
          </div>
          <div class="detail-row" style="color:#475569">
            <span>→ Quota datore di lavoro (${((1-employeeSharePct)*100).toFixed(0)}%):</span>
            <span style="font-weight:600;color:#166534">${formatCHF(Math.round(employerShare))}</span>
          </div>
          <div class="detail-row">
            <span>Capitale erogato (una tantum):</span>
            <strong>${formatCHF(Math.round(capitalPayoutAmount))}</strong>
          </div>
          <div class="detail-row">
            <span>Capitale convertito in rendita:</span>
            <strong>${formatCHF(Math.round(capitalForAnnuity))}</strong>
          </div>
          <div class="detail-row border-top">
            <span>Rendita annua LPP lorda:</span>
            <strong style="color:#059669">${formatCHF(Math.round(annualPension))}</strong>
          </div>
        </div>
      </div>`;

      html += `<div class="detail-box">
        <h4>📈 Confronto pilastri</h4>
        <div class="detail-inner">
          <div class="detail-row">
            <span>1° Pilastro (AVS):</span>
            <span class="tag">${(fattoreAVS*100).toFixed(0)}% di rendita</span>
          </div>
          <div class="detail-row">
            <span>→ Rendita AVS mensile:</span>
            <strong>${formatCHF(Math.round(renditaAVSMensileLorda))}</strong>
          </div>
          <div class="detail-row">
            <span>2° Pilastro (LPP):</span>
            <strong>${formatCHF(Math.round(monthlyPension))}/mese</strong>
          </div>
          <div class="detail-row border-top">
            <span>Totale 1° + 2° pilastro:</span>
            <strong style="color:#059669">${formatCHF(Math.round(totalPension/12))}/mese</strong>
          </div>
          <div class="detail-row">
            <span>Target (60% salario lordo):</span>
            <span>${formatCHF(Math.round(targetIncome/12))}/mese</span>
          </div>
          <div class="detail-row" style="color:${gap > 0 ? '#dc2626' : '#059669'}">
            <span>${gap > 0 ? 'Lacuna previdenziale:' : 'Surplus previdenziale:'}</span>
            <strong>${formatCHF(Math.round(Math.abs(gap)/12))}/mese</strong>
          </div>
        </div>
      </div>`;

      html += `</div>`;

      
    // ===== GRAFICO SVG EVOLUZIONE CAPITALE =====
    let chartHtml = '';
    if (yearlyData.length > 0) {

      if (yearlyData.length > 0) {
        const maxCap = Math.max(...yearlyData.map(d => d.capital));
        const minCap = Math.min(...yearlyData.map(d => d.capital));
        const range = maxCap - minCap || 1;
        const padding = { top: 10, right: 10, bottom: 30, left: 60 };
        const width = 800;
        const height = 220;
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;
        const n = yearlyData.length;

        // Scala X
        const xScale = (i) => padding.left + (i / (n - 1)) * chartW;
        // Scala Y
        const yScale = (val) => padding.top + chartH - ((val - minCap) / range) * chartH;

        // Path area (sotto la linea)
        let areaD = `M ${xScale(0)} ${padding.top + chartH}`;
        yearlyData.forEach((d, i) => {
          areaD += ` L ${xScale(i)} ${yScale(d.capital)}`;
        });
        areaD += ` L ${xScale(n - 1)} ${padding.top + chartH} Z`;

        // Path linea
        let lineD = '';
        yearlyData.forEach((d, i) => {
          lineD += (i === 0 ? 'M' : 'L') + ` ${xScale(i)} ${yScale(d.capital)}`;
        });

        // Griglia Y (5 linee)
        let gridLines = '';
        let yLabels = '';
        for (let g = 0; g <= 5; g++) {
          const yVal = minCap + (range * g / 5);
          const yPos = yScale(yVal);
          gridLines += `<line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" class="grid-line"/>`;
          yLabels += `<text x="${padding.left - 8}" y="${yPos + 3}" text-anchor="end" class="axis-text">${formatCHF(Math.round(yVal))}</text>`;
        }

        // Labels X (ogni ~5 anni)
        let xLabels = '';
        const stepX = Math.max(1, Math.floor(n / 8));
        yearlyData.forEach((d, i) => {
          if (i % stepX === 0 || i === n - 1) {
            xLabels += `<text x="${xScale(i)}" y="${height - 8}" text-anchor="middle" class="axis-text">${d.age}</text>`;
          }
        });

        // Punti
        let dots = '';
        yearlyData.forEach((d, i) => {
          dots += `<circle cx="${xScale(i)}" cy="${yScale(d.capital)}" class="dot" data-age="${d.age}" data-cap="${formatCHF(d.capital)}"/>`;
        });

        chartHtml += `<div class="chart-container">
          <div class="svg-chart-wrapper">
            <div class="chart-title">📊 Evoluzione del capitale LPP</div>
            <svg viewBox="0 0 ${width} ${height}" class="svg-chart" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.6"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
              ${gridLines}
              <path d="${areaD}" class="area-path"/>
              <path d="${lineD}" class="line-path"/>
              ${dots}
              ${yLabels}
              ${xLabels}
              <text x="${width/2}" y="${height - 2}" text-anchor="middle" class="axis-text" style="font-size:10px; fill:#64748b;">Età</text>
            </svg>
            <div class="chart-tooltip" id="chartTooltip"></div>
            <div class="chart-legend">
              <span><span class="dot-legend" style="background:#3b82f6;"></span> Capitale accumulato</span>
              <span><span class="dot-legend" style="background:#f59e0b;"></span> Capitale massimo: ${formatCHF(Math.round(maxCap))}</span>
            </div>
          </div>
        </div>`;
      }

      
    }
    document.getElementById('capital-chart').innerHTML = chartHtml;
// Tabella fasce
      html += `<div class="table-container">
        <h4 style="margin:0 0 8px; color:#334155; font-size:0.85rem; font-weight:600;">📋 Proiezione per fasce d'età</h4>
        <table>
          <thead>
            <tr>
              <th>Fascia età</th>
              <th class="right">Aliquota</th>
              <th class="right">Contributo/anno</th>
              <th class="right">Quota dip. (${(employeeSharePct*100).toFixed(0)}%)</th>
              <th class="right">Quota datore</th>
            </tr>
          </thead>
          <tbody>`;

      const fasce = [
        { label: '25–34 anni', rate: 0.07 },
        { label: '35–44 anni', rate: 0.10 },
        { label: '45–54 anni', rate: 0.15 },
        { label: '55–65 anni', rate: 0.18 }
      ];

      fasce.forEach(f => {
        const contrib = coordSalary * f.rate;
        const emp = contrib * employeeSharePct;
        const empl = contrib * (1 - employeeSharePct);
        html += `<tr>
          <td>${f.label}</td>
          <td class="right" style="font-weight:600">${(f.rate*100).toFixed(0)}%</td>
          <td class="right" style="color:#059669; font-weight:600">${formatCHF(Math.round(contrib))}</td>
          <td class="right" style="color:#1e40af; font-weight:500">${formatCHF(Math.round(emp))}</td>
          <td class="right" style="color:#166534; font-weight:500">${formatCHF(Math.round(empl))}</td>
        </tr>`;
      });

      html += `</tbody></table></div>`;
    }

    document.getElementById('results').innerHTML = html;

    // ===== TOOLTIP GRAFICO =====
    setTimeout(() => {
      const tooltip = document.getElementById('chartTooltip');
      if (!tooltip) return;
      document.querySelectorAll('.svg-chart .dot').forEach(dot => {
        dot.addEventListener('mouseenter', (e) => {
          const age = dot.getAttribute('data-age');
          const cap = dot.getAttribute('data-cap');
          tooltip.innerHTML = '<strong>' + age + ' anni</strong><br/>Capitale: ' + cap;
          tooltip.classList.add('visible');
          const rect = dot.getBoundingClientRect();
          const wrapper = dot.closest('.svg-chart-wrapper');
          const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : rect;
          tooltip.style.left = (rect.left - wrapperRect.left + 12) + 'px';
          tooltip.style.top = (rect.top - wrapperRect.top - 40) + 'px';
        });
        dot.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      });
    }, 50);
  };

  // ========== PDF DOWNLOAD ==========
  syncBirthYear();
  calculateLPP();
})();