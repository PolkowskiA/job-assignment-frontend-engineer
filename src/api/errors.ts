export interface ApiClientError {
  status: number;
  details: string[];
  message: string;
}

export function createApiClientError(
  status: number,
  details: string[] = [],
  fallbackMessage = "Request failed"
): ApiClientError {
  return {
    status,
    details,
    message: details[0] ?? fallbackMessage,
  };
}

export function toApiClientError(error: unknown): ApiClientError {
  if (typeof error === "object" && error !== null) {
    return error as ApiClientError;
  }

  if (error instanceof Error) {
    return createApiClientError(0, [error.message], error.message);
  }

  return createApiClientError(0);
}
