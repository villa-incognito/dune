export function formatNumber(number: number) {
  return typeof number.toLocaleString === "function"
    ? number.toLocaleString()
    : number;
}

// formatUsd(0.5) -> $0.50
export function formatUsd(number: number) {
  if (typeof number.toLocaleString === "function") {
    return number
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
      .replace(/\.00$/, "");
  } else {
    return "$" + number.toFixed(2).replace(/\.00$/, "");
  }
}
