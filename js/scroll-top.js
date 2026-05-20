(function () {
  var SIZE = 44, R = 18, CIRC = 2 * Math.PI * R;

  var btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.className = 'scroll-top-btn';
  btn.setAttribute('aria-label', '回到頂端');
  btn.innerHTML =
    '<svg class="progress-ring" width="' + SIZE + '" height="' + SIZE + '" viewBox="0 0 ' + SIZE + ' ' + SIZE + '">' +
      '<circle class="progress-ring-track" cx="' + SIZE/2 + '" cy="' + SIZE/2 + '" r="' + R + '"/>' +
      '<circle class="progress-ring-fill" cx="' + SIZE/2 + '" cy="' + SIZE/2 + '" r="' + R + '"/>' +
    '</svg>' +
    '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(btn);

  var fill = btn.querySelector('.progress-ring-fill');
  fill.style.strokeDasharray = CIRC;
  fill.style.strokeDashoffset = CIRC;

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    fill.style.strokeDashoffset = CIRC * (1 - progress);
    btn.classList.toggle('visible', scrollTop > 300);
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
