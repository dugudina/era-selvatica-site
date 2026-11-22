const introduction = document.querySelector('.introduction');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const assemblies = [];
let frameId = 0;

function assemblyProgress(top, viewportHeight, duration = 0.1) {
  const start = viewportHeight * 0.8;
  return Math.min(1, Math.max(0, (start - top) / (viewportHeight * duration)));
}

function layoutOffset(item, section) {
  // Use layout coordinates so the item's own translation or scale cannot move its trigger.
  let top = 0;
  for (let node = item; node && node !== section; node = node.offsetParent) {
    top += node.offsetTop;
  }
  return top;
}

function* assemblyOffsets(section, items, stagger, height) {
  let nextOffset = -Infinity;
  for (const item of items) {
    const offset = Math.max(nextOffset, layoutOffset(item, section));
    yield [item, offset];
    if (stagger) nextOffset = offset + height * stagger;
  }
}

function assemblyCompletionTop(section, height) {
  let top = Infinity;
  for (const { section: animatedSection, items, stagger } of assemblies) {
    if (animatedSection !== section) continue;
    for (const [, offset] of assemblyOffsets(section, items, stagger, height)) {
      top = Math.min(top, height * (.8 - (stagger || .1)) - offset);
    }
  }
  return top;
}

function drawAssemblies() {
  frameId = 0;
  const viewport = window.visualViewport;
  const height = viewport?.height ?? window.innerHeight;
  if (height <= 0) return;

  const visibleTop = viewport?.offsetTop ?? 0;
  const reducedMotion = motionPreference.matches;

  for (const { section, background, items, property, stagger } of assemblies) {
    const top = section.getBoundingClientRect().top - visibleTop;
    if (background) {
      section.style.setProperty(background, reducedMotion ? 1 : assemblyProgress(top, height));
    }

    for (const [item, offset] of assemblyOffsets(section, items, stagger, height)) {
      const progress = assemblyProgress(top + offset, height, stagger || undefined);
      item.style.setProperty(property, reducedMotion ? 1 : progress);
    }
  }
}

function scheduleAssemblies() {
  if (!frameId) frameId = requestAnimationFrame(drawAssemblies);
}

const assemblyLayout = new ResizeObserver(scheduleAssemblies);
assemblyLayout.observe(document.querySelector('.site-header'));

function registerAssembly(section, selector, background, property, stagger = 0) {
  assemblies.push({ section, background, items: section.querySelectorAll(selector), property, stagger });
  assemblyLayout.observe(section);
  scheduleAssemblies();
}

registerAssembly(introduction, '.wrap > *', '--intro-background', '--intro-reveal');
registerAssembly(document.querySelector('.events-mosaic'), 'button', null, '--event-photo-reveal', 0.045);
window.addEventListener('scroll', scheduleAssemblies, { passive: true });
window.addEventListener('resize', scheduleAssemblies);
window.visualViewport?.addEventListener('resize', scheduleAssemblies);
window.visualViewport?.addEventListener('scroll', scheduleAssemblies, { passive: true });
motionPreference.addEventListener('change', scheduleAssemblies);

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
  scheduleAssemblies();
}

if (window.scrollY === 0 && !location.hash &&
    pianoAnimations.some(animation => animation.playState === 'running' || animation.pending)) {
  scrollRoot.classList.add('header-assembling');
  window.addEventListener('wheel', blockHeaderScroll, { capture: true, passive: false });
  window.addEventListener('touchmove', blockHeaderScroll, { capture: true, passive: false });
  window.addEventListener('keydown', blockHeaderScrollKey, true);
}
Promise.allSettled(pianoAnimations.map(animation => animation.finished)).then(results => {
  releaseHeaderScroll();
  scrollRoot.classList.add('header-assembled');
  window.dispatchEvent(new Event('headerassembled'));
  if (motionPreference.matches || !results.some(result => result.status === 'fulfilled')) return;

  document.querySelector('.site-header').classList.add('header-piano-ready');
  for (const motion of document.querySelectorAll('#logo-lizard-motion animate')) {
    motion.beginElement?.();
  }
});

window.addEventListener('pageshow', () => {
  if (window.scrollY > 0 || location.hash) releaseHeaderScroll();
  scheduleAssemblies();
});
