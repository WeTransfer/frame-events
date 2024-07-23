import ERROR_MESSAGES from './constants/error-messages';
import Events, { SubscriberCallback } from './helpers/event-emitter';
import { loadScriptTags } from './helpers/load-script-tags';
import { InitialFrameEvent } from './types';
import { RESERVED_READY_COMMAND } from './constants/constants';

/**
 * A class for handling communication between the parent and child frames.
 *
 * @export
 * @class ChildFrame
 */
export default class ChildFrame {
  /**
   * The callback function to be executed when the event is emitted.
   *
   * @private
   * @type {SubscriberCallback}
   * @memberof ChildFrame
   */
  private readonly callback: SubscriberCallback;

  /**
   * The endpoint of the parent frame.
   *
   * @type {(string | null)}
   * @memberof ChildFrame
   */
  readonly endpoint: string | null;

  /**
   * The listeners of the parent frame.
   *
   * @memberof ChildFrame
   */
  readonly listeners: { [key: string]: (...args: any[]) => void };

  /**
   * The run function of the parent frame.
   *
   * @memberof ChildFrame
   */
  readonly run: { [key: string]: (...args: any[]) => void };

  /**
   * The placement of the parent frame.
   *
   * @type {(string | null)}
   * @memberof ChildFrame
   */
  readonly parentPlacement: string | null;

  /**
   * The event emitter
   *
   * @type {Events}
   * @memberof ChildFrame
   */
  readonly eventEmitter: Events = new Events();

  /**
   * Creates an instance of ChildFrame.
   * @param {SubscriberCallback} initCallback
   * @memberof ChildFrame
   */
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

  /**
   * Handles receiving messages from the parent frame.
   *
   * @param {MessageEvent} event
   * @returns {void}
   * @memberof ChildFrame
   */
  receiveEvent(event: MessageEvent): void {
    // Verify the origin
    if (event.origin !== this.endpoint) return;

    try {
      const { command, payload, parentPlacement } = this.parseMessage(event);

      // Check placement
      // Only process messages coming from the parent placement
      if (parentPlacement !== this.parentPlacement) return;

      if (command === RESERVED_READY_COMMAND) {
        this.onParentReady(event.data);
      } else {
        this.eventEmitter.emit(command, payload);
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  /**
   * Parses a message from the parent frame.
   *
   * @param {MessageEvent} event
   * @return  {{
   *     command: string;
   *     payload: unknown;
   *     parentPlacement: string;
   *   }}
   * @memberof ChildFrame
   */
  parseMessage(event: MessageEvent): {
    command: string;
    payload: unknown;
    parentPlacement: string;
  } {
    return {
      command: event.data.command || '',
      payload: event.data.payload || {},
      parentPlacement: event.data.placement || '',
    };
  }

  /**
   * Handles the ready event from the parent frame.
   *
   * @param {InitialFrameEvent} payload
   * @memberof ChildFrame
   */
  onParentReady(payload: InitialFrameEvent): void {
    const { availableListeners, availableMethods, scripts } = payload;

    // Attach listeners and commands
    if (availableListeners) {
      availableListeners.forEach((name: string) => {
        this.listeners[name] = (fn: SubscriberCallback) => {
          this.eventEmitter.on(name, fn);
        };
      });
    }

    if (availableMethods) {
      availableMethods.forEach((command: string) => {
        this.run[command] = (data: unknown) => {
          this.sendCommand(command, data);
        };
      });
    }

    // Add third party scripts
    if (scripts) {
      loadScriptTags(scripts);
    }

    // Fire custom callback
    this.callback(payload);
  }

  /**
   * Sends a command to the parent frame.
   *
   * @param {string} command
   * @param {unknown} payload
   * @memberof ChildFrame
   */
  public sendCommand(command: string, payload: unknown): void {
    const data = {
      command,
      payload,
      placement: this.parentPlacement,
    };

    window.parent.postMessage(data, this.endpoint as string);
  }
}
