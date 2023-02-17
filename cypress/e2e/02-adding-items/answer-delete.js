/// <reference types="cypress" />
// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// remember to manually delete all items before running the test
// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

/**
 * Adds a todo item
 * @param {string} text
 */
const addItem = (text) => {
  cy.get('.new-todo').type(`${text}{enter}`)
}

beforeEach(() => {
  cy.visit('localhost:3000')
})

it('can delete an item', () => {
  // adds a few items
  addItem('simple')
  addItem('hard')
  // deletes the first item
  cy.contains('li.todo', 'simple')
    .should('exist')
    .find('.destroy')
    // use force: true because we don't have the hover
    .click({ force: true })

  // confirm the deleted item is gone from the dom
  cy.contains('li.todo', 'simple').should('not.exist')
  // confirm the other item still exists
  cy.contains('li.todo', 'hard').should('exist')
})

it('deletes all items at the start', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  cy.wait(1000)
  // get all todo items (there might not be any!)
  cy.get('li.todo')
    .should(Cypress._.noop)
    // for each todo item click the remove button
    .each(($item) => {
      cy.wrap($item).find('.destroy').click({ force: true })
    })
  // confirm that the item is gone from the dom
  cy.get('li.todo').should('not.exist')
})

it('deletes all items at the start (click multiple elements)', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  cy.wait(1000)
  // get all todo elements and their destroy buttons
  // (there might not be any!)
  // the click on them all at once
  // see https://on.cypress.io/click documentation
  cy.get('li.todo .destroy')
    .should(Cypress._.noop)
    .then(($destroy) => {
      if ($destroy.length) {
        cy.wrap($destroy).click({ force: true, multiple: true })
      }
    })
  // confirm that the item is gone from the dom
  cy.get('li.todo').should('not.exist')
})
