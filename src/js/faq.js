/**
 * FAQ Accordion — trượt lên / trượt xuống + đổi màu nền khi mở.
 * File riêng, chỉ được load ở trang có dùng component FAQ (không nhúng vào main.js).
 */
(function () {
  var faqItems = document.querySelectorAll("[data-faq-item]");

  faqItems.forEach(function (item) {
    var trigger = item.querySelector("[data-faq-trigger]");
    var panel = item.querySelector("[data-faq-panel]");
    if (!trigger || !panel) return;

    // Trạng thái đóng: chiều cao 0, ẩn nội dung
    panel.style.height = "0px";
    panel.style.overflow = "hidden";

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      if (isOpen) {
        // Đóng: khoá chiều cao hiện tại rồi trượt về 0
        panel.style.height = panel.scrollHeight + "px";
        panel.style.overflow = "hidden";
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");

        requestAnimationFrame(function () {
          panel.style.height = "0px";
        });
      } else {
        // Mở: trượt từ 0 xuống chiều cao nội dung
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.height = panel.scrollHeight + "px";

        // Sau khi trượt xong -> height auto để nội dung tự co giãn khi resize
        panel.addEventListener(
          "transitionend",
          function onEnd(e) {
            if (
              e.propertyName === "height" &&
              item.classList.contains("is-open")
            ) {
              panel.style.height = "auto";
              panel.removeEventListener("transitionend", onEnd);
            }
          },
          { once: true },
        );
      }
    });
  });
})();
