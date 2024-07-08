export interface ParentFrameMethods {
  [key: string]: (...args: never[]) => void;
}

export interface ParentFrameOptions {
  childFrameNode: HTMLIFrameElement;
  methods?: ParentFrameMethods;
  listeners?: string[];
  scripts?: string[];
}

export interface FrameEvent<Payload = unknown> {
  command: string;
  payload: Payload;
}

export interface InitialFrameEvent extends FrameEvent {
  availableListeners: string[] | null;
  availableMethods: string[] | null;
  scripts?: string[];
  placement: string;
}
