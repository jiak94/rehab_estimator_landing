(function(root) {
  "use strict";

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 1
    }).format(Number.isFinite(value) ? value : 0);
  }

  function readNumber(container, name) {
    const input = container.querySelector(`[data-input="${name}"]`);
    return input ? Number(input.value) : 0;
  }

  function readValue(container, name) {
    const input = container.querySelector(`[data-input="${name}"]`);
    return input ? input.value : "";
  }

  function setText(container, name, value) {
    const output = container.querySelector(`[data-output="${name}"]`);
    if (output) output.textContent = value;
  }

  function setError(container, message) {
    const error = container.querySelector("[data-error]");
    if (error) error.textContent = message || "";
  }

  function renderBreakdown(container, rows) {
    const list = container.querySelector('[data-output="breakdown"]');
    if (!list) return;

    list.innerHTML = rows.map((row) => (
      `<dt>${row.label}</dt><dd>${row.value}</dd>`
    )).join("");
  }

  function bindCalculator(container, render) {
    const form = container.querySelector(".calculator-form");
    const update = () => {
      try {
        render();
        setError(container, "");
      } catch (error) {
        setError(container, error.message);
      }
    };

    if (form) {
      form.addEventListener("input", update);
      form.addEventListener("change", update);
    }
    update();
  }

  root.RehabCalculatorUI = {
    bindCalculator,
    formatCurrency,
    formatPercent,
    readNumber,
    readValue,
    renderBreakdown,
    setText
  };
})(window);
