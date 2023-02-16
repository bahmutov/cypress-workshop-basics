const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 600,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {},
    specPattern: 'cypress/ci-tests/*-spec.js',
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    }
  },
  projectId: '89mmxs'
})
