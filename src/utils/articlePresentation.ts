import authorPlaceholder from "../assets/author-placeholder.svg";

export const AUTHOR_IMAGE_PLACEHOLDER = authorPlaceholder;

export function formatPublicationDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getAuthorImage(src: string | null): string {
  return src && src.trim().length > 0 ? src : AUTHOR_IMAGE_PLACEHOLDER;
}
