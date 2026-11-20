(() => {
  const form = document.querySelector('.contact-form');
  const date = form.elements.namedItem('event-date');
  const fields = [
    ['event-type', 'Tipo de evento'],
    ['event-lineup', 'Formação'],
    ['event-date', 'Data'],
    ['event-venue', 'Local'],
    ['event-city', 'Cidade'],
    ['event-setup', 'Estrutura']
  ];
  const message = form.elements.namedItem('text');
  const greeting = message.value;

  date.addEventListener('input', () => {
    date.setCustomValidity('');
    const digits = date.value.replace(/\D/g, '').slice(0, 8);
    const masked = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
    if (date.value !== masked) date.value = masked;
  });

  function validDate(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
    const [day, month, year] = value.split('/').map(Number);
    const calendarDate = new Date(0);
    calendarDate.setUTCFullYear(year, month - 1, day);
    return year > 0 && calendarDate.getUTCFullYear() === year
      && calendarDate.getUTCMonth() === month - 1 && calendarDate.getUTCDate() === day;
  }

  form.addEventListener('submit', event => {
    if (date.value && !validDate(date.value)) {
      event.preventDefault();
      date.setCustomValidity('Informe uma data válida no formato dd/mm/aaaa.');
      date.reportValidity();
      return;
    }

    const details = fields.flatMap(([id, label]) => {
      const value = form.elements.namedItem(id).value.trim();
      return value ? [label + ': ' + value] : [];
    });
    message.value = details.length ? greeting + '\n\n' + details.join('\n') : greeting;
  });
})();
