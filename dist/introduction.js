const introduction = document.querySelector('.introduction');
const introductionParts = introduction.querySelectorAll('.wrap > *');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const backgroundEnd = 0.36;

let frameId = 0;

function drawIntroduction() {
  frameId = 0;
  if (CSS.supports('animation-timeline', 'view()')) {
    const sectionTop = introduction.getBoundingClientRect().top + window.scrollY;
    const offset = Math.max(0, window.innerHeight - sectionTop);
    introduction.style.setProperty('--intro-scroll-offset', `${offset}px`);
    introduction.style.setProperty('--intro-scroll-distance', `${Math.max(1, window.innerHeight * .75 - offset)}px`);
    return;
  }

  if (motionPreference.matches) {
    introduction.style.removeProperty('--intro-background');
    introductionParts.forEach(part => part.style.removeProperty('--intro-reveal'));
    return;
  }

  const viewportHeight = window.innerHeight;
  const availableTop = introduction.getBoundingClientRect().top + window.scrollY;
  const startAt = Math.max(0, availableTop - viewportHeight);
  const finishAt = Math.max(startAt + 1, availableTop - viewportHeight * 0.25);
  const scrollProgress = Math.min(1, Math.max(0, (window.scrollY - startAt) / (finishAt - startAt)));
  const progress = scrollProgress * (2 - scrollProgress);

  introduction.style.setProperty('--intro-background', Math.min(1, progress / backgroundEnd));

  const textProgress = (progress - backgroundEnd) / (1 - backgroundEnd);
  introductionParts.forEach((part, index) => {
    const reveal = Math.min(1, Math.max(0, textProgress * introductionParts.length - index));
    part.style.setProperty('--intro-reveal', reveal);
  });
}

function scheduleIntroduction() {
  if (!frameId) frameId = requestAnimationFrame(drawIntroduction);
}

drawIntroduction();
window.addEventListener('scroll', scheduleIntroduction, { passive: true });
window.addEventListener('resize', scheduleIntroduction);
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
