# 🔗 Frame Events ![Coverage](https://github.com/WeTransfer/frame-events/wiki/coverage.svg)[![Publish](https://github.com/WeTransfer/frame-events/actions/workflows/pusblish.yml/badge.svg)](https://github.com/WeTransfer/frame-events/actions/workflows/publish.yml)

Frame Events is a library for establishing secure parent and child 2-way communication when working with iframes and the `window.postMessage` method.

## How it works

The library consists of two classes, `ParentFrame`, to be instantiated in the parent document and `ChildFrame`, to be run in the embedded document. They both make use of the `Window.postMessage()` method and the `onmessage` event handler.

[Receiver and emitter diagram](./docs/event_flow.drawio)

When a ParentFrame instance defines an interface it sends a ready event to the ChildFrame instance in the embedded document. When the ChildFrame instance receives the ready event it runs the subscriber callback.

[Subscriber callback diagram](./docs/subscriber_callback.drawio)

## Using ParentFrame

```typescript
new ParentFrame(options);
```

### Options

| Name      | Type                |            |
| --------- | ------------------- | ---------- |
| child     | `HTMLIFrameElement` | `required` |
| methods   | `object`            |            |
| listeners | `string[]`          |            |
| scripts   | `string[]`          |            |

#### child

A child is a `HTMLIFrameElement` that is embedding a document with a ChildFrame instance into the parent document. This iframe must be attached to the DOM and ready to receive events.

When building your iframe source you must specify the parent origin in order to establish a secure connection.

```html
<iframe
  src="https://example.com/embedded-document/index.html?_origin=http://parentorigin&_placement=myPlacement"
></iframe>
```

#### methods

This is an object with methods that can be fired by the embedded document. When defining method make sure you:

- Don't use any reserved words like `ready`.
- Add descriptive meaningful function names, they will later be exposed.
- By design, the methods provided can only take one parameter.

#### listeners

Listeners is an array of event names that you are opening for subscription in the embedded document.

#### scripts

An array of html script tags that you want to ad to the embedded document head.

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

## Example

In the main document:

```typescript
const state = {
  counter: 0,
};
const myAPI = new ParentFrame({
  child: document.querySelector("iframe"),
  methods: {
    updateCounter: function () {
      state.counter = state.counter++;
      this.send("counterUpdated", {
        counter: state.counter,
      });
    },
  },
  listeners: ["counterUpdated"],
  scripts: ['<script src=""></script>', '<script src=""></script>'],
});
```

Remember to pass the parent origin and the placement as query parameters: `_origin=PARENT_HOST&_placement=PLACEMENT_NAME`:

```html
<iframe
  src="http://childorigin/embedded.html?_origin=http://parentorigin&_placement=myPlacement"
></iframe>
```

In the embedded document:

```typescript
const myChildAPI = new ChildFrame(function (data) {
  // Communication was succesfully established
  const { listeners, methods } = data;

  // Listen for events
  myChildAPI.listeners.counterUpdated((event) => {});

  // Fire commands
  document.querySelector("button").addEventListener("click", function () {
    myChildAPI.run.updateCounter();
  });
});
```

## Known Issues

- IntelliSense won't work due to how we add the methods to the namespace.

## Build

```
  yarn build
```

## Running unit tests

Run `yarn test` to execute the unit tests via [Jest](https://jestjs.io).

## Running unit tests with coverage

Run `yarn test:coverage` to execute the unit tests with coverage via [Jest](https://jestjs.io).
