/**
 *
 * A callback function that handles emitted events.
 * @param args - The arguments passed to the callback function.
 * @interface SubscriberCallback
 */
export interface SubscriberCallback {
  (...args: any[]): void;
}

/**
 *
 * An object containing subscribers for different events.
 * @interface Subscribers
 */
export interface Subscribers {
  [key: string]: SubscriberCallback[];
}

/**
 *
 * A class for emitting and subscribing to events.
 *
 * @export
 * @class Events
 */
export default class Events {
  /**
   *
   * An object containing subscribers for different events.
   *
   * @type {Subscribers}
   * @memberof Events
   */
  readonly subscribers: Subscribers;

  constructor() {
    this.subscribers = {};
  }

  /**
   * Handles subscribing to events by adding a callback to the subscribers array under the specified event.
   *
   * @param {string} event - The event to subscribe to.
   * @param {SubscriberCallback} callback - The callback function to be executed when the event is emitted.
   * @return {object} An object with an `off` method to unsubscribe the callback from the event.
   */
  on(event: string, callback: SubscriberCallback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(callback);

    return {
      off: () => {
        this.subscribers[event] = this.subscribers[event].filter(
          (sub) => sub !== callback
        );
      },
    };
  }

  /**
   * Emits an event and executes all callbacks associated with it.
   *
   * @param {string} event - The event to be emitted.
   * @param {...any[]} args - The arguments to be passed to the callbacks.
   * @return {void}
   */
  emit(event: string, ...args: any[]) {
    if (!this.subscribers[event]) return;
    this.subscribers[event].forEach((subscriberCallback: SubscriberCallback) =>
      subscriberCallback(...args)
    );
  }
}
