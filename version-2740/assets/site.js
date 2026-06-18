(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initTopSearch() {
    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          if (input) input.focus();
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) return;

    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var genre = panel.querySelector("[data-filter-genre]");
    var category = panel.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    var items = Array.prototype.slice.call(list.querySelectorAll(".movie-item"));

    function apply() {
      var query = normalize(search && search.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var genreValue = normalize(genre && genre.value);
      var categoryValue = normalize(category && category.value);
      var shown = 0;

      items.forEach(function (item) {
        var text = normalize(item.textContent + " " + item.dataset.title + " " + item.dataset.genre + " " + item.dataset.region + " " + item.dataset.category + " " + item.dataset.year);
        var visible = true;
        if (query && text.indexOf(query) === -1) visible = false;
        if (yearValue && normalize(item.dataset.year) !== yearValue) visible = false;
        if (regionValue && normalize(item.dataset.region) !== regionValue) visible = false;
        if (genreValue && normalize(item.dataset.genre).indexOf(genreValue) === -1) visible = false;
        if (categoryValue && normalize(item.dataset.category) !== categoryValue) visible = false;
        item.classList.toggle("hidden-by-filter", !visible);
        if (visible) shown += 1;
      });

      if (empty) empty.classList.toggle("show", shown === 0);
    }

    [search, year, region, genre, category].forEach(function (control) {
      if (!control) return;
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    apply();
  }

  function initPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-player-button]");
      if (!video || !button) return;
      var stream = video.getAttribute("data-hls");
      var initialized = false;

      function loadAndPlay() {
        if (!stream) return;
        if (!initialized) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hlsPlayer = hls;
          } else {
            video.src = stream;
          }
          initialized = true;
        }
        box.classList.add("playing");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      button.addEventListener("click", loadAndPlay);
      video.addEventListener("click", function () {
        if (!initialized) loadAndPlay();
      });
      video.addEventListener("play", function () {
        box.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) box.classList.remove("playing");
      });
    });
  }

  function cardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-tags">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.movieCatalog) return;
    var empty = document.querySelector("[data-search-empty]");
    var liveInput = document.querySelector("[data-live-search]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (liveInput) liveInput.value = initialQuery;
    document.querySelectorAll('.hero-search input[name="q"]').forEach(function (input) {
      input.value = initialQuery;
    });

    function render() {
      var query = normalize(liveInput && liveInput.value);
      var source = window.movieCatalog;
      var matches = source.filter(function (movie) {
        if (!query) return movie.featured;
        var text = normalize(movie.title + " " + movie.region + " " + movie.year + " " + movie.genre + " " + movie.category + " " + movie.tags.join(" ") + " " + movie.oneLine);
        return text.indexOf(query) !== -1;
      });
      results.innerHTML = matches.slice(0, 240).map(cardTemplate).join("");
      if (empty) empty.classList.toggle("show", matches.length === 0);
    }

    if (liveInput) liveInput.addEventListener("input", render);
    render();
  }

  ready(function () {
    initMobileMenu();
    initTopSearch();
    initHeroSlider();
    initFilters();
    initPlayer();
    initSearchPage();
  });
})();
