(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav-links]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-tab]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      tabs.forEach(function(tab, tabIndex) {
        tab.classList.toggle('is-active', tabIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        setHero(current + 1);
      }, 5200);
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var index = parseInt(tab.getAttribute('data-hero-tab') || '0', 10);
        setHero(index);
        startHero();
      });
    });

    setHero(0);
    startHero();
  }

  var filterBar = document.querySelector('[data-filter-bar]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterBar && filterList) {
    var filterButtons = Array.prototype.slice.call(filterBar.querySelectorAll('[data-filter-value]'));
    var filterCards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    function applyFilter(value) {
      var keyword = value === '全部' ? '' : value.toLowerCase();
      filterCards.forEach(function(card) {
        var searchText = card.getAttribute('data-search') || '';
        card.style.display = !keyword || searchText.indexOf(keyword) !== -1 ? '' : 'none';
      });
      filterButtons.forEach(function(button) {
        button.classList.toggle('is-active', button.getAttribute('data-filter-value') === value);
      });
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        applyFilter(button.getAttribute('data-filter-value') || '全部');
      });
    });

    applyFilter('全部');
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var searchInput = searchPage.querySelector('[data-search-input]');
    var categorySelect = searchPage.querySelector('[data-category-select]');
    var searchCards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function applySearch() {
      var keyword = (searchInput.value || '').trim().toLowerCase();
      var category = categorySelect.value || '';
      searchCards.forEach(function(card) {
        var searchText = card.getAttribute('data-search') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchedText = !keyword || searchText.indexOf(keyword) !== -1;
        var matchedCategory = !category || cardCategory === category;
        card.style.display = matchedText && matchedCategory ? '' : 'none';
      });
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', applySearch);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', applySearch);
    }
    applySearch();
  }
}());
