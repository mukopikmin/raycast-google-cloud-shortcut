import { GoogleAuthenticationError } from "./GoogleAuthenticationError";

export class GoogleAuthenticationRequiredError extends GoogleAuthenticationError {
  constructor() {
    super("Your Google session has expired. Sign in again to load resources.");
    this.name = "GoogleAuthenticationRequiredError";
  }
}
