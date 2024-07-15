type Colors = {
  textColor?: string;
  backgroundColor?: string;
  ctaTextColor?: string;
  ctaBackgroundColor?: string;
  textColorDark?: string;
  backgroundColorDark?: string;
  ctaTextColorDark?: string;
  ctaBackgroundColorDark?: string;
};

export type Payload = {
  status: Status;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  alt?: string;
  cta?: string;
  colors?: Colors;
  version: number;
  heading?: string;
  ppa?: string;
};
