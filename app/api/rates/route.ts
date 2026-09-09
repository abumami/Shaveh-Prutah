const FALLBACK_RATES = { USD: 1, ILS: 3.012, EUR: 0.85997, GBP: 0.73957, CAD: 1.3806, AUD: 1.3907, CHF: 0.80887, JPY: 156.52 };
export async function GET() {
  try {
    const [silverResponse, currencyResponse] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAG', { cf: { cacheTtl: 300, cacheEverything: true } }),
      fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP,ILS,CAD,AUD,CHF,JPY', { cf: { cacheTtl: 3600, cacheEverything: true } }),
    ]);
    if (!silverResponse.ok || !currencyResponse.ok) throw new Error('Market data unavailable');
    const silver = await silverResponse.json() as { price: number; updatedAt: string };
    const currencyRows = await currencyResponse.json() as Array<{ quote: string; rate: number }>;
    const rates = Object.fromEntries(currencyRows.map(({ quote, rate }) => [quote, rate]));
    return Response.json({ silverUsdPerOunce: silver.price, rates: { ...rates, USD: 1 }, updatedAt: silver.updatedAt, live: true }, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } });
  } catch {
    return Response.json({ silverUsdPerOunce: 66.341003, rates: FALLBACK_RATES, updatedAt: '2026-09-06T05:38:03Z', live: false });
  }
}
