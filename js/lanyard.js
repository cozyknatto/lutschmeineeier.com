(function () {
  var UID = '552062519171350550';
  var card    = document.getElementById('dc');
  var avEl    = document.getElementById('dc-av');
  var dotEl   = document.getElementById('dc-dot');
  var nameEl  = document.getElementById('dc-name');
  var handleEl = document.getElementById('dc-handle');
  var clanEl  = document.getElementById('dc-clan');
  var actBarEl = document.getElementById('dc-activity-bar');
  var spotEl  = document.getElementById('dc-spot');
  var artEl   = document.getElementById('dc-art');
  var songEl  = document.getElementById('dc-song');
  var artistEl = document.getElementById('dc-artist');
  var gameEl  = document.getElementById('dc-game');

  function render(d) {
    var u = d.discord_user;

    if (u.avatar) {
      avEl.src = 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=64';
    }

    nameEl.textContent   = u.global_name || u.username;
    handleEl.textContent = '@' + u.username;

    var clan = u.clan || u.primary_guild || null;
    var clanTagEl   = document.getElementById('dc-clan-tag');
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

    if (d.listening_to_spotify && d.spotify) {
      artEl.src            = d.spotify.album_art_url;
      songEl.textContent   = d.spotify.song;
      artistEl.textContent = d.spotify.artist;
      spotEl.style.display = 'flex';
      gameEl.style.display = 'none';
      actBarEl.classList.add('visible');
    } else {
      var game = (d.activities || []).find(function (a) { return a.type === 0; });
      if (game) {
        gameEl.textContent   = game.name;
        gameEl.style.display = 'inline';
        spotEl.style.display = 'none';
        actBarEl.classList.add('visible');
      } else {
        actBarEl.classList.remove('visible');
      }
    }

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
            var badges     = data.badges || [];
            var namelineEl = document.querySelector('.dc-nameline');

            namelineEl.querySelectorAll('.dc-badge').forEach(function (b) { b.remove(); });

            badges.forEach(function (badge) {
              var img = document.createElement('img');
              img.src       = 'https://cdn.discordapp.com/badge-icons/' + badge.icon + '.png';
              img.title     = badge.description || badge.id;
              img.className = 'dc-badge';
              img.style.cssText = 'width:18px;height:18px;object-fit:contain;flex-shrink:0;';
              namelineEl.appendChild(img);
            });
          });
      }

      if (msg.op === 0) render(msg.d);
    };

    ws.onclose = function () {
      clearInterval(hbInterval);
      setTimeout(connect, 5000);
    };
  }

  connect();
})();