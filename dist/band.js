registerAssembly(
  document.querySelector('.band'),
  '.band-piece, .band-copy > *',
  null,
  '--band-reveal'
);

for (const section of document.querySelectorAll('.footer-assembly')) {
  registerAssembly(section, '.wrap > :not(ul)', null, '--band-reveal');
  registerAssembly(section, '.wrap > ul > li', null, '--band-reveal', 0.035);
}

registerAssembly(
  document.querySelector('.formations'),
  '.wrap > h2, .wrap > p, .formation-card',
  null,
  '--band-reveal',
  .06
);

registerAssembly(
  document.querySelector('.band-history'),
  '.wrap > *',
  null,
  '--band-reveal',
  .06
);
