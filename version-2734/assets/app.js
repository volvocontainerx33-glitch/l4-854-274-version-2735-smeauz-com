(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value == null ? "" : value);
  }

  function normalize(value) {
    return text(value).toLowerCase().replace(/\s+/g, "");
  }

  function setupMenu() {
    var toggle = $("[data-menu-toggle]");
    var panel = $("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    $all("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dot", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var input = $("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = $all(".movie-card");
    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(" "));
        card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
      });
    });
  }

  function setupSearchPage() {
    var results = $("[data-search-results]");
    var keywordInput = $("[data-search-keyword]");
    var typeSelect = $("[data-search-type]");
    var regionSelect = $("[data-search-region]");
    var yearSelect = $("[data-search-year]");
    if (!results || !keywordInput || !window.siteMovies) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    keywordInput.value = params.get("q") || "";

    function fillSelect(select, values, label) {
      if (!select) {
        return;
      }
      select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
        return '<option value="' + escapeAttr(value) + '">' + escapeHtml(value) + '</option>';
      }).join("");
    }

    function unique(field) {
      var map = {};
      window.siteMovies.forEach(function (movie) {
        if (movie[field]) {
          map[movie[field]] = true;
        }
      });
      return Object.keys(map).sort();
    }

    function escapeHtml(value) {
      return text(value).replace(/[&<>"']/g, function (char) {
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[char];
      });
    }

    function escapeAttr(value) {
      return escapeHtml(value);
    }

    function card(movie) {
      return '<article class="search-card">' +
        '<a href="./' + escapeAttr(movie.file) + '"><img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + ' 海报" loading="lazy" decoding="async"></a>' +
        '<div>' +
        '<h2><a href="./' + escapeAttr(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>' +
        '<div class="search-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<a class="primary-btn" href="./' + escapeAttr(movie.file) + '">立即观看</a>' +
        '</div>' +
        '</article>';
    }

    function render() {
      var keyword = normalize(keywordInput.value);
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var list = window.siteMovies.filter(function (movie) {
        var haystack = normalize([movie.title, movie.oneLine, movie.genre, movie.tags, movie.region, movie.type, movie.year, movie.category].join(" "));
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!type || movie.type === type) &&
          (!region || movie.region === region) &&
          (!year || movie.year === year);
      }).slice(0, 120);
      results.innerHTML = list.length ? list.map(card).join("") : '<div class="empty-state">没有找到匹配的影片</div>';
    }

    fillSelect(typeSelect, unique("type"), "全部类型");
    fillSelect(regionSelect, unique("region"), "全部地区");
    fillSelect(yearSelect, unique("year").reverse().slice(0, 40), "全部年份");
    [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });
    render();
  }

  function setupPlayers() {
    $all(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video[data-stream]");
      var cover = shell.querySelector(".player-cover");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
