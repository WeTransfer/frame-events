import { RESERVED_READY_COMMAND } from "./constants/constants";
import ERROR_MESSAGES from "./constants/error-messages";
import Events, { SubscriberCallback } from "./helpers/event-emitter";
import { FrameEvent, InitialFrameEvent, ParentFrameOptions } from "./types";

/**
 * ParentFrame is responsible for sending events to the child frame
 *
 * @export
 * @class ParentFrame
 */
export default class ParentFrame {
  readonly child: HTMLIFrameElement;
  readonly creativeUrl: URL;
  readonly origin: string;
  readonly listeners: string[] | null;
  readonly methods: string[];
  readonly scripts?: string[];
  readonly placement: string;
  readonly events: unknown[] = [];
  readonly eventEmitter: Events = new Events();

  /**
   * Creates an instance of ParentFrame.
   * @param {ParentFrameOptions} {
   *     childFrameNode,
   *     listeners = [],
   *     methods = {},
   *     scripts = [],
   *   }
   * @memberof ParentFrame
   */
  constructor({
    childFrameNode,
    listeners = [],
    methods = {},
    scripts = [],
  }: ParentFrameOptions) {
    if (!childFrameNode.src) {
      throw new Error(ERROR_MESSAGES.EMPTY_IFRAME);
    }
    this.child = childFrameNode;
    this.origin = window.origin;
    this.creativeUrl = new URL(this.child.src);

    // A placement name must be defined in the embedded document source
    const urlParams = new URLSearchParams(this.child.src);
    this.placement = urlParams.get("_placement") || "";
    if (!this.placement) {
      throw new Error(ERROR_MESSAGES.CANT_VALIDATE_PLACEMENT);
    }

    this.scripts = scripts;
    this.listeners = listeners;
    this.methods = Object.keys(methods);

    window.addEventListener("message", this.receiveEvent.bind(this));

    this.methods.forEach((command: string) => {
      if (command === RESERVED_READY_COMMAND) {
        console.error(ERROR_MESSAGES.CANT_USE_READY_COMMAND);
        return;
      }

      const event = this.eventEmitter.on(
        command,
        methods[command] as SubscriberCallback
      );

      this.events.push(event);
    });

    this.send(RESERVED_READY_COMMAND, undefined);
  }

  /**
   *
   *
   * @private
   * @param {MessageEvent} event
   * @return {*}  {void}
   * @memberof ParentFrame
   */
  private receiveEvent(event: MessageEvent): void {
    // Verify the origin
    if (this.creativeUrl.origin !== event.origin) return;

    try {
      const { command, payload, placement } = this.parseMessage(event);

      // Only process events coming from the placement embedded doc
      if (this.placement !== placement) return;

      this.eventEmitter.emit(command, payload);
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }

  /**
   *
   * Parses a message
   * @param {MessageEvent} event
   * @return {*}  {{
   *     command: string;
   *     payload: unknown;
   *     placement: string;
   *   }}
   * @memberof ParentFrame
   */
  parseMessage(event: MessageEvent): {
    command: string;
    payload: unknown;
    placement: string;
  } {
    const { command, payload, placement } = event.data;
    if (!command || !placement) {
      throw new Error(ERROR_MESSAGES.INVALID_MESSAGE_FORMAT);
    }
    return { command, payload, placement };
  }

  /**
   *
   * Builds an event payload
   * @param {string} command
   * @param {unknown} payload
   * @return {*}  {(FrameEvent | InitialFrameEvent)}
   * @memberof ParentFrame
   */
  buildEventPayload(
    command: string,
    payload: unknown
  ): FrameEvent | InitialFrameEvent {
    const result: InitialFrameEvent = {
      command,
      payload,
      placement: this.placement,
      availableListeners: null,
      availableMethods: null,
      scripts: this.scripts,
    };

    if (command === RESERVED_READY_COMMAND) {
      result.availableListeners = this.listeners;
      result.availableMethods = this.methods;
    }

    return result;
  }

  /**
   *
   * Sends an event to the child frame
   * @param {string} command
   * @param {unknown} event
   * @return {*}  {void}
   * @memberof ParentFrame
   */
  public send(command: string, event: unknown): void {
    if (
      this.listeners &&
      !this.listeners.includes(command) &&
      command !== RESERVED_READY_COMMAND
    ) {
      throw new Error(ERROR_MESSAGES.NOT_DEFINED_EVENT_NAME);
    }

    if (!this.child.contentWindow) return;

    const { origin: creativeOrigin } = this.creativeUrl;
    if (!creativeOrigin) return;

    try {
      const payload = this.buildEventPayload(command, event);
      this.child.contentWindow.postMessage(payload, creativeOrigin);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  /**
   *
   * Destroys the parent frame
   *
   * @memberof ParentFrame
   */
  public destroy(): void {
    window.removeEventListener("message", this.receiveEvent.bind(this));
    this.events.forEach((event: any) => {
      event.off();
    });
  }
}
