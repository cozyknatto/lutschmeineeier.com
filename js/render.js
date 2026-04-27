function renderHero() {
  var av = document.getElementById('s-initial');
  if (CONFIG.avatar) {
    av.innerHTML = '<img src="' + CONFIG.avatar + '" alt="' + CONFIG.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  } else {
    av.textContent = CONFIG.name[0];
  }
  document.title = CONFIG.name;
  document.getElementById('s-name').textContent   = CONFIG.name;
  document.getElementById('s-footer').textContent = 'lutschmeineeier.com';

  var bioEl = document.getElementById('s-bio');
  var text  = CONFIG.bio;
  var i     = 0;
  bioEl.textContent = '';

  var blinkCursor = document.createElement('span');
  blinkCursor.textContent = '|';
  blinkCursor.style.cssText = 'color:var(--pink);animation:blink 0.7s step-end infinite;margin-left:1px;';
  bioEl.appendChild(blinkCursor);

  setTimeout(function type() {
    if (i < text.length) {
      bioEl.insertBefore(document.createTextNode(text[i]), blinkCursor);
      i++;
      setTimeout(type, 35 + Math.random() * 25);
    } else {
      setTimeout(function () {
        blinkCursor.style.animation = 'none';
        blinkCursor.style.opacity   = '0';
      }, 1000);
    }
  }, 600);
}

function renderSocials() {
  var wrap = document.getElementById('s-socials');
  CONFIG.socials.forEach(function (s) {
    var a = document.createElement('a');
    a.href      = s.url;
    a.className = 'social';
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[s.icon] + '</svg><span>' + s.title + '</span>';
    wrap.appendChild(a);
  });
}

function renderProjects() {
  var grid = document.getElementById('s-grid');
  CONFIG.projects.forEach(function (p) {
    var a = document.createElement('a');
    a.href      = p.url;
    a.className = 'card';
    a.setAttribute('data-a', '');
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';

    var imgHtml  = p.img ? '<img src="' + p.img + '" alt="' + p.name + '">' : '';
    var tagsHtml = (p.tags || []).map(function (t) {
      return '<span class="tag">' + t + '</span>';
    }).join('');

    a.innerHTML =
      '<div class="thumb">' +
        '<div class="thumb-bg" style="background:' + p.gradient + '"></div>' +
        (p.emoji ? '<div class="thumb-emoji">' + p.emoji + '</div>' : '') +
        imgHtml +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-name">' + p.name + '</div>' +
        '<div class="card-desc">'  + p.desc  + '</div>' +
        (tagsHtml ? '<div class="tags">' + tagsHtml + '</div>' : '') +
      '</div>';

    grid.appendChild(a);
  });
}
