# Frontend

This project is a classical Angular CLI project.
We chose to use Yarn to handle the dependencies rather than NPM, and to use the `rb-` prefix
(for **R**are **B**asket)  for components and directives rather than the default `app-` prefix.

Here are the customizations that have been made.

## Development server

`ng serve` acts as a reverse proxy (see `proxy.conf.json`) to the backend Spring Boot server
running on port 8080, for all the paths starting with `/api`.

## Code formatting

The code must be formatted using [Prettier](https://prettier.io/). The gradle on the CI will fail
if the code is not properly formatted. 

You can format everything at once using `yarn format`.

You can check if the code is properly formatted using `yarn format:check`.

## Unit tests

`ng test` lauches a Chrome headless browser instead of an actual Chrome browser. 

You can still debug a test by launching the browser by yourself and going to `http://localhost:9876`.

## End-to-end tests

The support for end-to-end tests using Protractor has been removed. If we end up writing end-to-end
tests, using [Cypress](https://www.cypress.io/) (installed using the [Cypress schematic](https://github.com/briebug/cypress-schematic))
would be a better option.

# Compiling and Linting

The TypeScript and Angular compiler options, as well as the TSLint rules, have been customized to be stricter.
See `tsconfig.json` and `tslint.json`.

# Gradle build

Even though you can use the classical `ng` and `yarn` commands during development,
the "official" way of building the project, including this frontend, is to use Gradle.
The standard Gradle lifecycle tasks (assemble, test, check, build) are available.

Running the build using Gradle will automatically download NodeJS and Yarn, install
the dependencies and run the various tasks by delegating to the Yarn and CLI tasks.
