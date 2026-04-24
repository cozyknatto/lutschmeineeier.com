(function () {
  var UID = CONFIG.discord;
  var card = document.getElementById("dc");
  var avEl = document.getElementById("dc-av");
  var dotEl = document.getElementById("dc-dot");
  var nameEl = document.getElementById("dc-name");
  var handleEl = document.getElementById("dc-handle");
  var clanEl = document.getElementById("dc-clan");
  var actBarEl = document.getElementById("dc-activity-bar");
  var actEl = document.getElementById("dc-activity");

  var timerIntervals = [];
  var assetCache = {};  // appId -> Promise<{[name]: id}>
  var iconCache = {};   // appId -> Promise<url|null>

  var TYPE_LABELS = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };

  // Resolve named asset key -> numeric ID via Discord's public assets endpoint
  function fetchAssetMap(appId) {
    if (!assetCache[appId]) {
      assetCache[appId] = fetch(
        'https://discord.com/api/v10/oauth2/applications/' + appId + '/assets'
      )
        .then(function (r) { return r.json(); })
        .then(function (list) {
          var map = {};
          if (Array.isArray(list)) list.forEach(function (a) { map[a.name] = a.id; });
          return map;
        })
        .catch(function () { return {}; });
    }
    return assetCache[appId];
  }

  // Fetch the app's cover/icon URL when no assets are present in the activity
  function fetchAppIcon(appId) {
    if (!iconCache[appId]) {
      iconCache[appId] = fetch(
        'https://discord.com/api/v10/oauth2/applications/' + appId + '/rpc'
      )
        .then(function (r) { return r.json(); })
        .then(function (app) {
          if (app.cover_image)
            return 'https://cdn.discordapp.com/app-icons/' + appId + '/' + app.cover_image + '.png?size=128';
          if (app.icon)
            return 'https://cdn.discordapp.com/app-icons/' + appId + '/' + app.icon + '.png?size=128';
          return null;
        })
        .catch(function () { return null; });
    }
    return iconCache[appId];
  }

  // Load an image: tries direct CDN first, falls back to asset name lookup via API
  function tryLoadImage(imgEl, appId, key) {
    if (!key) return;

    if (key.indexOf('mp:external/') === 0) { imgEl.src = 'https://media.discordapp.net/external/' + key.slice('mp:external/'.length); return; }
    if (key.indexOf('spotify:') === 0)      { imgEl.src = 'https://i.scdn.co/image/' + key.slice('spotify:'.length); return; }
    if (key.indexOf('https://') === 0 || key.indexOf('http://') === 0) { imgEl.src = key; return; }

    // On CDN failure, try resolving named asset key -> numeric ID via API
    imgEl.onerror = function () {
      imgEl.onerror = function () { /* all attempts failed */ };
      if (!appId) return;
      fetchAssetMap(appId).then(function (map) {
        var id = map[key];
        if (id) imgEl.src = 'https://cdn.discordapp.com/app-assets/' + appId + '/' + id + '.png';
      });
    };

    imgEl.src = 'https://cdn.discordapp.com/app-assets/' + appId + '/' + key + '.png';
  }

  function fmtTime(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function row(inner) {
    var div = document.createElement('div');
    div.className = 'dc-act-row';
    div.appendChild(inner);
    return div;
  }

  function makeArtWrap(imgEl) {
    var wrap = document.createElement('div');
    wrap.className = 'dc-rich-art-wrap';
    wrap.style.display = 'none';
    imgEl.onload = function () { wrap.style.display = ''; };
    wrap.appendChild(imgEl);
    return wrap;
  }

  function buildCustomStatus(act) {
    var div = document.createElement('div');
    div.className = 'dc-custom';

    if (act.emoji) {
      if (act.emoji.id) {
        var img = document.createElement('img');
        img.src = 'https://cdn.discordapp.com/emojis/' + act.emoji.id + (act.emoji.animated ? '.gif' : '.png') + '?size=20';
        img.style.cssText = 'width:18px;height:18px;object-fit:contain;flex-shrink:0;vertical-align:middle;';
        div.appendChild(img);
      } else if (act.emoji.name) {
        var emojiSpan = document.createElement('span');
        emojiSpan.style.flexShrink = '0';
        emojiSpan.textContent = act.emoji.name;
        div.appendChild(emojiSpan);
      }
    }

    if (act.state) {
      var text = document.createElement('span');
      text.className = 'dc-custom-text';
      text.textContent = act.state;
      div.appendChild(text);
    }

    return row(div);
  }

  function buildSpotify(sp) {
    var div = document.createElement('div');
    div.className = 'dc-spot';

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'dc-spot-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.innerHTML = '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>';

    var art = document.createElement('img');
    art.className = 'dc-art';
    art.src = sp.album_art_url;
    art.alt = '';

    var track = document.createElement('div');
    track.className = 'dc-track';

    var song = document.createElement('span');
    song.className = 'dc-song';
    song.textContent = sp.song;

    var artist = document.createElement('span');
    artist.className = 'dc-artist';
    artist.textContent = sp.artist;

    track.appendChild(song);
    track.appendChild(artist);

    if (sp.timestamps && sp.timestamps.start && sp.timestamps.end) {
      var timeEl = document.createElement('span');
      timeEl.className = 'dc-artist';
      timeEl.style.fontVariantNumeric = 'tabular-nums';
      (function (el, ts) {
        function tick() {
          var elapsed = Date.now() - ts.start;
          var total = ts.end - ts.start;
          el.textContent = fmtTime(elapsed) + ' / ' + fmtTime(total);
        }
        tick();
        timerIntervals.push(setInterval(tick, 1000));
      })(timeEl, sp.timestamps);
      track.appendChild(timeEl);
    }

    div.appendChild(svg);
    div.appendChild(art);
    div.appendChild(track);
    return row(div);
  }

  function buildRich(act) {
    var div = document.createElement('div');
    div.className = 'dc-rich';

    var info = document.createElement('div');
    info.className = 'dc-rich-info';

    var label = document.createElement('span');
    label.className = 'dc-rich-label';
    label.textContent = TYPE_LABELS[act.type] || 'Activity';
    info.appendChild(label);

    var name = document.createElement('span');
    name.className = 'dc-rich-name';
    name.textContent = act.name;
    info.appendChild(name);

    if (act.details) {
      var details = document.createElement('span');
      details.className = 'dc-rich-detail';
      details.textContent = act.details;
      info.appendChild(details);
    }

    if (act.state) {
      var state = document.createElement('span');
      state.className = 'dc-rich-state';
      var stateText = act.state;
      if (act.party && act.party.size)
        stateText += ' (' + act.party.size[0] + ' of ' + act.party.size[1] + ')';
      state.textContent = stateText;
      info.appendChild(state);
    }

    if (act.timestamps) {
      var timeEl = document.createElement('span');
      timeEl.className = 'dc-rich-time';
      (function (el, ts) {
        function tick() {
          var now = Date.now();
          if (ts.end) {
            var rem = ts.end - now;
            el.textContent = rem > 0 ? fmtTime(rem) + ' left' : '';
          } else if (ts.start) {
            el.textContent = fmtTime(now - ts.start) + ' elapsed';
          }
        }
        tick();
        timerIntervals.push(setInterval(tick, 1000));
      })(timeEl, act.timestamps);
      info.appendChild(timeEl);
    }

    div.appendChild(info);

    var largeKey = act.assets && act.assets.large_image;
    var smallKey = act.assets && act.assets.small_image;

    if (largeKey) {
      // Activity provided an asset key — resolve it
      var art = document.createElement('img');
      art.className = 'dc-rich-art';
      art.alt = (act.assets && act.assets.large_text) || '';
      var wrap = makeArtWrap(art);
      div.insertBefore(wrap, info);
      tryLoadImage(art, act.application_id, largeKey);

      if (smallKey) {
        var small = document.createElement('img');
        small.className = 'dc-rich-small';
        small.alt = (act.assets && act.assets.small_text) || '';
        small.style.display = 'none';
        small.onload = function () { this.style.display = ''; };
        wrap.appendChild(small);
        tryLoadImage(small, act.application_id, smallKey);
      }
    } else if (act.application_id) {
      // No assets at all — fall back to the app's cover/icon image
      var art2 = document.createElement('img');
      art2.className = 'dc-rich-art';
      art2.alt = act.name;
      var wrap2 = makeArtWrap(art2);
      div.insertBefore(wrap2, info);
      fetchAppIcon(act.application_id).then(function (url) {
        if (url) art2.src = url;
      });
    }

    return row(div);
  }

  function renderActivity(d) {
    timerIntervals.forEach(clearInterval);
    timerIntervals = [];
    actEl.innerHTML = '';

    var rows = [];
    var activities = d.activities || [];

    // 1. Custom status
    for (var i = 0; i < activities.length; i++) {
      if (activities[i].type === 4) { rows.push(buildCustomStatus(activities[i])); break; }
    }

    // 2. Playing (type 0)
    for (var i = 0; i < activities.length; i++) {
      if (activities[i].type === 0) rows.push(buildRich(activities[i]));
    }

    // 3. Spotify
    if (d.listening_to_spotify && d.spotify) {
      rows.push(buildSpotify(d.spotify));
    }

    // 4. Everything else (streaming, watching, competing, other listening)
    for (var i = 0; i < activities.length; i++) {
      var act = activities[i];
      if (act.type === 0 || act.type === 4) continue;
      if (act.type === 2 && act.name === 'Spotify') continue;
      rows.push(buildRich(act));
    }

    if (rows.length === 0) {
      actBarEl.classList.remove('visible');
      return;
    }

    rows.forEach(function (r) { actEl.appendChild(r); });
    actBarEl.classList.add('visible');
  }

  function render(d) {
    var u = d.discord_user;

    if (u.avatar) {
      avEl.src = 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=64';
    }

    nameEl.textContent = u.global_name || u.username;
    handleEl.textContent = '@' + u.username;

    var clan = u.clan || u.primary_guild || null;
    var clanTagEl = document.getElementById('dc-clan-tag');
    var clanBadgeEl = document.getElementById('dc-clan-badge');
    if (clan && clan.tag) {
      clanTagEl.textContent = clan.tag;
      if (clan.badge && clan.identity_guild_id) {
        clanBadgeEl.src = 'https://cdn.discordapp.com/clan-badges/' + clan.identity_guild_id + '/' + clan.badge + '.png?size=16';
        clanBadgeEl.style.display = 'block';
      } else {
        clanBadgeEl.style.display = 'none';
      }
      clanEl.style.display = 'flex';
    } else {
      clanEl.style.display = 'none';
    }

    dotEl.className = 'dc-dot ' + (d.discord_status || 'offline');
    renderActivity(d);
    card.classList.add('ready');
  }

  var hbInterval;

  function connect() {
    var ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onmessage = function (e) {
      var msg = JSON.parse(e.data);

      if (msg.op === 1) {
        clearInterval(hbInterval);
        hbInterval = setInterval(function () {
          if (ws.readyState === 1) ws.send(JSON.stringify({ op: 3 }));
        }, msg.d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: UID } }));

        fetch('https://dcdn.dstn.to/profile/' + UID)
          .then(function (r) { return r.json(); })
          .then(function (data) {
            var badges = data.badges || [];
            var namelineEl = document.querySelector('.dc-nameline');
            namelineEl.querySelectorAll('.dc-badge').forEach(function (b) { b.remove(); });
            badges.forEach(function (badge) {
              if ((CONFIG.hideBadges || []).indexOf(badge.id) !== -1) return;
              var wrap = document.createElement('span');
              wrap.className = 'tooltip-wrap';
              var img = document.createElement('img');
              img.src = 'https://cdn.discordapp.com/badge-icons/' + badge.icon + '.png';
              img.className = 'dc-badge';
              img.style.cssText = 'width:18px;height:18px;object-fit:contain;flex-shrink:0;';
              var tip = document.createElement('span');
              tip.className = 'tooltip';
              tip.textContent = badge.description || badge.id;
              wrap.appendChild(img);
              wrap.appendChild(tip);
              namelineEl.appendChild(wrap);
            });
          }).catch(function () {});
      }

      if (msg.op === 0) render(msg.d);
    };

    ws.onclose = function () {
      clearInterval(hbInterval);
      timerIntervals.forEach(clearInterval);
      timerIntervals = [];
      setTimeout(connect, 5000);
    };
  }

  connect();
})();
