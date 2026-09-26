(function () {
  "use strict";

  const compactQuery = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function onMedia(query, listener) {
    if (typeof query.addEventListener === "function") query.addEventListener("change", listener);
    else query.addListener(listener);
  }

  function setupSkipLink() {
    const main = document.querySelector("main");
    if (!main || document.querySelector(".skip-link")) return;
    if (!main.id) main.id = "main-content";
    const link = document.createElement("a");
    link.className = "skip-link";
    link.href = `#${main.id}`;
    link.textContent = "Skip to main content";
    document.body.prepend(link);
  }

  function setupPrimaryNavigation() {
    const nav = document.querySelector(".nav");
    const links = document.querySelector(".nav-links");
    if (!nav || !links || nav.querySelector(".nav-toggle")) return;
    links.id ||= "primary-navigation";
    links.setAttribute("aria-label", "Primary navigation");
    links.querySelectorAll("a").forEach((link) => {
      if (link.classList.contains("active")) link.setAttribute("aria-current", "page");
    });
    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-controls", links.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"></span><span>Menu</span>';
    nav.insertBefore(toggle, links);

    function setOpen(open, restoreFocus = false) {
      const expanded = compactQuery.matches && open;
      links.hidden = compactQuery.matches && !expanded;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.classList.toggle("is-open", expanded);
      if (restoreFocus) toggle.focus();
    }
    function sync() {
      if (compactQuery.matches) setOpen(false);
      else {
        links.hidden = false;
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("is-open");
      }
    }
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (event) => {
      if (compactQuery.matches && event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
    });
    onMedia(compactQuery, sync);
    sync();
  }

  function setupBackToTop() {
    if (document.querySelector(".back-to-top")) return;
    const button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = '<span aria-hidden="true">↑</span>';
    document.body.appendChild(button);
    let ticking = false;
    function sync() {
      button.classList.toggle("is-visible", window.scrollY > 700);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sync);
      }
    }, { passive: true });
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" }));
    sync();
  }

  function setupSectionSignals() {
    const sections = [...document.querySelectorAll("main > .hero, main > .page-hero, main > .section")];
    function sync() {
      let visibleIndex = 0;
      sections.forEach((section) => {
        const visible = !section.hidden;
        section.classList.toggle("command-section", visible);
        if (!visible) {
          section.style.removeProperty("--section-index");
          return;
        }
        visibleIndex += 1;
        section.style.setProperty("--section-index", `"${String(visibleIndex).padStart(2, "0")}"`);
      });
    }
    const observer = new MutationObserver(sync);
    sections.forEach((section) => observer.observe(section, { attributes: true, attributeFilter: ["hidden"] }));
    sync();
  }

  function setupResponsiveDefaults() {
    const footers = document.querySelectorAll(".footer-nav-disclosure");
    function sync() {
      footers.forEach((details) => { details.open = !compactQuery.matches; });
    }
    onMedia(compactQuery, sync);
    sync();
  }

  function setupDisclosureAnimation(details) {
    if (details.dataset.disclosureAnimationReady === "true") return;
    const summary = details.querySelector(":scope > summary");
    if (!summary) return;
    details.dataset.disclosureAnimationReady = "true";
    let animation = null;

    function finish(open) {
      animation?.cancel();
      animation = null;
      details.open = open;
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
      details.dataset.disclosureAnimating = "false";
    }

    summary.addEventListener("click", (event) => {
      if (event.defaultPrevented || reducedMotion.matches) return;
      event.preventDefault();
      const opening = !details.open;
      const startHeight = `${details.getBoundingClientRect().height}px`;
      if (opening) details.open = true;
      const summaryHeight = `${summary.getBoundingClientRect().height}px`;
      const fullHeight = `${details.scrollHeight}px`;
      animation?.cancel();
      details.dataset.disclosureAnimating = "true";
      details.style.overflow = "clip";
      animation = details.animate(
        { height: opening ? [summaryHeight, fullHeight] : [startHeight, summaryHeight] },
        { duration: 210, easing: "cubic-bezier(.22,1,.36,1)" }
      );
      animation.onfinish = () => finish(opening);
      animation.oncancel = () => {
        details.style.removeProperty("height");
        details.style.removeProperty("overflow");
      };
    });
  }

  function setupDisclosureAnimations() {
    document.querySelectorAll("details").forEach(setupDisclosureAnimation);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("details")) setupDisclosureAnimation(node);
        node.querySelectorAll?.("details").forEach(setupDisclosureAnimation);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.documentElement.classList.add("site-ui-ready");
  setupSkipLink();
  setupPrimaryNavigation();
  setupBackToTop();
  setupResponsiveDefaults();
  setupSectionSignals();
  setupDisclosureAnimations();
})();
