(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');
  var search = document.querySelector('.nav-search');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var filterButtons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-year]'));
    var filterInput = filterRoot.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var selectedYear = 'all';

    function applyFilters() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var yearMatch = selectedYear === 'all' || card.getAttribute('data-year') === selectedYear;
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = yearMatch && keywordMatch ? '' : 'none';
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedYear = button.getAttribute('data-filter-year') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }
  }
})();
