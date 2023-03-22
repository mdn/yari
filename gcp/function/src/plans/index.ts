type CountryCode = string;
type LanguageCode = string;
type CurrencyCode = string;
type ProductId = string;
type PriceId = string;

export interface Plan {
  unit_amount: number;
  currency: CurrencyCode;
  product: ProductId;
  recurring: {
    interval: "month" | "year";
  };
  nickname: string;
  lookup_key: string;
  metadata: { [key: string]: string };
  price_id: PriceId;
}

export interface LookupData {
  countryToCurrency: {
    [countryCode: CountryCode]: {
      currency: CurrencyCode;
      supportedLanguages: {
        [languageCode: LanguageCode]: null | {
          [key: string]: string;
        };
      };
      defaultLanguage: LanguageCode;
    };
  };
  langCurrencyToPlans: {
    [langCurrencyCode: string]: {
      [name: string]: Plan;
    };
  };
}
