renderHero();
renderSocials();
renderProjects();

// Entrance animation
(function () {
  var els = document.querySelectorAll('[data-a]');
  els.forEach(function (el, i) {
    el.style.transition = 'opacity .5s ease ' + (i * 0.07) + 's, transform .5s ease ' + (i * 0.07) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();

// Copy Discord handle on click
document.getElementById('dc-handle').addEventListener('click', function () {
  var text = this.textContent.replace('@', '');
  navigator.clipboard.writeText(text);
  var toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 2000);
});

// Mouse glow
var glow = document.getElementById('mouse-glow');
document.addEventListener('mousemove', function (e) {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// Avatar click pop
document.getElementById('s-initial').addEventListener('click', function () {
  var av = this;
  av.classList.remove('popping');
  void av.offsetWidth;
  av.classList.add('popping');
  setTimeout(function () { av.classList.remove('popping'); }, 400);
});

// Custom cursor
(function () {
  var cur = document.getElementById('cursor');
  cur.style.transition = 'width 0.15s ease, height 0.15s ease, opacity 0.2s ease';

  document.addEventListener('mousemove', function (e) {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, [role="button"]')) {
      cur.style.width  = '28px';
      cur.style.height = '28px';
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('a, button, [role="button"]')) {
      cur.style.width  = '20px';
      cur.style.height = '20px';
    }
  });

  document.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { cur.style.opacity = '1'; });
})();

// Konami code easter egg
(function () {
  var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], idx = 0;

  document.addEventListener('keydown', function (e) {
    if (e.keyCode === seq[idx]) {
      idx++;
      if (idx === seq.length) { idx = 0; triggerEgg(); }
    } else { idx = 0; }
  });

  function triggerEgg() {
    var colors = ['#f43f8a', '#c084fc', '#ffffff', '#f9a8d4'];
    for (var i = 0; i < 60; i++) spawnParticle(colors[Math.floor(Math.random() * colors.length)]);

    var flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:rgba(244,63,138,0.08);pointer-events:none;z-index:9990;transition:opacity 0.6s ease;';
    document.body.appendChild(flash);
    setTimeout(function () { flash.style.opacity = '0'; }, 50);
    setTimeout(function () { flash.remove(); }, 700);

    var toast = document.getElementById('toast');
    toast.textContent = '🎉 Bring dich um!';
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); toast.textContent = 'Copied!'; }, 3000);
  }

  function spawnParticle(color) {
    var p = document.createElement('div');
    var x = Math.random() * window.innerWidth;
    var y = Math.random() * window.innerHeight;
    var angle = Math.random() * 360;
    var dist  = 80 + Math.random() * 120;
    var size  = 4 + Math.random() * 6;
    var dur   = 600 + Math.random() * 600;
    p.style.cssText = 'position:fixed;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';left:' + x + 'px;top:' + y + 'px;pointer-events:none;z-index:9989;transition:transform ' + dur + 'ms ease-out, opacity ' + dur + 'ms ease-out;';
    document.body.appendChild(p);
    requestAnimationFrame(function () {
      var rad = angle * Math.PI / 180;
      p.style.transform = 'translate(' + (Math.cos(rad) * dist) + 'px,' + (Math.sin(rad) * dist) + 'px)';
      p.style.opacity = '0';
    });
    setTimeout(function () { p.remove(); }, dur + 50);
  }
})();

// Animated title
(function () {
  var frames = ['Cozy', 'Coz', 'Co', 'C', 'Co', 'Coz', 'Cozy', '~ozy', 'C~zy', 'Co~y', 'Coz~', 'Cozy'];
  var idx = 0, interval = null;
  function start() { interval = setInterval(function () { idx = (idx + 1) % frames.length; document.title = frames[idx]; }, 1000); }
  function stop()  { clearInterval(interval); document.title = CONFIG.name; }
  start();
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); document.title = 'Cozy'; } else { document.title = CONFIG.name; start(); }
  });
})();

// Twitch live badge
(function () {
  fetch('https://decapi.me/twitch/uptime/' + CONFIG.twitchUser)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      if (text.toLowerCase().includes('offline') || text.toLowerCase().includes('not live')) return;
      var twitchLink = document.querySelector('a[href*="twitch.tv"]');
      if (!twitchLink) return;
      var badge = document.createElement('span');
      badge.textContent = '● LIVE';
      badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#e53935;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:99px;letter-spacing:0.05em;border:1.5px solid var(--bg);pointer-events:none;';
      twitchLink.parentElement.style.position = 'relative';
      twitchLink.parentElement.appendChild(badge);
    }).catch(function () {});
})();
