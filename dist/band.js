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
