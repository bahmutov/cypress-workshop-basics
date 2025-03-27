/// <reference types="cypress" />

import 'cypress-rest-easy'

describe('TodoMVC', { baseUrl: null, rest: { todos: [] } }, () => {
  it.only('adds items', function () {
    const todos = Cypress.env('todos')
    cy.visit('todomvc/index.html')
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.get('.todo-list li') // command
      .should('have.length', 4) // assertion
    cy.log('**complete items**')
    cy.contains('[data-cy="remaining-count"]', '4')
    cy.contains('.todo', 'todo B').find('.toggle').click()
    cy.contains('[data-cy="remaining-count"]', '3').then(() => {
      expect(todos, '4 items').to.have.length(4)
      console.table(todos)
    })
  })

  it.only('starts with zero items', () => {
    cy.visit('todomvc/index.html')
    cy.get('.loaded')
    cy.get('li.todo').should('have.length', 0)
  })
})
