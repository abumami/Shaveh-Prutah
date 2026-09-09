'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currencies = [
  ['ILS', '₪', 'Israeli new shekel'], ['USD', '$', 'US dollar'], ['EUR', '€', 'Euro'], ['GBP', '£', 'British pound'],
  ['CAD', 'C$', 'Canadian dollar'], ['AUD', 'A$', 'Australian dollar'], ['CHF', 'CHF', 'Swiss franc'], ['JPY', '¥', 'Japanese yen'],
] as const;

type RateData = { silverUsdPerOunce: number; rates: Record<string, number>; updatedAt: string; live: boolean };
const FALLBACK: RateData = {
  silverUsdPerOunce: 66.341003,
  rates: { USD: 1, ILS: 3.012, EUR: 0.85997, GBP: 0.73957, CAD: 1.3806, AUD: 1.3907, CHF: 0.80887, JPY: 156.52 },
  updatedAt: '2026-09-06T05:38:03Z', live: false,
};
const GRAMS_PER_TROY_OUNCE = 31.1034768;
const PRUTAH_GRAMS = 0.025;

export default function Home() {
  const [amount, setAmount] = useState('1');
  const [currency, setCurrency] = useState('ILS');
  const [data, setData] = useState<RateData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rates', { cache: 'no-store' });
      if (!response.ok) throw new Error('Rates unavailable');
      setData(await response.json());
    } catch { setData(FALLBACK); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const selected = currencies.find(([code]) => code === currency) ?? currencies[0];
  const valuePerPrutah = (data.silverUsdPerOunce / GRAMS_PER_TROY_OUNCE) * PRUTAH_GRAMS * (data.rates[currency] ?? 1);
  const numericAmount = Math.max(0, Number.parseFloat(amount) || 0);
  const prutot = numericAmount / valuePerPrutah;
  const result = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: prutot >= 100 ? 1 : 3 }).format(prutot), [prutot]);
  const money = (value: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: value < 0.1 ? 4 : 2, maximumFractionDigits: value < 0.1 ? 4 : 2 }).format(value);

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grain" aria-hidden="true" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="#converter" className="flex items-center gap-3 font-semibold tracking-tight"><span className="logo-mark"><img src="/prutah-icon.png" alt="" /></span><span>Prutah</span></a>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`status-dot ${data.live ? 'is-live' : ''}`} />{data.live ? 'Live market rates' : 'Recent reference rates'}</div>
      </header>

      <section id="converter" className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:pb-20 lg:pt-16">
        <div className="max-w-xl">
          <div className="eyebrow"><Sparkles size={13} /> A measure with meaning</div>
          <h1>What is your money worth <em>in silver?</em></h1>
          <p className="hebrew-coheading" lang="he" dir="rtl">מה ערך <em>שווה פרוטה</em> במטבע שלך?</p>
          <p className="lede">Convert any amount into <strong>shaveh prutah</strong>—the current market value of 0.025 grams of pure silver.</p>
          <div className="definition"><span className="hebrew" lang="he" dir="rtl">שווה פרוטה</span><div><strong>shaveh prutah</strong><br /><span>“worth a prutah”</span></div></div>
        </div>

        <div className="converter-card">
          <div className="card-topline"><span>Enter an amount</span><Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading} aria-label="Refresh market rates"><RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh</Button></div>
          <div className="amount-row">
            <Input aria-label="Amount" inputMode="decimal" type="number" min="0" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
            <Select value={currency} onValueChange={(value) => value && setCurrency(value)}>
              <SelectTrigger aria-label="Currency"><SelectValue /></SelectTrigger>
              <SelectContent align="end">{currencies.map(([code, symbol, name]) => <SelectItem key={code} value={code}><span className="currency-symbol">{symbol}</span> {code} · {name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="conversion-arrow" aria-hidden="true"><ArrowRight /></div>
          <output className="result-block" aria-live="polite"><span className="result-kicker">Equals approximately</span><strong>{result}</strong><span className="result-label">shaveh prutah{prutot === 1 ? '' : ' values'}</span></output>
          <div className="rate-strip"><div><span>1 shaveh prutah</span><strong>{selected[1]}{money(valuePerPrutah)} {currency}</strong></div><div><span>Silver spot price</span><strong>${data.silverUsdPerOunce.toFixed(2)} / oz</strong></div></div>
          <p className="timestamp">Rates updated {new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</p>
        </div>
      </section>

      <section className="how-it-works mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div><span>01</span><strong>Live silver</strong><p>We start with the latest spot price per troy ounce.</p></div>
        <div><span>02</span><strong>Measured precisely</strong><p>That price is reduced to exactly 0.025 grams.</p></div>
        <div><span>03</span><strong>Your currency</strong><p>The result is converted using the latest reference rate.</p></div>
      </section>
      <footer><p>For educational use. Market prices fluctuate, and halachic opinions may differ. Consult your rabbi for practical guidance.</p></footer>
    </main>
  );
}
