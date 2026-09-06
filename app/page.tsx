'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Scale, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const currencies = [
  { code: 'ILS', symbol: '₪', en: 'Israeli shekel', he: 'שקל ישראלי' },
  { code: 'USD', symbol: '$', en: 'US dollar', he: 'דולר אמריקאי' },
  { code: 'EUR', symbol: '€', en: 'Euro', he: 'אירו' },
  { code: 'GBP', symbol: '£', en: 'UK pound', he: 'לירה שטרלינג' },
  { code: 'CAD', symbol: 'C$', en: 'Canadian dollar', he: 'דולר קנדי' },
  { code: 'AUD', symbol: 'A$', en: 'Australian dollar', he: 'דולר אוסטרלי' },
  { code: 'CHF', symbol: 'CHF', en: 'Swiss franc', he: 'פרנק שווייצרי' },
  { code: 'JPY', symbol: '¥', en: 'Japanese yen', he: 'ין יפני' },
] as const;

const CORE_CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP'];
const STORAGE_KEY = 'prutah-extra-currencies';
type RateData = { silverUsdPerOunce: number; rates: Record<string, number>; updatedAt: string; live: boolean };
const FALLBACK: RateData = {
  silverUsdPerOunce: 66.341003,
  rates: { USD: 1, ILS: 3.012, EUR: 0.85997, GBP: 0.73957, CAD: 1.3806, AUD: 1.3907, CHF: 0.80887, JPY: 156.52 },
  updatedAt: '2026-09-06T05:38:03Z', live: false,
};
const GRAMS_PER_TROY_OUNCE = 31.1034768;
const PRUTAH_GRAMS = 0.025;

export default function Home() {
  const [extraCurrencies, setExtraCurrencies] = useState<string[]>([]);
  const [currencyToAdd, setCurrencyToAdd] = useState('CAD');
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

  useEffect(() => {
    void refresh();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) setExtraCurrencies(saved.filter((code): code is string => currencies.some((currency) => currency.code === code) && !CORE_CURRENCIES.includes(code)));
    } catch { /* Ignore invalid saved preferences. */ }
  }, [refresh]);

  const persistExtras = (next: string[]) => {
    setExtraCurrencies(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const availableCurrencies = currencies.filter(({ code }) => !CORE_CURRENCIES.includes(code) && !extraCurrencies.includes(code));
  const displayedCurrencies = [...CORE_CURRENCIES, ...extraCurrencies];
  const valueFor = (code: string) => (data.silverUsdPerOunce / GRAMS_PER_TROY_OUNCE) * PRUTAH_GRAMS * (data.rates[code] ?? 1);
  const money = (value: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: value < 1 ? 4 : 2, maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
  const addCurrency = () => {
    if (!currencyToAdd || extraCurrencies.includes(currencyToAdd)) return;
    const next = [...extraCurrencies, currencyToAdd];
    persistExtras(next);
    const nextAvailable = currencies.find(({ code }) => !CORE_CURRENCIES.includes(code) && !next.includes(code));
    if (nextAvailable) setCurrencyToAdd(nextAvailable.code);
  };
  const removeCurrency = (code: string) => {
    setCurrencyToAdd(code);
    persistExtras(extraCurrencies.filter((item) => item !== code));
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grain" aria-hidden="true" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#values" className="flex items-center gap-3 font-semibold tracking-tight"><span className="logo-mark"><Scale size={20} strokeWidth={1.8} /></span><span>Prutah · פרוטה</span></a>
        <div className="market-status"><span className={`status-dot ${data.live ? 'is-live' : ''}`} /><span>{data.live ? 'Live market rates' : 'Recent reference rates'}<b lang="he" dir="rtl">{data.live ? 'שערי שוק בזמן אמת' : 'שערים עדכניים אחרונים'}</b></span></div>
      </header>

      <section id="values" className="hero-grid mx-auto grid w-full max-w-6xl gap-10 px-5 pb-12 pt-2 sm:px-8 sm:pt-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20 lg:pb-16 lg:pt-5">
        <div className="max-w-xl">
          <div className="eyebrow"><Sparkles size={13} /> A measure with meaning <span lang="he" dir="rtl">· שיעור בעל משמעות</span></div>
          <h1>What is a <em>shaveh prutah</em> worth in your currency?</h1>
          <h2 lang="he" dir="rtl">כמה שווה פרוטה במטבע שלך?</h2>
          <p className="lede">The current market value of <strong>0.025 grams of pure silver.</strong><span lang="he" dir="rtl">השווי הנוכחי בשוק של <strong>0.025 גרם כסף טהור.</strong></span></p>
          <div className="definition"><span className="hebrew" lang="he" dir="rtl">שווה פרוטה</span><div><strong>shaveh prutah</strong><br /><span>“worth a prutah” · ״שווה פרוטה״</span></div></div>
        </div>

        <div className="converter-card">
          <div className="card-topline"><span>Current value · <b lang="he" dir="rtl">השווי הנוכחי</b></span><Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={loading} aria-label="Refresh market rates / רענון שערי השוק"><RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh · רענון</Button></div>
          <div className="currency-list" role="list" aria-label="Value of one shaveh prutah by currency / שווי פרוטה לפי מטבע">
            {displayedCurrencies.map((code) => {
              const currency = currencies.find((item) => item.code === code)!;
              const removable = !CORE_CURRENCIES.includes(code);
              return <div className="currency-value" role="listitem" key={code}>
                <div className="currency-name"><span className="currency-code">{currency.code}</span><span>{currency.en}<b lang="he" dir="rtl">{currency.he}</b></span></div>
                <strong><span className="value-symbol">{currency.symbol}</span>{money(valueFor(code))}</strong>
                {removable && <button className="remove-currency" type="button" onClick={() => removeCurrency(code)} aria-label={`Remove ${currency.en} / הסרת ${currency.he}`}><X /></button>}
              </div>;
            })}
          </div>

          {availableCurrencies.length > 0 && <div className="add-currency">
            <label htmlFor="add-currency">Add another currency <span lang="he" dir="rtl">· הוספת מטבע</span></label>
            <div>
              <Select value={currencyToAdd} onValueChange={(value) => value && setCurrencyToAdd(value)}>
                <SelectTrigger id="add-currency" aria-label="Choose a currency / בחירת מטבע"><SelectValue /></SelectTrigger>
                <SelectContent align="end">{availableCurrencies.map(({ code, symbol, en, he }) => <SelectItem key={code} value={code}><span className="currency-symbol">{symbol}</span> {code} · {en} · {he}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={addCurrency}><Plus /> Add · הוסף</Button>
            </div>
            <small>Saved on this device · <span lang="he" dir="rtl">נשמר במכשיר זה</span></small>
          </div>}

          <div className="rate-strip single"><div><span>Silver spot price · <b lang="he" dir="rtl">מחיר הכסף</b></span><strong>${data.silverUsdPerOunce.toFixed(2)} / oz</strong></div></div>
          <p className="timestamp">Rates updated {new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC<br /><span lang="he" dir="rtl">השערים עודכנו לפי שעון UTC</span></p>
        </div>
      </section>

      <section className="how-it-works mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div><span>01</span><strong>Live silver · <b lang="he" dir="rtl">מחיר הכסף</b></strong><p>We use the latest price per troy ounce.<i lang="he" dir="rtl">לפי המחיר העדכני לאונקיית טרוי.</i></p></div>
        <div><span>02</span><strong>Measured precisely · <b lang="he" dir="rtl">חישוב מדויק</b></strong><p>Reduced to exactly 0.025 grams.<i lang="he" dir="rtl">מחושב בדיוק ל־0.025 גרם.</i></p></div>
        <div><span>03</span><strong>Your currencies · <b lang="he" dir="rtl">המטבעות שלך</b></strong><p>Converted using current reference rates.<i lang="he" dir="rtl">מומר לפי שערי החליפין העדכניים.</i></p></div>
      </section>
      <footer><p>For educational use. Market prices fluctuate, and halachic opinions may differ. Consult your rabbi for practical guidance.<span lang="he" dir="rtl">למטרות לימוד בלבד. מחירי השוק משתנים ויש דעות הלכתיות שונות. למעשה יש להתייעץ עם רב.</span></p></footer>
    </main>
  );
}
