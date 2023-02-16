/// <reference types="cypress" />

describe('waits for network idle', () => {
  // we want to wait for the app to finish all network calls
  // before proceeding with the test commands

  beforeEach(() => {
    // before each test, stub the network call to load zero items
    cy.intercept('GET', '/todos', []).as('todos')
  })

  it('waits for the network to be idle for 2 seconds', () => {
    // keep track of the timestamp of the network call
    // intercept all calls (or maybe a specific pattern)
    // and in the callback save the current timestamp
    let lastNetworkAt
    cy.intercept('*', () => {
      lastNetworkAt = +new Date()
    })
    // load the page, but delay loading of the data by some random number
    // using /?delay=<number> query param
    const delayMs = Cypress._.random(100, 1500)
    cy.visit(`/?delay=${delayMs}`).then(() => {
      // start waiting after the cy.visit command finishes

      // wait for network to be idle for 1 second
      // using a .should(cb) assertion that looks at the current timestamp
      // vs the timestamp of the last network call
      // see assertion examples at
      // https://glebbahmutov.com/cypress-examples/commands/assertions.html
      // TIP: cy.wrap('message').should(cb) works really well
      const started = +new Date()
      let finished
      cy.wrap('network idle for 2 sec')
        .should(() => {
          const t = lastNetworkAt || started
          const elapsed = +new Date() - t
          if (elapsed < 2000) {
            throw new Error('Network is busy')
          }
          finished = +new Date()
        })
        .then(() => {
          const waited = finished - started
          cy.log(`finished after ${waited} ms`)
        })
    })
    // by now everything should have been loaded
    // we can check the page and use a very short timeout
    // because the page is ready to be tested
    cy.get('.todo-list li', { timeout: 10 }).should('have.length', 0)
  })
})
