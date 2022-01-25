/// <reference types="cypress" />

it('shows loading element', () => {
  // delay XHR to "/todos" by a few seconds
  // and respond with an empty list
  cy.intercept(
    {
      method: 'GET',
      pathname: '/todos'
    },
    {
      body: [],
      delayMs: 2000
    }
  ).as('loading')
  cy.visit('/')

  // shows Loading element
  cy.get('.loading').should('be.visible')

  // wait for the network call to complete
  cy.wait('@loading')

  // now the Loading element should go away
  cy.get('.loading').should('not.be.visible')
})
