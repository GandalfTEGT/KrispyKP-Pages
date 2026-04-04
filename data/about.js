(function () {
  function initSectionReveal() {
    const sections = document.querySelectorAll(
      ".about-layout > .frame, .about-grid > .frame, .about-two-col > .frame, .about-footer-panel"
    );

    if (!("IntersectionObserver" in window) || !sections.length) {
      sections.forEach((section) => section.classList.add("about-section-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("about-section-visible");
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    });

    sections.forEach((section) => observer.observe(section));
  }

  function init() {
    initSectionReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();