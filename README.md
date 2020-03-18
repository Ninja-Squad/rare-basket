# Rare Basket

This project is built with Gradle, and is composed of two sub-projects:

1. backend: the Backend, implemented using Java 8 and Spring Boot. 
   See [the backend README](backend/README.md) for details.
2. frontend: the frontend, implemented using Angular.
   See [the frontend README](frontend/README.md) for details.
   
## Prerequisites

- A [Java 8 SDK](https://adoptopenjdk.net/)
- [Docker](https://www.docker.com/) to easily setup a database and an SMTP server

## Building

Once you have the database set up as explained in the backend README, you can use the standard
Gradle tasks. You can also of course import the project in your IDE: they all have Gradle 
support.

Here are the main gradle commands available:

 - `./gradlew assemble`: assembles the executable jar file, containing both the backend and the frontend.
   The created jar is located in `backend/build/libs/rare-basket.jar`. 
 - `./gradlew build`: assembles the executable jar file, but also runs all the checks:
   linting, unit tests, etc.
 - `./gradlew tasks`: lists the tasks.

See the backend README and the `build.gradle.kts` files for more details.
