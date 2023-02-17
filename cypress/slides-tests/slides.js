/// <reference types="cypress" />
/// <reference types="cypress-real-events" />

import 'cypress-real-events/support'

// https://j1000.github.io/blog/2022/10/27/enhanced_cypress_logging.html
Cypress.Commands.add('endGroup', () => {
  collapseLastGroup()
  Cypress.log({ groupEnd: true, emitOnly: true })
})

function collapseLastGroup() {
  const openExpanders = window.top.document.getElementsByClassName(
    'command-expander-is-open'
  )
  const numExpanders = openExpanders.length
  const el = openExpanders[numExpanders - 1]

  if (el) {
    el.parentElement.click()
  }
}

Cypress.Commands.add('checkSlide', (column, row) => {
  Cypress.log({
    name: 'checkSlide',
    message: `${column}, ${row}`,
    groupStart: true
  })
  if (row > 1) {
    cy.location('hash').should('equal', `#/${column}/${row}`)
  }
  cy.contains('.slide-number-a', String(column)).should('be.visible')
  cy.contains('.slide-number-b', String(row)).should('be.visible')
  return cy.endGroup()
})

describe('Workshop slides', () => {
  const checkSlide = (column, row) => {
    Cypress.log({
      name: 'checkSlide',
      message: `${column}, ${row}`,
      groupStart: true
    })
    cy.contains('.slide-number-a', String(column)).should('be.visible')
    cy.contains('.slide-number-b', String(row)).should('be.visible')
    return cy.endGroup()
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

    cy.checkSlide(1, 1)
    cy.get('.navigate-down')
      .should('have.class', 'enabled')
      .and('be.visible')
      .wait(1000, noLog)

    // focus on the app
    cy.get('h1').realClick().realPress('ArrowDown').wait(500, noLog)
    cy.checkSlide(1, 2)
    cy.get('h1').realClick().realPress('ArrowDown').wait(500, noLog)
    cy.checkSlide(1, 3)

    cy.log('**no more slides down**')
    cy.get('.navigate-down').should('not.be.visible').wait(1000, noLog)
    cy.log('**go back up**')
    cy.realPress('ArrowUp')
    cy.checkSlide(1, 2).wait(1000, noLog)

    cy.log('**go to the next slide column**')
    cy.realPress('ArrowRight')
    cy.checkSlide(2, 1).wait(1000, noLog)
  })
})
