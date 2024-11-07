export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class UnexpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnexpectedError';
  }
}
