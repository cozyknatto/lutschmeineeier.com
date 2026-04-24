function renderHero() {
  var av = document.getElementById('s-initial');
  if (CONFIG.avatar) {
    av.innerHTML = '<img src="' + CONFIG.avatar + '" alt="' + CONFIG.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
  } else {
    av.textContent = CONFIG.name[0];
  }
  document.title = CONFIG.name;
  document.getElementById('s-name').textContent   = CONFIG.name;
  document.getElementById('s-bio').textContent    = CONFIG.bio;
  document.getElementById('s-footer').textContent = 'lutschmeineeier.com';

   // Typing Bio
  var bioEl = document.getElementById('s-bio');
  var text  = CONFIG.bio;
  var i     = 0;
  bioEl.textContent = '';

  // Cursor Element
  var cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = 'color:var(--accent);animation:blink 0.7s step-end infinite;margin-left:1px;';
  bioEl.appendChild(cursor);

  setTimeout(function type() {
    if (i < text.length) {
      bioEl.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, 35 + Math.random() * 25);
    } else {
      setTimeout(function () {
        cursor.style.animation = 'none';
        cursor.style.opacity   = '0';
      }, 1000);
    }
  }, 600);
}

function renderSocials() {
  var wrap = document.getElementById('s-socials');
  CONFIG.socials.forEach(function (s) {
    var outer = document.createElement('div');
    outer.className = 'tooltip-wrap';

    var a = document.createElement('a');
    a.href      = s.url;
    a.className = 'social';
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[s.icon] + '</svg>';

    var tip = document.createElement('span');
    tip.className   = 'tooltip';
    tip.textContent = s.title;

    outer.appendChild(a);
    outer.appendChild(tip);
    wrap.appendChild(outer);
  });
}

function renderProjects() {
  var grid = document.getElementById('s-grid');
  CONFIG.projects.forEach(function (p) {
    var a = document.createElement('a');
    a.href      = p.url;
    a.className = 'card';
    a.setAttribute('data-a', '');
    if (p.newTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }

    var imgHtml  = p.img ? '<img src="' + p.img + '" alt="' + p.name + '">' : '';
    var tagsHtml = (p.tags || []).map(function (t) {
      return '<span class="tag">' + t + '</span>';
    }).join('');

    a.innerHTML =
      '<div class="thumb">' +
        '<div class="thumb-bg" style="background:' + p.gradient + '"></div>' +
        '<div class="thumb-emoji">' + p.emoji + '</div>' +
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