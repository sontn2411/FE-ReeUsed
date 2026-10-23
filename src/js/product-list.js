/**
 * Product list: lọc theo danh mục, tìm kiếm, sắp xếp.
 * File riêng, chỉ load ở trang muon-mua.
 */
(function () {
  var slider = document.getElementById("cat-slider");
  var prevBtn = document.getElementById("cat-prev");
  var nextBtn = document.getElementById("cat-next");
  var searchInput = document.getElementById("product-search");
  var sortInput = document.querySelector(".custom-form-select-input[name='sort']");
  var grid = document.getElementById("product-grid");
  var countEl = document.getElementById("product-count");
  var emptyEl = document.getElementById("product-empty");

  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));

  // --- Category slider: prev/next ---
  function scrollSlider(dir) {
    if (!slider) return;
    var amount = slider.clientWidth * 0.8;
    slider.scrollBy({ left: dir * amount, behavior: "instant" });
  }
  if (prevBtn) prevBtn.addEventListener("click", function () { scrollSlider(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { scrollSlider(1); });

  // --- Filter logic ---
  var activeCategory = "";

  function normalize(str) {
    return (str || "").toLowerCase().trim();
  }

  function matchCategory(productCat, selectedCat) {
    if (!selectedCat) return true;
    var pc = normalize(productCat);
    var sc = normalize(selectedCat);
    return pc === sc || pc.indexOf(sc) !== -1 || sc.indexOf(pc) !== -1;
  }

  function getVisibleCards() {
    var query = searchInput ? normalize(searchInput.value) : "";
    return cards.filter(function (card) {
      if (!matchCategory(card.dataset.category, activeCategory)) return false;
      if (query && card.dataset.name.indexOf(query) === -1) return false;
      return true;
    });
  }

  function sortCards(list) {
    var sortVal = sortInput ? sortInput.value : "default";
    var sorted = list.slice();
    switch (sortVal) {
      case "name-asc":
        sorted.sort(function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); });
        break;
      case "name-desc":
        sorted.sort(function (a, b) { return b.dataset.name.localeCompare(a.dataset.name); });
        break;
      case "price-asc":
        sorted.sort(function (a, b) { return parseInt(a.dataset.price || "0", 10) - parseInt(b.dataset.price || "0", 10); });
        break;
      case "price-desc":
        sorted.sort(function (a, b) { return parseInt(b.dataset.price || "0", 10) - parseInt(a.dataset.price || "0", 10); });
        break;
      default:
        break;
    }
    return sorted;
  }

  function applyFilters() {
    var visible = getVisibleCards();
    var sorted = sortCards(visible);

    // Hide all first
    cards.forEach(function (c) { c.classList.add("hidden"); });

    // Reorder and show visible
    sorted.forEach(function (c) {
      c.classList.remove("hidden");
      grid.appendChild(c);
    });

    // Update count
    if (countEl) countEl.textContent = sorted.length;

    // Toggle empty state
    if (emptyEl) {
      if (sorted.length === 0) emptyEl.classList.remove("hidden");
      else emptyEl.classList.add("hidden");
    }
  }

  // --- Category chip click ---
  document.addEventListener("click", function (e) {
    var chip = e.target && e.target.closest ? e.target.closest(".cat-chip") : null;
    if (!chip) return;
    activeCategory = chip.getAttribute("data-category") || "";

    // Update chip styles: selected = primary circle + primary label
    document.querySelectorAll(".cat-chip").forEach(function (c) {
      var circle = c.querySelector(".cat-chip-circle");
      var label = c.querySelector(".cat-chip-label");
      if (circle) {
        circle.classList.remove("bg-primary");
        circle.classList.add("bg-[#e5f3ea]");
      }
      if (label) {
        label.classList.remove("text-primary");
        label.classList.add("text-gray-800");
      }
      // Also reset icon color for the "All" chip
      var svg = circle ? circle.querySelector("svg") : null;
      if (svg) {
        svg.classList.remove("text-white");
        svg.classList.add("text-primary");
      }
    });
    var selCircle = chip.querySelector(".cat-chip-circle");
    var selLabel = chip.querySelector(".cat-chip-label");
    if (selCircle) {
      selCircle.classList.remove("bg-[#e5f3ea]");
      selCircle.classList.add("bg-primary");
    }
    if (selLabel) {
      selLabel.classList.remove("text-gray-800");
      selLabel.classList.add("text-primary");
    }
    var selSvg = selCircle ? selCircle.querySelector("svg") : null;
    if (selSvg) {
      selSvg.classList.remove("text-primary");
      selSvg.classList.add("text-white");
    }

    applyFilters();
  });

  // --- Search input ---
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      applyFilters();
    });
  }

  // --- Sort change ---
  if (sortInput) {
    sortInput.addEventListener("change", function () {
      applyFilters();
    });
  }

  // Initial render
  applyFilters();
})();
