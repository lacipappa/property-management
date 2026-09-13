let translations = null;
let currentLang = 'es';

function getValue(obj, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function loadLanguage(lang) {
  if (!['es','en','hu'].includes(lang)) lang = 'es';
  const page = document.body.dataset.page || 'index';
  try {
    const response = await fetch(`locales/${lang}.json`, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    translations = {...(data.common || {}), ...((data.pages || {})[page] || {})};
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('cc_lang', lang);
    applyTranslations();
  } catch (err) {
    console.error('Language file could not be loaded:', err);
  }
}

function applyTranslations() {
  if (!translations) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = getValue(translations, el.dataset.i18n);
    if (value !== undefined) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const value = getValue(translations, el.dataset.i18nPlaceholder);
    if (value !== undefined) el.placeholder = value;
  });
  document.querySelectorAll('.lang button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function initConfig() {
  const c = window.SITE_CONFIG || {};
  document.querySelectorAll('[data-brand]').forEach(e => e.textContent = c.brand || 'CostaCare');
  document.querySelectorAll('[data-phone]').forEach(e => e.textContent = c.phone || '');
  document.querySelectorAll('[data-email]').forEach(e => e.textContent = c.email || '');
  document.querySelectorAll('[data-area]').forEach(e => e.textContent = c.area || '');
  document.querySelectorAll('[data-phone-link]').forEach(e => e.href = 'tel:' + (c.phoneHref || ''));
  document.querySelectorAll('[data-wa]').forEach(e => e.href = 'https://wa.me/' + (c.whatsapp || ''));
  document.querySelectorAll('[data-email-link]').forEach(e => e.href = 'mailto:' + (c.email || ''));
}

function initNavigation() {
  const button = document.querySelector('.menu-btn');
  const links = document.querySelector('.links');
  if (button && links) button.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('.lang button').forEach(btn => {
    btn.addEventListener('click', () => loadLanguage(btn.dataset.lang));
  });
  const demoForm = document.querySelector('[data-demo-form]');
  if (demoForm) demoForm.addEventListener('submit', event => {
    event.preventDefault();
    alert((translations && translations.formAlert) || 'Demo form');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initConfig();
  initNavigation();
  await loadLanguage(localStorage.getItem('cc_lang') || 'es');
});
