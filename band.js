const bandSection = document.querySelector('.band');
const bandReveals = bandSection.querySelectorAll('.band-piece, .band-copy > *');
const bandMotionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const bandStops = [0, .16, .23, .30, .37, .45, .55, .65, .75];
let bandFrame = 0;

function drawBandSection() {
  bandFrame = 0;
  const top = bandSection.getBoundingClientRect().top + window.scrollY;
  const viewport = window.innerHeight;
  const entered = (window.scrollY - Math.max(0, top - viewport)) / viewport;
  const progress = bandMotionPreference.matches ? 1 : entered;
  bandSection.style.setProperty('--band-background', revealBetween(progress, 0, bandStops[1]));
  bandReveals.forEach((part, index) => {
    const reveal = revealBetween(progress, bandStops[index + 1], bandStops[index + 2]);
    part.style.setProperty('--band-reveal', reveal * (2 - reveal));
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
new ResizeObserver(scheduleBandSection).observe(document.querySelector(".introduction"));
new ResizeObserver(scheduleBandSection).observe(document.querySelector(".site-header"));
