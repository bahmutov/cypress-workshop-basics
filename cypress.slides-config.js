const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 600,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3100',
    specPattern: 'cypress/slides-tests/*.js',
    supportFile: false,
    fixturesFolder: false
  }
})
