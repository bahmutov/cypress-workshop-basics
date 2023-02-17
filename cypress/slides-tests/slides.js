/// <reference types="cypress" />
/// <reference types="cypress-real-events" />

import 'cypress-real-events/support'

describe('Workshop slides', () => {
  const checkSlide = (column, row) => {
    cy.contains('.slide-number-a', String(column)).should('be.visible')
    cy.contains('.slide-number-b', String(row)).should('be.visible')
    return cy
  }

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

  it('navigates using the keyboard', () => {
    cy.log('**very first column with 3 slides**')
    const noLog = { log: false }
    cy.visit('/')
    cy.get('h1').should('be.visible')

    checkSlide(1, 1)
    cy.get('.navigate-down')
      .should('have.class', 'enabled')
      .and('be.visible')
      .wait(1000, noLog)

    // focus on the app
    cy.get('h1').realClick().realPress('ArrowDown').wait(500, noLog)
    checkSlide(1, 2)
    cy.get('h1').realClick().realPress('ArrowDown').wait(500, noLog)
    checkSlide(1, 3)

    // no more slides down
    cy.get('.navigate-down').should('not.be.visible').wait(1000, noLog)
    // go back up
    cy.realPress('ArrowUp')
    checkSlide(1, 1).wait(1000, noLog)
    // go to the next slide column
    cy.realPress('ArrowRight')
    checkSlide(2, 1).wait(1000, noLog)
  })
})
