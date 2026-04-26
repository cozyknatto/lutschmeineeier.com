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

// Copy on Click — Discord Handle
document.getElementById('dc-handle').style.cursor = 'pointer';
document.getElementById('dc-handle').addEventListener('click', function () {
  var text = this.textContent.replace('@', '');
  navigator.clipboard.writeText(text);
  var toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 2000);
});

// Mouse Glow
var glow = document.getElementById('mouse-glow');
document.addEventListener('mousemove', function (e) {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// Konami Code
(function () {
  var sequence = [38,38,40,40,37,39,37,39,66,65];
  var index = 0;

  document.addEventListener('keydown', function (e) {
    if (e.keyCode === sequence[index]) {
      index++;
      if (index === sequence.length) {
        index = 0;
        triggerEasterEgg();
      }
    } else {
      index = 0;
    }
  });

  function triggerEasterEgg() {
    // Burst aus Partikeln
    var colors = ['#d946ef', '#7c3aed', '#ffffff', '#f0abfc'];
    for (var i = 0; i < 60; i++) {
      spawnParticle(colors[Math.floor(Math.random() * colors.length)]);
    }

    // Kurzer Screen-Flash
    var flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:rgba(217,70,239,0.08);pointer-events:none;z-index:999;transition:opacity 0.6s ease;';
    document.body.appendChild(flash);
    setTimeout(function () { flash.style.opacity = '0'; }, 50);
    setTimeout(function () { flash.remove(); }, 700);

    // Toast
    var toast = document.getElementById('toast');
    toast.textContent = '🎉 Bring dich um!';
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
      toast.textContent = 'Copied!';
    }, 3000);
  }

  function spawnParticle(color) {
    var p = document.createElement('div');
    var x = Math.random() * window.innerWidth;
    var y = Math.random() * window.innerHeight;
    var angle = Math.random() * 360;
    var distance = 80 + Math.random() * 120;
    var size = 4 + Math.random() * 6;
    var duration = 600 + Math.random() * 600;

    p.style.cssText = 
      'position:fixed;width:' + size + 'px;height:' + size + 'px;' +
      'border-radius:50%;background:' + color + ';' +
      'left:' + x + 'px;top:' + y + 'px;pointer-events:none;z-index:998;' +
      'transition:transform ' + duration + 'ms ease-out, opacity ' + duration + 'ms ease-out;';

    document.body.appendChild(p);

    requestAnimationFrame(function () {
      var rad = angle * Math.PI / 180;
      p.style.transform = 'translate(' + (Math.cos(rad) * distance) + 'px, ' + (Math.sin(rad) * distance) + 'px)';
      p.style.opacity = '0';
    });

    setTimeout(function () { p.remove(); }, duration + 50);
  }
})();

// Avatar Klick
document.getElementById('s-initial').addEventListener('click', function () {
  var av = this;
  av.classList.remove('popping');
  void av.offsetWidth; // reflow trick damit animation neu startet
  av.classList.add('popping');
  setTimeout(function () { av.classList.remove('popping'); }, 400);
});

// Twitch Live Badge
(function () {
  var twitchUser = CONFIG.twitchUser;

  fetch('https://decapi.me/twitch/uptime/' + twitchUser)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var isLive = !text.toLowerCase().includes('offline') && !text.toLowerCase().includes('not live');
      if (!isLive) return;

      var twitchLink = document.querySelector('a[href*="twitch.tv"]');
      if (!twitchLink) return;

      var badge = document.createElement('span');
      badge.textContent = '● LIVE';
      badge.style.cssText =
        'position:absolute;top:-6px;right:-6px;' +
        'background:#e53935;color:#fff;font-size:9px;font-weight:700;' +
        'padding:2px 5px;border-radius:99px;letter-spacing:0.05em;' +
        'border:1.5px solid var(--bg);pointer-events:none;';

      twitchLink.parentElement.style.position = 'relative';
      twitchLink.parentElement.appendChild(badge);
    })
    .catch(function () {});
})();

// Custom Cursor
(function () {
  var cursor = document.getElementById('cursor');
  
  // Transition nur für size, NICHT für position
  cursor.style.transition = 'width 0.15s ease, height 0.15s ease, opacity 0.2s ease';

  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button, [role="button"]')) {
      cursor.style.width  = '28px';
      cursor.style.height = '28px';
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('a, button, [role="button"]')) {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
    }
  });

  document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
})();

// View Counter
(function () {
  fetch('https://api.countapi.xyz/hit/lutschmeineeier.com/visits')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var el = document.getElementById('s-views');
      if (el && data.value) el.textContent = data.value.toLocaleString() + ' views';
    })
    .catch(function () {});
})();

// Animated Title + Come Back
(function () {
  var frames   = ['Cozy', 'Coz', 'Co', 'C', 'Co', 'Coz', 'Cozy', '~ozy', 'C~zy', 'Co~y', 'Coz~', 'Cozy', 'Coz y', 'Co z y', 'C o z y', 'C o zy', 'C ozy'];
  var idx      = 0;
  var interval = null;

  function startAnimation() {
    interval = setInterval(function () {
      idx = (idx + 1) % frames.length;
      document.title = frames[idx];
    }, 1000);
  }

  function stopAnimation() {
    clearInterval(interval);
    document.title = CONFIG.name;
  }

  startAnimation();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAnimation();
      document.title = 'Cozy';
    } else {
      document.title = CONFIG.name;
      startAnimation();
    }
  });
})();

