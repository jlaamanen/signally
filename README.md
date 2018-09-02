# Signally

Send messages to your Node process on the run with Signally! ⚡️

[![Published on npm](https://img.shields.io/npm/v/signally.svg)](https://www.npmjs.com/package/signally)

## Why?

Node doesn't offer a nice and simple way to send events or messages to running Node processes out-of-the-box.

## How?

1. Install Signally
    ```sh
    npm install signally
    ```
2. Add an event listener to your app
    ```ts
    import { addListener } from "signally";

    addListener("hello", message => {
      console.log("Received message:", message);
    });
    ```
3. Run your app
4. Send an event with Signally CLI command
    ```sh
    npx signally hello world
    ```
    ```sh
    # Node process output:
    Received message: world
    ```

## Under the hood

Signally uses a simple file watching message queue to watch for new events. Each new event from Signally CLI will be added as a new file in buffer directory. Whenever a new file appears in the directory while an app with registered listeners is running, it will be read and parsed by the file watcher. All the listeners attached to the event are handled, and after this, the file is removed.

## API

### addListener

```ts
addListener(event: string, callback: (...messages: string[]) => void)
```

Adds a listener for given event name. When an event with given name is received, the callback is invoked with the messages as arguments.

Example:
```ts
// event with one message
addListener("some-event", message => {
  console.log("Received a message:", message);
});

// event with two messages
addListener("another-event", (first, second) => {
  console.log("Received two messages:", first, second);
});

// handle all sent messages
addListener("exhaustive-event", (...messages) => {
  console.log("Received messages:", messages);
});
```

### send

```ts
send(event: string, ...messages: string[])
```

Send an event by adding a new file in the buffer directory.

Used by the CLI command, but can also be imported and invoked programmatically.

## CLI

You can use the Signally CLI via:
* npm scripts in `package.json`
* `npx signally [arguments]`

Signally CLI takes one or more arguments:
```sh
signally <event> [<message1> <message2> ...]
```
* **event** (required)
  * type: string
  * describes the event name
* **messages**
  * each of type string
  * the actual payload of the event

## Tips & tricks

* Signally has a module specific buffer directory, so installing it globally won't work
* Remember to wrap messages in quotation marks when needed (depending on your terminal)
* To allow Signally to clean up properly, call `process.exit()` on signals like `SIGINT` (Ctrl + C)
  * Signally contains a handler for the `exit` event for clearing up and removing its buffer directory
