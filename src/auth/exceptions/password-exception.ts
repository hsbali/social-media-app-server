export class IncorrectConfirmPasswordException extends Error {
  constructor(message?: string) {
    super(message || 'Incorrect Password');
  }
}
