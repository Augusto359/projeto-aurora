const DEFAULT_LESSONS = [
  {
    id: 'aula-1',
    title: 'Aula 01: Bem-vindas ao Projeto Aurora & STEM Racing',
    category: 'Introdução',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `Nesta primeira aula, apresentamos a missão do Projeto Aurora em parceria com a Equipe NitroNeedles e nossa associação parceira.\n\nO que você vai aprender:\n1. Como funciona o desafio STEM Racing e o papel da engenharia aplicada.\n2. Por que o protagonismo feminino transforma equipes de tecnologia.\n3. Como utilizar esta plataforma para acompanhar seu progresso e tirar dúvidas.\n\nDica: Ao terminar de ler, responda às duas perguntas abaixo para registrar seu entendimento!`,
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
  users: JSON.parse(localStorage.getItem('aurora_users')) || [],
  currentUser: JSON.parse(localStorage.getItem('aurora_current_user')) || null,
  lessons: JSON.parse(localStorage.getItem('aurora_lessons')) || DEFAULT_LESSONS,
  completedMap: JSON.parse(localStorage.getItem('aurora_completed_map')) || {},
  comments: JSON.parse(localStorage.getItem('aurora_comments')) || {},
  quizAnswers: JSON.parse(localStorage.getItem('aurora_quiz')) || [],
  testimonials: JSON.parse(localStorage.getItem('aurora_testimonials')) || [],
  activeLessonId: null
};

function saveState() {
  localStorage.setItem('aurora_users', JSON.stringify(state.users));
  localStorage.setItem('aurora_current_user', JSON.stringify(state.currentUser));
  localStorage.setItem('aurora_lessons', JSON.stringify(state.lessons));
  localStorage.setItem('aurora_completed_map', JSON.stringify(state.completedMap));
  localStorage.setItem('aurora_comments', JSON.stringify(state.comments));
  localStorage.setItem('aurora_quiz', JSON.stringify(state.quizAnswers));
  localStorage.setItem('aurora_testimonials', JSON.stringify(state.testimonials));
}

function getUserKey() {
  return state.currentUser ? state.currentUser.email : 'guest';
}

function getCompletedIds() {
  return state.completedMap[getUserKey()] || [];
}

function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
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
  menuBtn.textContent = '☰ Menu';
  navContent.insertBefore(menuBtn, navLinks);

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.textContent = isOpen ? '✕ Fechar' : '☰ Menu';
  });

  const authBtn = document.getElementById('open-profile-btn');
  if (authBtn) {
    if (state.currentUser) {
      const firstName = state.currentUser.name.split(' ')[0];
      authBtn.textContent = `Olá, ${firstName}`;
    } else {
      authBtn.textContent = 'Entrar / Cadastrar';
    }
    authBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}
function injectCertificateModal() {
  const certHTML = `
    <div id="certificate-modal" class="modal-overlay hidden">
      <div class="certificate-sheet" id="certificate-print-area">
        <div class="cert-border">
          <div class="cert-logos">
            <span>PROJETO AURORA</span>
            <span>•</span>
            <span>EQUIPE NITRONEEDLES</span>
            <span>•</span>
            <span>ASSOCIAÇÃO PARCEIRA</span>
          </div>
          <p class="cert-kicker">CERTIFICADO DE CONCLUSÃO</p>
          <h2>Certificamos que</h2>
          <h1 id="cert-student-name" class="cert-name">Nome da Aluna</h1>
          <p id="cert-student-cpf" style="font-weight: 700; color: var(--brand-blue); margin-bottom: 0.5rem;"></p>
          <p class="cert-body">
            concluiu com êxito todas as aulas e atividades formativas disponíveis na trilha educacional do
            <strong>Projeto Aurora — Ciência, Tecnologia e STEM Racing</strong>.
          </p>
          <p id="cert-date" class="cert-date"></p>
          <div class="cert-signatures">
            <div><div class="sig-line"></div><span>Coordenação Projeto Aurora</span></div>
            <div><div class="sig-line"></div><span>Equipe NitroNeedles</span></div>
          </div>
        </div>
        <div class="cert-actions no-print">
          <button type="button" onclick="window.print()" class="btn btn-orange">Salvar PDF / Imprimir</button>
          <button type="button" id="close-cert-btn" class="btn btn-ghost">Fechar</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', certHTML);
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavbar();
  injectCertificateModal();

  if (state.lessons.length > 0) {
    state.activeLessonId = state.lessons[0].id;
  }

  updateGreetingAndProgress();
  renderLoginPage();
  renderCursosPage();
  renderTestimonialsPage();
  renderAdminPage();
  setupGlobalEvents();
});

function updateGreetingAndProgress() {
  const greetingEl = document.getElementById('student-greeting');
  if (greetingEl) {
    greetingEl.textContent = state.currentUser
      ? `Olá, ${state.currentUser.name}! Conclua todas as aulas publicadas para liberar seu certificado.`
      : 'Faça login ou cadastre-se para salvar seu progresso e emitir seu certificado ao final.';
  }

  const completedIds = getCompletedIds();
  const total = state.lessons.length;
  const doneCount = completedIds.filter(id => state.lessons.some(l => l.id === id)).length;
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
  if (sideCertBtn) sideCertBtn.disabled = !isAllDone;
}

function renderLoginPage() {
  const tabsBox = document.getElementById('auth-tabs-box');
  const profileBox = document.getElementById('logged-profile-box');
  if (!tabsBox || !profileBox) return;

  if (state.currentUser) {
    tabsBox.classList.add('hidden');
    profileBox.classList.remove('hidden');
    document.getElementById('prof-name').textContent = state.currentUser.name;
    document.getElementById('prof-cpf').textContent = state.currentUser.cpf;
    document.getElementById('prof-birth').textContent = state.currentUser.birth;
    document.getElementById('prof-city').textContent = state.currentUser.city;
    document.getElementById('prof-email').textContent = state.currentUser.email;
    document.getElementById('prof-source').textContent = state.currentUser.source;
  } else {
    tabsBox.classList.remove('hidden');
    profileBox.classList.add('hidden');
  }
}

function renderCursosPage() {
  const listEl = document.getElementById('lesson-list');
  if (!listEl) return;

  const completedIds = getCompletedIds();
  listEl.innerHTML = '';

  state.lessons.forEach((lesson) => {
    const isDone = completedIds.includes(lesson.id);
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
  const isDone = completedIds.includes(lesson.id);
  completeBtn.textContent = isDone ? '✓ Aula Concluída' : 'Marcar como Concluída';
  completeBtn.classList.toggle('completed', isDone);

  const quizContainer = document.getElementById('quiz-questions-container');
  quizContainer.innerHTML = '';
  (lesson.questions || []).forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-question-item';
    div.innerHTML = `<label>${idx + 1}. ${q}</label><input type="text" required placeholder="Sua resposta ou dúvida...">`;
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
    row.innerHTML = `<span><strong>${lesson.title}</strong> (${lesson.category})</span><button type="button" class="btn btn-ghost" style="color:#dc2626;padding:0.2rem 0.5rem;">Excluir</button>`;
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
  visitorsAdmin.innerHTML = state.users.length === 0 ? '<small class="muted">Nenhuma aluna cadastrada ainda.</small>' : '';
  state.users.slice().reverse().forEach(u => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'flex-start';
    row.innerHTML = `<strong>${u.name} (CPF: ${u.cpf})</strong><small>${u.city} • Origem: ${u.source} • ${u.email}</small>`;
    visitorsAdmin.appendChild(row);
  });

  const respAdmin = document.getElementById('admin-responses-list');
  respAdmin.innerHTML = state.quizAnswers.length === 0 ? '<small class="muted">Nenhuma resposta registrada ainda.</small>' : '';
  state.quizAnswers.slice().reverse().forEach(entry => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'flex-start';
    row.innerHTML = `<strong>${entry.student} — ${entry.lessonTitle}</strong><small>${entry.answers.join(' | ')}</small>`;
    respAdmin.appendChild(row);
  });
}

function showAuthAlert(msg, isSuccess = false) {
  const box = document.getElementById('auth-message');
  if (!box) return;
  box.textContent = msg;
  box.classList.remove('hidden', 'success');
  if (isSuccess) box.classList.add('success');
}

function setupGlobalEvents() {
  // Abas Login / Cadastro
  const tabLogin = document.getElementById('tab-btn-login');
  const tabReg = document.getElementById('tab-btn-register');
  const formLogin = document.getElementById('login-form');
  const formReg = document.getElementById('register-form');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    formLogin.classList.remove('hidden');
    formReg.classList.add('hidden');
    document.getElementById('auth-message').classList.add('hidden');
  });

  tabReg?.addEventListener('click', () => {
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    formReg.classList.remove('hidden');
    formLogin.classList.add('hidden');
    document.getElementById('auth-message').classList.add('hidden');
  });

  // Máscara de CPF no cadastro
  document.getElementById('reg-cpf')?.addEventListener('input', (e) => {
    e.target.value = maskCPF(e.target.value);
  });

  // Envio de Cadastro
  formReg?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cpfRaw = document.getElementById('reg-cpf').value.replace(/\D/g, '');
    if (cpfRaw.length !== 11) {
      showAuthAlert('Digite um CPF válido com 11 números.');
      return;
    }

    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const exists = state.users.some(u => u.email === email || u.cpf.replace(/\D/g, '') === cpfRaw);
    if (exists) {
      showAuthAlert('Já existe uma conta cadastrada com este E-mail ou CPF. Use a aba Entrar.');
      return;
    }

    const newUser = {
      name: document.getElementById('reg-name').value.trim(),
      cpf: maskCPF(cpfRaw),
      birth: document.getElementById('reg-birth').value,
      city: document.getElementById('reg-city').value.trim(),
      email,
      source: document.getElementById('reg-source').value,
      password: document.getElementById('reg-password').value
    };

    state.users.push(newUser);
    state.currentUser = newUser;
    saveState();
    window.location.href = 'cursos.html';
  });

  // Envio de Login
  formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = document.getElementById('login-identifier').value.trim().toLowerCase();
    const idDigits = idInput.replace(/\D/g, '');
    const pass = document.getElementById('login-password').value;

    const found = state.users.find(u =>
      (u.email === idInput || (idDigits.length === 11 && u.cpf.replace(/\D/g, '') === idDigits)) &&
      u.password === pass
    );

    if (!found) {
      showAuthAlert('E-mail/CPF ou senha incorretos. Se for seu primeiro acesso, clique em "Primeiro Acesso (Cadastrar)".');
      return;
    }

    state.currentUser = found;
    saveState();
    window.location.href = 'cursos.html';
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    state.currentUser = null;
    saveState();
    window.location.reload();
  });

  // Certificado com Nome e CPF
  const openCert = () => {
    if (!state.currentUser) {
      alert('Faça login ou cadastre seu nome e CPF antes de emitir o certificado.');
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('cert-student-name').textContent = state.currentUser.name;
    document.getElementById('cert-student-cpf').textContent = `CPF: ${state.currentUser.cpf}`;
    document.getElementById('cert-date').textContent = `Emitido em ${new Date().toLocaleDateString('pt-BR')}`;
    document.getElementById('certificate-modal').classList.remove('hidden');
  };
  document.getElementById('hero-cert-btn')?.addEventListener('click', openCert);
  document.getElementById('sidebar-cert-btn')?.addEventListener('click', openCert);
  document.getElementById('close-cert-btn')?.addEventListener('click', () => {
    document.getElementById('certificate-modal').classList.add('hidden');
  });

  // Marcar aula como concluída
  document.getElementById('mark-complete-btn')?.addEventListener('click', () => {
    if (!state.currentUser) {
      alert('Entre na sua conta ou faça um cadastro rápido para salvar seu progresso!');
      window.location.href = 'login.html';
      return;
    }
    if (!state.activeLessonId) return;
    const key = getUserKey();
    if (!state.completedMap[key]) state.completedMap[key] = [];
    const idx = state.completedMap[key].indexOf(state.activeLessonId);
    if (idx === -1) state.completedMap[key].push(state.activeLessonId);
    else state.completedMap[key].splice(idx, 1);
    saveState();
    renderCursosPage();
    updateGreetingAndProgress();
  });

  // Perguntas de fixação
  document.getElementById('lesson-quiz-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const lesson = state.lessons.find(l => l.id === state.activeLessonId);
    if (!lesson) return;
    const answers = Array.from(e.target.querySelectorAll('input')).map(i => i.value.trim());
    state.quizAnswers.push({
      student: state.currentUser ? `${state.currentUser.name} (${state.currentUser.cpf})` : 'Visitante',
      lessonTitle: lesson.title,
      answers
    });
    saveState();
    e.target.reset();
    const msg = document.getElementById('quiz-feedback-msg');
    msg.textContent = 'Respostas enviadas para a equipe!';
    setTimeout(() => (msg.textContent = ''), 4000);
  });

  // Comentários / Dúvidas
  document.getElementById('comment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.activeLessonId) return;
    const input = document.getElementById('comment-input');
    if (!state.comments[state.activeLessonId]) state.comments[state.activeLessonId] = [];
    state.comments[state.activeLessonId].push({
      author: state.currentUser?.name || 'Aluna Visitante',
      text: input.value.trim(),
      date: new Date().toLocaleDateString('pt-BR')
    });
    saveState();
    input.value = '';
    renderCursosPage();
  });

  // Depoimentos
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

  // Admin
  document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('admin-pin-input').value === 'aurora2026') {
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
    state.lessons.push({
      id: 'aula-' + Date.now(),
      title: document.getElementById('adm-title').value.trim(),
      category: document.getElementById('adm-cat').value.trim(),
      videoUrl: document.getElementById('adm-video').value.trim(),
      content: document.getElementById('adm-text').value.trim(),
      questions: q2 ? [q1, q2] : [q1]
    });
    saveState();
    e.target.reset();
    renderAdminPage();
    alert('Nova aula publicada com sucesso!');
  });
}
