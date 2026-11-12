const videos = document.querySelectorAll("video");
const observer = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
});

for (const video of videos) {
  observer.observe(video);
}
