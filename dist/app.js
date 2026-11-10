document.getElementById('whatsapp-contact').addEventListener('click', () => {
  const contact = atob('NTUxMTk5MTYwNTM4Nw==');
  const message = 'Olá, Era Selvática! Quero conversar sobre um evento e consultar a disponibilidade de vocês.';
  window.open('https://wa.me/' + contact + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
});
