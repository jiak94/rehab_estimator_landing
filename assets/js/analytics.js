(function(root) {
  "use strict";

  const trackedResults = new Set();

  function pagePath() {
    return root.location ? root.location.pathname : "";
  }

  function calculatorNameFromPath(path) {
    if (path.includes("rehab-cost-calculator")) return "rehab_cost";
    if (path.includes("calculadora-costos-remodelacion")) return "rehab_cost";
    if (path.includes("fix-and-flip-calculator")) return "fix_and_flip";
    if (path.includes("calculadora-fix-and-flip")) return "fix_and_flip";
    if (path.includes("rental-cashflow-calculator")) return "rental_cashflow";
    if (path.includes("calculadora-flujo-renta")) return "rental_cashflow";
    return "";
  }

  function send(eventName, params) {
    if (typeof root.gtag !== "function") return;
    root.gtag("event", eventName, Object.assign({
      page_path: pagePath()
    }, params || {}));
  }

  function trackCalculatorResult(calculatorName) {
    const key = `${pagePath()}:${calculatorName}`;
    if (trackedResults.has(key)) return;
    trackedResults.add(key);
    send("calculator_result_generated", {
      calculator_name: calculatorName
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-analytics-event]");
    if (!link) return;

    const store = link.dataset.store || "";
    const ctaLocation = link.dataset.ctaLocation || "unknown";
    const linkUrl = link.href || "";
    const calculatorName = calculatorNameFromPath(pagePath());

    send(link.dataset.analyticsEvent, {
      store,
      cta_location: ctaLocation,
      link_url: linkUrl
    });

    if (calculatorName) {
      send("calculator_page_cta_click", {
        calculator_name: calculatorName,
        store,
        cta_location: ctaLocation,
        link_url: linkUrl
      });
    }
  });

  root.RehabAnalytics = {
    trackCalculatorResult
  };
})(window);
