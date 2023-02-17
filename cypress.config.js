const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 600,
  viewportHeight: 800,
  experimentalStudio: true,
  experimentalInteractiveRunEvents: false,
  projectId: '89mmxs',
  e2e: {
    experimentalRunAllSpecs: true,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: ['cypress/e2e/*/spec.js', 'cypress/e2e/*/demo.js'],
    baseUrl: 'http://localhost:3000'
  }
})
