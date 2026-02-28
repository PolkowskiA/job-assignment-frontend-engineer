import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { AUTHOR_IMAGE_PLACEHOLDER, getAuthorImage } from "../utils/articlePresentation";

type AuthorImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
};

function handleFallback(event: SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = AUTHOR_IMAGE_PLACEHOLDER;
}

export default function AuthorImage({ src, alt, onError, ...rest }: AuthorImageProps) {
  return (
    <img
      {...rest}
      src={getAuthorImage(src ?? null)}
      alt={alt}
      onError={event => {
        if (onError) {
          onError(event);
        }
        handleFallback(event);
      }}
    />
  );
}
