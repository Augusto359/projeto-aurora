const DEFAULT_LESSONS = [
  {
    id: 'aula-1',
    title: 'Aula 01: Bem-vindas ao Projeto Aurora & STEM Racing',
    category: 'Introdução',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `Nesta primeira aula, apresentamos a missão do Projeto Aurora em parceria com a Equipe Nitroneedles e nossa associação parceira.\n\nO que você vai aprender:\n1. Como funciona o desafio STEM Racing e o papel da engenharia aplicada.\n2. Por que o protagonismo feminino transforma equipes de tecnologia.\n3. Como utilizar esta plataforma para acompanhar seu progresso e tirar dúvidas.\n\nDica: Ao terminar de ler, responda às duas perguntas abaixo para registrar seu entendimento!`,
    questions: [
      'Qual foi o ponto que mais chamou sua atenção sobre o Projeto Aurora?',
      'Você já teve contato com algum projeto de ciência ou engenharia antes? Ficou alguma dúvida?'
    ]
  },
  {
    id: 'aula-2',
    title: 'Aula 02: Fundamentos de Aerodinâmica e Design',
    category: 'Engenharia & Design',
    videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    content: `A aerodinâmica estuda como o ar interage com objetos em movimento. Nos carros em miniatura do STEM Racing, reduzir o arrasto (resistência do ar) faz toda a diferença na velocidade final.\n\nConceitos-chave:\n• Arrasto Aerodinâmico: força que puxa o carro para trás.\n• Fluxo Laminar: quando o ar desliza suavemente pela carroceria.\n• Prototipagem: testar formas antes da fabricação final.`,
    questions: [
      'Com suas palavras, o que é o arrasto aerodinâmico?',
      'Qual parte do conteúdo desta aula você gostaria de ver na prática em uma oficina?'
    ]
  }
];

let state = {
  visitor: JSON.parse(localStorage.getItem('aurora_visitor')) || null,
  visitorsLog: JSON.parse(localStorage.getItem('aurora_visitors_log')) || [],
  lessons: JSON.parse(localStorage.getItem('aurora_lessons')) || DEFAULT_LESSONS,
  completedIds: JSON.parse(localStorage.getItem('aurora_completed')) || [],
  comments: JSON.parse(localStorage.getItem('aurora_comments')) || {},
  quizAnswers: JSON.parse(localStorage.getItem('aurora_quiz')) || [],
  testimonials: JSON.parse(localStorage.getItem('aurora_testimonials')) || [],
  activeLessonId: null
};

function saveState() {
  localStorage.setItem('aurora_visitor', JSON.stringify(state.visitor));
  localStorage.setItem('aurora_visitors_log', JSON.stringify(state.visitorsLog));
  localStorage.setItem('aurora_lessons', JSON.stringify(state.lessons));
  localStorage.setItem('aurora_completed', JSON.stringify(state.completedIds));
  localStorage.setItem('aurora_comments', JSON.stringify(state.comments));
  localStorage.setItem('aurora_quiz', JSON.stringify(state.quizAnswers));
  localStorage.setItem('aurora_testimonials', JSON.stringify(state.testimonials));
}

function formatYouTubeUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regExp);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function setupMobileNavbar() {
  const navContent = document.querySelector('.nav-content');
  const navLinks = document.querySelector('.nav-links');
  if (!navContent || !navLinks) return;

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'mobile-menu-btn';
  menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
  menuBtn.textContent = '☰ Menu';

  navContent.insertBefore(menuBtn, navLinks);

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.textContent = isOpen ? '✕ Fechar' : '☰ Menu';
  });

  navLinks.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.textContent = '☰ Menu';
    });
  });
}

function updateVisitorGreeting() {
  const greetingEl = document.getElementById('student-greeting');
  if (greetingEl && state.visitor?.name) {
    greetingEl.textContent = `Olá, ${state.visitor.name}! Conclua todas as aulas publicadas para liberar seu certificado.`;
  }
}

function updateProgressUI() {
  const total = state.lessons.length;
  const validCompleted = state.completedIds.filter(id => state.lessons.some(l => l.id === id));
  const doneCount = validCompleted.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const textEl = document.getElementById('progress-text');
  const pctEl = document.getElementById('progress-percent');
  const fillEl = document.getElementById('progress-fill');
  const countBadge = document.getElementById('module-count-badge');

  if (textEl) textEl.textContent = `${doneCount} de ${total} aulas concluídas`;
  if (pctEl) pctEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (countBadge) countBadge.textContent = `${total} ${total === 1 ? 'aula' : 'aulas'}`;

  const isAllDone = total > 0 && doneCount === total;
  const heroCertBtn = document.getElementById('hero-cert-btn');
  const sideCertBtn = document.getElementById('sidebar-cert-btn');

  if (heroCertBtn) {
    heroCertBtn.disabled = !isAllDone;
    heroCertBtn.textContent = isAllDone
      ? 'Certificado Liberado! Clique para Emitir'
      : 'Certificado Bloqueado (Conclua as aulas)';
  }
  if (sideCertBtn) {
    sideCertBtn.disabled = !isAllDone;
  }
}
function injectSharedModals() {
  const modalsHTML = `
    <div id="welcome-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <div class="modal-badges">
          <span class="badge badge-blue">Projeto Aurora</span>
          <span class="badge badge-orange">Nitroneedles</span>
          <span class="badge badge-purple">Associação</span>
        </div>
        <h2>Bem-vinda ao Projeto Aurora</h2>
        <p>Preencha seus dados rápidos para personalizar sua trilha de estudos e emitir seu certificado ao final.</p>
        <form id="visitor-form" class="form-grid">
          <div class="form-group">
            <label for="vis-name">Nome completo *</label>
            <input type="text" id="vis-name" required placeholder="Ex: Maria Clara Silva">
          </div>
          <div class="form-group">
            <label for="vis-birth">Data de nascimento *</label>
            <input type="date" id="vis-birth" required>
          </div>
          <div class="form-group">
            <label for="vis-city">Cidade e País *</label>
            <input type="text" id="vis-city" required placeholder="Ex: Valinhos, Brasil">
          </div>
          <div class="form-group">
            <label for="vis-email">E-mail *</label>
            <input type="email" id="vis-email" required placeholder="seuemail@exemplo.com">
          </div>
          <div class="form-group full-width">
            <label for="vis-source">Por onde conheceu nosso site? *</label>
            <select id="vis-source" required>
              <option value="">Selecione uma opção...</option>
              <option value="Casa de Abigail">Casa de Abigail</option>
              <option value="Equipe Nitroneedles">Equipe Nitroneedles</option>
              <option value="Amigos">Amigos</option>
              <option value="Família">Família</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div class="modal-actions full-width">
            <button type="submit" class="btn btn-orange">Salvar Dados e Entrar</button>
            <button type="button" id="skip-modal-btn" class="btn btn-ghost">Explorar sem preencher agora</button>
          </div>
        </form>
      </div>
    </div>

    <div id="certificate-modal" class="modal-overlay hidden">
      <div class="certificate-sheet" id="certificate-print-area">
        <div class="cert-border">
          <div class="cert-logos">
            <span>PROJETO AURORA</span>
            <span>•</span>
            <span>EQUIPE Nitroneedles</span>
            <span>•</span>
            <span>ASSOCIAÇÃO PARCEIRA</span>
          </div>
          <p class="cert-kicker">CERTIFICADO DE CONCLUSÃO</p>
          <h2>Certificamos que</h2>
          <h1 id="cert-student-name" class="cert-name">Nome da Aluna</h1>
          <p class="cert-body">
            concluiu com êxito todas as aulas e atividades formativas disponíveis na trilha educacional do
            <strong>Projeto Aurora — Ciência, Tecnologia e STEM Racing</strong>.
          </p>
          <p id="cert-date" class="cert-date"></p>
          <div class="cert-signatures">
            <div><div class="sig-line"></div><span>Coordenação Projeto Aurora</span></div>
            <div><div class="sig-line"></div><span>Equipe Nitroneedles</span></div>
          </div>
        </div>
        <div class="cert-actions no-print">
          <button type="button" onclick="window.print()" class="btn btn-orange">Salvar PDF / Imprimir</button>
          <button type="button" id="close-cert-btn" class="btn btn-ghost">Fechar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalsHTML);
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavbar();
  injectSharedModals();

  if (!state.visitor && !sessionStorage.getItem('aurora_modal_skipped')) {
    document.getElementById('welcome-modal').classList.remove('hidden');
  }

  if (state.lessons.length > 0) {
    state.activeLessonId = state.lessons[0].id;
  }

  updateVisitorGreeting();
  updateProgressUI();
  renderCursosPage();
  renderTestimonialsPage();
  renderAdminPage();
  setupGlobalEvents();
});

function renderCursosPage() {
  const listEl = document.getElementById('lesson-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  state.lessons.forEach((lesson) => {
    const isDone = state.completedIds.includes(lesson.id);
    const isActive = lesson.id === state.activeLessonId;

    const item = document.createElement('div');
    item.className = `lesson-item ${isActive ? 'active' : ''}`;
    item.innerHTML = `
      <span>${lesson.title}</span>
      <span class="status-dot ${isDone ? 'done' : ''}"></span>
    `;
    item.addEventListener('click', () => {
      state.activeLessonId = lesson.id;
      renderCursosPage();
      if (window.innerWidth <= 860) {
        document.querySelector('.lesson-viewer')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
    listEl.appendChild(item);
  });

  const lesson = state.lessons.find(l => l.id === state.activeLessonId);
  if (!lesson) return;

  document.getElementById('lesson-category').textContent = lesson.category;
  document.getElementById('lesson-title').textContent = lesson.title;
  document.getElementById('lesson-video').src = formatYouTubeUrl(lesson.videoUrl);
  document.getElementById('lesson-content').textContent = lesson.content;

  const completeBtn = document.getElementById('mark-complete-btn');
  const isDone = state.completedIds.includes(lesson.id);
  completeBtn.textContent = isDone ? '✓ Aula Concluída' : 'Marcar como Concluída';
  completeBtn.classList.toggle('completed', isDone);

  const quizContainer = document.getElementById('quiz-questions-container');
  quizContainer.innerHTML = '';
  (lesson.questions || []).forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-question-item';
    div.innerHTML = `
      <label>${idx + 1}. ${q}</label>
      <input type="text" required placeholder="Sua resposta ou dúvida...">
    `;
    quizContainer.appendChild(div);
  });

  const commentsList = document.getElementById('comments-list');
  const lessonComments = state.comments[lesson.id] || [];
  commentsList.innerHTML = lessonComments.length === 0
    ? '<p class="muted"><small>Nenhuma dúvida enviada nesta aula ainda. Seja a primeira!</small></p>'
    : '';
  lessonComments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment-bubble';
    div.innerHTML = `<small><strong>${c.author}</strong> • ${c.date}</small><p>${c.text}</p>`;
    commentsList.appendChild(div);
  });
}
function renderTestimonialsPage() {
  const container = document.getElementById('testimonials-list');
  if (!container) return;

  state.testimonials.forEach(t => {
    if (t.type === 'Depoimento') {
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `<p>"${t.message}"</p><strong>— ${t.name}</strong>`;
      container.appendChild(card);
    }
  });
}

function renderAdminPage() {
  const loginBox = document.getElementById('admin-login-box');
  const dashboard = document.getElementById('admin-dashboard');
  if (!loginBox || !dashboard) return;

  if (sessionStorage.getItem('aurora_admin_unlocked') === 'true') {
    loginBox.classList.add('hidden');
    dashboard.classList.remove('hidden');
  }

  const lessonsAdmin = document.getElementById('admin-lessons-list');
  lessonsAdmin.innerHTML = '';
  state.lessons.forEach(lesson => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <span><strong>${lesson.title}</strong> (${lesson.category})</span>
      <button type="button" class="btn btn-ghost" style="color:#dc2626;padding:0.2rem 0.5rem;">Excluir</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      if (confirm(`Remover "${lesson.title}"?`)) {
        state.lessons = state.lessons.filter(l => l.id !== lesson.id);
        saveState();
        renderAdminPage();
      }
    });
    lessonsAdmin.appendChild(row);
  });

  const visitorsAdmin = document.getElementById('admin-visitors-list');
  visitorsAdmin.innerHTML = state.visitorsLog.length === 0
    ? '<small class="muted">Nenhuma visitante registrada ainda.</small>'
    : '';
  state.visitorsLog.slice().reverse().forEach(v => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'flex-start';
    row.innerHTML = `<strong>${v.name}</strong><small>${v.city} • Origem: ${v.source} • ${v.email}</small>`;
    visitorsAdmin.appendChild(row);
  });

  const respAdmin = document.getElementById('admin-responses-list');
  respAdmin.innerHTML = state.quizAnswers.length === 0
    ? '<small class="muted">Nenhuma resposta registrada ainda.</small>'
    : '';
  state.quizAnswers.slice().reverse().forEach(entry => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'flex-start';
    row.innerHTML = `<strong>${entry.student} — ${entry.lessonTitle}</strong><small>${entry.answers.join(' | ')}</small>`;
    respAdmin.appendChild(row);
  });
}

function setupGlobalEvents() {
  document.getElementById('visitor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('vis-name').value.trim(),
      birth: document.getElementById('vis-birth').value,
      city: document.getElementById('vis-city').value.trim(),
      email: document.getElementById('vis-email').value.trim(),
      source: document.getElementById('vis-source').value
    };
    state.visitor = data;
    state.visitorsLog.push(data);
    saveState();
    updateVisitorGreeting();
    document.getElementById('welcome-modal').classList.add('hidden');
  });

  document.getElementById('skip-modal-btn')?.addEventListener('click', () => {
    sessionStorage.setItem('aurora_modal_skipped', 'true');
    document.getElementById('welcome-modal').classList.add('hidden');
  });

  document.getElementById('open-profile-btn')?.addEventListener('click', () => {
    if (state.visitor) {
      document.getElementById('vis-name').value = state.visitor.name || '';
      document.getElementById('vis-birth').value = state.visitor.birth || '';
      document.getElementById('vis-city').value = state.visitor.city || '';
      document.getElementById('vis-email').value = state.visitor.email || '';
      document.getElementById('vis-source').value = state.visitor.source || '';
    }
    document.getElementById('welcome-modal').classList.remove('hidden');
  });

  const openCert = () => {
    const studentName = state.visitor?.name || prompt('Digite seu nome completo para o certificado:');
    if (!studentName) return;
    document.getElementById('cert-student-name').textContent = studentName;
    document.getElementById('cert-date').textContent = `Emitido em ${new Date().toLocaleDateString('pt-BR')}`;
    document.getElementById('certificate-modal').classList.remove('hidden');
  };
  document.getElementById('hero-cert-btn')?.addEventListener('click', openCert);
  document.getElementById('sidebar-cert-btn')?.addEventListener('click', openCert);
  document.getElementById('close-cert-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal').classList.add('hidden');
  });

  document.getElementById('mark-complete-btn')?.addEventListener('click', () => {
    if (!state.activeLessonId) return;
    const idx = state.completedIds.indexOf(state.activeLessonId);
    if (idx === -1) state.completedIds.push(state.activeLessonId);
    else state.completedIds.splice(idx, 1);
    saveState();
    renderCursosPage();
    updateProgressUI();
  });

  document.getElementById('lesson-quiz-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const lesson = state.lessons.find(l => l.id === state.activeLessonId);
    if (!lesson) return;
    const answers = Array.from(e.target.querySelectorAll('input')).map(i => i.value.trim());
    state.quizAnswers.push({
      student: state.visitor?.name || 'Visitante',
      lessonTitle: lesson.title,
      answers
    });
    saveState();
    e.target.reset();
    const msg = document.getElementById('quiz-feedback-msg');
    msg.textContent = 'Respostas enviadas para a equipe!';
    setTimeout(() => (msg.textContent = ''), 4000);
  });

  document.getElementById('comment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.activeLessonId) return;
    const input = document.getElementById('comment-input');
    if (!state.comments[state.activeLessonId]) state.comments[state.activeLessonId] = [];
    state.comments[state.activeLessonId].push({
      author: state.visitor?.name || 'Aluna Visitante',
      text: input.value.trim(),
      date: new Date().toLocaleDateString('pt-BR')
    });
    saveState();
    input.value = '';
    renderCursosPage();
  });

  document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      name: document.getElementById('fb-name').value.trim(),
      type: document.getElementById('fb-type').value,
      message: document.getElementById('fb-msg').value.trim()
    };
    state.testimonials.push(item);
    saveState();
    if (item.type === 'Depoimento') {
      const container = document.getElementById('testimonials-list');
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `<p>"${item.message}"</p><strong>— ${item.name}</strong>`;
      container.appendChild(card);
    } else {
      alert('Sugestão registrada com sucesso para a equipe!');
    }
    e.target.reset();
  });

  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('admin-pin-input').value;
    if (pin === 'aurora2026') {
      sessionStorage.setItem('aurora_admin_unlocked', 'true');
      renderAdminPage();
    } else {
      alert('Senha incorreta.');
    }
  });

  document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('aurora_admin_unlocked');
    location.reload();
  });

  document.getElementById('new-lesson-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q1 = document.getElementById('adm-q1').value.trim();
    const q2 = document.getElementById('adm-q2').value.trim();
    const questions = q2 ? [q1, q2] : [q1];

    state.lessons.push({
      id: 'aula-' + Date.now(),
      title: document.getElementById('adm-title').value.trim(),
      category: document.getElementById('adm-cat').value.trim(),
      videoUrl: document.getElementById('adm-video').value.trim(),
      content: document.getElementById('adm-text').value.trim(),
      questions
    });
    saveState();
    e.target.reset();
    renderAdminPage();
    alert('Nova aula publicada com sucesso!');
  });
}

