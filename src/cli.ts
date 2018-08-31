#!/usr/bin/env node
import { send } from "./sender";

const [, , event, ...messages] = process.argv;
send(event, ...messages);
