/**
 * Custom error class for transport-related errors in DyneMCP.
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = 'TransportError'
  }

  /**
   * Error for connection failures.
   */
  static connectionError(details: string) {
    return new TransportError(
      `Connection error: ${details}`,
      'CONNECTION_ERROR'
    )
  }

  /**
   * Error for message handling failures.
   */
  static messageError(details: string) {
    return new TransportError(`Message error: ${details}`, 'MESSAGE_ERROR')
  }
}
