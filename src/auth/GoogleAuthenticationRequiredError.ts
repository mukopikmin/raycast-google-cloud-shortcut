export class GoogleAuthenticationRequiredError extends Error {
  constructor() {
    super("Your Google session has expired. Sign in again to load resources.");
    this.name = "GoogleAuthenticationRequiredError";
  }
}
