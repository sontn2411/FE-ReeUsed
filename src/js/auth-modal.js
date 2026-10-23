/**
 * Modal Đăng nhập / Đăng ký — mở/đóng + chuyển tab (slide qua lại).
 * File riêng, load globally (header có nút đăng nhập).
 */
(function () {
  var currentTab = "login";

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("hidden");
    m.classList.add("flex");
    void m.offsetWidth;
    m.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var first = m.querySelector("input:not([type='hidden']), textarea");
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal(m) {
    if (!m) return;
    m.classList.remove("is-open");
    setTimeout(function () {
      if (!m.classList.contains("is-open")) {
        m.classList.add("hidden");
        m.classList.remove("flex");
        document.body.style.overflow = "";
      }
    }, 220);
  }

  function switchTab(modal, tabName) {
    if (!modal || tabName === currentTab) return;
    var track = modal.querySelector("#auth-forms-track");
    var indicator = modal.querySelector("#auth-tab-indicator");
    var success = modal.querySelector("[data-auth-success]");

    // Ẩn success state nếu đang hiện
    if (success) success.classList.add("hidden");

    // Cập nhật tab buttons text color
    modal.querySelectorAll("[data-auth-tab]").forEach(function (btn) {
      if (btn.getAttribute("data-auth-tab") === tabName) {
        btn.classList.add("text-primary");
        btn.classList.remove("text-gray-600");
      } else {
        btn.classList.remove("text-primary");
        btn.classList.add("text-gray-600");
      }
    });

    // Slide indicator
    if (indicator) {
      if (tabName === "login") {
        indicator.style.transform = "translateX(0)";
      } else {
        indicator.style.transform = "translateX(100%)";
      }
    }

    // Slide track
    if (track) {
      if (tabName === "login") {
        track.style.transform = "translateX(0)";
      } else {
        track.style.transform = "translateX(-50%)";
      }
    }

    currentTab = tabName;

    // Focus first input in active form
    var activeForm = modal.querySelector('[data-auth-form="' + tabName + '"]');
    if (activeForm) {
      var first = activeForm.querySelector("input");
      if (first) setTimeout(function () { first.focus(); }, 380);
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    // Mở modal
    var opener = t && t.closest ? t.closest("[data-modal-open]") : null;
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-modal-open"));
      // Reset về tab login khi mở
      var m = document.getElementById(opener.getAttribute("data-modal-open"));
      if (m) {
        currentTab = "login";
        var track = m.querySelector("#auth-forms-track");
        if (track) track.style.transform = "translateX(0)";
        var indicator = m.querySelector("#auth-tab-indicator");
        if (indicator) indicator.style.transform = "translateX(0)";
        m.querySelectorAll("[data-auth-tab]").forEach(function (btn) {
          if (btn.getAttribute("data-auth-tab") === "login") {
            btn.classList.add("text-primary");
            btn.classList.remove("text-gray-600");
          } else {
            btn.classList.remove("text-primary");
            btn.classList.add("text-gray-600");
          }
        });
      }
      return;
    }

    // Đóng qua nút X
    var closer = t && t.closest ? t.closest("[data-modal-close]") : null;
    if (closer) {
      var m = closer.closest("[data-modal]");
      if (m) closeModal(m);
      return;
    }

    // Đóng khi click backdrop
    if (t && t.getAttribute && t.getAttribute("data-modal") !== null) {
      if (t.classList.contains("is-open")) closeModal(t);
      return;
    }

    // Chuyển tab
    var tabBtn = t && t.closest ? t.closest("[data-auth-tab]") : null;
    if (tabBtn) {
      var modal = tabBtn.closest("[data-modal]");
      if (modal) switchTab(modal, tabBtn.getAttribute("data-auth-tab"));
      return;
    }

    // Chuyển tab qua link "Đăng ký ngay" / "Đăng nhập"
    var switchBtn = t && t.closest ? t.closest("[data-auth-switch]") : null;
    if (switchBtn) {
      e.preventDefault();
      var modal = switchBtn.closest("[data-modal]");
      if (modal) switchTab(modal, switchBtn.getAttribute("data-auth-switch"));
      return;
    }
  });

  // Đóng bằng phím Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll("[data-modal].is-open").forEach(closeModal);
    }
  });

  // Submit form: hiển thị trạng thái thành công, sau đó đóng modal
  document.addEventListener("submit", function (e) {
    var form = e.target && e.target.closest ? e.target.closest("[data-auth-form]") : null;
    if (!form) return;
    e.preventDefault();
    var modal = form.closest("[data-modal]");
    var track = modal ? modal.querySelector("#auth-forms-track") : null;
    var success = modal ? modal.querySelector("[data-auth-success]") : null;
    if (success) {
      if (track) track.style.opacity = "0";
      success.classList.remove("hidden");
    }
    setTimeout(function () {
      form.reset();
      if (track) {
        track.style.transform = "translateX(0)";
        track.style.opacity = "1";
        currentTab = "login";
      }
      if (success) success.classList.add("hidden");
      if (modal) closeModal(modal);
    }, 2600);
  });
})();
