/// <reference types="cypress" />

// beforeEach(() => {
//   cy.request('POST', '/reset', { todos: [] })
// })

it('completes an item using API', () => {
  cy.request('POST', '/reset', { todos: [] })
  cy.request('GET', '/todos').its('body').should('deep.equal', [])
  cy.request('POST', '/todos', { title: 'first', completed: false })
    .its('body')
    .should('deep.include', { title: 'first', completed: false })
    .its('id')
    .then(cy.log)
    .then((id) => {
      cy.request('PATCH', `/todos/${id}`, { completed: true })
        .its('status')
        .should('eq', 200)
      cy.request('GET', `/todos/${id}`)
        .its('body')
        .should('deep.equals', { id, title: 'first', completed: true })
    })
})

it('updates the Vuex store', () => {
  cy.request('POST', '/reset', { todos: [] })
  cy.request('POST', '/todos', { title: 'first', completed: false })
  cy.visit('/')

  cy.get('.todo-list li')
    .should('have.length', 1)
    .first()
    .should('not.have.class', 'completed')
    .find('.toggle')
    .should('not.be.checked')
    .click()
  cy.contains('.todo-list li', 'first').should('have.class', 'completed')
  cy.window()
    .its('app.$store.state.todos')
    .should('have.length', 1)
    .its(0)
    .should('have.property', 'completed', true)
})

it('toggles an item', () => {
  cy.request('POST', '/reset', { todos: [] })
  cy.request('POST', '/todos', { title: 'first', completed: false })
  cy.visit('/')

  cy.intercept('PATCH', '/todos/*').as('patch')
  cy.get('.todo-list li')
    .should('have.length', 1)
    .first()
    .should('not.have.class', 'completed')
    .find('.toggle')
    .should('not.be.checked')
    .click()
  cy.wait('@patch')
    .its('request.body')
    .should('deep.equal', { completed: true })

  // toggle back
  cy.contains('.todo-list li', 'first').find('.toggle').click()
  cy.wait('@patch')
    .its('request.body')
    .should('deep.equal', { completed: false })
  cy.contains('.todo-list li', 'first').should('not.have.class', 'completed')
})

it('stays completed', () => {
  // reset + create the first todo
  cy.request('POST', '/reset', {
    todos: [{ id: 1, title: 'first', completed: false }]
  })
  cy.visit('/')
  cy.get('.todo-list li')
    .should('have.length', 1)
    .first()
    .should('not.have.class', 'completed')
    .find('.toggle')
    .should('not.be.checked')
    .click()
  cy.contains('.todo-list li', 'first')
    .should('have.class', 'completed')
    .wait(1000, { log: false }) // for clarity
  // the item stays completed
  cy.reload()
  cy.contains('.todo-list li', 'first').should('have.class', 'completed')
})
