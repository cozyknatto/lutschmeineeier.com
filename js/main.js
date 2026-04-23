renderHero();
renderSocials();
renderProjects();

(function () {
  var els = document.querySelectorAll('[data-a]');
  els.forEach(function (el, i) {
    el.style.transition = 'opacity .45s ease ' + (i * 0.06) + 's, transform .45s ease ' + (i * 0.06) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();