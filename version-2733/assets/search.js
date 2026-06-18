(function () {
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');

  if (!input || !results || !window.MOVIE_INDEX) {
    return;
  }

  input.value = q;

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function render(items) {
    if (count) {
      count.textContent = String(items.length);
    }

    if (!items.length) {
      results.innerHTML = '<div class="empty-state">没有找到相关影片，可以尝试更换关键词。</div>';
      return;
    }

    results.innerHTML = items.slice(0, 120).map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card compact">' +
        '<a href="' + escapeHtml(item.href) + '" class="card-link">' +
        '<div class="card-poster" style="--poster: url(\'' + escapeHtml(item.cover) + '\');">' +
        '<span class="card-category">' + escapeHtml(item.category) + '</span>' +
        '<span class="play-chip">▶</span>' +
        '</div>' +
        '<div class="card-body">' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '<div class="card-tags">' + tags + '</div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }).join('');
  }

  function run() {
    var keyword = input.value.trim().toLowerCase();
    if (!keyword) {
      render(MOVIE_INDEX.slice(0, 48));
      return;
    }

    render(MOVIE_INDEX.filter(function (item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return text.indexOf(keyword) !== -1;
    }));
  }

  input.addEventListener('input', run);
  run();
})();
