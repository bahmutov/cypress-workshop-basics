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
