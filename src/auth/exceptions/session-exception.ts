export class InvalidSessionRequestException extends Error {
  constructor(message?: string) {
    super(message || 'Invalid session request');
  }
}

export class SessionExpiredException extends Error {
  constructor(message?: string) {
    super(message || 'Session expired');
  }
}
