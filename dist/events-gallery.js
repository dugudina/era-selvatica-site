(() => {
  const gallery = document.querySelector('.events-mosaic');
  const dialog = document.querySelector('.events-photo-dialog');
  const fullPhoto = dialog.querySelector('img');

  gallery.addEventListener('click', event => {
    const thumbnail = event.target.closest('button')?.querySelector('img');
    if (!thumbnail || dialog.open) return;

    fullPhoto.alt = thumbnail.alt;
    fullPhoto.src = thumbnail.currentSrc || thumbnail.src;
    dialog.showModal();
  });
})();
