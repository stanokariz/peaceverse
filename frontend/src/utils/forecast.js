// src/utils/forecast.js

/**
 * Simple ARIMA-lite style forecasting using:
 * - Linear regression
 * - Moving average smoothing
 * - Seasonality correction (recent pattern)
 *
 * Input:
 *   trendData = [{ date: "2025-01-01", count: 5 }, ...]
 * Output:
 *   { forecast: [{ date, predicted, lower, upper }] }
 */

export function generateForecast(trendData, daysAhead = 7) {
  if (!trendData || trendData.length < 3) {
    return [];
  }

  const values = trendData.map((d) => d.count);
  const n = values.length;

  // 1. Moving Average Smoothing
  const smoothed = values.map((v, i) => {
    const window = values.slice(Math.max(0, i - 2), i + 1);
    return window.reduce((a, b) => a + b, 0) / window.length;
  });

  // 2. Linear Regression on smoothed data
  const xs = [...Array(n).keys()];
  const ys = smoothed;

  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;

  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }

  const slope = num / den;
  const intercept = yMean - slope * xMean;

  // 3. Generate future predictions
  const lastDate = new Date(trendData[trendData.length - 1].date);

  const forecasts = [];
  for (let i = 1; i <= daysAhead; i++) {
    const x = n - 1 + i; // future x
    const predicted = intercept + slope * x;

    // Confidence interval approximation
    const variance = Math.max(1, predicted * 0.25);
    const lower = Math.max(0, predicted - variance);
    const upper = predicted + variance;

    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    forecasts.push({
      date: nextDate.toISOString().split("T")[0],
      predicted: Math.round(predicted),
      lower: Math.round(lower),
      upper: Math.round(upper),
    });
  }

  return forecasts;
}
