import { InitialFrameEvent, RESERVED_READY_COMMAND } from './ParentFrame';
import ERROR_MESSAGES from './constants/error-messages';
import Events, { SubscriberCallback } from './helpers/event-emitter';
import { loadScriptTags } from './helpers/load-script-tags';

export default class ChildFrame {
  private callback: SubscriberCallback;
  readonly endpoint: string | null;
  readonly listeners: { [key: string]: (...args: any[]) => void };
  readonly run: { [key: string]: (...args: any[]) => void };
  public parentPlacement: string | null;
  readonly eventEmitter: Events = new Events();

  constructor(initCallback: SubscriberCallback) {
    // Register endpoint
    const urlParams = new URLSearchParams(window.location.search);
    this.endpoint = urlParams.get('_origin');
    if (!this.endpoint) {
      throw new Error(ERROR_MESSAGES.CANT_VALIDATE_ORIGIN);
    }

    // Get parent placement from location
    this.parentPlacement = urlParams.get('_placement');
    if (!this.parentPlacement) {
      throw new Error(ERROR_MESSAGES.CANT_VALIDATE_PLACEMENT);
    }

    this.callback = initCallback;

    this.eventEmitter.on(
      RESERVED_READY_COMMAND,
      this.onParentReady.bind(this) as SubscriberCallback
    );

    this.listeners = {};
    this.run = {};

    window.addEventListener('message', this.receiveEvent.bind(this));
  }

  receiveEvent(event: MessageEvent): void {
    // Verify the origin
    if (event.origin !== this.endpoint) return;

    try {
      const { command, payload, parentPlacement } = this.parseMessage(event);

      // Check placement
      // Only process messages coming from the parent placement
      if (parentPlacement !== this.parentPlacement) return;

      if (command === RESERVED_READY_COMMAND) this.onParentReady(event.data);
      else this.eventEmitter.emit(command, payload);
    } catch (error) {
      console.error(error);
    }
  }

  parseMessage(event: MessageEvent): {
    command: string;
    payload: unknown;
    parentPlacement: string;
  } {
    return {
      command: event.data.command,
      payload: event.data.payload,
      parentPlacement: event.data.placement,
    };
  }

  onParentReady(payload: InitialFrameEvent): void {
    const { availableListeners, availableMethods, scripts } = payload;

    // Attach listeners and commands
    availableListeners &&
      availableListeners.forEach((name: string) => {
        this.listeners[name] = (fn: SubscriberCallback) => {
          this.eventEmitter.on(name, fn);
        };
      });

    availableMethods &&
      availableMethods.forEach((command: string) => {
        this.run[command] = (data) => {
          this.sendCommand(command, data);
        };
      });

    // Add third party scripts
    scripts && loadScriptTags(scripts);

    // Fire custom callback
    this.callback(payload);
  }

  sendCommand(command: string, payload: unknown): void {
    const data = {
      command,
      payload,
      placement: this.parentPlacement,
    };

    window.parent.postMessage(data, this.endpoint as string);
  }
}
