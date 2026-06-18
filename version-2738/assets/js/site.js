(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  var search = document.querySelector('.top-search');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (search) {
        search.classList.toggle('open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var form = document.querySelector('[data-filter-form]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');

  if (form && results && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var queryInput = form.querySelector('input[name="q"]');
    if (queryInput) {
      queryInput.value = q;
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-wrap" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '    <span class="poster-play">播放</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render() {
      var data = new FormData(form);
      var keyword = String(data.get('q') || '').trim().toLowerCase();
      var region = String(data.get('region') || '');
      var type = String(data.get('type') || '');
      var year = String(data.get('year') || '');
      var category = String(data.get('category') || '');

      var matched = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();

        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!region || movie.region === region) &&
          (!type || movie.type === type) &&
          (!year || movie.year === year) &&
          (!category || movie.category === category);
      });

      results.innerHTML = matched.slice(0, 120).map(card).join('');
      if (status) {
        status.textContent = matched.length ? '已找到相关影片，优先展示前 120 部' : '没有找到匹配影片';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
  }
})();
