export class InvalidCredentialException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid Credentials');
  }
}
