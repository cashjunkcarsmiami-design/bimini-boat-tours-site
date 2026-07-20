(function () {
  function track(eventName, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
  }

  function upsertHiddenInput(form, name, value) {
    if (!form || !name || !value) return;
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var pagePath = window.location.pathname || "/";
    var pageTitle = document.title || "Bimini Boat Tours";

    document.querySelectorAll('form[action="/api/contact"]').forEach(function (form) {
      upsertHiddenInput(form, "Landing Page", pagePath);
      upsertHiddenInput(form, "Landing Title", pageTitle);

      form.addEventListener("submit", function () {
        track("submit_lead_form", {
          event_category: "lead",
          event_label: pageTitle,
          page_path: pagePath,
          form_id: form.id || "contact-form"
        });
      });
    });
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var label = (link.textContent || "").trim() || href;
    var pagePath = window.location.pathname || "/";

    if (href.indexOf("tel:") === 0) {
      track("click_call", {
        event_category: "contact",
        event_label: label,
        page_path: pagePath,
        destination: href
      });
      return;
    }

    if (href.indexOf("wa.me/") !== -1 || href.toLowerCase().indexOf("whatsapp") !== -1) {
      track("click_whatsapp", {
        event_category: "contact",
        event_label: label,
        page_path: pagePath,
        destination: href
      });
    }
  });
}());
