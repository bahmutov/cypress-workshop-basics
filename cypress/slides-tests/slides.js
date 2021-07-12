/// <reference types="cypress" />
describe('Workshop slides', () => {
  it('loads', () => {
    cy.visit('/')
    const title = 'Cypress Workshop: Basics'
    cy.title().should('equal', title)
    cy.contains('h1', title).should('be.visible')

    cy.log('**speaker slide**')
    cy.get('[aria-label="below slide"]').should('be.visible').click()
    cy.contains('h2', 'Gleb Bahmutov').should('be.visible')
    cy.hash().should('equal', '#/1/2')

    cy.get('.progress').should('be.visible')
  })
})
