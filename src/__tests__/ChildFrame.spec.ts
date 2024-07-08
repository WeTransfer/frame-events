import { InitialFrameEvent } from "src/types";
import ChildFrame from "../ChildFrame";
import ERROR_MESSAGES from "../constants/error-messages";
import Events from "../helpers/event-emitter";
import { loadScriptTags } from "../helpers/load-script-tags";

jest.mock("../helpers/event-emitter");
jest.mock("../helpers/load-script-tags");

describe("ChildFrame", () => {
  const originalLocation = window.location;

  describe("construct", () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should throw an error if no origin is present in the URL", () => {
      const mockLocation = {
        ...originalLocation,
        search: "?_placement=myParentPlacement",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });

      expect(() => {
        new ChildFrame(jest.fn());
      }).toThrow(ERROR_MESSAGES.CANT_VALIDATE_ORIGIN);
    });

    it("should throw an error if no placement is present is the URL", () => {
      const mockLocation = {
        ...originalLocation,
        search: "?_origin=http://parent:1",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });

      expect(() => {
        new ChildFrame(jest.fn);
      }).toThrow(ERROR_MESSAGES.CANT_VALIDATE_PLACEMENT);
    });

    it("should get the parent origin from the URL", () => {
      const mockLocation = {
        ...originalLocation,
        search: "?_origin=http://parent:1&_placement=myParentPlacement",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });

      const marco = new ChildFrame(jest.fn);

      expect(marco.endpoint).toBe("http://parent:1");
    });

    it("should start listening for message events", () => {
      jest.spyOn(window, "addEventListener");
      new ChildFrame(jest.fn);

      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.addEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("should define a parent placement", () => {
      const marco = new ChildFrame(jest.fn);

      expect(marco.parentPlacement).toBe("myParentPlacement");
    });
  });

  describe("receiveEvent method", () => {
    let event: MessageEvent;
    let parseMessageMock: jest.SpyInstance;
    let onParentReadyMock: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let emitEventSpy: jest.SpyInstance;

    beforeAll(() => {
      parseMessageMock = jest.spyOn(ChildFrame.prototype, "parseMessage");
      parseMessageMock.mockImplementation(() => Promise.resolve());
      onParentReadyMock = jest.spyOn(ChildFrame.prototype, "onParentReady");
      onParentReadyMock.mockImplementation(() => Promise.resolve());
      consoleErrorSpy = jest.spyOn(console, "error");
      consoleErrorSpy.mockImplementation(() => {});
      emitEventSpy = jest.spyOn(Events.prototype, "emit");

      event = new MessageEvent("message");
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should reject events not coming from the parent", () => {
      global.dispatchEvent(event);

      expect(parseMessageMock).not.toHaveBeenCalled();
    });

    it("should try to parse the message", () => {
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://parent:1");
      global.dispatchEvent(event);

      expect(parseMessageMock).toHaveBeenCalled();
    });

    it("should log parsing errors", () => {
      parseMessageMock.mockImplementationOnce(() => {
        throw new Error("Parsing error");
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://parent:1");
      global.dispatchEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error processing event:",
        new Error("Parsing error")
      );
    });

    it("should not emit an internal event if the message comes from a different placement", () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: "myCommand",
        parentPlacement: "otherPlacement",
      });

      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://parent:1");
      global.dispatchEvent(event);

      expect(emitEventSpy).not.toHaveBeenCalled();
    });

    it("should emit an internal event", () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: "myCommand",
        parentPlacement: "myParentPlacement",
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://parent:1");
      global.dispatchEvent(event);

      expect(emitEventSpy).toHaveBeenCalledWith("myCommand", {});
    });

    it("should fire the onParentReady callback if the event is the default ready event", () => {
      parseMessageMock.mockReturnValueOnce({
        command: "ready",
        parentPlacement: "myParentPlacement",
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://parent:1");
      jest.spyOn(event, "data", "get").mockReturnValueOnce("event:data");
      global.dispatchEvent(event);

      expect(onParentReadyMock).toHaveBeenCalledWith("event:data");
    });
  });

  describe("parseMessage method", () => {
    let marco: InstanceType<typeof ChildFrame>;
    let event: MessageEvent;

    beforeAll(() => {
      const mockLocation = {
        ...originalLocation,
        search: "?_origin=http://parent:1&_placement=myParentPlacement",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });

      marco = new ChildFrame(jest.fn);
      event = new MessageEvent("message");
      jest.spyOn(event, "data", "get").mockReturnValue({
        command: "ready",
        payload: {},
        placement: "myParentPlacement",
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should parse the message", async () => {
      const { payload, command, parentPlacement } = marco.parseMessage(event);

      expect(command).toEqual("ready");
      expect(payload).toEqual({});
      expect(parentPlacement).toEqual("myParentPlacement");
    });
  });

  describe("onParentReady method", () => {
    let childFrame: ChildFrame;
    const callbackMock = jest.fn();
    let payload: InitialFrameEvent;
    let eventEmitterOnSpy: jest.SpyInstance;
    let sendCommandSpy: jest.SpyInstance;

    beforeAll(() => {
      const mockLocation = {
        ...originalLocation,
        search: "?_origin=http://parent:1&_placement=myParentPlacement",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });

      childFrame = new ChildFrame(callbackMock);
      payload = {
        availableMethods: ["method1", "method2"],
        availableListeners: ["myListener"],
        command: "",
        payload: {},
        placement: "myParentPlacement",
        scripts: ['<script src="https://moat.com/script.js"></script>'],
      };

      eventEmitterOnSpy = jest.spyOn(childFrame.eventEmitter, "on");
      sendCommandSpy = jest.spyOn(childFrame, "sendCommand");

      childFrame.onParentReady(payload);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should add available event listeners", () => {
      if (payload.availableListeners) {
        expect(eventEmitterOnSpy).toHaveBeenCalledTimes(
          payload.availableListeners.length
        );
        payload.availableListeners.forEach((listener) => {
          expect(eventEmitterOnSpy).toHaveBeenCalledWith(
            listener,
            expect.any(Function)
          );
        });
      } else {
        // Handle case where availableListeners is null or undefined
        expect(eventEmitterOnSpy).not.toHaveBeenCalled();
      }
    });

    it("should add available event listeners", () => {
      expect(childFrame.listeners["myListener"]).toBeDefined();
    });

    it("should register available methods", () => {
      expect(childFrame.run["method1"]).toBeDefined();
      expect(childFrame.run["method2"]).toBeDefined();
    });

    it("should fire the init callback", () => {
      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(callbackMock).toHaveBeenCalledWith(payload);
    });

    it("should pass the scripts to the helper method", () => {
      expect(loadScriptTags).toHaveBeenCalledTimes(1);
      expect(loadScriptTags).toHaveBeenCalledWith(payload.scripts);
    });
  });

  describe("sendCommand method", () => {
    let marco: InstanceType<typeof ChildFrame>;
    const callbackMock = jest.fn();

    beforeAll(() => {
      const mockLocation = {
        ...originalLocation,
        search: "?_origin=http://parent:1&_placement=myParentPlacement",
      };

      Object.defineProperty(window, "location", {
        configurable: true,
        writable: true,
        value: mockLocation,
      });
      window.parent.postMessage = jest.fn();
      marco = new ChildFrame(callbackMock);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should post a message", () => {
      marco.sendCommand("myCommand", {});

      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          command: "myCommand",
          payload: {},
          placement: "myParentPlacement",
        },
        "http://parent:1"
      );
    });
  });
});
