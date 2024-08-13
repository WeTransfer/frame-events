# Working with Frame Events

Frame Events is a communication layer library between the DOM and iframes allowing for secure parent and child 2-way communication using the `window.postMessage` method. The library consists of two classes, `ParentFrame`, to be instantiated in the parent document and `ChildFrame`, to be run in the embedded document.

## Using ParentFrame

```typescript
new ParentFrame(options);
```

### Options

| Name               | Type                |            |
| ------------------ | ------------------- | ---------- |
| childFrameNode     | `HTMLIFrameElement` | `required` |
| methods            | `object`            |            |
| listeners          | `string[]`          |            |
| scripts            | `string[]`          |            |

#### childFrameNode

A childFrameNode is a `HTMLIFrameElement` that is embedding a document with a ChildFrame instance into the parent document. This iframe must be attached to the DOM and ready to receive events.

When building your iframe source you must specify the parent origin in order to establish a secure connection.

```html
<iframe
  src="https://example.com/embedded-document/index.html?_origin=http://parentorigin&_placement=myPlacement"
></iframe>
```

#### methods

This is an object with methods that is passed on to the embedded document to be fired. Methods should have the following named accordingly.
By design methods can only take on a single parameter. These methods can be combined with `send` to fire a feedback event back to the embedded frame once sunccesfully executed.

#### listeners

Listeners is an array of event names that you are opening for subscription in the embedded document.

#### scripts

An array of html script tags that you want to ad to the embedded document head.

### Class methods and properties

#### Read Only Properties

| Name              | Description                       | 
| ----------------- | --------------------------------- | 
| **child**         | A reference to the child frame    |
| **creativeUrl**   | The URL of the creative           | 
| **origin**        | The origin of the parent          | 
| **listeners**     | A list of listeners               | 
| **methods**       | A list of methods                 |
| **scripts**       | A list of scripts                 |
| **placement**     | The name of the placement         |
| **events**        | A list of events                  |
| **eventEmitter**  | An event emitter                  |


#### Public methods

| Name                                                      | Description                                                                       | 
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | 
| **parseMessage(event: MessageEvent)**                     | Takes in an event and returns parsed message with command, payload and placement   |
| **buildEventPayload(command: string, payload: unknown)**  | Builds an event payload in the correct format with Frame Events configuration.    | 
| **send(command: string, event: unknown)**                 | Sends an event between frames using `postMessage`.                                | 
| **destroy()**:                                            | Destroys the instance and turns off listeners for all events.                     | 

## Using ChildFrame

```typescript
new ChildFrame(myCallbackMethod);
```

### Options

| Name     | Type       |            |                                             |
| -------- | ---------- | ---------- | ------------------------------------------- |
| callback | `function` | `required` | Fires when the parent sends the ready event |

#### callback

A function that will execute when the ChildFrame instance gets the ready signal from the parent frame. This function takes as an argument all event names you can listen to and every command you can execute.


### Class methods and properties

#### Read Only Properties

| Name                  | Description                                    | 
| --------------------- | ---------------------------------------------- | 
| **endpoint**          | The endpoint of the parent frame.              |
| **listeners**         | The listeners received from the parent frame.  | 
| **run**               | The run function of the parent frame.          | 
| **parentPlacement**   | The placement of the parent frame.             | 
| **eventEmitter**      | The event emitter                              | 

#### Public methods

| Name                                                  | Description                                                           | 
| ------------------------------------------------------| --------------------------------------------------------------------- | 
| **receiveEvent(event: MessageEvent)**                 | A handler to receive messages from the parent frame and process it.   |
| **parseMessage(event: MessageEvent)**                 | Parses a message received from the parent frame.                      |
| **onParentReady(payload: InitialFrameEvent)**         | Handler when parent sends a `ready` event.                            | 
| **sendCommand(command: string, payload: unknown)**    | Method to send commands to the parent frame.                          | 

## Build

```
  yarn build
```

## Running unit tests

Run `yarn test` to execute the unit tests via [Jest](https://jestjs.io).

## Running unit tests with coverage

Run `yarn test:coverage` to execute the unit tests with coverage via [Jest](https://jestjs.io).
