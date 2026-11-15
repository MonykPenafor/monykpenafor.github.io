// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Light / dark theme ----------
const root = document.documentElement;
const themeBtn = document.querySelector('.theme-toggle');

function updateThemeIcon() {
    const isDark = root.dataset.theme === 'dark';
    themeBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    updateThemeIcon();
});
updateThemeIcon();

// ---------- Language (EN / PT) ----------
// English is written in index.html; Portuguese comes from assets/js/i18n.js.
const I18N = window.I18N || { pt: {}, meta: {} };
let lang = 'en';

// Short UI strings used by the code below
const UI = {
    en: { openMenu: 'Open menu', closeMenu: 'Close menu', switchLang: 'Mudar idioma para português' },
    pt: { openMenu: 'Abrir menu', closeMenu: 'Fechar menu', switchLang: 'Switch language to English' },
};

// Keep the original English so we can switch back
const i18nEls = [...document.querySelectorAll('[data-i18n]')];
const i18nAriaEls = [...document.querySelectorAll('[data-i18n-aria]')];
i18nEls.forEach(el => { el.dataset.en = el.innerHTML; });
i18nAriaEls.forEach(el => { el.dataset.enAria = el.getAttribute('aria-label'); });

const metaDescription = document.querySelector('meta[name="description"]');
const enMeta = { title: document.title, description: metaDescription ? metaDescription.content : '' };

const langBtn = document.querySelector('.lang-toggle');

function setLanguage(next) {
    lang = next === 'pt' ? 'pt' : 'en';
    const pt = lang === 'pt';

    i18nEls.forEach(el => {
        const t = pt ? I18N.pt[el.dataset.i18n] : el.dataset.en;
        if (t !== undefined) el.innerHTML = t;
    });
    i18nAriaEls.forEach(el => {
        const t = pt ? I18N.pt[el.dataset.i18nAria] : el.dataset.enAria;
        if (t !== undefined) el.setAttribute('aria-label', t);
    });

    root.lang = pt ? 'pt-BR' : 'en';
    document.title = pt && I18N.meta.title ? I18N.meta.title : enMeta.title;
    if (metaDescription) metaDescription.content = pt && I18N.meta.description ? I18N.meta.description : enMeta.description;

    langBtn.dataset.current = lang;
    langBtn.setAttribute('aria-label', UI[lang].switchLang);
    navToggle.setAttribute('aria-label', UI[lang][navLinks.classList.contains('open') ? 'closeMenu' : 'openMenu']);

    renderDurations(); // translated HTML brings back empty duration spans
    try { localStorage.setItem('lang', lang); } catch (e) {}
}

langBtn.addEventListener('click', () => setLanguage(lang === 'en' ? 'pt' : 'en'));

// ---------- Mobile menu ----------
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', UI[lang][open ? 'closeMenu' : 'openMenu']);
    navToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

// ---------- Header border + reading progress (lane marking) ----------
const header = document.querySelector('.site-header');
const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Highlight the current section in the menu ----------
const sections = document.querySelectorAll('main section[id]');
const menuLinks = navLinks.querySelectorAll('a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        menuLinks.forEach(a =>
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ---------- Job durations (LinkedIn style: "1 yr 11 mos" / "1 ano e 11 meses") ----------
// <span class="duration" data-start="2025-01" data-end="2025-06"></span>
// No data-end = still in the role (counts until this month).
function monthsBetween(start, end) {
    const [y1, m1] = start.split('-').map(Number);
    const [y2, m2] = end
        ? end.split('-').map(Number)
        : [new Date().getFullYear(), new Date().getMonth() + 1];
    return (y2 - y1) * 12 + (m2 - m1) + 1; // inclusive, like LinkedIn
}

function formatDuration(months) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (lang === 'pt') {
        const parts = [];
        if (years) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
        if (rest) parts.push(`${rest} ${rest > 1 ? 'meses' : 'mês'}`);
        return parts.join(' e ') || '1 mês';
    }
    const parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
    return parts.join(' ') || '1 mo';
}

function renderDurations() {
    document.querySelectorAll('.duration[data-start]').forEach(el => {
        el.textContent = formatDuration(monthsBetween(el.dataset.start, el.dataset.end));
    });
}

// "2+ years" counter in the hero
document.querySelectorAll('[data-years-since]').forEach(el => {
    const years = Math.floor(monthsBetween(el.dataset.yearsSince) / 12);
    if (years >= 1) el.textContent = `${years}+`;
});

// ---------- Project filters ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-category]');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active);
        });
        projectCards.forEach(card => {
            card.hidden = filter !== 'all' && card.dataset.category !== filter;
        });
    });
});

// Hide filter buttons that have no matching project
filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    if (f !== 'all' && ![...projectCards].some(c => c.dataset.category === f)) btn.hidden = true;
});

// ---------- Start in the saved language (English by default) ----------
let savedLang = 'en';
try { savedLang = localStorage.getItem('lang') || 'en'; } catch (e) {}
setLanguage(savedLang);

// ---------- Reveal on scroll ----------
const revealTargets = document.querySelectorAll(
    '.section-head, .about-grid, .focus-card, .xp-company, .xp-earlier, .skill-group, .project-card, .edu-card, .contact-text'
);

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealTargets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});
