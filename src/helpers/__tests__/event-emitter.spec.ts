import Events from '../event-emitter';

describe('Event Emitter helper', () => {
  const eventEmitter = new Events();
  const callback1 = jest.fn();
  const event1 = eventEmitter.on('event1', callback1);
  const callback2 = jest.fn();
  const event2 = eventEmitter.on('event2', callback2);

  it('should fire callback methods for all registered events', () => {
    eventEmitter.emit('event1', { payload: '' });
    eventEmitter.emit('event2', { payload: '' });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith({ payload: '' });
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith({ payload: '' });
  });

  it('should allow to unsubscribe from events', () => {
    event1.off();
    event2.off();
    eventEmitter.emit('event1', { payload: '' });
    eventEmitter.emit('event2', { payload: '' });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
