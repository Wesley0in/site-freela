// OnlineJá — interações leves, sem dependências

// Menu mobile
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

// Fecha o menu ao navegar
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
  });
});

// Reinicia a animação de montagem do mockup do hero em loop
const buildBlocks = document.querySelectorAll('.build');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (buildBlocks.length && !prefersReducedMotion) {
  const STAGGER_MS = 350;
  const HOLD_MS = 4000;

  setInterval(() => {
    buildBlocks.forEach((block) => {
      block.style.animation = 'none';
      // força reflow para reiniciar a animação CSS
      void block.offsetWidth;
      block.style.animation = '';
    });
  }, buildBlocks.length * STAGGER_MS + HOLD_MS);
}
