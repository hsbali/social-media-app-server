export class LogoutException extends Error {
  constructor(message?: string) {
    super(message || 'Logged out with error');
  }
}
