/* Birthday in π — main application */
(function () {
  'use strict';

  const TOTAL_DIGITS = 1_000_001; // "3" + 1 million decimal places
  const CONTEXT_DIGITS = 25; // digits to show before and after match

  let piDigits = null;

  const $ = (id) => document.getElementById(id);
  const show = (el) => el && el.classList.remove('hidden');
  const hide = (el) => el && el.classList.add('hidden');

  function showLoading() {
    show($('loading'));
    hide($('result'));
  }

  function hideLoading() {
    hide($('loading'));
  }

  async function loadPiDigits() {
    if (piDigits) return piDigits;
    showLoading();
    try {
      const res = await fetch('pi-digits.txt');
      const text = await res.text();
      piDigits = text.replace(/\s/g, ''); // strip whitespace
      return piDigits;
    } finally {
      hideLoading();
    }
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function buildBirthdayPermutations(month, day, year) {
    const m = pad2(month);
    const d = pad2(day);
    const yFull = String(year);
    const yShort = yFull.slice(-2);
    const permutations = [];
    // Order: MMDDYYYY, MDDYYYY, MMDDYY, MDDYY
    if (m !== '00' && d !== '00') {
      permutations.push(m + d + yFull);  // 07201991
      if (month < 10) permutations.push(String(month) + d + yFull);  // 7201991
      permutations.push(m + d + yShort);  // 072091
      if (month < 10) permutations.push(String(month) + d + yShort);  // 72091
    }
    return [...new Set(permutations)]; // dedupe
  }

  function nameToDigits(name) {
    return name
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .map((c) => c.charCodeAt(0) - 64)
      .filter((n) => n >= 1 && n <= 26)
      .map(String)
      .join('');
  }

  function searchInPi(digits, permutations) {
    for (const p of permutations) {
      const pos = digits.indexOf(p);
      if (pos >= 0) return { found: true, position: pos, matched: p };
    }
    return { found: false, tried: permutations };
  }

  function formatSurrounding(digits, position, matched) {
    const start = Math.max(0, position - CONTEXT_DIGITS);
    const end = Math.min(digits.length, position + matched.length + CONTEXT_DIGITS);
    const before = digits.slice(start, position);
    const after = digits.slice(position + matched.length, end);
    return { before, match: matched, after };
  }

  function renderResult(type, data) {
    const resultEl = $('result');
    show(resultEl);
    resultEl.className = 'result-section ' + (data.found ? 'found' : 'not-found');

    if (data.found) {
      const { position, matched, tried } = data;
      const pct = ((position / piDigits.length) * 100).toFixed(2);
      const { before, match, after } = formatSurrounding(piDigits, position, matched);

      resultEl.innerHTML = `
        <div class="result-status">✓ Found!</div>
        <div class="result-detail">
          The string <strong>${matched}</strong> appears at position <strong>${position + 1}</strong> 
          (1-indexed) in the first ${(TOTAL_DIGITS - 1).toLocaleString()} digits of π.
        </div>
        <div class="position-bar">
          <div class="position-fill" style="width: ${pct}%"></div>
        </div>
        <div class="position-label">
          About ${pct}% through the first million digits
        </div>
        <div class="digits-display">
          <span class="before">…${before}</span><span class="match animate">${match}</span><span class="after">${after}…</span>
        </div>
        ${tried && tried.length > 1 ? `<div class="permutations-tried">Matched using: ${matched}</div>` : ''}
      `;
    } else {
      const tried = data.tried || [];
      resultEl.innerHTML = `
        <div class="result-status">Not found</div>
        <div class="result-detail">
          None of the searched strings (${tried.join(', ') || '—'}) appear in the first ${(TOTAL_DIGITS - 1).toLocaleString()} digits of π.
        </div>
        <p class="hint">Try a different format or check your input. Longer dates are less likely to appear in the first million digits.</p>
      `;
    }
  }

  function handleBirthdaySubmit(e) {
    e.preventDefault();
    const month = $('month').value;
    const day = $('day').value;
    const year = $('year').value;

    if (!month || !day || !year) {
      alert('Please select month, day, and year.');
      return;
    }

    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);

    if (d < 1 || d > 31 || y < 1 || y > 9999) {
      alert('Please enter a valid day (1–31) and year.');
      return;
    }

    loadPiDigits().then((digits) => {
      const permutations = buildBirthdayPermutations(m, d, y);
      const result = searchInPi(digits, permutations);
      result.tried = permutations;
      renderResult('birthday', result);
    });
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    const name = $('name-input').value.trim();
    if (!name) {
      alert('Please enter a name.');
      return;
    }

    const digitStr = nameToDigits(name);
    if (!digitStr) {
      alert('Please enter at least one letter (A–Z).');
      return;
    }

    loadPiDigits().then((digits) => {
      const result = searchInPi(digits, [digitStr]);
      result.tried = [digitStr];
      renderResult('name', result);
    });
  }

  $('birthday-form').addEventListener('submit', handleBirthdaySubmit);
  $('name-form').addEventListener('submit', handleNameSubmit);

  // Preload digits when page is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadPiDigits().catch(() => {}), { timeout: 3000 });
  }
})();
