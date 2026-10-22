// Check if current viewport is mobile (< 768px)
function isMobileView() {
  return window.innerWidth < 768;
}

// --- Smooth Scrollbar & Sticky Header Initialization ---
var Scrollbar = window.Scrollbar;
var scrollbar = null;
var originalHeader = document.querySelector("#original-header");
var stickyHeader = document.querySelector("#sticky-header");
var isSticky = false;
var hideTimeout = null;

// Desktop Sticky Navbar Collapse Elements
var stickyNavbarCollapse = document.querySelector("#sticky-navbar-collapse");
var desktopStickyToggleBtn = document.querySelector(
  "#sticky-header .sticky-navbar-toggle",
);

function openStickyNavbar() {
  if (!stickyNavbarCollapse || !desktopStickyToggleBtn) return;
  stickyNavbarCollapse.classList.add("is-open");
  desktopStickyToggleBtn.classList.add("is-active");
  setTimeout(function () {
    if (stickyNavbarCollapse.classList.contains("is-open")) {
      stickyNavbarCollapse.classList.add("is-fully-expanded");
    }
  }, 350);
}

function closeStickyNavbar() {
  if (!stickyNavbarCollapse || !desktopStickyToggleBtn) return;
  stickyNavbarCollapse.classList.remove("is-fully-expanded");
  stickyNavbarCollapse.classList.remove("is-open");
  if (!isMobileView()) {
    desktopStickyToggleBtn.classList.remove("is-active");
  }
}

if (stickyNavbarCollapse) {
  stickyNavbarCollapse.addEventListener("transitionend", function (e) {
    if (
      e.propertyName === "grid-template-rows" &&
      stickyNavbarCollapse.classList.contains("is-open")
    ) {
      stickyNavbarCollapse.classList.add("is-fully-expanded");
    }
  });
}

if (Scrollbar && document.querySelector("#main")) {
  var mainEl = document.querySelector("#main");
  // Hủy instance cũ nếu đã tồn tại khi live reload, tránh rò rỉ bộ nhớ và lag cuộn
  if (Scrollbar.has(mainEl)) {
    try {
      Scrollbar.destroy(mainEl);
    } catch (err) {}
  }

  scrollbar = Scrollbar.init(mainEl, {
    damping: 0.16,
    alwaysShowTracks: false,
  });

  // Cache header height to prevent forced synchronous reflow (layout thrashing) on every scroll frame
  var cachedHeaderHeight = originalHeader ? originalHeader.offsetHeight : 120;
  window.addEventListener("resize", function () {
    cachedHeaderHeight = originalHeader ? originalHeader.offsetHeight : 120;
  });

  function getThresholds() {
    return {
      show: Math.max(300, cachedHeaderHeight),
      hide: Math.max(300, cachedHeaderHeight - 30),
    };
  }

  var backToTopBtn = document.querySelector("#back-to-top");
  var backToTopProgress = document.querySelector("#back-to-top-progress");
  var PROGRESS_CIRCUMFERENCE = 132;

  scrollbar.addListener(function (status) {
    var y = status.offset.y;
    var thresholds = getThresholds();

    // 1. When scrolling down past threshold: slide sticky header down
    if (y >= thresholds.show) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      if (!isSticky) {
        isSticky = true;
        stickyHeader.classList.remove("hidden");
        stickyHeader.classList.remove("header-slide-up");
        stickyHeader.classList.add("header-slide-down");
      }
    }
    // 2. When scrolling back near top: slide sticky header up and hide
    else if (y <= thresholds.hide) {
      if (isSticky) {
        isSticky = false;
        stickyHeader.classList.remove("header-slide-down");
        stickyHeader.classList.add("header-slide-up");

        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(function () {
          stickyHeader.classList.remove("header-slide-up");
          stickyHeader.classList.add("hidden");
        }, 350);

        // Close navbar collapse if open when sticky header is hidden
        closeStickyNavbar();
      }

      // Instantly hide sticky header when at top of page
      if (y <= 0) {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        stickyHeader.classList.remove("header-slide-down");
        stickyHeader.classList.remove("header-slide-up");
        stickyHeader.classList.add("hidden");
        closeStickyNavbar();
      }
    }

    // 3. Show/hide Back-to-Top Button & update scroll progress border
    if (backToTopBtn) {
      if (y > 300) {
        backToTopBtn.classList.remove(
          "opacity-0",
          "pointer-events-none",
          "translate-y-4",
        );
        backToTopBtn.classList.add(
          "opacity-100",
          "pointer-events-auto",
          "translate-y-0",
        );
      } else {
        backToTopBtn.classList.remove(
          "opacity-100",
          "pointer-events-auto",
          "translate-y-0",
        );
        backToTopBtn.classList.add(
          "opacity-0",
          "pointer-events-none",
          "translate-y-4",
        );
      }

      if (backToTopProgress && scrollbar) {
        var maxScroll = scrollbar.limit.y;
        var ratio = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
        backToTopProgress.style.strokeDashoffset =
          PROGRESS_CIRCUMFERENCE - ratio * PROGRESS_CIRCUMFERENCE;
      }
    }
  });

  // Handle Back-to-Top Click
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      if (scrollbar) {
        scrollbar.scrollTo(0, 0, 600);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Fallback for native scroll if Smooth Scrollbar is disabled
  window.addEventListener("scroll", function () {
    if (!scrollbar && backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove(
          "opacity-0",
          "pointer-events-none",
          "translate-y-4",
        );
        backToTopBtn.classList.add(
          "opacity-100",
          "pointer-events-auto",
          "translate-y-0",
        );
      } else {
        backToTopBtn.classList.remove(
          "opacity-100",
          "pointer-events-auto",
          "translate-y-0",
        );
        backToTopBtn.classList.add(
          "opacity-0",
          "pointer-events-none",
          "translate-y-4",
        );
      }

      if (backToTopProgress) {
        var maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        var ratio =
          maxScroll > 0
            ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
            : 0;
        backToTopProgress.style.strokeDashoffset =
          PROGRESS_CIRCUMFERENCE - ratio * PROGRESS_CIRCUMFERENCE;
      }
    }
  });
}

// --- Fix: Prevent Smooth Scrollbar from hijacking wheel events inside dropdown menus ---
// Uses only closest() + querySelector() — zero getComputedStyle calls to avoid layout thrashing.
(function () {
  if (window.__DROPDOWN_WHEEL_INIT__) return;
  window.__DROPDOWN_WHEEL_INIT__ = true;

  var DROPDOWN_SELECTOR =
    ".custom-select[open], .navbar-category-dropdown[open], .custom-form-select[open]";
  var SCROLL_BOX_SELECTOR = ".overflow-y-auto, .overflow-auto";

  document.addEventListener(
    "wheel",
    function (e) {
      var dropdown = e.target.closest(DROPDOWN_SELECTOR);
      if (!dropdown) return; // Not inside an open dropdown — bail out fast, let Smooth Scrollbar handle it

      var scrollable = dropdown.querySelector(SCROLL_BOX_SELECTOR);
      if (!scrollable || scrollable.scrollHeight <= scrollable.clientHeight)
        return;

      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 33;
      else if (e.deltaMode === 2) delta *= scrollable.clientHeight;

      // Clamp: don't scroll past top/bottom boundaries
      var newTop = scrollable.scrollTop + delta;
      var maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
      scrollable.scrollTop = Math.max(0, Math.min(newTop, maxScroll));

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    },
    { passive: false, capture: true },
  );
})();

// --- Mobile Left-Side Drawer Navigation ---
var mobileNav = document.querySelector("#mobile-nav");
var mobileNavBackdrop = document.querySelector("#mobile-nav-backdrop");
var mobileNavPanel = document.querySelector("#mobile-nav-panel");
var mobileNavCloseBtn = document.querySelector("#mobile-nav-close");
var allHamburgerBtns = document.querySelectorAll(".sticky-navbar-toggle");

function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.add("is-open");
  if (mobileNavPanel) {
    mobileNavPanel.classList.add("is-open");
    mobileNavPanel.style.transform = "translateX(0)";
    mobileNavPanel.style.translate = "0 0";
  }
  allHamburgerBtns.forEach(function (btn) {
    btn.classList.add("is-active");
  });
}

function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove("is-open");
  if (mobileNavPanel) {
    mobileNavPanel.classList.remove("is-open");
    mobileNavPanel.style.transform = "translateX(-100%)";
    mobileNavPanel.style.translate = "-100% 0";
  }
  allHamburgerBtns.forEach(function (btn) {
    btn.classList.remove("is-active");
  });
}

if (mobileNav) {
  // Close on clicking close (X) button
  if (mobileNavCloseBtn) {
    mobileNavCloseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  // Close on clicking backdrop overlay
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener("click", function (e) {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  // Close on clicking any navigation link in mobile drawer
  mobileNav.querySelectorAll(".mobile-nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMobileNav();
    });
  });

  // Close on Escape key press
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
      closeMobileNav();
    }
  });

  // Automatically close mobile drawer when resizing to desktop
  window.addEventListener("resize", function () {
    if (!isMobileView() && mobileNav.classList.contains("is-open")) {
      closeMobileNav();
    }
  });
}

// Bind click events to all Hamburger buttons
allHamburgerBtns.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();

    // 1. On Mobile (< 768px): Toggle left-side drawer
    if (isMobileView()) {
      if (mobileNav && mobileNav.classList.contains("is-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    }
    // 2. On Desktop (>= 768px): Toggle sticky header navbar accordion
    else {
      if (btn.closest("#sticky-header") && stickyNavbarCollapse) {
        if (stickyNavbarCollapse.classList.contains("is-open")) {
          closeStickyNavbar();
        } else {
          openStickyNavbar();
        }
      }
    }
  });
});

// Synchronize search query across all input[name="q"] fields
document.addEventListener("input", function (e) {
  if (e.target && e.target.matches('input[name="q"]')) {
    var val = e.target.value;
    document.querySelectorAll('input[name="q"]').forEach(function (inp) {
      if (inp !== e.target) inp.value = val;
    });
  }
});

// --- Mobile Search Bar Toggle & Slide-Down Collapse ---
var mobileSearchToggles = document.querySelectorAll(".mobile-search-toggle");
var mobileSearchCollapses = document.querySelectorAll(
  ".mobile-search-collapse",
);

function toggleMobileSearch(forceState) {
  var anyOpen = false;
  mobileSearchCollapses.forEach(function (el) {
    if (typeof forceState === "boolean") {
      el.classList.toggle("is-open", forceState);
    } else {
      el.classList.toggle("is-open");
    }
    if (!el.classList.contains("is-open")) {
      el.classList.remove("is-fully-expanded");
    }
    if (el.classList.contains("is-open")) anyOpen = true;
  });

  mobileSearchToggles.forEach(function (btn) {
    btn.classList.toggle("is-active", anyOpen);
  });

  // Automatically focus search input when expanded
  if (anyOpen) {
    setTimeout(function () {
      var activeInput = document.querySelector(
        ".mobile-search-collapse.is-open input[name='q']",
      );
      if (activeInput) activeInput.focus();
    }, 150);
  }
}

mobileSearchCollapses.forEach(function (collapse) {
  collapse.addEventListener("transitionend", function (e) {
    if (
      e.propertyName === "grid-template-rows" &&
      collapse.classList.contains("is-open")
    ) {
      collapse.classList.add("is-fully-expanded");
    }
  });
});

mobileSearchToggles.forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleMobileSearch();
  });
});

// Click outside header to collapse mobile search
// document.addEventListener("click", function (e) {
//   if (
//     !e.target.closest("header") &&
//     !e.target.closest(".mobile-search-toggle")
//   ) {
//     var hasOpenSearch = false;
//     mobileSearchCollapses.forEach(function (el) {
//       if (el.classList.contains("is-open")) hasOpenSearch = true;
//     });
//     if (hasOpenSearch) {
//       toggleMobileSearch(false);
//     }
//   }
// });

// Press Escape key to close mobile search
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    toggleMobileSearch(false);
  }
});

// Automatically collapse mobile search when resizing to desktop
window.addEventListener("resize", function () {
  if (!isMobileView()) {
    toggleMobileSearch(false);
  }
});
