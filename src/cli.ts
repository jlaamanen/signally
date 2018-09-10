#!/usr/bin/env node
import { send } from "./sender";

const [, , eventName, ...messages] = process.argv;
send(eventName, ...messages);
