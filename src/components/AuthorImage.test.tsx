import { fireEvent, render, screen } from "@testing-library/react";
import { AUTHOR_IMAGE_PLACEHOLDER } from "../utils/articlePresentation";
import AuthorImage from "./AuthorImage";

describe("AuthorImage", () => {
  test("uses placeholder when src is empty", () => {
    render(<AuthorImage src="" alt="author" />);

    const image = screen.getByAltText("author");
    expect(image).toHaveAttribute("src", AUTHOR_IMAGE_PLACEHOLDER);
  });

  test("switches to placeholder on image load error", () => {
    render(<AuthorImage src="https://example.com/broken-image.jpg" alt="author" />);

    const image = screen.getByAltText("author");
    fireEvent.error(image);

    expect(image).toHaveAttribute("src", AUTHOR_IMAGE_PLACEHOLDER);
  });
});
