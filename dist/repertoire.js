const section = document.querySelector(".repertoire");
const windowPanel = section.querySelector(".repertoire-window");
const list = section.querySelector(".repertoire-list");
const groups = Array.from(list.children);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function repeatGroup(group) {
  const copy = group.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  return copy;
}

const before = groups.slice(-3).map(repeatGroup);
const after = groups.slice(0, 3).map(repeatGroup);
const visibleGroups = [...before, ...groups, ...after];
let rowHeight = 0;
let frame = 0;

function render() {
  frame = 0;
  if (!rowHeight) return;

  const progress = Math.min(groups.length - 1, Math.max(0, -section.getBoundingClientRect().top / rowHeight));
  const active = Math.round(progress) + before.length;
  const position = progress + before.length;

  list.style.transform = `translateY(${-(position + 0.5) * rowHeight}px)`;

  visibleGroups.forEach((group, index) => {
    const distance = Math.abs(index - position);
    group.style.opacity = index === active ? "1" : String(Math.max(0, 0.55 - distance * 0.19));
  });
}

function measure() {
  if (!section.classList.contains("is-scrolling")) return;

  rowHeight = groups[0].getBoundingClientRect().height;
  section.style.setProperty("--repertoire-distance", `${rowHeight * (groups.length - 0.5)}px`);
  render();
}

function configure() {
  if (reducedMotion.matches || window.innerHeight < 360) {
    section.classList.remove("is-scrolling");
    rowHeight = 0;
    list.style.removeProperty("transform");
    for (const group of groups) group.style.removeProperty("opacity");
    for (const copy of [...before, ...after]) copy.remove();
    return;
  }

  if (!section.classList.contains("is-scrolling")) {
    list.prepend(...before);
    list.append(...after);
    section.classList.add("is-scrolling");
  }
  measure();
}

window.addEventListener("scroll", () => {
  if (rowHeight && !frame) frame = requestAnimationFrame(render);
}, { passive: true });
window.addEventListener("resize", configure);
reducedMotion.addEventListener("change", configure);
new ResizeObserver(measure).observe(windowPanel);
configure();
