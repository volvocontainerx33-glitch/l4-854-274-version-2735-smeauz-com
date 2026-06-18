(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    function setupHero(hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
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

        show(0);
        restart();
    }

    document.querySelectorAll('[data-hero]').forEach(setupHero);

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters(panel) {
        var scope = panel.parentElement || document;
        var list = scope.querySelector('[data-filter-list]');
        var empty = scope.querySelector('[data-empty-state]');
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var category = panel.querySelector('[data-filter-category]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var selectedYear = year ? year.value : '';
            var selectedRegion = region ? region.value : '';
            var selectedCategory = category ? category.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchesRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                var matchesCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                var show = matchesQuery && matchesYear && matchesRegion && matchesCategory;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, year, region, category].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(setupFilters);

    document.querySelectorAll('[data-region-browser]').forEach(function (browser) {
        var buttons = Array.prototype.slice.call(browser.querySelectorAll('[data-region-button]'));
        var panels = Array.prototype.slice.call(browser.querySelectorAll('[data-region-panel]'));

        function show(region) {
            buttons.forEach(function (button) {
                button.classList.toggle('active', button.getAttribute('data-region-button') === region);
            });
            panels.forEach(function (panel) {
                panel.classList.toggle('active', panel.getAttribute('data-region-panel') === region);
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                show(button.getAttribute('data-region-button'));
            });
        });
    });
}());
