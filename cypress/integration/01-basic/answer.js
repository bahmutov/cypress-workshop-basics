/// <reference types="cypress" />
// @ts-check
it('loads', () => {
  // application should be running at port 3000
  // see the documentation for "cy.visit" command
  // in the Cypress docs at https://on.cypress.io/visit
  // TIP: all commands are linked from https://on.cypress.io/api
  cy.visit('localhost:3000')

  // passing assertions
  // https://on.cypress.io/get
  cy.get('.new-todo').get('footer')

  // https://on.cypress.io/contains
  // use ("selector", "text") arguments to "cy.contains"
  cy.contains('h1', 'todos')

  // or can use regular expression
  cy.contains('h1', /^todos$/)

  // also good practice is to use data attributes specifically for testing
  // see https://on.cypress.io/best-practices#Selecting-Elements
  // which play well with "Selector Playground" tool
  cy.contains('[data-cy=app-title]', 'todos')
})
