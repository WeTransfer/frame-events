import { ParentFrameOptions } from "src/types";
import ParentFrame from "../ParentFrame";
import ERROR_MESSAGES from "../constants/error-messages";
import Events from "../helpers/event-emitter";

jest.mock("../helpers/event-emitter");

describe("ParentFrame", () => {
  it("should throw an error if the iframe element does not have a source", () => {
    expect(() => {
      const childFrameNode = document.createElement("iframe");
      const options: ParentFrameOptions = {
        childFrameNode,
      };
      new ParentFrame(options);
    }).toThrow(ERROR_MESSAGES.EMPTY_IFRAME);
  });

  describe("Construct", () => {
    const childFrameNode = document.createElement("iframe");
    childFrameNode.src =
      "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
    const options: ParentFrameOptions = {
      childFrameNode,
      methods: {
        myMethod() {
          jest.fn();
        },
        myOtherMethod() {
          jest.fn();
        },
      },
      listeners: ["eventName1", "eventName2"],
      scripts: ['<script src="https://moat.com/script.js"></script>'],
    };
    let padre: InstanceType<typeof ParentFrame>;
    let consoleErrorSpy: jest.SpyInstance;
    let onEventSpy: jest.SpyInstance;

    beforeAll(() => {
      jest.spyOn(window, "addEventListener");
      consoleErrorSpy = jest.spyOn(console, "error");
      consoleErrorSpy.mockImplementation(() => {});

      padre = new ParentFrame(options);

      onEventSpy = jest.spyOn(Events.prototype, "on");
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should define a child frame node", () => {
      expect(padre.child).toEqual(childFrameNode);
    });

    it("should expose an array of defined method names", () => {
      expect(padre.methods).toEqual(["myMethod", "myOtherMethod"]);
    });

    it("should expose the collection of 3rd party scripts", () => {
      expect(padre.scripts).toEqual([
        '<script src="https://moat.com/script.js"></script>',
      ]);
    });

    it("should expose the collection of 3rd party scripts", () => {
      expect(padre.scripts).toEqual([
        '<script src="https://moat.com/script.js"></script>',
      ]);
    });

    it("should expose the defined array of listeners", () => {
      expect(padre.listeners).toEqual(["eventName1", "eventName2"]);
    });

    it("should expose the creative source as a URL object", () => {
      expect(padre.creativeUrl).toEqual(
        new URL("http://child:1/?_origin=http://parent:2")
      );
    });

    it("should register a listener for message events", () => {
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.addEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("should create event subscribers for defined methods", () => {
      expect(onEventSpy).toHaveBeenCalledTimes(2);
      expect((onEventSpy as jest.Mock).mock.calls).toEqual([
        ["myMethod", expect.any(Function)],
        ["myOtherMethod", expect.any(Function)],
      ]);
    });

    it("should define a placement", () => {
      expect(padre.placement).toEqual("myParentPlacement");
    });

    it("should throw an error if the placement name is not defined", () => {
      jest.clearAllMocks();
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src = "http://child:1/?_origin=http://parent:2";
      const options: ParentFrameOptions = {
        childFrameNode,
        methods: {
          ready() {
            jest.fn();
          },
        },
      };

      expect(() => {
        new ParentFrame(options);
      }).toThrow(ERROR_MESSAGES.CANT_VALIDATE_PLACEMENT);
    });

    it("should throw a warning when registering with a reserved name method", () => {
      jest.clearAllMocks();
      jest.spyOn(window, "addEventListener");
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
      const options: ParentFrameOptions = {
        childFrameNode,
        methods: {
          ready() {
            jest.fn();
          },
        },
      };
      padre = new ParentFrame(options);

      expect(onEventSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        ERROR_MESSAGES.CANT_USE_READY_COMMAND
      );
    });
  });

  describe("receiveEvent method", () => {
    let event: MessageEvent;
    let parseMessageMock: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let emitEventSpy: jest.SpyInstance;

    beforeAll(() => {
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";

      parseMessageMock = jest.spyOn(ParentFrame.prototype, "parseMessage");
      parseMessageMock.mockImplementation(() => Promise.resolve());
      consoleErrorSpy = jest.spyOn(console, "error");
      consoleErrorSpy.mockImplementation(() => {});
      emitEventSpy = jest.spyOn(Events.prototype, "emit");
      event = new MessageEvent("message");
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should not process events not coming from the child", () => {
      global.dispatchEvent(event);

      expect(parseMessageMock).not.toHaveBeenCalled();
    });

    it("should try to parse the message", () => {
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://child:1");
      global.dispatchEvent(event);

      expect(parseMessageMock).toHaveBeenCalled();
    });

    it("should log parsing errors", () => {
      parseMessageMock.mockImplementationOnce(() => {
        throw new Error("Parsing error");
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://child:1");
      global.dispatchEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error processing event:",
        new Error("Parsing error")
      );
    });

    it("should not emit an internal event if the events come from a different frame/placement", () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: "myCommand",
        placement: "otherPlacement",
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://child:1");
      global.dispatchEvent(event);

      expect(emitEventSpy).not.toHaveBeenCalled();
    });

    it("should emit an internal event", () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: "myCommand",
        placement: "myParentPlacement",
      });
      jest.spyOn(event, "origin", "get").mockReturnValueOnce("http://child:1");
      global.dispatchEvent(event);

      expect(emitEventSpy).toHaveBeenCalledWith("myCommand", {});
    });
  });

  describe("parseMessage method", () => {
    let padre: InstanceType<typeof ParentFrame>;
    let event: MessageEvent;

    beforeAll(() => {
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
      const options: ParentFrameOptions = {
        childFrameNode,
      };
      padre = new ParentFrame(options);
      event = new MessageEvent("message");
      jest.spyOn(event, "data", "get").mockReturnValue({
        command: "ready",
        payload: {},
        placement: "myPlacement",
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if command or placement is not defined", () => {
      jest.spyOn(event, "data", "get").mockReturnValue({
        command: "",
        payload: {},
        placement: "",
      });

      expect(() => {
        (padre as any).parseMessage(event);
      }).toThrow(ERROR_MESSAGES.INVALID_MESSAGE_FORMAT);
    });

    it("should parse the message", () => {
      jest.spyOn(event, "data", "get").mockReturnValue({
        command: "ready",
        payload: {},
        placement: "myPlacement",
      });
      const { payload, command, placement } = padre.parseMessage(event);

      expect(command).toEqual("ready");
      expect(payload).toEqual({});
      expect(placement).toEqual("myPlacement");
    });
  });

  describe("buildEventPayload method", () => {
    let padre: InstanceType<typeof ParentFrame>;

    beforeAll(() => {
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
      const options: ParentFrameOptions = {
        childFrameNode,
        methods: {
          myMethod() {},
          myOtherMethod() {},
        },
        listeners: ["myListener"],
        scripts: ['<script src="https://moat.com/script.js"></script>'],
      };
      padre = new ParentFrame(options);
    });

    describe("Regular events", () => {
      it("should return a FrameEvent", () => {
        const eP = padre.buildEventPayload("commandName", {
          key: "value",
        });

        expect(eP).toEqual({
          availableListeners: null,
          availableMethods: null,
          command: "commandName",
          payload: {
            key: "value",
          },
          placement: "myParentPlacement",
          scripts: ['<script src="https://moat.com/script.js"></script>'],
        });
      });
    });

    describe("Initial event", () => {
      it("should return an InitialFrameEvent", () => {
        const eP = padre.buildEventPayload("ready", {
          key: "value",
        });

        expect(eP).toEqual({
          command: "ready",
          payload: {
            key: "value",
          },
          availableMethods: ["myMethod", "myOtherMethod"],
          availableListeners: ["myListener"],
          scripts: ['<script src="https://moat.com/script.js"></script>'],
          placement: "myParentPlacement",
        });
      });
    });
  });

  describe("send method", () => {
    let padre: InstanceType<typeof ParentFrame>;
    let buildEventPayloadMock: jest.SpyInstance;
    let postMessageMock: jest.Mock;
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
      const options: ParentFrameOptions = {
        childFrameNode,
        listeners: ["myListener"],
      };

      buildEventPayloadMock = jest.spyOn(
        ParentFrame.prototype,
        "buildEventPayload"
      );
      buildEventPayloadMock.mockReturnValue({
        command: "myListener",
        payload: {},
      });
      consoleErrorSpy = jest.spyOn(console, "error");
      consoleErrorSpy.mockImplementation(() => {});
      postMessageMock = jest.fn();
      jest.spyOn(console, "error");

      padre = new ParentFrame(options);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should throw if the event you are firing was not previously defined", () => {
      expect(() => {
        padre.send("unknown", {});
      }).toThrow(ERROR_MESSAGES.NOT_DEFINED_EVENT_NAME);
    });

    it("should return if no content window is defined", () => {
      padre.send("ready", {});
      Object.defineProperty(padre, "child", {
        value: null,
      });

      expect(buildEventPayloadMock).not.toHaveBeenCalled();
    });

    it("should return if no child creative origin is defined", () => {
      Object.defineProperty(padre, "child", {
        value: {
          contentWindow: {
            postMessage: postMessageMock,
          },
        },
      });
      Object.defineProperty(padre, "creativeUrl", {
        value: { origin: null },
      });
      padre.send("ready", {});

      expect(buildEventPayloadMock).not.toHaveBeenCalled();
    });

    it("should post a message to the child window", () => {
      Object.defineProperty(padre, "creativeUrl", {
        value: { origin: "childhost" },
      });
      padre.send("ready", {
        key: "value",
      });

      expect(buildEventPayloadMock).toHaveBeenCalledTimes(1);
      expect(postMessageMock).toHaveBeenCalledTimes(1);
      expect(postMessageMock).toHaveBeenCalledWith(
        {
          command: "myListener",
          payload: {},
        },
        "childhost"
      );
    });

    it("should log sending errors", () => {
      buildEventPayloadMock.mockImplementationOnce(() => {
        throw new Error("Parsing error");
      });
      padre.send("ready", {
        key: "value",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error sending message:",
        new Error("Parsing error")
      );
    });
  });

  describe("destroy method", () => {
    let padre: InstanceType<typeof ParentFrame>;
    let removeEventListenerSpy: jest.SpyInstance;
    let eventMock: { off: jest.Mock };

    beforeAll(() => {
      const childFrameNode = document.createElement("iframe");
      childFrameNode.src =
        "http://child:1/?_origin=http://parent:2&_placement=myParentPlacement";
      const options: ParentFrameOptions = {
        childFrameNode,
        methods: {
          myMethod() {
            jest.fn();
          },
        },
      };
      padre = new ParentFrame(options);
      removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      Object.defineProperty(padre, "events", {
        writable: true,
        value: [],
      });
      eventMock = { off: jest.fn() };

      padre.events.push(eventMock);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should remove the message event listener", () => {
      padre.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("should call off on all registered events", () => {
      padre.destroy();

      expect(eventMock.off).toHaveBeenCalledTimes(1);
    });
  });
});
