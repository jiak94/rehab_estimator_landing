(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="rehab-cost"]');
  if (!container || !formulas || !ui) return;

  const isSpanish = document.documentElement.lang === "es";
  const labels = isSpanish ? {
    Interior: "Interior",
    Exterior: "Exterior",
    Systems: "Sistemas",
    General: "General"
  } : {};
  const rangeWord = isSpanish ? " a " : " to ";

  ui.bindCalculator(container, () => {
    const result = formulas.rehabCost({
      squareFeet: ui.readNumber(container, "squareFeet"),
      intensity: ui.readValue(container, "intensity"),
      contingencyRate: ui.readNumber(container, "contingencyRate")
    });

    ui.setText(container, "lowTotal", ui.formatCurrency(result.lowTotal));
    ui.setText(container, "highTotal", ui.formatCurrency(result.highTotal));
    ui.setText(container, "contingency", ui.formatCurrency(result.contingency));
    ui.renderBreakdown(container, result.breakdown.map((row) => ({
      label: labels[row.label] || row.label,
      value: `${ui.formatCurrency(row.low)}${rangeWord}${ui.formatCurrency(row.high)}`
    })));
    if (window.RehabAnalytics) {
      window.RehabAnalytics.trackCalculatorResult("rehab_cost");
    }
  });
})();
