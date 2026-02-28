import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { toApiClientError } from "../api";
import { useAuth } from "../auth/AuthContext";
import LoginRegister from "./LoginRegister";

jest.mock("../auth/AuthContext");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
}));

jest.mock("../components/AppLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock("../api", () => ({
  toApiClientError: jest.fn(),
}));

const mockReplace = jest.fn();
const mockLogin = jest.fn();

describe("LoginRegister", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useHistory as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
    });
  });

  it("renders form fields and button", () => {
    render(<LoginRegister />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls login with trimmed email and password", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginRegister />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "  test@example.com  ");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "secret");
    });
  });

  it("redirects to home after successful login", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginRegister />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message when login fails", async () => {
    mockLogin.mockRejectedValue(new Error("fail"));

    (toApiClientError as jest.Mock).mockReturnValue({
      message: "Invalid credentials",
      details: [],
    });

    render(<LoginRegister />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");

    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("disables submit button while submitting", async () => {
    let resolvePromise!: () => void;

    mockLogin.mockReturnValue(
      new Promise<void>(resolve => {
        resolvePromise = resolve;
      })
    );

    render(<LoginRegister />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "secret");

    const button = screen.getByRole("button", { name: /sign in/i });

    await userEvent.click(button);

    expect(button).toBeDisabled();

    resolvePromise();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("redirects immediately if already authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      login: mockLogin,
    });

    render(<LoginRegister />);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
