(() => {
  const menu = document.querySelector('.site-menu');
  const track = menu.querySelector('.site-menu-scroll');
  const list = track.querySelector('ul');
  const previous = menu.querySelector('.site-menu-prev');
  const next = menu.querySelector('.site-menu-next');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...track.querySelectorAll('a')].map(link => ({
    link,
    section: document.querySelector(link.hash),
  }));
  const eventsTitle = document.querySelector('#eventos-titulo');
  const eventsTitleGap = 56;
  const finishAssembly = new Set(['quem-somos', 'banda', 'cidades', 'estrutura', 'historia']);
  let activeLink;
  let frame = 0;

  function fitMenuToViewport() {
    const width = window.visualViewport?.width ?? document.documentElement.clientWidth;
    menu.style.setProperty('--menu-viewport-width', `${Math.floor(width)}px`);
    updateArrows();
  }

  function updateArrows() {
    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    previous.hidden = track.scrollLeft < 2;
    next.hidden = remaining < 2;
  }

  function shiftMenu(distance) {
    track.scrollBy({ left: distance, behavior: motion.matches ? 'instant' : 'smooth' });
  }

  function updateActiveSection() {
    frame = 0;
    const menuBottom = menu.getBoundingClientRect().bottom;
    const marker = (menuBottom + window.innerHeight) / 2;
    let current = sections[0].link;
    for (const { link, section } of sections) {
      const bounds = section.getBoundingClientRect();
      const threshold = finishAssembly.has(section.id) ? marker : menuBottom + 1;
      const top = section.id === 'eventos'
        ? eventsTitle.getBoundingClientRect().top - eventsTitleGap
        : bounds.top;
      if (top <= threshold) current = link;
    }
    const page = document.documentElement;
    if (page.scrollHeight - page.clientHeight - window.scrollY <= 2) {
      current = sections.at(-1).link;
    }
    if (activeLink === current) return;

    activeLink?.removeAttribute('aria-current');
    current.setAttribute('aria-current', 'location');
    activeLink = current;

    const bounds = track.getBoundingClientRect();
    const item = current.getBoundingClientRect();
    if (item.left < bounds.left || item.right > bounds.right) {
      shiftMenu((item.left + item.right - bounds.left - bounds.right) / 2);
    }
  }

  function scheduleActiveSection() {
    if (!frame) frame = requestAnimationFrame(updateActiveSection);
  }

  track.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const { section } = sections.find(item => item.link === link);
    if (section.id === 'inicio') return;

    const menuBottom = menu.getBoundingClientRect().bottom;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const bounds = section.getBoundingClientRect();
    let targetTop = menuBottom;
    if (section.id === 'eventos') {
      targetTop += eventsTitleGap + bounds.top - eventsTitle.getBoundingClientRect().top;
    }

    if (finishAssembly.has(section.id)) {
      const centeredTop = menuBottom + Math.max(0, (viewportHeight - menuBottom - bounds.height) / 2);
      const completionTop = motion.matches ? Infinity : assemblyCompletionTop(section, viewportHeight) - 1;
      targetTop = Math.min(centeredTop, completionTop);
    }

    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    window.scrollTo({
      top: window.scrollY + bounds.top - targetTop,
      behavior: motion.matches ? 'instant' : 'smooth',
    });
  });

  previous.addEventListener('click', () => shiftMenu(-track.clientWidth * .75));
  next.addEventListener('click', () => shiftMenu(track.clientWidth * .75));
  track.addEventListener('scroll', updateArrows, { passive: true });
  const menuLayout = new ResizeObserver(updateArrows);
  menuLayout.observe(track);
  menuLayout.observe(list);
  window.addEventListener('headerassembled', () => {
    requestAnimationFrame(fitMenuToViewport);
    scheduleActiveSection();
  });
  window.addEventListener('pageshow', fitMenuToViewport);
  window.addEventListener('resize', fitMenuToViewport);
  window.visualViewport?.addEventListener('resize', fitMenuToViewport);
  window.addEventListener('scroll', scheduleActiveSection, { passive: true });
  window.addEventListener('resize', scheduleActiveSection);
  window.addEventListener('pageshow', scheduleActiveSection);
  fitMenuToViewport();
  scheduleActiveSection();
})();

(() => {
  const dialog = document.querySelector('.history-dialog');
  const opener = document.querySelector('.history-open');
  const copy = dialog.querySelector('.history-dialog-copy');

  opener.addEventListener('click', () => {
    dialog.showModal();
    copy.scrollTop = 0;
  });
  dialog.addEventListener('close', () => opener.focus({ preventScroll: true }));
})();
