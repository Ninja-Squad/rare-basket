# Backend

The backend is implemented in Java 8, using 
[Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/).

It uses [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#reference) for its 
persistence layer, and uses PostgreSQL as its database. 

## Database

The easiest way to have a database running and set up with the expected users and databases is
to use Docker. Running `docker-compose up` from the root directory os the project will start
a container with a PostgreSQL database running, as well as an SMTP server which doesn't send any email
(which is nice for testing).
The PostgreSQL database is configured using the `database/setup.sql` script.

There are actually two databases available: one to actually run the application, and one
used for the unit tests (in order to be able to run the application and unit tests
at the same time, without the tests erasing the data of the application).

## Database schema migrations

[Flyway](https://flywaydb.org/) is used to handle the schema migrations, which are executed automatically
(if not already executed) once the application (or the unit tests) is started.
It's OK to modify migrations during development, **as long as the migrations have not already been
executed in production**. That will cause a conflict, but you can always restart from scratch:

- either by executing `docker-compose down` and then `docker-compose up`, which recreates both databases.
- or by using `./gradlew flywayCleanApp` (to clean the application database) and `./gradlew flywayCleanTest` 
  (to clean the test database)
