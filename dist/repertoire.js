(() => {
  const section = document.querySelector('.repertoire');
  const stage = section.querySelector('.repertoire-stage');
  const list = section.querySelector('.repertoire-list');
  const rows = [...list.querySelectorAll('.repertoire-row')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const viewport = window.visualViewport;
  const lastGroup = rows.length - 1;
  let frame = 0;
  let travel = 0;

  function updateRepertoire() {
    frame = 0;
    if (!section.classList.contains('is-assembled')) return;

    const sectionBounds = section.getBoundingClientRect();
    const viewportTop = viewport?.offsetTop ?? 0;
    const distancePastTop = viewportTop - sectionBounds.top;
    const pinned = distancePastTop >= 0 && distancePastTop < travel;

    stage.classList.toggle('is-pinned', pinned);
    stage.classList.toggle('is-released', distancePastTop >= travel);
    if (pinned) {
      stage.style.setProperty('--repertoire-viewport-top', `${viewportTop}px`);
      stage.style.setProperty('--repertoire-stage-left', `${sectionBounds.left}px`);
      stage.style.setProperty('--repertoire-stage-width', `${sectionBounds.width}px`);
    }

    const progress = Math.min(1, Math.max(0, distancePastTop / travel));
    const position = progress * lastGroup;
    const currentGroup = Math.round(position);

    list.style.setProperty('--repertoire-position', position);

    rows.forEach((row, index) => {
      const distance = Math.abs(index - position);
      const opacity = distance <= 1
        ? 1 - distance * .66
        : distance <= 2
          ? .34 - (distance - 1) * .24
          : Math.max(0, .10 * (3 - distance));
      row.classList.toggle('is-current', index === currentGroup);
      row.style.setProperty('--repertoire-opacity', opacity);
    });
  }

  function scheduleRepertoire() {
    if (!frame) frame = requestAnimationFrame(updateRepertoire);
  }

  function configureRepertoire() {
    const assembled = !reducedMotion.matches;
    section.classList.toggle('is-assembled', assembled);
    if (assembled) {
      const height = viewport?.height || window.innerHeight;
      travel = height * .24 * lastGroup;
      section.style.setProperty('--repertoire-viewport-height', `${height}px`);
      section.style.setProperty('--repertoire-travel', `${travel}px`);
    } else {
      stage.classList.remove('is-pinned', 'is-released');
    }
    scheduleRepertoire();
  }

  window.addEventListener('scroll', scheduleRepertoire, { passive: true });
  window.addEventListener('resize', configureRepertoire);
  window.addEventListener('pageshow', scheduleRepertoire);
  viewport?.addEventListener('resize', configureRepertoire);
  viewport?.addEventListener('scroll', scheduleRepertoire);
  reducedMotion.addEventListener('change', configureRepertoire);
  configureRepertoire();
})();
