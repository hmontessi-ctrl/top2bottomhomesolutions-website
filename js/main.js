/* ============================================================
   Top 2 Bottom Home Solutions — client-side behavior
   - Mobile navigation toggle
   - Header shadow on scroll
   - Quote form -> composes an SMS draft to Matt's phone (no backend)
   - (The chatbot lives in js/chatbot.js)
   - Footer year
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu when a link is tapped
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Requests go to Matt's phone by text ----------
     Front-end only (no backend): the quote form opens
     the visitor's text app with a prefilled message to
     Top 2 Bottom Home Solutions, (239) 528-7188. Matt asked for
     requests by text, not email (intake form, Oct 30, 2026). */
  var SMS_NUMBER = "+12395287188";
  function smsHref(body) {
    // "?&body=" is the cross-platform form: iOS reads "&body", Android "?body".
    return "sms:" + SMS_NUMBER + "?&body=" + encodeURIComponent(body);
  }

  /* ---------- Quote form -> SMS ---------- */
  document.querySelectorAll("form.quote-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');
      var service = form.querySelector('[name="service"]');
      var details = form.querySelector('[name="details"]');
      var when = form.querySelector('[name="when"]');
      var photos = form.querySelector('[name="photos"]');

      var valid = true;
      // Simple required-field validation with inline messages
      [[name, "Please enter your name."],
       [phone, "Please enter a phone number so we can reach you."],
       [details, "Please describe your project briefly."]
      ].forEach(function (pair) {
        var field = pair[0], msg = pair[1];
        var wrap = field.closest(".field");
        var err = wrap.querySelector(".error");
        if (!field.value.trim()) {
          valid = false;
          wrap.classList.add("invalid");
          if (err) err.textContent = msg;
          field.setAttribute("aria-invalid", "true");
        } else {
          wrap.classList.remove("invalid");
          field.removeAttribute("aria-invalid");
        }
      });

      if (!valid) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      var photosLine = "Photos: none";
      if (photos && photos.files && photos.files.length) {
        photosLine = "Photos: I picked " + photos.files.length + " photo(s) of the job and will attach them to this text.";
      }
      var lines = [
        "Quote request \u2014 " + (service.value || "General repair"),
        "",
        "Name: " + name.value.trim(),
        "Phone: " + phone.value.trim(),
        "Email: " + (email.value.trim() || "(not provided)"),
        "Service: " + (service.value || "General repair"),
        "Preferred time: " + (when.value.trim() || "(flexible)"),
        "",
        "Project details:",
        details.value.trim(),
        "",
        photosLine
      ];

      window.location.href = smsHref(lines.join("\n"));
    });

    // Clear the error state as the user types
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field");
      if (wrap && wrap.classList.contains("invalid") && e.target.value.trim()) {
        wrap.classList.remove("invalid");
        e.target.removeAttribute("aria-invalid");
      }
    });
  });

})();
