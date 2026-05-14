const assert = require("assert");
const formulas = require("../assets/js/calculators/formulas");

function closeTo(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

const rehab = formulas.rehabCost({
  squareFeet: 1000,
  intensity: "light",
  contingencyRate: 10
});

closeTo(rehab.lowTotal, 16500);
closeTo(rehab.highTotal, 38500);
closeTo(rehab.contingency, 3500);
assert.strictEqual(rehab.breakdown.length, 4);

const flip = formulas.fixAndFlip({
  arv: 300000,
  purchasePrice: 180000,
  desiredProfit: 40000,
  repairCost: 35000,
  purchaseCost: 5000,
  saleCost: 4000,
  monthlyHoldingCost: 1500,
  holdingMonths: 4,
  commissionRate: 6
});

closeTo(flip.commission, 18000);
closeTo(flip.holdingCost, 6000);
closeTo(flip.maxPurchasePrice, 192000);
closeTo(flip.projectedProfit, 52000);
closeTo(flip.profitMargin, 0.1733333333);

const rental = formulas.rentalCashflow({
  purchasePrice: 200000,
  rehabCost: 30000,
  closingCost: 5000,
  downPaymentRate: 20,
  interestRate: 6,
  loanYears: 30,
  rent: 2200,
  vacancyRate: 5,
  managementRate: 8,
  maintenanceRate: 5,
  annualTaxes: 3600,
  annualInsurance: 1200,
  miscMonthly: 50
});

closeTo(rental.loanAmount, 160000);
closeTo(rental.loanPayment, 959.28, 0.1);
closeTo(rental.cashInvested, 75000);
closeTo(rental.operatingExpenses, 846);
closeTo(rental.monthlyCashflow, 394.72, 0.1);
closeTo(rental.cashOnCashReturn, 0.063155, 0.0002);

assert.throws(() => formulas.rehabCost({ squareFeet: 0, intensity: "light" }), /Square footage/);

console.log("calculator formula tests passed");
