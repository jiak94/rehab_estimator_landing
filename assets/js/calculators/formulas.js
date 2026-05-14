(function(root) {
  "use strict";

  const REHAB_RATES = {
    light: { label: "Light cosmetic", low: 15, high: 35 },
    medium: { label: "Medium rehab", low: 35, high: 70 },
    heavy: { label: "Heavy rehab", low: 70, high: 120 }
  };

  const REHAB_CATEGORY_WEIGHTS = [
    ["Interior", 0.55],
    ["Exterior", 0.20],
    ["Systems", 0.18],
    ["General", 0.07]
  ];

  function assertFiniteNumber(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new Error(`${label} must be a number.`);
    }
    return number;
  }

  function assertMin(value, label, min) {
    const number = assertFiniteNumber(value, label);
    if (number < min) {
      throw new Error(`${label} must be at least ${min}.`);
    }
    return number;
  }

  function percent(value) {
    return assertMin(value, "Percent", 0) / 100;
  }

  function monthlyPayment(principal, annualRate, years) {
    const loanAmount = assertMin(principal, "Loan amount", 0);
    const termYears = assertMin(years, "Loan years", 1);
    const monthlyRate = assertMin(annualRate, "Interest rate", 0) / 100 / 12;
    const payments = termYears * 12;

    if (loanAmount === 0) return 0;
    if (monthlyRate === 0) return loanAmount / payments;

    const factor = Math.pow(1 + monthlyRate, payments);
    return loanAmount * ((monthlyRate * factor) / (factor - 1));
  }

  function rehabCost(inputs) {
    const squareFeet = assertMin(inputs.squareFeet, "Square footage", 1);
    const contingencyRate = percent(inputs.contingencyRate || 0);
    const rate = REHAB_RATES[inputs.intensity] || REHAB_RATES.medium;
    const baseLow = squareFeet * rate.low;
    const baseHigh = squareFeet * rate.high;
    const lowTotal = baseLow * (1 + contingencyRate);
    const highTotal = baseHigh * (1 + contingencyRate);

    return {
      intensityLabel: rate.label,
      lowTotal,
      highTotal,
      contingency: highTotal - baseHigh,
      breakdown: REHAB_CATEGORY_WEIGHTS.map(([label, weight]) => ({
        label,
        low: lowTotal * weight,
        high: highTotal * weight
      }))
    };
  }

  function fixAndFlip(inputs) {
    const arv = assertMin(inputs.arv, "After repair value", 1);
    const purchasePrice = assertMin(inputs.purchasePrice, "Purchase price", 0);
    const desiredProfit = assertMin(inputs.desiredProfit, "Desired profit", 0);
    const repairCost = assertMin(inputs.repairCost, "Repair cost", 0);
    const purchaseCost = assertMin(inputs.purchaseCost, "Purchase costs", 0);
    const saleCost = assertMin(inputs.saleCost, "Selling costs", 0);
    const monthlyHoldingCost = assertMin(inputs.monthlyHoldingCost, "Holding cost per month", 0);
    const holdingMonths = assertMin(inputs.holdingMonths, "Holding months", 0);
    const commission = arv * percent(inputs.commissionRate || 0);
    const holdingCost = monthlyHoldingCost * holdingMonths;
    const nonPurchaseCost = repairCost + purchaseCost + saleCost + holdingCost + commission;
    const maxPurchasePrice = arv - desiredProfit - nonPurchaseCost;
    const projectedProfit = arv - purchasePrice - nonPurchaseCost;

    return {
      maxPurchasePrice,
      projectedProfit,
      profitMargin: projectedProfit / arv,
      totalProjectCost: purchasePrice + nonPurchaseCost,
      holdingCost,
      commission,
      nonPurchaseCost
    };
  }

  function rentalCashflow(inputs) {
    const purchasePrice = assertMin(inputs.purchasePrice, "Purchase price", 1);
    const rehabCostValue = assertMin(inputs.rehabCost, "Rehab cost", 0);
    const closingCost = assertMin(inputs.closingCost, "Closing cost", 0);
    const downPaymentRate = percent(inputs.downPaymentRate || 0);
    const rent = assertMin(inputs.rent, "Monthly rent", 0);
    const annualTaxes = assertMin(inputs.annualTaxes, "Annual taxes", 0);
    const annualInsurance = assertMin(inputs.annualInsurance, "Annual insurance", 0);
    const miscMonthly = assertMin(inputs.miscMonthly, "Misc monthly", 0);

    const downPayment = purchasePrice * downPaymentRate;
    const loanAmount = Math.max(purchasePrice - downPayment, 0);
    const loanPayment = monthlyPayment(loanAmount, inputs.interestRate || 0, inputs.loanYears || 30);
    const vacancy = rent * percent(inputs.vacancyRate || 0);
    const management = rent * percent(inputs.managementRate || 0);
    const maintenance = rent * percent(inputs.maintenanceRate || 0);
    const taxes = annualTaxes / 12;
    const insurance = annualInsurance / 12;
    const operatingExpenses = vacancy + management + maintenance + taxes + insurance + miscMonthly;
    const monthlyCashflow = rent - loanPayment - operatingExpenses;
    const cashInvested = downPayment + rehabCostValue + closingCost;

    return {
      monthlyCashflow,
      cashInvested,
      cashOnCashReturn: cashInvested > 0 ? (monthlyCashflow * 12) / cashInvested : 0,
      loanAmount,
      loanPayment,
      operatingExpenses,
      vacancy,
      management,
      maintenance,
      taxes,
      insurance,
      miscMonthly
    };
  }

  const formulas = {
    rehabCost,
    fixAndFlip,
    rentalCashflow,
    monthlyPayment
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = formulas;
  } else {
    root.RehabCalculatorFormulas = formulas;
  }
})(typeof window !== "undefined" ? window : globalThis);
