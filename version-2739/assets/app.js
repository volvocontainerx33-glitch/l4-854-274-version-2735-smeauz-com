(function() {
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  const grids = Array.from(document.querySelectorAll("[data-card-grid]"));
  grids.forEach(function(grid) {
    const cards = Array.from(grid.querySelectorAll(".movie-card, .rank-row"));
    const input = document.querySelector("[data-filter-input]");
    const select = document.querySelector("[data-sort-select]");

    function valueOf(card, key) {
      return (card.getAttribute("data-" + key) || "").toLowerCase();
    }

    function filterCards() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        const haystack = ["title", "year", "region", "genre", "tags"].map(function(key) {
          return valueOf(card, key);
        }).join(" ");
        card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    }

    function sortCards() {
      if (!select) {
        return;
      }
      const sorted = cards.slice();
      if (select.value === "year-desc") {
        sorted.sort(function(a, b) {
          return Number(valueOf(b, "year")) - Number(valueOf(a, "year"));
        });
      } else if (select.value === "year-asc") {
        sorted.sort(function(a, b) {
          return Number(valueOf(a, "year")) - Number(valueOf(b, "year"));
        });
      } else if (select.value === "title") {
        sorted.sort(function(a, b) {
          return valueOf(a, "title").localeCompare(valueOf(b, "title"), "zh-Hans-CN");
        });
      }
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }
    if (select) {
      select.addEventListener("change", function() {
        sortCards();
        filterCards();
      });
    }
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  if (query) {
    const pageInputs = Array.from(document.querySelectorAll("[data-search-page-input], [data-search-sync], [data-filter-input]"));
    pageInputs.forEach(function(input) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    });
  }
}());
