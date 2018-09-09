/**
 * Custom Signally error wrapper class.
 */
export class SignallyError extends Error {
  public static EVENT_NAME_NOT_DEFINED() {
    return new SignallyError("Event name not defined");
  }

  public static CALLBACK_NOT_DEFINED() {
    return new SignallyError("Callback not defined");
  }

  public static LISTENER_DOES_NOT_EXIST(eventName: string) {
    return new SignallyError(
      `Listener for event "${eventName}" does not exist`
    );
  }

  public static BUFFER_ROOT_NOT_FOUND() {
    return new SignallyError(
      "No Signally listeners were found. Is the app running?"
    );
  }

  public static CALLER_STACK_TOO_SMALL() {
    return new SignallyError("Could not get caller path from stack");
  }

  public static PACKAGE_ROOT_NOT_FOUND() {
    return new SignallyError(
      "Could not find the package root containing package.json"
    );
  }

  constructor(message: string) {
    super(message);
  }
}
