const introduction = document.querySelector('.introduction');
const introductionParts = introduction.querySelectorAll('.wrap > *');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const introStops = [0, .21, .32, .45, .59, .72, .85, 1];
const clampReveal = value => Math.min(1, Math.max(0, value));
const revealBetween = (position, start, end) => clampReveal((position - start) / (end - start));

let frameId = 0;

function drawIntroduction() {
  frameId = 0;
  if (motionPreference.matches) {
    introduction.style.removeProperty('--intro-background');
    introductionParts.forEach(part => part.style.removeProperty('--intro-reveal'));
    return;
  }

  const viewportHeight = window.innerHeight;
  const availableTop = introduction.getBoundingClientRect().top + window.scrollY;
  const startAt = Math.max(0, availableTop - viewportHeight);
  const finishAt = Math.max(startAt + 1, availableTop - viewportHeight * 0.25);
  const progress = revealBetween(window.scrollY, startAt, finishAt);
  introduction.style.setProperty('--intro-background', revealBetween(progress, 0, introStops[1]));
  introductionParts.forEach((part, index) => {
    const reveal = revealBetween(progress, introStops[index + 1], introStops[index + 2]);
    part.style.setProperty('--intro-reveal', reveal * (2 - reveal));
  });
}

function scheduleIntroduction() {
  if (!frameId) frameId = requestAnimationFrame(drawIntroduction);
}

drawIntroduction();
window.addEventListener('scroll', scheduleIntroduction, { passive: true });
window.addEventListener('resize', scheduleIntroduction);
motionPreference.addEventListener('change', scheduleIntroduction);
new ResizeObserver(scheduleIntroduction).observe(document.querySelector('.site-header'));
const pianoAnimations = document.querySelector('.header-piano').getAnimations();
const scrollRoot = document.documentElement;

function blockHeaderScroll(event) {
  event.preventDefault();
}

function blockHeaderScrollKey(event) {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
    blockHeaderScroll(event);
  }
}

function releaseHeaderScroll() {
  window.removeEventListener('wheel', blockHeaderScroll, true);
  window.removeEventListener('touchmove', blockHeaderScroll, true);
  window.removeEventListener('keydown', blockHeaderScrollKey, true);
  scrollRoot.classList.remove('header-assembling');
  scheduleIntroduction();
}

if (window.scrollY === 0 && !location.hash &&
    pianoAnimations.some(animation => animation.playState === 'running' || animation.pending)) {
  scrollRoot.classList.add('header-assembling');
  window.addEventListener('wheel', blockHeaderScroll, { capture: true, passive: false });
  window.addEventListener('touchmove', blockHeaderScroll, { capture: true, passive: false });
  window.addEventListener('keydown', blockHeaderScrollKey, true);
}
Promise.allSettled(pianoAnimations.map(animation => animation.finished)).then(releaseHeaderScroll);

window.addEventListener('pageshow', () => {
  if (window.scrollY > 0 || location.hash) releaseHeaderScroll();
  scheduleIntroduction();
});
