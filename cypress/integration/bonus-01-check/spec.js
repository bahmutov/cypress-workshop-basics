/// <reference types="cypress" />

beforeEach(() => {
  cy.request('POST', '/reset', {
    todos: []
  })
})

describe('REST API', () => {
  it('completes the item', () => {
    const todo = {
      title: 'first item',
      completed: false,
      id: '101'
    }
    cy.request('POST', '/todos', todo)
    cy.request('GET', '/todos/101').its('body').should('deep.equal', todo)
    cy.request('GET', '/todos').its('body').should('deep.equal', [todo])
    cy.request('PATCH', '/todos/101', { completed: true })
    cy.request('GET', '/todos/101')
      .its('body')
      .should('deep.equal', {
        ...todo,
        completed: true
      })
    cy.request('PATCH', '/todos/101', { completed: false })
    cy.request('GET', '/todos/101').its('body').should('deep.equal', todo)
  })
})

describe('Web app', () => {
  it('completes the item', () => {
    const todo = {
      title: 'first item',
      completed: false,
      id: '101'
    }
    cy.request('POST', '/todos', todo)
    cy.visit('/')
    cy.intercept('PATCH', '/todos/101').as('patchTodo')
    cy.get('.todo')
      .should('have.length', 1)
      .first()
      .should('not.have.class', 'completed')
      .find('.toggle')
      .click()
    cy.get('.todo').first().should('have.class', 'completed')
    cy.window()
      .its('app.$store.state.todos.0')
      .should('deep.equal', {
        ...todo,
        completed: true
      })
    cy.wait('@patchTodo')
  })
})
