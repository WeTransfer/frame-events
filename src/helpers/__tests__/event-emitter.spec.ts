import Events from '../event-emitter';

describe('Event Emitter helper', () => {
  let eventEmitter: Events;
  let callback1: jest.Mock;
  let callback2: jest.Mock;
  let event1: { off: () => void };
  let event2: { off: () => void };

  beforeEach(() => {
    eventEmitter = new Events();
    callback1 = jest.fn();
    callback2 = jest.fn();
    event1 = eventEmitter.on('event1', callback1);
    event2 = eventEmitter.on('event2', callback2);
  });

  afterEach(() => {
    // Clean up subscribers after each test
    event1.off();
    event2.off();
  });
  it('should fire callback methods for all registered events', () => {
    eventEmitter.emit('event1', { payload: '' });
    eventEmitter.emit('event2', { payload: '' });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith({ payload: '' });
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith({ payload: '' });
  });

  it('should handle emitting events with no subscribers', () => {
    // Mock the case where there are no subscribers for an event
    eventEmitter.emit('event3', { payload: '' });

    // No callbacks should be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
