(function () {
  function getSuccessMessage(type) {
    if (type === "contact") {
      return "Message sent successfully. I’ll get back to you as soon as possible.";
    }

    if (type === "tournament") {
      return "Tournament signup received. Keep an eye on your email or Discord for updates.";
    }

    return "";
  }

  function showSuccessMessageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("sent");

    if (!type) return;

    const shell = document.getElementById("form-success");
    const text = document.getElementById("form-success-text");
    const message = getSuccessMessage(type);

    if (!shell || !text || !message) return;

    text.textContent = message;
    shell.hidden = false;

    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }

  function lockSubmittedForms() {
    const forms = document.querySelectorAll(".js-formspree-form");

    forms.forEach((form) => {
      form.addEventListener("submit", function () {
        const submitButton = form.querySelector(".js-submit-button");

        if (!submitButton) return;

        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = "Sending...";
        submitButton.setAttribute("aria-disabled", "true");
      });
    });
  }

  function isArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normaliseText(value, fallback = "") {
    return value == null || value === "" ? fallback : String(value);
  }

  function getEligibleTournamentEvents() {
    const data = window.KRISPY_TOURNAMENTS || { events: [] };
    const events = isArray(data.events);

    return events
      .filter((event) => {
        const registrationMode = normaliseText(event?.registrationMode).toLowerCase();
        return registrationMode === "external" || registrationMode === "challonge";
      })
      .sort((a, b) => {
        const aTime = Date.parse(a?.startDate || "") || Number.MAX_SAFE_INTEGER;
        const bTime = Date.parse(b?.startDate || "") || Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }

  function buildTournamentLabel(event) {
    const parts = [];

    if (event?.title) {
      parts.push(String(event.title));
    }

    if (event?.status) {
      const status =
        String(event.status).charAt(0).toUpperCase() +
        String(event.status).slice(1).toLowerCase();

      parts.push(status);
    }

    if (event?.startDate) {
      parts.push(String(event.startDate));
    }

    return parts.join(" // ");
  }

  function populateTournamentOptions() {
    const select = document.getElementById("signup-tournament");
    if (!select) return;

    const existingValue = select.value;
    select.innerHTML = "";

    const events = getEligibleTournamentEvents();
    const form = select.closest("form");
    const submitButton = form?.querySelector(".js-submit-button");

    if (!events.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No tournament signups currently available";
      option.selected = true;
      select.appendChild(option);
      select.disabled = true;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-disabled", "true");
      }
      return;
    }

    select.disabled = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-disabled");
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a tournament";
    select.appendChild(placeholder);

    events.forEach((event) => {
      const option = document.createElement("option");
      option.value = normaliseText(event.id);
      option.textContent = buildTournamentLabel(event);
      select.appendChild(option);
    });

    const hasExistingOption = Array.from(select.options).some(
      (option) => option.value === existingValue
    );

    if (hasExistingOption) {
      select.value = existingValue;
    }
  }

  function init() {
    showSuccessMessageFromUrl();
    populateTournamentOptions();
    lockSubmittedForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
