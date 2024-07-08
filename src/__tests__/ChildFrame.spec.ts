import ChildFrame from '../ChildFrame';
import Events from '../helpers/event-emitter';
import { loadScriptTags } from '../helpers/load-script-tags';
import { InitialFrameEvent } from '../ParentFrame';

jest.mock('../helpers/event-emitter');
jest.mock('../helpers/load-script-tags');

describe('ChildFrame class', () => {
  describe('construct class', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw an error if no origin is present is the URL', () => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_placement=myParentPlacement',
      } as Location;

      expect(() => {
        new ChildFrame(jest.fn);
      }).toThrowError(
        `Can't validate origin! please add ?_origin=PARENT_HOST to the iframe source`
      );
    });

    it('should throw an error if no placement is present is the URL', () => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_origin=http://parent:1',
      } as Location;

      expect(() => {
        new ChildFrame(jest.fn);
      }).toThrowError(
        `Can't validate placement! please add ?_placement=PLACEMENT_NAME to the iframe source`
      );
    });

    it('should get the parent origin from the URL', () => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_origin=http://parent:1&_placement=myParentPlacement',
      } as Location;
      const marco = new ChildFrame(jest.fn);

      expect(marco.endpoint).toBe('http://parent:1');
    });

    it('should start listening for message events', () => {
      jest.spyOn(window, 'addEventListener');
      new ChildFrame(jest.fn);

      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('should define a parent placement', () => {
      const marco = new ChildFrame(jest.fn);

      expect(marco.parentPlacement).toBe('myParentPlacement');
    });
  });

  describe('receiveEvent method', () => {
    let event: MessageEvent;
    let parseMessageMock: jest.SpyInstance;
    let onParentReadyMock: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let emitEventSpy: jest.SpyInstance;

    beforeAll(() => {
      parseMessageMock = jest.spyOn(ChildFrame.prototype, 'parseMessage');
      parseMessageMock.mockImplementation(() => Promise.resolve());
      onParentReadyMock = jest.spyOn(ChildFrame.prototype, 'onParentReady');
      onParentReadyMock.mockImplementation(() => Promise.resolve());
      consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});
      emitEventSpy = jest.spyOn(Events.prototype, 'emit');

      event = new MessageEvent('message');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should reject events not coming from the parent', () => {
      global.dispatchEvent(event);

      expect(parseMessageMock).not.toHaveBeenCalled();
    });

    it('should try to parse the message', () => {
      jest.spyOn(event, 'origin', 'get').mockReturnValueOnce('http://parent:1');
      global.dispatchEvent(event);

      expect(parseMessageMock).toHaveBeenCalled();
    });

    it('should log parsing errors', () => {
      parseMessageMock.mockImplementationOnce(() => {
        throw new Error('Parsing error');
      });
      jest.spyOn(event, 'origin', 'get').mockReturnValueOnce('http://parent:1');
      global.dispatchEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Parsing error'));
    });

    it('should not emit an internal event if the message comes from a different placement', () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: 'myCommand',
        parentPlacement: 'otherPlacement',
      });

      jest.spyOn(event, 'origin', 'get').mockReturnValueOnce('http://parent:1');
      global.dispatchEvent(event);

      expect(emitEventSpy).not.toBeCalled();
    });

    it('should emit an internal event', () => {
      parseMessageMock.mockReturnValueOnce({
        payload: {},
        command: 'myCommand',
        parentPlacement: 'myParentPlacement',
      });
      jest.spyOn(event, 'origin', 'get').mockReturnValueOnce('http://parent:1');
      global.dispatchEvent(event);

      expect(emitEventSpy).toHaveBeenCalledWith('myCommand', {});
    });

    it('should fire the onParentReady callback if the event is the default ready event', () => {
      parseMessageMock.mockReturnValueOnce({
        command: 'ready',
        parentPlacement: 'myParentPlacement',
      });
      jest.spyOn(event, 'origin', 'get').mockReturnValueOnce('http://parent:1');
      jest.spyOn(event, 'data', 'get').mockReturnValueOnce('event:data');
      global.dispatchEvent(event);

      expect(onParentReadyMock).toBeCalledWith('event:data');
    });
  });

  describe('parseMessage method', () => {
    let marco: InstanceType<typeof ChildFrame>;
    let event: MessageEvent;

    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_origin=http://parent:1&_placement=myParentPlacement',
      } as Location;
      marco = new ChildFrame(jest.fn);
      event = new MessageEvent('message');
      jest.spyOn(event, 'data', 'get').mockReturnValue({
        command: 'ready',
        payload: {},
        placement: 'myParentPlacement',
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should parse the message', async () => {
      const { payload, command, parentPlacement } = marco.parseMessage(event);

      expect(command).toEqual('ready');
      expect(payload).toEqual({});
      expect(parentPlacement).toEqual('myParentPlacement');
    });
  });

  describe('onParentReady method', () => {
    let marco: InstanceType<typeof ChildFrame>;
    const callbackMock = jest.fn();
    let payload: InitialFrameEvent;

    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_origin=http://parent:1&_placement=myParentPlacement',
      } as Location;
      marco = new ChildFrame(callbackMock);
      payload = {
        availableMethods: ['method1', 'method2'],
        availableListeners: ['myListener'],
        command: '',
        payload: {},
        placement: 'myParentPlacement',
        scripts: ['<script src="https://moat.com/script.js"></script>'],
      } as unknown as InitialFrameEvent;

      marco.onParentReady(payload);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should add available event listeners', () => {
      expect(marco.listeners['myListener']).toBeDefined();
    });

    it('should register available methods', () => {
      expect(marco.run['method1']).toBeDefined();
      expect(marco.run['method2']).toBeDefined();
    });

    it('should fire the init callback', () => {
      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(callbackMock).toHaveBeenCalledWith(payload);
    });

    it('should pass the scripts to the helper method', () => {
      expect(loadScriptTags).toHaveBeenCalledTimes(1);
      expect(loadScriptTags).toHaveBeenCalledWith(payload.scripts);
    });
  });

  describe('sendCommand method', () => {
    let marco: InstanceType<typeof ChildFrame>;
    const callbackMock = jest.fn();

    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      window.location = {
        search: '?_origin=http://parent:1&_placement=myParentPlacement',
      } as Location;
      window.parent.postMessage = jest.fn();
      marco = new ChildFrame(callbackMock);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should post a message', () => {
      marco.sendCommand('myCommand', {});

      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
      expect(window.parent.postMessage).toHaveBeenCalledWith(
        {
          command: 'myCommand',
          payload: {},
          placement: 'myParentPlacement',
        },
        'http://parent:1'
      );
    });
  });
});
