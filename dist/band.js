const bandSection = document.querySelector('.band');
const bandReveals = bandSection.querySelectorAll('.band-piece, .band-copy > *');
const bandMotionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let bandFrame = 0;

function drawBandSection() {
  bandFrame = 0;
  if (CSS.supports('animation-timeline', 'view()')) return;
  const viewport = window.innerHeight;
  const top = bandSection.getBoundingClientRect().top;
  const clampProgress = value => Math.min(1, Math.max(0, value));
  const scrollProgress = clampProgress((viewport - top) / (viewport * .75));
  const progress = bandMotionPreference.matches ? 1 : scrollProgress * (2 - scrollProgress);
  const backgroundEnd = .24;

  bandSection.style.setProperty('--band-background', clampProgress(progress / backgroundEnd));
  const contentProgress = (progress - backgroundEnd) / (1 - backgroundEnd);
  bandReveals.forEach((part, index) => {
    const reveal = clampProgress(contentProgress * bandReveals.length - index);
    part.style.setProperty('--band-reveal', reveal * reveal * (3 - 2 * reveal));
  });
}

function scheduleBandSection() {
  if (!bandFrame) bandFrame = requestAnimationFrame(drawBandSection);
}

drawBandSection();
window.addEventListener('scroll', scheduleBandSection, { passive: true });
window.addEventListener('resize', scheduleBandSection);
window.addEventListener('pageshow', scheduleBandSection);
bandMotionPreference.addEventListener('change', scheduleBandSection);
