export default {
  port: process.env.PORT || 4003,
  graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4002/graphql',

  // API keys configuration - external access only
  apiKeys: {
    'external-police-api-key': {
      name: 'External Police API Client',
      role: 'police'
    },
    'external-registrar-api-key': {
      name: 'External Registrar API Client',
      role: 'registrar'
    }
  }
};