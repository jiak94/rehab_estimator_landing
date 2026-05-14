(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="fix-flip"]');
  if (!container || !formulas || !ui) return;

  ui.bindCalculator(container, () => {
    const result = formulas.fixAndFlip({
      arv: ui.readNumber(container, "arv"),
      purchasePrice: ui.readNumber(container, "purchasePrice"),
      desiredProfit: ui.readNumber(container, "desiredProfit"),
      repairCost: ui.readNumber(container, "repairCost"),
      purchaseCost: ui.readNumber(container, "purchaseCost"),
      saleCost: ui.readNumber(container, "saleCost"),
      monthlyHoldingCost: ui.readNumber(container, "monthlyHoldingCost"),
      holdingMonths: ui.readNumber(container, "holdingMonths"),
      commissionRate: ui.readNumber(container, "commissionRate")
    });

    ui.setText(container, "maxPurchasePrice", ui.formatCurrency(result.maxPurchasePrice));
    ui.setText(container, "projectedProfit", ui.formatCurrency(result.projectedProfit));
    ui.setText(container, "profitMargin", ui.formatPercent(result.profitMargin));
    ui.renderBreakdown(container, [
      { label: "Holding cost", value: ui.formatCurrency(result.holdingCost) },
      { label: "Agent commission", value: ui.formatCurrency(result.commission) },
      { label: "Non-purchase costs", value: ui.formatCurrency(result.nonPurchaseCost) },
      { label: "Total project cost", value: ui.formatCurrency(result.totalProjectCost) }
    ]);
  });
})();
