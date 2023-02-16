/// <reference types="cypress" />

// application periodically loads todos from the server
// we do not want to wait 1 minute for the load call
// instead we want to speed up the application's clock
it('loads todos every minute', () => {
  // note that the interceptors are matched in reverse order
  // thus we put the last interceptor first
  // answer the 3rd and all other calls with one two
  cy.intercept(
    {
      method: 'GET',
      url: '/todos',
      times: 1
    },
    { body: [{ id: 1, title: 'use cy.clock', completed: true }] }
  )
  // answer the 2nd call with three items
  cy.intercept(
    {
      method: 'GET',
      url: '/todos',
      times: 1
    },
    { fixture: 'three-items.json' }
  ).as('load2')
  // answer the first call with two items
  cy.intercept(
    {
      method: 'GET',
      url: '/todos',
      times: 1
    },
    { fixture: 'two-items.json' }
  ).as('load1')
  // leave the date unchanged, and only "freeze" the setInterval function
  cy.clock(null, ['setInterval'])
  cy.visit('/')
  cy.wait('@load1')
  cy.get('li.todo').should('have.length', 2)
  // make the application think an entire minute has passed
  cy.tick(60000)
  cy.wait('@load2')
  cy.get('li.todo').should('have.length', 3)
  // another minute passes
  cy.tick(60000)
  cy.get('li.todo').should('have.length', 1).contains('.todo', 'use cy.clock')
})
