import { addListener } from "signally";

let helloMessage = "Hello";
let worldMessage = "World!";

addListener("hello", newMessage => {
  helloMessage = newMessage;
});

addListener("world", (message, punctuation = "!") => {
  worldMessage = message + punctuation;
});

setInterval(() => {
  console.log([helloMessage, worldMessage].join(" "));
}, 1000);

process.on("SIGINT", () => {
  // Emit "exit" on Ctrl+C to allow Signally to clean up
  process.exit();
});
