interface HydrationData<Type = any> {
  hyData?: Type;
  doc?: any;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
}

export type { HydrationData };
