(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="fix-flip"]');
  if (!container || !formulas || !ui) return;

  const isSpanish = document.documentElement.lang === "es";
  const breakdownLabels = isSpanish ? {
    holdingCost: "Costo de holding",
    commission: "Comisión de agente",
    nonPurchaseCost: "Costos fuera de compra",
    totalProjectCost: "Costo total del proyecto"
  } : {
    holdingCost: "Holding cost",
    commission: "Agent commission",
    nonPurchaseCost: "Non-purchase costs",
    totalProjectCost: "Total project cost"
  };

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
      { label: breakdownLabels.holdingCost, value: ui.formatCurrency(result.holdingCost) },
      { label: breakdownLabels.commission, value: ui.formatCurrency(result.commission) },
      { label: breakdownLabels.nonPurchaseCost, value: ui.formatCurrency(result.nonPurchaseCost) },
      { label: breakdownLabels.totalProjectCost, value: ui.formatCurrency(result.totalProjectCost) }
    ]);
    if (window.RehabAnalytics) {
      window.RehabAnalytics.trackCalculatorResult("fix_and_flip");
    }
  });
})();
