import { useTheme } from "../../../hooks";

export default function ThemedPicture({
  srcLight,
  srcDark,
  alt,
  ...props
}: {
  srcLight: string;
  srcDark: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const theme = useTheme();
  return (
    <picture>
      {theme === "os-default" && (
        <>
          <source srcSet={srcLight} media="(prefers-color-scheme: light)" />
          <source srcSet={srcDark} media="(prefers-color-scheme: dark)" />
        </>
      )}
      <img src={theme === "dark" ? srcDark : srcLight} alt={alt} {...props} />
    </picture>
  );
}
