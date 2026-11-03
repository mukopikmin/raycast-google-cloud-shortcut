export class GoogleAuthenticationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GoogleAuthenticationError";
  }
}

export const isGoogleAuthenticationError = (error: Error) =>
  error instanceof GoogleAuthenticationError ||
  error.name === "GoogleAuthenticationError" ||
  error.name === "GoogleAuthenticationRequiredError";
