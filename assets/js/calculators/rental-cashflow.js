(function() {
  "use strict";

  const formulas = window.RehabCalculatorFormulas;
  const ui = window.RehabCalculatorUI;
  const container = document.querySelector('[data-calculator="rental-cashflow"]');
  if (!container || !formulas || !ui) return;

  const isSpanish = document.documentElement.lang === "es";
  const breakdownLabels = isSpanish ? {
    loanPayment: "Pago del préstamo",
    vacancy: "Vacancia",
    management: "Administración",
    maintenance: "Mantenimiento",
    taxesAndInsurance: "Impuestos y seguro",
    operatingExpenses: "Gastos operativos"
  } : {
    loanPayment: "Loan payment",
    vacancy: "Vacancy",
    management: "Management",
    maintenance: "Maintenance",
    taxesAndInsurance: "Taxes and insurance",
    operatingExpenses: "Operating expenses"
  };

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
      { label: breakdownLabels.loanPayment, value: ui.formatCurrency(result.loanPayment) },
      { label: breakdownLabels.vacancy, value: ui.formatCurrency(result.vacancy) },
      { label: breakdownLabels.management, value: ui.formatCurrency(result.management) },
      { label: breakdownLabels.maintenance, value: ui.formatCurrency(result.maintenance) },
      { label: breakdownLabels.taxesAndInsurance, value: ui.formatCurrency(result.taxes + result.insurance) },
      { label: breakdownLabels.operatingExpenses, value: ui.formatCurrency(result.operatingExpenses) }
    ]);
    if (window.RehabAnalytics) {
      window.RehabAnalytics.trackCalculatorResult("rental_cashflow");
    }
  });
})();
