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

  var timerInterval = null;

  var TYPE_LABELS = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };

  // Resolve a Discord activity asset key to a full image URL
  function resolveAsset(applicationId, key) {
    if (!key) return null;
    if (key.indexOf('mp:external/') === 0) {
      return 'https://media.discordapp.net/external/' + key.slice('mp:external/'.length);
    }
    if (key.indexOf('spotify:') === 0) {
      return 'https://i.scdn.co/image/' + key.slice('spotify:'.length);
    }
    if (key.indexOf('https://') === 0 || key.indexOf('http://') === 0) {
      return key;
    }
    if (applicationId) {
      return 'https://cdn.discordapp.com/app-assets/' + applicationId + '/' + key + '.png';
    }
    return null;
  }

  function fmtTime(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderSpotify(sp) {
    clearInterval(timerInterval);

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
      function tick() {
        var elapsed = Date.now() - sp.timestamps.start;
        var total = sp.timestamps.end - sp.timestamps.start;
        timeEl.textContent = fmtTime(elapsed) + ' / ' + fmtTime(total);
      }
      tick();
      timerInterval = setInterval(tick, 1000);
      track.appendChild(timeEl);
    }

    div.appendChild(svg);
    div.appendChild(art);
    div.appendChild(track);

    actEl.innerHTML = '';
    actEl.appendChild(div);
    actBarEl.classList.add('visible');
  }

  function renderRich(act) {
    clearInterval(timerInterval);

    var div = document.createElement('div');
    div.className = 'dc-rich';

    var largeUrl = resolveAsset(act.application_id, act.assets && act.assets.large_image);
    var smallUrl = resolveAsset(act.application_id, act.assets && act.assets.small_image);

    if (largeUrl) {
      var wrap = document.createElement('div');
      wrap.className = 'dc-rich-art-wrap';

      var art = document.createElement('img');
      art.className = 'dc-rich-art';
      art.src = largeUrl;
      art.alt = (act.assets && act.assets.large_text) || '';
      wrap.appendChild(art);

      if (smallUrl) {
        var small = document.createElement('img');
        small.className = 'dc-rich-small';
        small.src = smallUrl;
        small.alt = (act.assets && act.assets.small_text) || '';
        wrap.appendChild(small);
      }

      div.appendChild(wrap);
    }

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
      // Party size: show alongside state if present
      var stateText = act.state;
      if (act.party && act.party.size) {
        stateText += ' (' + act.party.size[0] + ' of ' + act.party.size[1] + ')';
      }
      state.textContent = stateText;
      info.appendChild(state);
    }

    if (act.timestamps) {
      var timeEl = document.createElement('span');
      timeEl.className = 'dc-rich-time';
      var ts = act.timestamps;
      function updateTimer() {
        var now = Date.now();
        if (ts.end) {
          var rem = ts.end - now;
          timeEl.textContent = rem > 0 ? fmtTime(rem) + ' left' : '';
        } else if (ts.start) {
          timeEl.textContent = fmtTime(now - ts.start) + ' elapsed';
        }
      }
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
      info.appendChild(timeEl);
    }

    div.appendChild(info);

    actEl.innerHTML = '';
    actEl.appendChild(div);
    actBarEl.classList.add('visible');
  }

  function renderActivity(d) {
    if (d.listening_to_spotify && d.spotify) {
      renderSpotify(d.spotify);
      return;
    }

    var activities = d.activities || [];
    var priority = [0, 1, 5, 3, 2];
    var act = null;
    for (var i = 0; i < priority.length; i++) {
      var t = priority[i];
      for (var j = 0; j < activities.length; j++) {
        if (activities[j].type === t) { act = activities[j]; break; }
      }
      if (act) break;
    }

    if (act) {
      renderRich(act);
    } else {
      clearInterval(timerInterval);
      actEl.innerHTML = '';
      actBarEl.classList.remove('visible');
    }
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
      clearInterval(timerInterval);
      setTimeout(connect, 5000);
    };
  }

  connect();
})();
