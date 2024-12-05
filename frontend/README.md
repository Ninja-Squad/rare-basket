# Frontend

This project is a classical Angular CLI project.
We chose to use Pnpm to handle the dependencies rather than NPM, and to use the `rb-` prefix
(for **R**are **B**asket)  for components and directives rather than the default `app-` prefix.

Here are the customizations that have been made.

## Development server

`ng serve` runs on port 4201 instead of the classical 4200, in order to easily be able to run the RARe frontend
(on port 4200) and the rare-basket frontend (on port 4201) on the same machine.

It acts as a reverse proxy (see `proxy.conf.json`) to the backend Spring Boot server
running on port 8081, for all the paths starting with `/api`.

## Code formatting

The code must be formatted using [Prettier](https://prettier.io/). The gradle on the CI will fail
if the code is not properly formatted. 

You can format everything at once using `pnpm format`.

You can check if the code is properly formatted using `pnpm format:check`.

## Unit tests

`ng test` launches a Chrome headless browser instead of an actual Chrome browser. 

You can still debug a test by launching the browser by yourself and going to `http://localhost:9876`.

## End-to-end tests

`pnpm e2e` runs the end-to-end tests.
Playwright is used, using its own server.
See `playwright.config.ts` for more options.

# Compiling and Linting

The TypeScript and Angular compiler options, as well as the TSLint rules, have been customized to be stricter.
See `tsconfig.json` and `tslint.json`.

# Gradle build

Even though you can use the classical `ng` and `pnpm` commands during development,
the "official" way of building the project, including this frontend, is to use Gradle.
The standard Gradle lifecycle tasks (assemble, test, check, build) are available.

Running the build using Gradle will automatically download NodeJS and Pnpm, install
the dependencies and run the various tasks by delegating to the Pnpm and CLI tasks.
