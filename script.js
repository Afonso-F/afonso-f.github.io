/* =========================================
   CONFIGURATION — edita aqui o teu username do GitHub
   ========================================= */
const GITHUB_USERNAME = 'afonso-f';

/* Repos a ignorar (ex: o próprio portfolio) */
const IGNORED_REPOS = [
  `${GITHUB_USERNAME}.github.io`,
  'afonso-f.github.io',
];

/* Tópicos que marcam um repo como "faculdade" */
const UNIVERSITY_TOPICS = ['university', 'faculdade', 'academico', 'academic', 'escola', 'school'];

/* =========================================
   LANGUAGE COLORS (subset)
   ========================================= */
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', C: '#555555', 'C++': '#f34b7d', 'C#': '#239120',
  Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c',
  Shell: '#89e051', Haskell: '#5e5086', Scala: '#c22d40', R: '#198CE7',
  Jupyter: '#DA5B0B', Vue: '#41b883', Svelte: '#ff3e00', Lua: '#000080',
};

/* =========================================
   GITHUB API
   ========================================= */
async function fetchRepos() {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=public`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  return res.json();
}

async function fetchTopics(repoName) {
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/topics`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.mercy-preview+json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.names || [];
  } catch {
    return [];
  }
}

/* =========================================
   CARD BUILDER
   ========================================= */
function isUniversityRepo(repo, topics) {
  const combinedTopics = [...(repo.topics || []), ...topics];
  return combinedTopics.some(t => UNIVERSITY_TOPICS.includes(t.toLowerCase()));
}

function buildCard(repo, topics) {
  const isUni = isUniversityRepo(repo, topics);
  const category = isUni ? 'university' : 'personal';
  const tagLabel = isUni ? 'Faculdade' : 'Pessoal';
  const tagClass = isUni ? 'project-tag--university' : 'project-tag--personal';
  const langColor = repo.language ? (LANG_COLORS[repo.language] || '#8b949e') : '#8b949e';
  const desc = repo.description || 'Sem descrição disponível.';

  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.category = category;

  const techTags = topics.length > 0
    ? topics.slice(0, 4).map(t => `<span class="tech-badge">${t}</span>`).join('')
    : repo.language ? `<span class="tech-badge">${repo.language}</span>` : '';

  const demoLink = repo.homepage
    ? `<a href="${repo.homepage}" class="icon-link" title="Demo" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>`
    : '';

  card.innerHTML = `
    <div class="project-card__header">
      <span class="project-tag ${tagClass}">${tagLabel}</span>
      <div class="project-card__links">
        <a href="${repo.html_url}" class="icon-link" title="GitHub" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
        </a>
        ${demoLink}
      </div>
    </div>
    <h3 class="project-card__title">${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
    <p class="project-card__desc">${desc}</p>
    <div class="project-card__meta">
      ${repo.language ? `
        <span class="project-card__meta-item">
          <span class="lang-dot" style="background:${langColor}"></span>
          ${repo.language}
        </span>` : ''}
      ${repo.stargazers_count > 0 ? `
        <span class="project-card__meta-item">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${repo.stargazers_count}
        </span>` : ''}
      ${repo.forks_count > 0 ? `
        <span class="project-card__meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <path d="M6 9v3a3 3 0 003 3h3M18 15V9"/>
          </svg>
          ${repo.forks_count}
        </span>` : ''}
    </div>
    ${techTags ? `<div class="project-card__tech">${techTags}</div>` : ''}
  `;

  return card;
}

/* =========================================
   STATS
   ========================================= */
function updateStats(repos) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const langs = new Set(repos.map(r => r.language).filter(Boolean));

  animateCount('repo-count', repos.length);
  animateCount('star-count', totalStars);
  animateCount('lang-count', langs.size);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* =========================================
   FILTER
   ========================================= */
let activeFilter = 'all';

function applyFilter(filter) {
  activeFilter = filter;
  const cards = document.querySelectorAll('#projects-grid .project-card:not(.skeleton)');
  cards.forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.style.display = match ? '' : 'none';
  });
}

/* =========================================
   INIT PROJECTS
   ========================================= */
async function initProjects() {
  const grid = document.getElementById('projects-grid');
  const errorBox = document.getElementById('projects-error');

  try {
    const repos = await fetchRepos();
    const filtered = repos.filter(r =>
      !r.fork &&
      !IGNORED_REPOS.includes(r.name) &&
      !r.archived
    );

    /* Fetch topics for all repos in parallel */
    const topicsList = await Promise.all(filtered.map(r => fetchTopics(r.name)));

    /* Clear skeletons */
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">Nenhum repositório público encontrado.</p>';
      return;
    }

    filtered.forEach((repo, i) => {
      const card = buildCard(repo, topicsList[i]);
      card.style.animationDelay = `${i * 0.05}s`;
      grid.appendChild(card);
    });

    updateStats(filtered);
    applyFilter(activeFilter);

  } catch (err) {
    console.error('Failed to load repos:', err);
    grid.innerHTML = '';
    errorBox.classList.remove('hidden');
  }
}

/* =========================================
   NAV — scroll & hamburger
   ========================================= */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* =========================================
   FILTER BAR
   ========================================= */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
}

/* =========================================
   SKILL BARS (Intersection Observer)
   ========================================= */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => observer.observe(f));
}

/* =========================================
   SCROLL REVEAL
   ========================================= */
function initScrollReveal() {
  const targets = document.querySelectorAll('.section__title, .about__text, .about__stats, .stat-card, .skill-group, .contact__links, .contact-form');
  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

/* =========================================
   CONTACT FORM (demo)
   ========================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Mensagem enviada!';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Enviar mensagem';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

/* =========================================
   RETRY BUTTON
   ========================================= */
function initRetry() {
  const btn = document.getElementById('retry-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('projects-error').classList.add('hidden');
      const grid = document.getElementById('projects-grid');
      grid.innerHTML = Array(6).fill('<div class="project-card skeleton"></div>').join('');
      initProjects();
    });
  }
}

/* =========================================
   FOOTER YEAR
   ========================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================
   BOOT
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFilters();
  initSkillBars();
  initScrollReveal();
  initContactForm();
  initRetry();
  initProjects();
});
