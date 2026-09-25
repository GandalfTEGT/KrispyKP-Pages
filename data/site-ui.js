(function () {
  "use strict";

  const footerQuery = window.matchMedia("(max-width: 700px)");
  const footerDisclosures = document.querySelectorAll(".footer-nav-disclosure");

  function syncFooterNavigation(isCompact) {
    footerDisclosures.forEach((disclosure) => {
      disclosure.open = !isCompact;
    });
  }

  syncFooterNavigation(footerQuery.matches);

  if (typeof footerQuery.addEventListener === "function") {
    footerQuery.addEventListener("change", (event) => {
      syncFooterNavigation(event.matches);
    });
  } else if (typeof footerQuery.addListener === "function") {
    footerQuery.addListener((event) => {
      syncFooterNavigation(event.matches);
    });
  }
})();