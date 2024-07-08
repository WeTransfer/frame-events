export interface SubscriberCallback {
  (...args: unknown[]): void;
}
export interface Subscribers {
  [key: string]: SubscriberCallback[];
}

export default class Events {
  readonly subscribers: Subscribers;

  constructor() {
    this.subscribers = {};
  }

  on(event: string, callback: SubscriberCallback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    const index = this.subscribers[event].push(callback) - 1;

    return {
      off: () => {
        this.subscribers[event].splice(index, 1);
      },
    };
  }

  emit(event: string, data: unknown) {
    if (!this.subscribers[event]) return;
    this.subscribers[event].forEach((subscriberCallback: SubscriberCallback) =>
      subscriberCallback(data)
    );
  }
}
