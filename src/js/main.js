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
  if (!window.__HEADER_RESIZE_INIT__) {
    window.__HEADER_RESIZE_INIT__ = true;
    window.addEventListener("resize", function () {
      cachedHeaderHeight = originalHeader ? originalHeader.offsetHeight : 120;
    });
  }

  // Tự động phát hiện nếu live-reload / Morphdom can thiệp làm hỏng cấu trúc Scrollbar khi đang chạy dev:
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    if (!window.__MORPHDOM_GUARD_INIT__) {
      window.__MORPHDOM_GUARD_INIT__ = true;
      if (mainEl && window.MutationObserver) {
        var domObserver = new MutationObserver(function () {
          // SmoothScrollbar luôn bọc phần tử con trong .scroll-content
          // Nếu live reload/Morphdom xóa mất .scroll-content mà Scrollbar vẫn còn đang chạy trong RAM:
          if (!mainEl.querySelector(".scroll-content")) {
            window.location.reload();
          }
        });
        domObserver.observe(mainEl, { childList: true });
      }
    }
  }

  function getThresholds() {
    return {
      show: Math.max(300, cachedHeaderHeight),
      hide: Math.max(300, cachedHeaderHeight - 30),
    };
  }

  var backToTopBtn = document.querySelector("#back-to-top");
  var backToTopProgress = document.querySelector("#back-to-top-progress");
  var PROGRESS_CIRCUMFERENCE = 132;
  var isBttVisible = false;
  var lastProgressVal = -1;
  var isStickyVisible = false;

  scrollbar.addListener(function (status) {
    var y = status.offset.y;
    var thresholds = getThresholds();

    // 1. Khi cuộn xuống quá ngưỡng: hiện sticky header
    if (y >= thresholds.show) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      if (!isStickyVisible) {
        isStickyVisible = true;
        isSticky = true;
        stickyHeader.classList.remove("hidden", "header-slide-up");
        stickyHeader.classList.add("header-slide-down");
      }
    }
    // 2. Khi cuộn ngược lên: ẩn sticky header
    else if (y <= thresholds.hide) {
      if (isStickyVisible) {
        isStickyVisible = false;
        isSticky = false;
        stickyHeader.classList.remove("header-slide-down");
        stickyHeader.classList.add("header-slide-up");

        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(function () {
          stickyHeader.classList.remove("header-slide-up");
          stickyHeader.classList.add("hidden");
        }, 350);

        closeStickyNavbar();
      }

      // Trở về đỉnh trang
      if (y <= 0 && stickyHeader && !stickyHeader.classList.contains("hidden")) {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        stickyHeader.classList.remove("header-slide-down", "header-slide-up");
        stickyHeader.classList.add("hidden");
        closeStickyNavbar();
      }
    }

    // 3. Nút Back-to-Top: Chỉ cập nhật DOM khi trạng thái thay đổi
    if (backToTopBtn) {
      var shouldShowBtt = y > 300;
      if (shouldShowBtt !== isBttVisible) {
        isBttVisible = shouldShowBtt;
        if (shouldShowBtt) {
          backToTopBtn.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
          backToTopBtn.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
        } else {
          backToTopBtn.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
          backToTopBtn.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
        }
      }

      // Cập nhật vòng tròn tiến trình (chỉ cập nhật khi giá trị số nguyên thay đổi)
      if (backToTopProgress && scrollbar) {
        var maxScroll = scrollbar.limit.y;
        if (maxScroll > 0) {
          var ratio = Math.min(1, Math.max(0, y / maxScroll));
          var progressOffset = Math.round(PROGRESS_CIRCUMFERENCE - ratio * PROGRESS_CIRCUMFERENCE);
          if (progressOffset !== lastProgressVal) {
            lastProgressVal = progressOffset;
            backToTopProgress.style.strokeDashoffset = progressOffset;
          }
        }
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
      var shouldShowBtt = window.scrollY > 300;
      if (shouldShowBtt !== isBttVisible) {
        isBttVisible = shouldShowBtt;
        if (shouldShowBtt) {
          backToTopBtn.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
          backToTopBtn.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
        } else {
          backToTopBtn.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
          backToTopBtn.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
        }
      }

      if (backToTopProgress) {
        var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          var ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
          var progressOffset = Math.round(PROGRESS_CIRCUMFERENCE - ratio * PROGRESS_CIRCUMFERENCE);
          if (progressOffset !== lastProgressVal) {
            lastProgressVal = progressOffset;
            backToTopProgress.style.strokeDashoffset = progressOffset;
          }
        }
      }
    }
  });
}

// --- Fix: Prevent Smooth Scrollbar from hijacking wheel events inside dropdown menus ---
// Tối ưu hóa triệt để: Gắn listener trực tiếp lên từng dropdown scroll box thay vì document
// Loại bỏ hoàn toàn độ trễ IPC của DevTools, giúp thao tác cuộn đạt 120 FPS mượt mà cả khi mở DevTools
(function () {
  if (window.__DROPDOWN_WHEEL_INIT__) return;
  window.__DROPDOWN_WHEEL_INIT__ = true;

  function bindLocalWheel(box) {
    if (!box || box.__wheelBound) return;
    box.__wheelBound = true;

    box.addEventListener("wheel", function (e) {
      var maxScroll = box.scrollHeight - box.clientHeight;
      if (maxScroll <= 0) return;

      var delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 33;
      else if (e.deltaMode === 2) delta *= box.clientHeight;

      var currentTop = box.scrollTop;
      // Chỉ can thiệp khi con lăn đang cuộn trong phạm vi danh sách
      if ((delta > 0 && currentTop < maxScroll) || (delta < 0 && currentTop > 0)) {
        box.scrollTop = Math.max(0, Math.min(currentTop + delta, maxScroll));
        e.stopPropagation();
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Gắn cho các menu hiện có
  document.querySelectorAll(".custom-select .overflow-y-auto, .navbar-category-dropdown .overflow-y-auto, .custom-form-select .overflow-y-auto").forEach(bindLocalWheel);

  // Tự động gắn khi bất kỳ details dropdown nào được mở
  document.addEventListener("toggle", function (e) {
    if (e.target && e.target.open && e.target.matches && e.target.matches(".custom-select, .navbar-category-dropdown, .custom-form-select")) {
      var box = e.target.querySelector(".overflow-y-auto, .overflow-auto");
      if (box) bindLocalWheel(box);
    }
  }, true);
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
