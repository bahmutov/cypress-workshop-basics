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

it('can add many items', () => {
  // assumes there are no items at the beginning

  const N = 5
  for (let k = 0; k < N; k += 1) {
    addItem(`item ${k}`)
  }
  // check number of items
  cy.get('li.todo').should('have.length', 5)
})
