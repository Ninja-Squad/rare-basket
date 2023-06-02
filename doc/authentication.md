# Authentication

The authentication is handled by [Keycloak](https://www.keycloak.org/documentation), using 
[OpenID/Connect](https://openid.net/connect/).

The flow is the following one:

1. The user logs in on the frontend (by clicking the login button, or by trying to access a route that requires authentication)
2. The user is redirected to the Keycloak login page for the `rare-basket` realm
3. The user logs in by entering the user name and password
4. Keycloak sends the user back to the rare-basket frontend, with query parameters in the URL
5. The frontend uses these query parameters to extract the information needed to get an access token
6. The frontend, using AJAX, requests the access token, to the Keycloak server
7. The authentication is now done, and the token is stored in local storage. 
   An Angular http interceptor sends the token inside the `Authorization` header in every HTTP request sent to the backend
8. The backend extracts and verifies the token from the `Authorization` header, in order to know who sent the request.
   If the request is not authenticated and needs to be, a 401 error response is sent back.
   
## Libraries being used

### Frontend

The frontend uses the library [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client).
See its README and [its API documentation](https://github.com/damienbod/angular-auth-oidc-client/blob/master/API_DOCUMENTATION.md)
for more details.

Here are the configuration choices that have been made:

 - the access token is silently refreshed, using a refresh token;
 - the application code handles the authentication result by itself, 
   in order to be able to route to the requested URL after the authentication succeeds;
 - the information is stored in local storage rather than session storage in order to be 
   able to open links in new tabs
   
### Backend

The backend uses the standard Spring-Security [oauth2-resource-server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html). 

### Keycloak configuration

For the authentication to work as expected, the following must be done on the Keycloak server:

 - create a realm named `rare-basket`;
 - create a client in this realm, with the client ID `rare-basket`, using the `openid-connect` protocol 
 - configure this client to have, in the "Valid Redirect URIs" field, the root public-facing URL(s) of the application.
   In development, these URLs are `http://localhost:4201/rare-basket/` and `http://localhost:8081/rare-basket/`
 - configure this client to have, in its "Web Origins" field, the value `+` (which means that the
   Valid Redirect URIs are used as web origins). Of course, the actual public facing URL of the 
   rare-basket server can also be used instead. This is necessary because the frontend sends AJAX request
   to the Keycloak server, and CORS must thus be enabled for requests coming from the frontend.
 - add the necessary users, with their password.
 
Note that, during development, all this is done automatically by `docker-compose`, which starts
a Keycloak server exposed on port 8082, and imports the necessary configuration.
At the time of this writing, this imported configuration contains 4 users named `admin`, `contact11`, `contact12` and `contact21`, 
all having the password `password`. The `admin` user is allowed to manage users. The other three 
are accession holder users, allowed to manage orders.

The admin user for the Keycloak server is `admin`, identified by the password `admin`.
The Keycloak console is available at http://localhost:8082/auth/.

The standard Angular environment mechanism is used to specify the URL of the Keycloak server,
so the `environment.prod.ts` configuration file should be modified to contain the actual, public-facing
URL of the Keycloak server.

Also note that, in order to be secure, both rare-basket and the Keycloak server should only be
exposed over HTTPS.
