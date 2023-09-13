export const environment = {
  production: false,
  keycloakUrl: 'http://localhost:8080', // we can't change this port on CI for e2e tests
  realmPath: '/auth/realms/rare-basket',
  usersRealmPath: '/auth/admin/master/console/#/realms/rare-basket/users',
  gdprDetailsUrl: 'https://urgi.versailles.inrae.fr/rare/legal#personal-data'
};
