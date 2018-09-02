# Signally example

An extremely simple example to demonstrate how Signally works.

## How to run

```sh
npm install
npm start
```

Node process starts to print `Hello World!` every 1 second. Message consists of two parts:

* **hello**: the first word
* **world**: the second word & punctuation

These parts can be modified with `signally` when the process is running:

```sh
# Modify the 'hello' part
signally hello [message]

# Modify the 'world' part
signally world [message] [punctuation]

# Punctuation has a default value '!' in code, so it can be left out
signally world [message]
```

If you don't have Signally installed globally, you can use
* `npx`, or
* npm script `send` (shorthand for running `signally` as defined in `package.json`).

```sh
# npx
npx signally hello [message]

# npm script 'send'
npm run send hello [message]
```

## Docker

This example directory also contains `Dockerfile` and `docker-compose.yml` files. To try the Docker version out, start the container with:

```sh
docker-compose up
```

Execute a Signally command inside the container with e.g.

```sh
docker-compose exec example npx signally hello [message]
```
