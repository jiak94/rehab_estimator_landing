(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="rental-cashflow"]');
  if (!container || !formulas || !ui) return;

  ui.bindCalculator(container, () => {
    const result = formulas.rentalCashflow({
      purchasePrice: ui.readNumber(container, "purchasePrice"),
      rehabCost: ui.readNumber(container, "rehabCost"),
      closingCost: ui.readNumber(container, "closingCost"),
      downPaymentRate: ui.readNumber(container, "downPaymentRate"),
      interestRate: ui.readNumber(container, "interestRate"),
      loanYears: ui.readNumber(container, "loanYears"),
      rent: ui.readNumber(container, "rent"),
      vacancyRate: ui.readNumber(container, "vacancyRate"),
      managementRate: ui.readNumber(container, "managementRate"),
      maintenanceRate: ui.readNumber(container, "maintenanceRate"),
      annualTaxes: ui.readNumber(container, "annualTaxes"),
      annualInsurance: ui.readNumber(container, "annualInsurance"),
      miscMonthly: ui.readNumber(container, "miscMonthly")
    });

    ui.setText(container, "monthlyCashflow", ui.formatCurrency(result.monthlyCashflow));
    ui.setText(container, "cashInvested", ui.formatCurrency(result.cashInvested));
    ui.setText(container, "cashOnCashReturn", ui.formatPercent(result.cashOnCashReturn));
    ui.renderBreakdown(container, [
      { label: "Loan payment", value: ui.formatCurrency(result.loanPayment) },
      { label: "Vacancy", value: ui.formatCurrency(result.vacancy) },
      { label: "Management", value: ui.formatCurrency(result.management) },
      { label: "Maintenance", value: ui.formatCurrency(result.maintenance) },
      { label: "Taxes and insurance", value: ui.formatCurrency(result.taxes + result.insurance) },
      { label: "Operating expenses", value: ui.formatCurrency(result.operatingExpenses) }
    ]);
    if (window.RehabAnalytics) {
      window.RehabAnalytics.trackCalculatorResult("rental_cashflow");
    }
  });
})();
