function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

ready(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.getElementById('navLinks');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
  }

  initHeroSlider();
  initLocalFilters();
  initSearchPage();
});

function initHeroSlider() {
  var slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  var prev = slider.querySelector('[data-hero-prev]');
  var next = slider.querySelector('[data-hero-next]');
  var current = 0;
  var timer;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function restart() {
    window.clearInterval(timer);
    start();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      restart();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function initLocalFilters() {
  var scopes = document.querySelectorAll('[data-filter-scope]');
  scopes.forEach(function (scope) {
    var keyword = scope.querySelector('[data-filter-keyword]');
    var region = scope.querySelector('[data-filter-region]');
    var year = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var count = scope.querySelector('[data-filter-count]');

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (q && title.indexOf(q) === -1 && genre.indexOf(q) === -1) {
          matched = false;
        }

        if (r && cardRegion !== r) {
          matched = false;
        }

        if (y && cardYear !== y) {
          matched = false;
        }

        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部作品';
      }
    }

    [keyword, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
}

function initSearchPage() {
  var input = document.getElementById('siteSearchInput');
  var region = document.getElementById('siteRegionSelect');
  var year = document.getElementById('siteYearSelect');
  var type = document.getElementById('siteTypeSelect');
  var results = document.getElementById('siteSearchResults');
  var count = document.getElementById('siteSearchCount');

  if (!input || !results || !window.SEARCH_MOVIES) {
    return;
  }

  function card(movie) {
    return '<a class="movie-card movie-card-wide" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">' +
      '<div class="wide-cover"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-dot">▶</span></div>' +
      '<div class="wide-info"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div></a>';
  }

  function apply() {
    var q = input.value.trim().toLowerCase();
    var r = region ? region.value : '';
    var y = year ? year.value : '';
    var t = type ? type.value : '';
    var filtered = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return (!q || text.indexOf(q) !== -1) && (!r || movie.region === r) && (!y || movie.year === y) && (!t || movie.type === t);
    }).slice(0, 120);

    results.innerHTML = filtered.map(card).join('');
    count.textContent = '共找到 ' + filtered.length + ' 条结果，最多展示前 120 条';
  }

  [input, region, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function initMoviePlayer(videoId, coverId, buttonId, source) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.getElementById(buttonId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function hideOverlay() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function play() {
    attachSource().then(function () {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
      hideOverlay();
    });
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (cover) {
    cover.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });
  }

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
