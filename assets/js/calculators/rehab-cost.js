(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="rehab-cost"]');
  if (!container || !formulas || !ui) return;

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
      label: row.label,
      value: `${ui.formatCurrency(row.low)} to ${ui.formatCurrency(row.high)}`
    })));
    if (window.RehabAnalytics) {
      window.RehabAnalytics.trackCalculatorResult("rehab_cost");
    }
  });
})();
