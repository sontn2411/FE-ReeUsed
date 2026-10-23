/**
 * Modal "Đăng ký thu mua" — mở/đóng, validate, xử lý submit.
 * File riêng, chỉ load ở trang có dùng modal (muon-ban).
 *
 * Form dùng component tái sử dụng:
 * - components/input.njk     -> Họ và tên, Số điện thoại
 * - components/form-select.njk -> Chọn danh mục (custom dropdown + hidden input)
 */
(function () {
  var CATEGORY_SEL = "input.custom-form-select-input[name='category']";

  /* ---------- Dropdown của formSelect: mở lên nếu hết chỗ phía dưới ---------- */
  function getPanel(dd) {
    return dd.querySelector(":scope > div");
  }

  function fitPanel(dd) {
    var panel = getPanel(dd);
    if (!panel) return;
    // Đặt lại trạng thái mặc định trước khi đo
    panel.style.top = "";
    panel.style.bottom = "";
    panel.style.marginTop = "";
    panel.style.marginBottom = "";
    if (!dd.open) return;

    var r = panel.getBoundingClientRect();
    var spaceBelow = window.innerHeight - r.bottom;
    if (spaceBelow >= 8) return;

    var pRect = dd.getBoundingClientRect();
    panel.style.top = "auto";
    panel.style.bottom = "calc(100% + 8px)";
    panel.style.marginTop = "0";
    panel.style.marginBottom = "0";

    // Không đủ chỗ phía trên -> trả về trạng thái mặc định
    if (panel.getBoundingClientRect().top < 8) {
      panel.style.top = "";
      panel.style.bottom = "";
      panel.style.marginTop = "";
      panel.style.marginBottom = "";
      void pRect;
    }
  }

  function refitOpenPanels() {
    document.querySelectorAll(".custom-form-select[open]").forEach(fitPanel);
  }

  /* ---------- Validate danh mục (hidden input bị "banned" khỏi native validation) ---------- */
  function setError(form, show) {
    var err = form ? form.querySelector("[data-category-error]") : null;
    if (!err) return;
    err.classList.toggle("hidden", !show);
  }

  function clearCategoryError(el) {
    var form = el && el.closest ? el.closest("[data-modal-form]") : null;
    setError(form, false);
  }

  /* ---------- Reset custom select về trạng thái placeholder (sau form.reset()) ---------- */
  function resetCustomSelects(form) {
    form.querySelectorAll(".custom-form-select").forEach(function (dd) {
      var hidden = dd.querySelector(".custom-form-select-input");
      if (hidden) {
        hidden.value = "";
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }

      var label = dd.querySelector(".custom-form-select-label");
      if (label) {
        label.textContent = label.getAttribute("data-placeholder") || "Vui lòng chọn";
        label.classList.add("text-slate-400");
        label.classList.remove("text-slate-800", "font-medium");
      }

      var iconW = dd.querySelector(".custom-form-select-icon-wrapper");
      if (iconW) {
        iconW.innerHTML = "";
        iconW.classList.add("hidden");
      }

      dd.querySelectorAll(".custom-form-select-option").forEach(function (btn) {
        btn.classList.remove("bg-emerald-50", "text-primary", "font-semibold");
        btn.classList.add("text-slate-700", "hover:bg-slate-50", "hover:text-primary");
        var chk = btn.querySelector(".check-indicator");
        if (chk) chk.remove();
      });

      dd.removeAttribute("open");
      var panel = getPanel(dd);
      if (panel) {
        panel.style.top = "";
        panel.style.bottom = "";
        panel.style.marginTop = "";
        panel.style.marginBottom = "";
      }
    });
  }

  /* ---------- Mở / Đóng modal ---------- */
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
    // Đóng luôn dropdown danh mục đang mở
    m.querySelectorAll(".custom-form-select[open]").forEach(function (dd) {
      dd.removeAttribute("open");
    });
    setTimeout(function () {
      if (!m.classList.contains("is-open")) {
        m.classList.add("hidden");
        m.classList.remove("flex");
        document.body.style.overflow = "";
      }
    }, 220);
  }

  /* ---------- Sự kiện ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;

    // Mở modal
    var opener = t && t.closest ? t.closest("[data-modal-open]") : null;
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-modal-open"));
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

    // Sau khi click: nếu dropdown vừa mở mà hết chỗ thì lật lên trên
    setTimeout(refitOpenPanels, 0);
  });

  // Đổi lựa chọn danh mục -> ẩn lỗi
  document.addEventListener("change", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("custom-form-select-input")) {
      clearCategoryError(e.target);
    }
  });

  // Đóng bằng phím Escape (ưu tiên đóng dropdown trước, rồi mới modal)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openDd = document.querySelector(".custom-form-select[open]");
    if (openDd) {
      openDd.removeAttribute("open");
      return;
    }
    document.querySelectorAll("[data-modal].is-open").forEach(closeModal);
  });

  window.addEventListener("resize", function () {
    document.querySelectorAll(".custom-form-select[open]").forEach(function (dd) {
      var panel = getPanel(dd);
      if (panel) {
        panel.style.top = "";
        panel.style.bottom = "";
        panel.style.marginTop = "";
        panel.style.marginBottom = "";
      }
      fitPanel(dd);
    });
  });

  // Submit form
  document.addEventListener("submit", function (e) {
    var form = e.target && e.target.closest ? e.target.closest("[data-modal-form]") : null;
    if (!form) return;
    e.preventDefault();

    var modal = form.closest("[data-modal]");

    // Bắt buộc chọn danh mục (input hidden không được browser validate)
    var cat = form.querySelector(CATEGORY_SEL);
    if (cat && !cat.value) {
      setError(form, true);
      var dd = cat.closest(".custom-form-select");
      if (dd) {
        dd.setAttribute("open", "");
        setTimeout(function () { fitPanel(dd); }, 0);
      }
      return;
    }
    setError(form, false);

    var success = modal ? modal.querySelector("[data-modal-success]") : null;
    if (success) {
      form.classList.add("hidden");
      success.classList.remove("hidden");
    }

    setTimeout(function () {
      form.reset();
      resetCustomSelects(form);
      form.classList.remove("hidden");
      if (success) success.classList.add("hidden");
      if (modal) closeModal(modal);
    }, 2600);
  });
})();
