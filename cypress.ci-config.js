const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 600,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {},
    integrationFolder: 'cypress/ci-tests',
    specPattern: 'cypress/ci-tests/*-spec.js',
    projectId: '89mmxs'
  }
})
