(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.nav-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 500);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (filterPanel) {
    var section = filterPanel.closest('section');
    var list = section ? section.querySelector('[data-card-list]') : null;
    var emptyState = section ? section.querySelector('[data-empty-state]') : null;

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var sortSelect = filterPanel.querySelector('[data-filter-sort]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var selectedType = normalize(typeSelect && typeSelect.value);
      var selectedYear = normalize(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.innerText);
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sortedCards = cards.slice();

      if (mode === 'views') {
        sortedCards.sort(function (a, b) {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        });
      }

      if (mode === 'year') {
        sortedCards.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      sortedCards.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sortedCards;
      applyFilters();
    }

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
  });

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var head = document.querySelector('[data-search-head]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');
    var empty = document.querySelector('[data-search-empty]');
    var fallback = document.querySelector('[data-search-fallback]');
    var pageInput = document.querySelector('.page-search input[name="q"]');

    if (pageInput) {
      pageInput.value = query;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function resultCard(item) {
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="' + escapeHtml(item.href) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-gradient"></span>',
        '    <span class="card-badge">' + escapeHtml(item.category) + '</span>',
        '    <span class="card-duration">' + escapeHtml(item.duration) + '</span>',
        '    <span class="card-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h2><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h2>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '      <span>' + escapeHtml(item.type) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '    </div>',
        '    <a class="card-category" href="' + escapeHtml(item.categoryHref) + '">' + escapeHtml(item.category) + '</a>',
        '  </div>',
        '</article>'
      ].join('');
    }

    if (query) {
      var lowered = query.toLowerCase();
      var results = window.SEARCH_DATA.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.category, item.oneLine, item.tags]
          .join(' ')
          .toLowerCase()
          .indexOf(lowered) !== -1;
      });

      if (head) {
        head.hidden = false;
      }

      if (title) {
        title.textContent = '“' + query + '” 的搜索结果';
      }

      if (count) {
        count.textContent = '找到 ' + results.length + ' 部相关内容';
      }

      searchResults.innerHTML = results.map(resultCard).join('');

      if (empty) {
        empty.hidden = results.length > 0;
      }

      if (fallback) {
        fallback.hidden = results.length > 0;
      }
    }
  }
})();
