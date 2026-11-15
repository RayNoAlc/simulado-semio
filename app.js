/**
 * SIMULADOR DE SEMIOLOGIA ORAL - VIBES DUOLINGO
 * Paleta Terrosa e Orgânica (Espresso, Chocolate, Terracota, Oliva, Argila, Marfim)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // ESTADO DA APLICAÇÃO
  // ==========================================
  const state = {
    allCases: [],
    currentFilteredCases: [],
    currentIndex: 0,
    currentCase: null,
    currentMode: 'escrito', // 'escrito' ou 'multipla'
    timerSeconds: 90,
    timerRemaining: 90,
    timerInterval: null,
    isZoomActive: false,
    isMirrored: false,
    synonyms: {},
    glossary: {},
    errorDeck: JSON.parse(localStorage.getItem('semio_error_deck') || '[]'),
    history: JSON.parse(localStorage.getItem('semio_history') || '[]'),
    userOverrides: {},
    hintsRevealed: 0,
    caseSubmissions: {},
    caseUserInputs: {},
    audioCtx: null
  };

  // ==========================================
  // ELEMENTOS DO DOM
  // ==========================================
  const el = {
    modeButtons: document.querySelectorAll('#modeControl .mode-pill-btn'),
    timerSelect: document.getElementById('timerSelect'),
    timerBox: document.getElementById('timerBox'),
    timerText: document.getElementById('timerText'),
    filterCategory: document.getElementById('filterCategory'),
    btnShuffle: document.getElementById('btnShuffle'),
    caseCounterText: document.getElementById('caseCounterText'),
    progressBarFill: document.getElementById('progressBarFill'),
    errorCountBadge: document.getElementById('errorCountBadge'),
    globalScoreBadge: document.getElementById('globalScoreBadge'),

    // Projeção
    projectorScreen: document.getElementById('projectorScreen'),
    projectorImage: document.getElementById('projectorImage'),
    magnifierLens: document.getElementById('magnifierLens'),
    caseOriginBadge: document.getElementById('caseOriginBadge'),
    btnZoomToggle: document.getElementById('btnZoomToggle'),
    btnMirrorToggle: document.getElementById('btnMirrorToggle'),

    // Formulário
    semiologiaForm: document.getElementById('semiologiaForm'),
    btnClearForm: document.getElementById('btnClearForm'),
    btnSkipCase: document.getElementById('btnSkipCase'),
    btnSubmitForm: document.getElementById('btnSubmitForm'),
    
    // Inputs
    inputLesaoFundamental: document.getElementById('inputLesaoFundamental'),
    inputInsercao: document.getElementById('inputInsercao'),
    inputSuperficie: document.getElementById('inputSuperficie'),
    inputLimites: document.getElementById('inputLimites'),
    inputColoracao: document.getElementById('inputColoracao'),
    inputLocalizacao: document.getElementById('inputLocalizacao'),
    inputLateralidade: document.getElementById('inputLateralidade'),
    inputConsistencia: document.getElementById('inputConsistencia'),
    inputDiagnostico: document.getElementById('inputDiagnostico'),
    pillsDiagnostico: document.getElementById('pillsDiagnostico'),

    // Feedback
    feedbackPanel: document.getElementById('feedbackPanel'),
    scoreValue: document.getElementById('scoreValue'),
    gradeStamp: document.getElementById('gradeStamp'),
    verdictTitle: document.getElementById('verdictTitle'),
    verdictSubtitle: document.getElementById('verdictSubtitle'),
    fatalAlertBox: document.getElementById('fatalAlertBox'),
    fatalAlertText: document.getElementById('fatalAlertText'),
    comparisonGrid: document.getElementById('comparisonGrid'),
    clinicalExplanationText: document.getElementById('clinicalExplanationText'),
    differentialsText: document.getElementById('differentialsText'),
    oralScriptText: document.getElementById('oralScriptText'),
    btnSpeakText: document.getElementById('btnSpeakText'),
    btnToggleErrorDeck: document.getElementById('btnToggleErrorDeck'),
    btnNextCase: document.getElementById('btnNextCase'),

    // Modais
    btnGuiaPatologias: document.getElementById('btnGuiaPatologias'),
    modalGuiaPatologias: document.getElementById('modalGuiaPatologias'),
    btnCloseGuiaPatologias: document.getElementById('btnCloseGuiaPatologias'),
    btnCloseGuiaPatologiasBottom: document.getElementById('btnCloseGuiaPatologiasBottom'),
    guideSearchInput: document.getElementById('guideSearchInput'),
    guideModalBody: document.getElementById('guideModalBody'),
    guideFilterTabs: document.getElementById('guideFilterTabs'),
    btnCaseGuide: document.getElementById('btnCaseGuide'),

    btnGlossario: document.getElementById('btnGlossario'),
    modalGlossario: document.getElementById('modalGlossario'),
    btnCloseGlossario: document.getElementById('btnCloseGlossario'),
    glossarySearchInput: document.getElementById('glossarySearchInput'),
    glossaryBody: document.getElementById('glossaryBody'),

    btnDeckErros: document.getElementById('btnDeckErros'),
    modalDeckErros: document.getElementById('modalDeckErros'),
    btnCloseDeckErros: document.getElementById('btnCloseDeckErros'),
    errorDeckList: document.getElementById('errorDeckList'),
    btnClearErrors: document.getElementById('btnClearErrors'),
    btnTrainErrorsNow: document.getElementById('btnTrainErrorsNow'),

    toastAlert: document.getElementById('toastAlert'),
    toastMsg: document.getElementById('toastMsg'),

    // Navegação e Revisão Rápida
    btnNavPrev: document.getElementById('btnNavPrev'),
    btnNavNext: document.getElementById('btnNavNext'),
    btnPrevCase: document.getElementById('btnPrevCase'),
    btnPrevCaseFeedback: document.getElementById('btnPrevCaseFeedback'),
    btnEditCaseAnswer: document.getElementById('btnEditCaseAnswer'),
    btnQuickBookmark: document.getElementById('btnQuickBookmark'),
    quickBookmarkLabel: document.getElementById('quickBookmarkLabel'),

    // Pistas Clínicas (Hints)
    duoHintCard: document.getElementById('duoHintCard'),
    hintCounterBadge: document.getElementById('hintCounterBadge'),
    btnRevealHint: document.getElementById('btnRevealHint'),
    hintBtnText: document.getElementById('hintBtnText'),
    hintBody: document.getElementById('hintBody'),
    hintList: document.getElementById('hintList'),
    btnJumpToHint: document.getElementById('btnJumpToHint'),

    // Visualizador de Imagem Ampliada (Lightbox)
    modalImageViewer: document.getElementById('modalImageViewer'),
    btnCloseImageViewer: document.getElementById('btnCloseImageViewer'),
    imageViewerTitle: document.getElementById('imageViewerTitle'),
    imageViewerImg: document.getElementById('imageViewerImg'),
    imageViewerCaption: document.getElementById('imageViewerCaption')
  };

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================
  async function init() {
    updateBadges();
    setupEventListeners();
    setupMagnifier();

    try {
      const resp = await fetch('assets/data/lesoes.json?v=20261115_v2');
      const data = await resp.json();
      state.allCases = data.casos;
      state.synonyms = data.sinonimos || {};
      state.glossary = data.glossario || {};

      applyFilter('oficial_22');
      populateDiagnosticoChips();
      renderGlossary();
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error('Falha ao carregar lesões:', err);
      showToast('Erro ao carregar o banco de lesões.');
    }
  }

  // Função de Embaralhamento Aleatório (Fisher-Yates)
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ==========================================
  // FILTRAGEM E SELEÇÃO DE CASOS (100% ALEATÓRIO)
  // ==========================================
  function applyFilter(filterVal) {
    let selected = [];

    if (filterVal === 'todos') {
      selected = [...state.allCases];
    } else if (filterVal === 'oficial_22') {
      selected = state.allCases.filter(c => c.id.startsWith('caso_'));
    } else if (filterVal === 'erros') {
      selected = state.allCases.filter(c => state.errorDeck.includes(c.id));
      if (selected.length === 0) {
        showToast('Nenhum caso na sua lista de revisão!');
        el.filterCategory.value = 'oficial_22';
        selected = state.allCases.filter(c => c.id.startsWith('caso_'));
      }
    } else if (filterVal === 'nodulos') {
      selected = state.allCases.filter(c => 
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('nódulo') ||
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('pápula')
      );
    } else if (filterVal === 'bolhas') {
      selected = state.allCases.filter(c => 
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('bolha') ||
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('vesícula')
      );
    } else if (filterVal === 'placas') {
      selected = state.allCases.filter(c => 
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('placa') ||
        (c.gabarito.lesao_fundamental || '').toLowerCase().includes('mancha')
      );
    }

    // Embaralha 100% a ordem de todos os casos a cada rodada/filtro
    state.currentFilteredCases = shuffleArray(selected);
    state.currentIndex = 0;
    loadCase(state.currentIndex);
  }

  // ==========================================
  // ==========================================
  // SISTEMA DE PISTAS CLÍNICAS (HINTS PROGRESSIVAS)
  // ==========================================
  function generateCaseHints(c) {
    if (!c || !c.gabarito) return [];
    const g = c.gabarito;
    const diffs = (c.diagnosticos_diferenciais || []).join(', ');
    
    // Pista 1: Inspeção Visual & Morfologia (Sítio e Tipo)
    let p1Dica = '';
    const fund = (g.lesao_fundamental || '').toLowerCase();
    if (fund.includes('bolha') || fund.includes('vesícula')) {
      p1Dica = 'Observe se a elevação tem aspecto de conteúdo líquido (translúcido/vesicular).';
    } else if (fund.includes('nódulo') || fund.includes('pápula')) {
      p1Dica = 'Observe a massa tecidual sólida circunscrita e seu relevo em relação aos tecidos vizinhos.';
    } else if (fund.includes('úlcera') || fund.includes('erosão')) {
      p1Dica = 'Atente para a solução de continuidade (perda total ou parcial de epitélio com fundo conjuntivo).';
    } else if (fund.includes('placa')) {
      p1Dica = 'Observe a área elevada e plana, de superfície levemente áspera, estriada ou verrucosa.';
    } else {
      p1Dica = 'Analise se há alteração plana de cor ou discreta elevação superficial.';
    }

    const p1 = {
      level: 1,
      title: 'Pista 1: Morfologia & Topografia',
      icon: 'eye',
      content: `<strong>Sítio Anatômico:</strong> Lesão situada em <strong>${g.localizacao}</strong> (${g.lateralidade}). Coloração: <strong>${g.coloracao}</strong> com limites <strong>${g.limites}</strong>.<br><em>${p1Dica}</em>`
    };

    // Pista 2: Palpação & Características Físicas
    const p2 = {
      level: 2,
      title: 'Pista 2: Palpação & Características Físicas',
      icon: 'hand',
      content: `<strong>Consistência ao toque esperada:</strong> <strong>${g.consistencia}</strong>.<br><strong>Base & Superfície:</strong> Inserção do tipo <strong>${g.insercao}</strong> e relevo superficial <strong>${g.superficie}</strong>.`
    };

    // Pista 3: Raciocínio & Diagnósticos Diferenciais da Cátedra
    const p3 = {
      level: 3,
      title: 'Pista 3: Pulo do Gato Diagnóstico',
      icon: 'zap',
      content: `<strong>Fisiopatologia Clínica:</strong> ${c.explicacao_clinica || 'Considere a etiopatogenia clássica.'}<br><strong>Diagnósticos Diferenciais da Cátedra:</strong> <em>${diffs || 'Considere lesões reacionais e neoplásicas da região.'}</em>`
    };

    return [p1, p2, p3];
  }

  function renderHintsUI() {
    if (!el.duoHintCard || !state.currentCase) return;

    const hints = generateCaseHints(state.currentCase);
    const total = hints.length;
    const revealed = state.hintsRevealed;

    if (el.hintCounterBadge) {
      el.hintCounterBadge.textContent = `${revealed} de ${total} ${revealed === 1 ? 'liberada' : 'liberadas'}`;
    }

    if (revealed === 0) {
      if (el.hintBtnText) el.hintBtnText.textContent = `Liberar Pista (1/${total})`;
      if (el.btnRevealHint) {
        el.btnRevealHint.disabled = false;
        el.btnRevealHint.classList.remove('all-unlocked');
      }
      if (el.hintBody) el.hintBody.style.display = 'none';
      if (el.hintList) el.hintList.innerHTML = '';
    } else {
      if (el.hintBody) el.hintBody.style.display = 'block';
      if (el.hintList) {
        el.hintList.innerHTML = '';
        for (let i = 0; i < revealed; i++) {
          const h = hints[i];
          const item = document.createElement('div');
          item.className = `hint-item hint-level-${h.level}`;
          item.innerHTML = `
            <div class="hint-item-header">
              <span class="hint-level-tag"><i data-lucide="${h.icon}"></i> ${h.title}</span>
            </div>
            <div class="hint-item-body">${h.content}</div>
          `;
          el.hintList.appendChild(item);
        }
      }

      if (revealed >= total) {
        if (el.hintBtnText) el.hintBtnText.textContent = 'Todas as pistas liberadas ✓';
        if (el.btnRevealHint) {
          el.btnRevealHint.disabled = true;
          el.btnRevealHint.classList.add('all-unlocked');
        }
      } else {
        if (el.hintBtnText) el.hintBtnText.textContent = `Liberar Pista (${revealed + 1}/${total})`;
        if (el.btnRevealHint) {
          el.btnRevealHint.disabled = false;
          el.btnRevealHint.classList.remove('all-unlocked');
        }
      }
    }

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // REVISÃO RÁPIDA (BOOKMARK)
  // ==========================================
  function updateQuickBookmarkState() {
    if (!state.currentCase || !el.btnQuickBookmark) return;
    const isSaved = state.errorDeck.includes(state.currentCase.id);
    el.btnQuickBookmark.classList.toggle('saved', isSaved);
    el.btnQuickBookmark.innerHTML = isSaved
      ? '<i data-lucide="bookmark-check"></i> <span id="quickBookmarkLabel">Salvo na Revisão</span>'
      : '<i data-lucide="bookmark"></i> <span id="quickBookmarkLabel">Revisar</span>';
    el.btnQuickBookmark.title = isSaved
      ? 'Caso salvo na revisão (clique para remover)'
      : 'Salvar este caso na lista de revisão';
    if (window.lucide) lucide.createIcons();
  }

  function toggleCaseReview(caseId) {
    const cid = caseId || (state.currentCase && state.currentCase.id);
    if (!cid) return;
    if (state.errorDeck.includes(cid)) {
      state.errorDeck = state.errorDeck.filter(id => id !== cid);
      showToast('Caso removido da lista de revisão.');
    } else {
      state.errorDeck.push(cid);
      showToast('Caso salvo na sua lista de revisão!');
    }
    localStorage.setItem('semio_error_deck', JSON.stringify(state.errorDeck));
    updateBadges();
    updateReviewButtonState();
    updateQuickBookmarkState();
    if (el.modalDeckErros && el.modalDeckErros.style.display !== 'none') {
      renderReviewModal();
    }
  }

  // CARREGAR CASO CLÍNICO
  // ==========================================
  function loadCase(index, forceShowForm = false) {
    if (!state.currentFilteredCases || state.currentFilteredCases.length === 0) return;
    
    if (index >= state.currentFilteredCases.length) {
      // Re-embaralha 100% para a próxima volta/rodada
      state.currentFilteredCases = shuffleArray(state.currentFilteredCases);
      index = 0;
      showToast('Nova rodada com casos 100% reembaralhados!');
    } else if (index < 0) {
      index = 0;
      showToast('Você já está no primeiro caso!');
    }

    state.currentIndex = index;
    state.currentCase = state.currentFilteredCases[index];
    state.userOverrides = {};

    // Atualiza badges e contadores
    const currentNum = index + 1;
    const totalNum = state.currentFilteredCases.length;
    el.caseCounterText.textContent = `Caso ${String(currentNum).padStart(2, '0')} de ${String(totalNum).padStart(2, '0')}`;
    el.progressBarFill.style.width = `${(currentNum / totalNum) * 100}%`;
    el.caseOriginBadge.textContent = state.currentCase.origem || 'Caso Oficial';

    // Atualiza estado de desativação dos botões "Anterior"
    const isFirstCase = (index === 0);
    [el.btnPrevCase, el.btnPrevCaseFeedback, el.btnNavPrev].forEach(btn => {
      if (btn) {
        btn.disabled = isFirstCase;
        btn.style.opacity = isFirstCase ? '0.4' : '1';
        btn.style.cursor = isFirstCase ? 'not-allowed' : 'pointer';
      }
    });

    el.projectorImage.src = state.currentCase.imagem;
    el.projectorImage.onload = () => {
      if (state.isZoomActive) {
        setupMagnifierBackground();
      }
    };

    // Reseta pistas para o novo caso
    state.hintsRevealed = 0;
    renderHintsUI();
    updateReviewButtonState();
    updateQuickBookmarkState();

    // VERIFICA SE O CASO JÁ FOI RESPONDIDO NESTA SESSÃO
    const prevSub = state.caseSubmissions[state.currentCase.id];
    if (prevSub && !forceShowForm) {
      // Exibe diretamente a tela de feedback com o resultado e gabarito
      clearInterval(state.timerInterval);
      if (el.timerBox) el.timerBox.style.display = 'none';
      renderDuoFeedback(
        prevSub.totalScore,
        prevSub.evaluationResults,
        prevSub.hasFatalError,
        prevSub.fatalErrorDescription,
        false // não auto-scrollar ao navegar
      );
    } else {
      // Exibe formulário para preenchimento ou edição
      el.semiologiaForm.style.display = 'block';
      el.feedbackPanel.style.display = 'none';

      // Restaura respostas anteriores (se houver) ou limpa
      const savedInputs = state.caseUserInputs[state.currentCase.id];
      if (savedInputs) {
        restoreUserAnswers(savedInputs);
      } else {
        clearFormFields();
      }

      startTimer();
    }

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // CRONÔMETRO DO PROJETOR
  // ==========================================
  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerSeconds = parseInt(el.timerSelect.value, 10);
    
    if (state.timerSeconds === 0) {
      el.timerBox.style.display = 'none';
      return;
    }

    el.timerBox.style.display = 'inline-flex';
    state.timerRemaining = state.timerSeconds;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timerRemaining--;
      updateTimerDisplay();

      if (state.timerRemaining <= 0) {
        clearInterval(state.timerInterval);
        handleTimerExpired();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timerRemaining / 60);
    const secs = state.timerRemaining % 60;
    el.timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    el.timerBox.classList.remove('warning', 'danger');
    if (state.timerRemaining <= 15) {
      el.timerBox.classList.add('danger');
    } else if (state.timerRemaining <= 30) {
      el.timerBox.classList.add('warning');
    }
  }

  function handleTimerExpired() {
    playBuzzerSound();
    showToast('Tempo esgotado! Avaliando respostas...');
    evaluateSubmission();
  }

  function playBuzzerSound() {
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = state.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // ==========================================
  // MOTOR DE AVALIAÇÃO & COMPARATIVO
  // ==========================================
  function evaluateSubmission() {
    clearInterval(state.timerInterval);
    const c = state.currentCase;
    if (!c) return;

    const userAnswers = getUserAnswers();

    const fieldWeights = {
      lesao_fundamental: 20,
      localizacao: 15,
      lateralidade: 10,
      insercao: 10,
      superficie: 10,
      coloracao: 10,
      consistencia: 10,
      diagnostico: 15
    };

    let totalScore = 0;
    const evaluationResults = [];
    let hasFatalError = false;
    let fatalErrorDescription = '';

    for (const [field, weight] of Object.entries(fieldWeights)) {
      const userVal = (userAnswers[field] || '').trim();
      let officialVal = '';
      let altVal = [];

      if (field === 'diagnostico') {
        officialVal = c.nome;
        altVal = c.diagnosticos_diferenciais || [];
      } else {
        officialVal = c.gabarito[field] || '';
        if (field === 'lesao_fundamental') {
          altVal = c.gabarito.lesao_fundamental_alt || [];
        }
      }

      const isOverride = !!state.userOverrides[field];
      let status = 'wrong'; // 'correct', 'partial', 'wrong'
      let earnedPoints = 0;

      if (isOverride) {
        status = 'correct';
        earnedPoints = weight;
      } else if (!userVal) {
        status = 'wrong';
        earnedPoints = 0;
      } else {
        const matchQuality = testMatch(field, userVal, officialVal, altVal);
        if (matchQuality >= 0.85) {
          status = 'correct';
          earnedPoints = weight;
        } else if (matchQuality >= 0.5) {
          status = 'partial';
          earnedPoints = Math.round(weight * 0.6);
        } else {
          status = 'wrong';
          earnedPoints = 0;
        }
      }

      totalScore += earnedPoints;
      evaluationResults.push({
        field,
        fieldLabel: getFieldLabel(field),
        userVal: userVal || 'Não preenchido',
        officialVal,
        status,
        weight,
        earnedPoints
      });
    }

    // Alerta de Erro Crasso
    const fatalCheck = checkFatalError(userAnswers, c);
    if (fatalCheck.isFatal) {
      hasFatalError = true;
      fatalErrorDescription = fatalCheck.reason;
      totalScore = Math.max(0, totalScore - 30);
    }

    // Salva submissão no estado da sessão para possibilitar voltar e revisar
    state.caseSubmissions[c.id] = {
      userAnswers,
      totalScore,
      evaluationResults,
      hasFatalError,
      fatalErrorDescription
    };

    state.history.push({
      caseId: c.id,
      score: totalScore,
      timestamp: Date.now()
    });
    localStorage.setItem('semio_history', JSON.stringify(state.history));

    if (totalScore < 60 && !state.errorDeck.includes(c.id)) {
      state.errorDeck.push(c.id);
      localStorage.setItem('semio_error_deck', JSON.stringify(state.errorDeck));
    }
    updateBadges();

    renderDuoFeedback(totalScore, evaluationResults, hasFatalError, fatalErrorDescription);
  }

  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function testMatch(field, userVal, officialVal, altList) {
    const uNorm = normalizeText(userVal);
    const oNorm = normalizeText(officialVal);

    if (uNorm === oNorm) return 1.0;
    if (uNorm && oNorm.includes(uNorm)) return 0.9;
    if (oNorm && uNorm.includes(oNorm)) return 0.9;

    for (const alt of (altList || [])) {
      const aNorm = normalizeText(alt);
      if (uNorm === aNorm || aNorm.includes(uNorm) || uNorm.includes(aNorm)) {
        return 0.95;
      }
    }

    const cluster = state.synonyms[field];
    if (cluster) {
      for (const [key, synList] of Object.entries(cluster)) {
        const matchesUser = synList.some(s => uNorm.includes(normalizeText(s)));
        const matchesOfficial = synList.some(s => oNorm.includes(normalizeText(s)));
        if (matchesUser && matchesOfficial) {
          return 0.95;
        }
      }
    }

    const sim = calculateSimilarity(uNorm, oNorm);
    if (sim > 0.75) return 0.85;
    if (sim > 0.5) return 0.5;

    return 0;
  }

  function calculateSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastVal = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newVal = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newVal = Math.min(Math.min(newVal, lastVal), costs[j]) + 1;
          }
          costs[j - 1] = lastVal;
          lastVal = newVal;
        }
      }
      if (i > 0) costs[shorter.length] = lastVal;
    }
    return (longer.length - costs[shorter.length]) / longer.length;
  }

  function checkFatalError(userAns, currentCase) {
    const userDiag = normalizeText(userAns.diagnostico);
    const userFund = normalizeText(userAns.lesao_fundamental);
    const caseName = normalizeText(currentCase.nome);

    if (caseName.includes('leucoplasia') && userDiag.includes('candidose')) {
      return {
        isFatal: true,
        reason: 'Atenção crítica: Leucoplasia é uma lesão potencialmente cancerizável que NÃO sai à raspagem. Candidose sai com gaze!'
      };
    }

    if (currentCase.gabarito.lesao_fundamental.toLowerCase().includes('úlcera') && userFund.includes('mancha')) {
      return {
        isFatal: true,
        reason: 'Cuidado: Úlcera é solução de continuidade profunda com perda total do epitélio; Mancha é apenas alteração plana de cor.'
      };
    }

    if (caseName.includes('tireoide lingual') && userFund.includes('bolha')) {
      return {
        isFatal: true,
        reason: 'A Tireoide Lingual é nódulo de parênquima ectópico na linha média posterior lingual. Não puncionar!'
      };
    }

    return { isFatal: false };
  }

  // ==========================================
  // RENDERIZAÇÃO DO FEEDBACK DUOLINGO
  // ==========================================
  function renderDuoFeedback(score, results, hasFatal, fatalMsg, shouldScroll = true) {
    el.semiologiaForm.style.display = 'none';
    el.feedbackPanel.style.display = 'flex';

    el.scoreValue.textContent = `${score}%`;

    // Cores e Mensagens da Roda de Pontuação
    if (score >= 80) {
      el.scoreValue.style.color = 'var(--c-oliva)';
      el.gradeStamp.style.borderColor = 'var(--c-oliva)';
      el.verdictTitle.textContent = 'Excelente Trabalho!';
      el.verdictSubtitle.textContent = 'Você dominou as características fundamentais desta lesão.';
    } else if (score >= 50) {
      el.scoreValue.style.color = 'var(--c-terracota)';
      el.gradeStamp.style.borderColor = 'var(--c-terracota)';
      el.verdictTitle.textContent = 'Quase lá! Bom Treino';
      el.verdictSubtitle.textContent = 'Revise os campos em destaque e a consistência ao toque.';
    } else {
      el.scoreValue.style.color = 'var(--c-argila)';
      el.gradeStamp.style.borderColor = 'var(--c-argila)';
      el.verdictTitle.textContent = 'Atenção aos Detalhes!';
      el.verdictSubtitle.textContent = 'Algumas características fundamentais divergiram do gabarito oficial.';
    }

    if (hasFatal) {
      el.fatalAlertBox.style.display = 'flex';
      el.fatalAlertText.textContent = fatalMsg;
    } else {
      el.fatalAlertBox.style.display = 'none';
    }

    // Renderiza Cards Comparativos
    el.comparisonGrid.innerHTML = '';
    results.forEach(res => {
      const card = document.createElement('div');
      card.className = `duo-comp-card status-${res.status}`;
      const isOverridden = state.userOverrides[res.field];

      let tagText = 'Divergente';
      let tagClass = 'tag-wrong';
      if (res.status === 'correct') {
        tagText = 'Correto';
        tagClass = 'tag-correct';
      } else if (res.status === 'partial') {
        tagText = 'Parcial';
        tagClass = 'tag-partial';
      }

      card.innerHTML = `
        <div class="duo-comp-field">${res.fieldLabel}</div>
        <div class="duo-comp-user">
          <span class="lbl">Sua Resposta:</span>
          ${escapeHtml(res.userVal)}
        </div>
        <div class="duo-comp-chair">
          <span class="lbl">Gabarito Oficial:</span>
          ${escapeHtml(res.officialVal)}
        </div>
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <span class="duo-status-tag ${tagClass}">${tagText}</span>
          <button type="button" class="btn-duo-override ${isOverridden ? 'active' : ''}" data-field="${res.field}">
            ${isOverridden ? '<i data-lucide="check"></i> Validado' : 'Validar'}
          </button>
        </div>
      `;

      card.querySelector('.btn-duo-override').addEventListener('click', () => {
        state.userOverrides[res.field] = !state.userOverrides[res.field];
        evaluateSubmission();
      });

      el.comparisonGrid.appendChild(card);
    });

    el.clinicalExplanationText.textContent = state.currentCase.explicacao_clinica || 'Sem descrição cadastrada.';
    const diffs = state.currentCase.diagnosticos_diferenciais || [];
    el.differentialsText.textContent = diffs.length > 0 ? diffs.join(', ') : 'Não especificado.';

    const oralSpeech = generateOralSpeech(state.currentCase);
    el.oralScriptText.textContent = `"${oralSpeech}"`;

    if (window.lucide) lucide.createIcons();

    if (shouldScroll) el.feedbackPanel.scrollIntoView({ behavior: 'smooth' });
  }

  function generateOralSpeech(c) {
    const g = c.gabarito;
    return `Ao exame estomatológico, o paciente apresenta lesão fundamental do tipo ${g.lesao_fundamental.toLowerCase()}, caracterizada por base de inserção ${g.insercao.toLowerCase()}, superfície ${g.superficie.toLowerCase()}, coloração ${g.coloracao.toLowerCase()} e limites ${g.limites.toLowerCase()}, topograficamente situada em ${g.localizacao.toLowerCase()} no ${g.lateralidade.toLowerCase()}. À consistência ao toque, revela-se ${g.consistencia.toLowerCase()}. O diagnóstico clínico é de ${c.nome}.`;
  }

  // ==========================================
  // LUPA DE ZOOM
  // ==========================================
  function setupMagnifier() {
    const lens = el.magnifierLens;
    const img = el.projectorImage;
    const wrapper = el.projectorScreen;

    function moveLens(e) {
      if (!state.isZoomActive) return;
      e.preventDefault();

      const rect = img.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        lens.style.display = 'none';
        return;
      }

      lens.style.display = 'block';
      const lensRadius = lens.offsetWidth / 2;
      lens.style.left = `${x - lensRadius + (img.offsetLeft || 0)}px`;
      lens.style.top = `${y - lensRadius + (img.offsetTop || 0)}px`;

      const zoom = 2.2;
      lens.style.backgroundPosition = `-${x * zoom - lensRadius}px -${y * zoom - lensRadius}px`;
      lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    }

    wrapper.addEventListener('mousemove', moveLens);
    wrapper.addEventListener('touchmove', moveLens, { passive: false });
    wrapper.addEventListener('mouseleave', () => {
      lens.style.display = 'none';
    });

    el.btnZoomToggle.addEventListener('click', () => {
      state.isZoomActive = !state.isZoomActive;
      el.btnZoomToggle.classList.toggle('active', state.isZoomActive);
      if (state.isZoomActive) {
        setupMagnifierBackground();
        showToast('Lupa de alta resolução ativada!');
      } else {
        lens.style.display = 'none';
      }
    });

    el.btnMirrorToggle.addEventListener('click', () => {
      state.isMirrored = !state.isMirrored;
      el.projectorScreen.classList.toggle('mirrored', state.isMirrored);
      el.btnMirrorToggle.classList.toggle('active', state.isMirrored);
    });
  }

  function setupMagnifierBackground() {
    el.magnifierLens.style.backgroundImage = `url('${el.projectorImage.src}')`;
  }

  // ==========================================
  // COLETAR RESPOSTAS & MODOS
  // ==========================================
  function getUserAnswers() {
    if (state.currentMode === 'escrito') {
      return {
        lesao_fundamental: el.inputLesaoFundamental.value,
        insercao: el.inputInsercao.value,
        superficie: el.inputSuperficie.value,
        limites: el.inputLimites.value,
        coloracao: el.inputColoracao.value,
        localizacao: el.inputLocalizacao.value,
        lateralidade: el.inputLateralidade.value,
        consistencia: el.inputConsistencia.value,
        diagnostico: el.inputDiagnostico.value
      };
    } else {
      const answers = {};
      document.querySelectorAll('.input-container').forEach(cont => {
        const field = cont.dataset.field;
        const selectedChip = cont.querySelector('.duo-chip.active');
        answers[field] = selectedChip ? selectedChip.dataset.val : '';
      });
      return answers;
    }
  }

  function restoreUserAnswers(answers) {
    if (!answers) return;
    if (el.inputLesaoFundamental) el.inputLesaoFundamental.value = answers.lesao_fundamental || '';
    if (el.inputInsercao) el.inputInsercao.value = answers.insercao || '';
    if (el.inputSuperficie) el.inputSuperficie.value = answers.superficie || '';
    if (el.inputLimites) el.inputLimites.value = answers.limites || '';
    if (el.inputColoracao) el.inputColoracao.value = answers.coloracao || '';
    if (el.inputLocalizacao) el.inputLocalizacao.value = answers.localizacao || '';
    if (el.inputLateralidade) el.inputLateralidade.value = answers.lateralidade || '';
    if (el.inputConsistencia) el.inputConsistencia.value = answers.consistencia || '';
    if (el.inputDiagnostico) el.inputDiagnostico.value = answers.diagnostico || '';

    // Sincroniza chips ativos
    document.querySelectorAll('.input-container').forEach(cont => {
      const field = cont.dataset.field;
      const val = answers[field];
      cont.querySelectorAll('.duo-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.val === val);
      });
    });
  }

  function clearFormFields() {
    document.querySelectorAll('.duo-text-input').forEach(inp => inp.value = '');
    document.querySelectorAll('.duo-chip.active').forEach(p => p.classList.remove('active'));
  }

  function setMode(mode) {
    state.currentMode = mode;
    document.body.classList.remove('mode-escrito', 'mode-multipla');
    document.body.classList.add(`mode-${mode}`);

    el.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'multipla') {
      document.querySelectorAll('.input-container').forEach(cont => {
        const field = cont.dataset.field;
        const input = cont.querySelector('.text-field-el');
        if (input && input.value) {
          const matchingChip = cont.querySelector(`.duo-chip[data-val="${input.value}"]`);
          if (matchingChip) matchingChip.classList.add('active');
        }
      });
    }
  }

  function populateDiagnosticoChips() {
    const list = state.allCases.map(c => c.nome);
    const unique = [...new Set(list)].sort();
    
    el.pillsDiagnostico.innerHTML = '';
    unique.forEach(nome => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duo-chip duo-chip-diagnostic';
      btn.dataset.val = nome;
      btn.textContent = nome;
      el.pillsDiagnostico.appendChild(btn);
    });
  }

  // ==========================================
  // LIGHTBOX / VISUALIZADOR DE IMAGEM AMPLIADA
  // ==========================================
  function openImageViewer(imgSrc, title, comment) {
    if (!el.modalImageViewer) return;
    el.imageViewerImg.src = imgSrc;
    el.imageViewerTitle.textContent = title || 'Caso Clínico';
    el.imageViewerCaption.textContent = comment || 'Análise semiótica visual da lesão.';
    el.modalImageViewer.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // GUIA DE PATOLOGIAS E HIPÓTESES DIAGNÓSTICAS
  // ==========================================
  let currentGuideCategory = 'todos';

  function matchCategory(c, category) {
    if (category === 'todos') return true;
    const loc = normalizeText((c.gabarito && c.gabarito.localizacao) || '');
    const fund = normalizeText((c.gabarito && c.gabarito.lesao_fundamental) || '');
    const cat = normalizeText(c.categoria || '');
    const nome = normalizeText(c.nome || '');

    if (category === 'gengiva') {
      return loc.includes('gengiv') || loc.includes('alveolar') || loc.includes('papila') || cat.includes('gengiv') || nome.includes('cisto de erupcao');
    }
    if (category === 'salivares') {
      return cat.includes('muco') || cat.includes('salivar') || fund.includes('bolha') || fund.includes('ves') || nome.includes('mucocele') || nome.includes('ranula') || nome.includes('linfangioma');
    }
    if (category === 'brancas') {
      return fund.includes('placa') || nome.includes('leuco') || nome.includes('liquen') || nome.includes('candid') || nome.includes('fordyce') || nome.includes('pilosa');
    }
    if (category === 'ulceras') {
      return fund.includes('ulcera') || fund.includes('eros') || fund.includes('vesic') || nome.includes('afta') || nome.includes('herpes') || nome.includes('queilite');
    }
    if (category === 'manchas') {
      return fund.includes('mancha') || fund.includes('macula') || nome.includes('amalgama') || nome.includes('hemangioma') || nome.includes('estomatite protetica');
    }
    return true;
  }

  function generateVisualCommentary(c) {
    if (c.comentario_imagem) return c.comentario_imagem;
    const g = c.gabarito || {};
    return `Na projeção clínica de ${c.nome}, observe a lesão fundamental do tipo ${g.lesao_fundamental || 'característica'} topograficamente situada em ${g.localizacao || 'mucosa oral'} (${g.lateralidade || 'central'}). Atente para a coloração ${g.coloracao || 'típica'}, limites ${g.limites || 'definidos'} e base de inserção ${g.insercao || 'séssil'}, com superfície ${g.superficie || 'lisa'}.`;
  }

  function renderPatologiasGuide(searchFilter = '', categoryFilter = 'todos', targetCaseId = null) {
    const norm = normalizeText(searchFilter);
    el.guideModalBody.innerHTML = '';

    const cases = state.allCases || [];
    const filtered = cases.filter(c => {
      const matchesCat = matchCategory(c, categoryFilter);
      if (!matchesCat) return false;
      if (!norm) return true;

      const fullSearchable = normalizeText([
        c.nome,
        c.categoria,
        c.gabarito ? c.gabarito.lesao_fundamental : '',
        c.gabarito ? c.gabarito.localizacao : '',
        c.gabarito ? c.gabarito.coloracao : '',
        c.gabarito ? c.gabarito.consistencia : '',
        (c.diagnosticos_diferenciais || []).join(' '),
        c.explicacao_clinica,
        c.alerta_erro_crasso
      ].join(' '));

      return fullSearchable.includes(norm);
    });

    if (filtered.length === 0) {
      el.guideModalBody.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--c-umber);">
          <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem;">Nenhuma patologia encontrada.</p>
          <p style="font-size: 0.85rem;">Tente pesquisar por outros termos (ex: "gengiva", "líquen", "bolha", "sangra").</p>
        </div>
      `;
      return;
    }

    filtered.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = 'guide-card';
      card.id = `guide-case-${c.id}`;
      if (targetCaseId && c.id === targetCaseId) {
        card.style.borderColor = 'var(--c-terracota)';
        card.style.background = '#FFFFFF';
        card.style.boxShadow = '0 0 0 3px rgba(164, 111, 84, 0.25)';
      }

      const diffList = (c.diagnosticos_diferenciais || []).join(' • ');

      card.innerHTML = `
        <div class="guide-card-header">
          <div class="guide-card-title-group">
            <span class="guide-card-num">${idx + 1}</span>
            <span class="guide-card-title">${escapeHtml(c.nome)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="guide-card-tag">${escapeHtml(c.categoria || 'Patologia Oral')}</span>
            <button type="button" class="btn-guide-train" data-case-id="${c.id}" title="Praticar este caso diretamente no simulador">
              <i data-lucide="play-circle"></i> Treinar Caso
            </button>
          </div>
        </div>

        <!-- Seção da Imagem Clínica Comentada -->
        <div class="guide-image-section">
          <div class="guide-img-container" title="Clique para ampliar a imagem clínica em alta resolução">
            <img src="${escapeHtml(c.imagem)}" alt="${escapeHtml(c.nome)}" class="guide-case-photo" loading="lazy" />
            <span class="guide-img-overlay-badge"><i data-lucide="zoom-in"></i> Ampliar</span>
          </div>
          <div class="guide-img-commentary-box">
            <div class="guide-img-commentary-header">
              <i data-lucide="scan-search"></i>
              <strong>Achados Semiológicos Visíveis na Imagem:</strong>
            </div>
            <p class="guide-img-commentary-text">
              ${escapeHtml(generateVisualCommentary(c))}
            </p>
            <div class="guide-img-tags">
              <span class="guide-tag-pill"><i data-lucide="map-pin"></i> ${c.gabarito ? escapeHtml(c.gabarito.localizacao) : '--'}</span>
              <span class="guide-tag-pill"><i data-lucide="eye"></i> ${c.gabarito ? escapeHtml(c.gabarito.lesao_fundamental) : '--'}</span>
              <span class="guide-tag-pill"><i data-lucide="hand"></i> ${c.gabarito ? escapeHtml(c.gabarito.consistencia) : '--'}</span>
            </div>
          </div>
        </div>

        <div class="guide-props-grid">
          <div class="guide-prop-item">
            <strong>Lesão Fundamental</strong>
            ${c.gabarito ? escapeHtml(c.gabarito.lesao_fundamental) : '--'}
          </div>
          <div class="guide-prop-item">
            <strong>Sítio Anatômico</strong>
            ${c.gabarito ? escapeHtml(c.gabarito.localizacao) : '--'}
          </div>
          <div class="guide-prop-item">
            <strong>Coloração</strong>
            ${c.gabarito ? escapeHtml(c.gabarito.coloracao) : '--'}
          </div>
          <div class="guide-prop-item">
            <strong>Consistência</strong>
            ${c.gabarito ? escapeHtml(c.gabarito.consistencia) : '--'}
          </div>
          <div class="guide-prop-item">
            <strong>Base & Relevo</strong>
            ${(c.gabarito && escapeHtml(c.gabarito.insercao)) || 'Séssil'} • ${(c.gabarito && escapeHtml(c.gabarito.superficie)) || 'Lisa'}
          </div>
        </div>

        <div class="guide-highlight-box">
          <strong><i data-lucide="zap"></i> O Pulo do Gato (Como Pensar):</strong> ${escapeHtml(c.explicacao_clinica || 'Sem descrição.')}
        </div>

        <div class="guide-diff-box">
          <strong><i data-lucide="layers"></i> Diagnósticos Diferenciais da Cátedra:</strong> ${escapeHtml(diffList || 'Não especificados.')}
        </div>

        ${c.alerta_erro_crasso ? `
          <div class="guide-alert-box">
            <strong><i data-lucide="alert-triangle"></i> Alerta de Prova (Erro Crasso):</strong> ${escapeHtml(c.alerta_erro_crasso)}
          </div>
        ` : ''}
      `;

      // Evento para ampliar imagem
      const imgContainer = card.querySelector('.guide-img-container');
      if (imgContainer) {
        imgContainer.addEventListener('click', () => {
          openImageViewer(c.imagem, c.nome, generateVisualCommentary(c));
        });
      }

      // Evento para praticar este caso no simulador
      const trainBtn = card.querySelector('.btn-guide-train');
      if (trainBtn) {
        trainBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          el.modalGuiaPatologias.style.display = 'none';
          let caseIdx = state.currentFilteredCases.findIndex(item => item.id === c.id);
          if (caseIdx === -1) {
            el.filterCategory.value = 'todos';
            applyFilter('todos');
            caseIdx = state.currentFilteredCases.findIndex(item => item.id === c.id);
          }
          if (caseIdx !== -1) {
            loadCase(caseIdx, true);
            showToast(`Carregado no simulador: ${c.nome}`);
          }
        });
      }

      el.guideModalBody.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

    if (targetCaseId) {
      setTimeout(() => {
        const targetEl = document.getElementById(`guide-case-${targetCaseId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }

  // ==========================================
  // GLOSSÁRIO DUOLINGO
  // ==========================================
  function renderGlossary(filterText = '') {
    const norm = normalizeText(filterText);
    el.glossaryBody.innerHTML = '';

    const fund = state.glossary.lesoes_fundamentais || [];
    const props = state.glossary.propriedades_semiologicas || [];

    const allTerms = [
      ...fund.map(t => ({ ...t, cat: 'Lesão Fundamental' })),
      ...props.map(t => ({ ...t, cat: 'Propriedade Semiológica' }))
    ];

    const filtered = allTerms.filter(item => 
      !norm || 
      normalizeText(item.termo).includes(norm) || 
      normalizeText(item.definicao).includes(norm) ||
      normalizeText(item.exemplos || '').includes(norm)
    );

    if (filtered.length === 0) {
      el.glossaryBody.innerHTML = '<p style="color: var(--c-umber); font-weight: 600; padding: 1rem 0;">Nenhum conceito encontrado.</p>';
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'duo-glossary-card';
      card.innerHTML = `
        <span class="duo-glossary-cat">${item.cat}</span>
        <h4>${item.termo}</h4>
        <p>${item.definicao}</p>
        ${item.exemplos ? `<div class="duo-glossary-example"><strong>Exemplos:</strong> ${item.exemplos}</div>` : ''}
      `;
      el.glossaryBody.appendChild(card);
    });
  }

  // ==========================================
  // CASOS DE REVISÃO
  // ==========================================
  function updateBadges() {
    el.errorCountBadge.textContent = state.errorDeck.length;

    if (state.history.length > 0) {
      const avg = Math.round(state.history.reduce((a, b) => a + b.score, 0) / state.history.length);
      el.globalScoreBadge.textContent = `${avg}%`;
    } else {
      el.globalScoreBadge.textContent = '--%';
    }
  }

  function renderReviewModal() {
    el.errorDeckList.innerHTML = '';
    if (state.errorDeck.length === 0) {
      el.errorDeckList.innerHTML = '<p style="color: var(--c-umber); font-weight: 600; padding: 1rem 0;">Sua lista de revisão está vazia! Excelente desempenho.</p>';
      return;
    }

    state.errorDeck.forEach(caseId => {
      const c = state.allCases.find(item => item.id === caseId);
      if (!c) return;

      const item = document.createElement('div');
      item.className = 'duo-glossary-card';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.marginBottom = '0.5rem';

      item.innerHTML = `
        <div>
          <h4 style="margin: 0;">${c.nome}</h4>
          <p style="margin: 0.15rem 0 0 0; font-size: 0.8rem; color: var(--c-umber);">
            Fundamental: ${c.gabarito.lesao_fundamental} | Local: ${c.gabarito.localizacao}
          </p>
        </div>
        <button type="button" class="btn-duo btn-duo-secondary btn-duo-sm btn-remove-rev" data-id="${c.id}">
          Remover
        </button>
      `;

      item.querySelector('.btn-remove-rev').addEventListener('click', () => {
        state.errorDeck = state.errorDeck.filter(id => id !== c.id);
        localStorage.setItem('semio_error_deck', JSON.stringify(state.errorDeck));
        updateBadges();
        renderReviewModal();
        updateReviewButtonState();
      });

      el.errorDeckList.appendChild(item);
    });
  }

  function updateReviewButtonState() {
    if (!state.currentCase) return;
    const isSaved = state.errorDeck.includes(state.currentCase.id);
    if (el.btnToggleErrorDeck) {
      el.btnToggleErrorDeck.innerHTML = isSaved 
        ? '<i data-lucide="bookmark-check"></i> Salvo na Revisão (Remover)' 
        : '<i data-lucide="bookmark-plus"></i> Salvar para Revisar';
      el.btnToggleErrorDeck.classList.toggle('active', isSaved);
    }
    updateQuickBookmarkState();
    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  function setupEventListeners() {
    // Modos
    el.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Chips
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.duo-chip');
      if (chip) {
        const container = chip.closest('.duo-chips-container');
        if (container) {
          container.querySelectorAll('.duo-chip').forEach(p => p.classList.remove('active'));
          chip.classList.add('active');

          const inputCont = container.closest('.input-container');
          if (inputCont) {
            const txtInput = inputCont.querySelector('.text-field-el');
            if (txtInput) txtInput.value = chip.dataset.val;
          }
          if (state.currentCase) {
            state.caseUserInputs[state.currentCase.id] = getUserAnswers();
          }
        }
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('duo-text-input') && state.currentCase) {
        state.caseUserInputs[state.currentCase.id] = getUserAnswers();
      }
    });

    // Submissão
    el.semiologiaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      evaluateSubmission();
    });

    el.btnClearForm.addEventListener('click', clearFormFields);

    // Navegação (Anterior, Pular, Próximo)
    if (el.btnPrevCase) {
      el.btnPrevCase.addEventListener('click', () => {
        loadCase(state.currentIndex - 1);
      });
    }

    if (el.btnPrevCaseFeedback) {
      el.btnPrevCaseFeedback.addEventListener('click', () => {
        loadCase(state.currentIndex - 1);
      });
    }

    if (el.btnNavPrev) {
      el.btnNavPrev.addEventListener('click', () => {
        loadCase(state.currentIndex - 1);
      });
    }

    if (el.btnNavNext) {
      el.btnNavNext.addEventListener('click', () => {
        loadCase(state.currentIndex + 1);
      });
    }

    if (el.btnEditCaseAnswer) {
      el.btnEditCaseAnswer.addEventListener('click', () => {
        loadCase(state.currentIndex, true); // reabre form para editar
      });
    }

    el.btnSkipCase.addEventListener('click', () => {
      loadCase(state.currentIndex + 1);
    });

    el.btnNextCase.addEventListener('click', () => {
      loadCase(state.currentIndex + 1);
    });

    // Pistas Clínicas (Hints)
    if (el.btnRevealHint) {
      el.btnRevealHint.addEventListener('click', () => {
        if (state.hintsRevealed < 3) {
          state.hintsRevealed++;
          renderHintsUI();
          showToast(`Pista ${state.hintsRevealed} liberada!`);
        }
      });
    }

    if (el.btnJumpToHint) {
      el.btnJumpToHint.addEventListener('click', () => {
        if (state.hintsRevealed === 0) {
          state.hintsRevealed = 1;
          renderHintsUI();
        }
        if (el.duoHintCard) {
          el.duoHintCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Revisão Rápida / Bookmark
    if (el.btnQuickBookmark) {
      el.btnQuickBookmark.addEventListener('click', () => {
        toggleCaseReview();
      });
    }

    el.filterCategory.addEventListener('change', (e) => {
      applyFilter(e.target.value);
    });

    if (el.btnShuffle) {
      el.btnShuffle.addEventListener('click', () => {
        state.currentFilteredCases = shuffleArray(state.currentFilteredCases);
        state.currentIndex = 0;
        loadCase(state.currentIndex);
        showToast('Ordem dos casos 100% embaralhada!');
      });
    }

    el.timerSelect.addEventListener('change', () => {
      startTimer();
    });

    el.btnToggleErrorDeck.addEventListener('click', () => {
      toggleCaseReview();
    });

    el.btnSpeakText.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = el.oralScriptText.textContent.replace(/"/g, '');
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pt-BR';
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      } else {
        alert('Síntese de voz não suportada pelo navegador.');
      }
    });

    // Modais
    if (el.btnGuiaPatologias) {
      el.btnGuiaPatologias.addEventListener('click', () => {
        el.modalGuiaPatologias.style.display = 'flex';
        renderPatologiasGuide(el.guideSearchInput.value, currentGuideCategory);
      });
    }

    if (el.btnCloseGuiaPatologias) {
      el.btnCloseGuiaPatologias.addEventListener('click', () => {
        el.modalGuiaPatologias.style.display = 'none';
      });
    }

    if (el.btnCloseGuiaPatologiasBottom) {
      el.btnCloseGuiaPatologiasBottom.addEventListener('click', () => {
        el.modalGuiaPatologias.style.display = 'none';
      });
    }

    if (el.guideSearchInput) {
      el.guideSearchInput.addEventListener('input', (e) => {
        renderPatologiasGuide(e.target.value, currentGuideCategory);
      });
    }

    if (el.guideFilterTabs) {
      el.guideFilterTabs.querySelectorAll('.guide-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          el.guideFilterTabs.querySelectorAll('.guide-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentGuideCategory = btn.dataset.tab;
          renderPatologiasGuide(el.guideSearchInput.value, currentGuideCategory);
        });
      });
    }

    if (el.btnCaseGuide) {
      el.btnCaseGuide.addEventListener('click', () => {
        if (!state.currentCase) return;
        el.modalGuiaPatologias.style.display = 'flex';
        el.guideSearchInput.value = '';
        if (el.guideFilterTabs) {
          el.guideFilterTabs.querySelectorAll('.guide-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === 'todos');
          });
        }
        currentGuideCategory = 'todos';
        renderPatologiasGuide('', 'todos', state.currentCase.id);
      });
    }

    el.btnGlossario.addEventListener('click', () => {
      el.modalGlossario.style.display = 'flex';
      renderGlossary(el.glossarySearchInput.value);
    });
    el.btnCloseGlossario.addEventListener('click', () => {
      el.modalGlossario.style.display = 'none';
    });
    el.glossarySearchInput.addEventListener('input', (e) => {
      renderGlossary(e.target.value);
    });

    el.btnDeckErros.addEventListener('click', () => {
      el.modalDeckErros.style.display = 'flex';
      renderReviewModal();
    });
    el.btnCloseDeckErros.addEventListener('click', () => {
      el.modalDeckErros.style.display = 'none';
    });

    el.btnClearErrors.addEventListener('click', () => {
      if (confirm('Deseja limpar todos os casos da sua lista de revisão?')) {
        state.errorDeck = [];
        localStorage.setItem('semio_error_deck', JSON.stringify([]));
        updateBadges();
        renderReviewModal();
        updateReviewButtonState();
      }
    });

    el.btnTrainErrorsNow.addEventListener('click', () => {
      el.modalDeckErros.style.display = 'none';
      el.filterCategory.value = 'erros';
      applyFilter('erros');
    });

    if (el.btnCloseImageViewer) {
      el.btnCloseImageViewer.addEventListener('click', () => {
        if (el.modalImageViewer) el.modalImageViewer.style.display = 'none';
      });
    }

    [el.modalGuiaPatologias, el.modalGlossario, el.modalDeckErros, el.modalImageViewer].filter(Boolean).forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.modalGuiaPatologias) el.modalGuiaPatologias.style.display = 'none';
        if (el.modalImageViewer) el.modalImageViewer.style.display = 'none';
        el.modalGlossario.style.display = 'none';
        el.modalDeckErros.style.display = 'none';
      }
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================
  function showToast(msg) {
    el.toastMsg.textContent = msg;
    el.toastAlert.style.display = 'flex';
    setTimeout(() => {
      el.toastAlert.style.display = 'none';
    }, 2800);
  }

  function getFieldLabel(field) {
    const labels = {
      lesao_fundamental: 'Lesão Fundamental',
      localizacao: 'Localização Anatômica',
      lateralidade: 'Lateralidade',
      insercao: 'Base de Inserção',
      superficie: 'Superfície',
      coloracao: 'Coloração',
      consistencia: 'Consistência ao Toque',
      diagnostico: 'Diagnóstico'
    };
    return labels[field] || field;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();
});
