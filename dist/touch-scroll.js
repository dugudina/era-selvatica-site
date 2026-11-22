(() => {
  let lastY = null;

  window.addEventListener('touchstart', event => {
    const nativeScroll = event.target.closest('.site-menu, dialog') || document.querySelector('dialog[open]');
    lastY = event.touches.length === 1 && !nativeScroll ? event.touches[0].clientY : null;
  }, { passive: true });

  window.addEventListener('touchmove', event => {
    if (lastY === null || event.touches.length !== 1) return;

    const currentY = event.touches[0].clientY;
    const distance = lastY - currentY;
    lastY = currentY;

    if (event.defaultPrevented || !event.cancelable || distance === 0) return;

    // Move only while the finger is down so the browser cannot add momentum.
    event.preventDefault();
    window.scrollBy({ top: distance, behavior: 'instant' });
  }, { passive: false });

  function endGesture() {
    lastY = null;
  }

  window.addEventListener('touchend', endGesture, { passive: true });
  window.addEventListener('touchcancel', endGesture, { passive: true });
})();
