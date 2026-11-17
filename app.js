// Set this to './assets/Xi_Qiao_Resume.pdf' after adding the actual PDF.
// null keeps both PDF actions visibly unavailable, with no broken links.
const resumePdf = null;

const textNodes = [...document.querySelectorAll('[data-zh]')].map(element => ({
  element, en: element.textContent, zh: element.dataset.zh
}));
const ariaNodes = [...document.querySelectorAll('[data-aria-zh]')].map(element => ({
  element, en: element.getAttribute('aria-label'), zh: element.dataset.ariaZh
}));
const languageButtons = [...document.querySelectorAll('[data-language]')];
const descriptions = {
  en: 'Xi Qiao — MS in Computer Science at NYU Tandon, expected 2028. Seeking Summer 2027 software engineering and applied AI internships in the United States.',
  zh: 'Xi Qiao — 纽约大学坦登工程学院计算机科学硕士在读，预计 2028 年毕业。寻找 2027 年美国暑期软件工程与应用人工智能实习机会。'
};

function setLanguage(language) {
  const lang = language === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  textNodes.forEach(({ element, ...text }) => { element.textContent = text[lang]; });
  ariaNodes.forEach(({ element, ...text }) => { element.setAttribute('aria-label', text[lang]); });
  languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));
  document.title = lang === 'zh' ? 'Xi Qiao · 软件工程与应用人工智能' : 'Xi Qiao · Software Engineering & Applied AI';
  document.querySelector('meta[name="description"]').content = descriptions[lang];
  try { localStorage.setItem('xi-qiao-language', lang); } catch { /* Storage may be blocked; the toggle still works. */ }
}

languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
try { if (localStorage.getItem('xi-qiao-language') === 'zh') setLanguage('zh'); } catch { /* English is the default. */ }
document.getElementById('year').textContent = new Date().getFullYear();

async function connectResumePdf() {
  if (!resumePdf) return;
  try {
    const response = await fetch(resumePdf, { method: 'HEAD' });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) return;
    for (const id of ['view-pdf', 'download-pdf']) {
      const link = document.getElementById(id);
      link.href = resumePdf;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
    }
    const view = document.getElementById('view-pdf');
    view.target = '_blank';
    view.rel = 'noopener noreferrer';
    document.getElementById('download-pdf').download = 'Xi_Qiao_Resume.pdf';
    document.getElementById('pdf-status').hidden = true;
  } catch { /* Keep the honest missing-PDF state if the file cannot be loaded. */ }
}
connectResumePdf();

// The sprite heads face up. atan2 + 90 degrees turns them toward the pointer.
// No roaming, pulsing, trails, easing, or perpetual animation loop.
const insects = [
  { x: 4, y: 23, size: 78, type: 0, angle: 35 },
  { x: 96, y: 19, size: 80, type: 1, angle: -40 },
  { x: 3.5, y: 62, size: 77, type: 2, angle: 50 },
  { x: 96.5, y: 68, size: 65, type: 3, angle: -55 },
  { x: 4.5, y: 89, size: 65, type: 4, angle: 30 },
  { x: 96, y: 85, size: 68, type: 5, angle: -35 },
  { x: 4, y: 4, size: 51, type: 5, angle: 145 },
  { x: 96, y: 98, size: 58, type: 0, angle: -25 }
];
const border = document.querySelector('.insect-border');
const insectElements = insects.map(({ x, y, size, type, angle }) => {
  const position = document.createElement('span');
  position.className = 'insect';
  position.style.cssText = `--x:${x}%;--y:${y}%;--size:${size}px;--sprite-x:${(type % 3) * 50}%;--sprite-y:${Math.floor(type / 3) * 100}%;--angle:${angle}deg`;
  const sprite = document.createElement('span');
  sprite.className = 'insect-sprite';
  position.append(sprite);
  border.append(position);
  return { position, sprite };
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(any-pointer: fine)');
let latestPointer;
let animationFrame = 0;
function pointInsects() {
  animationFrame = 0;
  if (!latestPointer || reducedMotion.matches || !finePointer.matches) return;
  insectElements.forEach(({ position }) => {
    if (!position.getClientRects().length) return;
    const rect = position.getBoundingClientRect();
    const angle = Math.atan2(latestPointer.y - rect.top - rect.height / 2, latestPointer.x - rect.left - rect.width / 2) * 180 / Math.PI + 90;
    position.style.transform = `rotate(${angle}deg)`;
  });
}
window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reducedMotion.matches || !finePointer.matches) return;
  latestPointer = { x: event.clientX, y: event.clientY };
  if (!animationFrame) animationFrame = requestAnimationFrame(pointInsects);
}, { passive: true });
window.addEventListener('resize', () => {
  if (latestPointer && !animationFrame) animationFrame = requestAnimationFrame(pointInsects);
}, { passive: true });
