interface HydrationData<T = any> {
  hyData?: T;
  doc?: any;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
}

export type { HydrationData };
