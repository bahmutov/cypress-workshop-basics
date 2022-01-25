/// <reference types="cypress" />
//
// note, we are not resetting the server before each test
//

// see https://on.cypress.io/intercept

it('starts with zero items (waits)', () => {
  cy.visit('/')
  /* eslint-disable-next-line cypress/no-unnecessary-waiting */
  cy.wait(1000)
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items', () => {
  // start Cypress network server
  // spy on route `GET /todos`
  // THEN visit the page
  cy.intercept('GET', '/todos').as('todos')
  cy.visit('/')
  cy.wait('@todos') // wait for `GET /todos` response
    // inspect the server's response
    .its('response.body')
    .should('have.length', 0)
  // then check the DOM
  // note that we don't have to use "cy.wait(...).then(...)"
  // because all Cypress commands are flattened into a single chain
  // automatically. Thus just write "cy.wait(); cy.get();" naturally
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (check body.loaded)', () => {
  cy.visit('/')
  // the application sets "loaded" class on the body
  // in the test we can check for this class
  cy.get('body').should('have.class', 'loaded')
  // then check the number of items
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (stubbed response)', () => {
  // start Cypress network server
  // spy on route `GET /todos`
  // THEN visit the page
  cy.intercept('GET', '/todos', []).as('todos')
  cy.visit('/')
  cy.wait('@todos') // wait for `GET /todos` response
    // inspect the server's response
    .its('response.body')
    .should('have.length', 0)
  // then check the DOM
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (fixture)', () => {
  // stub route `GET /todos`, return data from fixture file
  // THEN visit the page
  cy.intercept('GET', '/todos', { fixture: 'empty-list.json' }).as('todos')
  cy.visit('/')
  cy.wait('@todos') // wait for `GET /todos` response
    // inspect the server's response
    .its('response.body')
    .should('have.length', 0)
  // then check the DOM
  cy.get('li.todo').should('have.length', 0)
})

it('posts new item to the server', () => {
  cy.intercept('POST', '/todos').as('new-item')
  cy.visit('/')
  cy.get('.new-todo').type('test api{enter}')
  cy.wait('@new-item').its('request.body').should('have.contain', {
    title: 'test api',
    completed: false
  })
})

it('posts new item to the server response', () => {
  cy.intercept('POST', '/todos').as('new-item')
  cy.visit('/')
  cy.get('.new-todo').type('test api{enter}')
  cy.wait('@new-item').its('response.body').should('have.contain', {
    title: 'test api',
    completed: false
  })
})

it('loads several items from a fixture', () => {
  // stub route `GET /todos` with data from a fixture file
  // THEN visit the page
  cy.intercept('GET', '/todos', { fixture: 'two-items' })
  cy.visit('/')
  // then check the DOM: some items should be marked completed
  // we can do this in a variety of ways
  cy.get('li.todo').should('have.length', 2)
  cy.get('li.todo.completed').should('have.length', 1)
  cy.contains('.todo', 'first item from fixture')
    .should('not.have.class', 'completed')
    .find('.toggle')
    .should('not.be.checked')
  cy.contains('.todo.completed', 'second item from fixture')
    .find('.toggle')
    .should('be.checked')
})

it('handles 404 when loading todos', () => {
  // when the app tries to load items
  // set it up to fail
  cy.intercept(
    {
      method: 'GET',
      pathname: '/todos'
    },
    {
      body: 'test does not allow it',
      statusCode: 404,
      delayMs: 2000
    }
  )
  cy.visit('/', {
    // spy on console.error because we expect app would
    // print the error message there
    onBeforeLoad: (win) => {
      cy.spy(win.console, 'error').as('console-error')
    }
  })
  // observe external effect from the app - console.error(...)
  cy.get('@console-error').should(
    'have.been.calledWithExactly',
    'test does not allow it'
  )
})

it('handles todos with blank title', () => {
  cy.intercept('GET', '/todos', [
    {
      id: '123',
      title: '  ',
      completed: false
    }
  ])

  cy.visit('/')
  cy.get('li.todo')
    .should('have.length', 1)
    .first()
    .should('not.have.class', 'completed')
    .find('label')
    .should('have.text', '  ')
})

// a test that confirms a specific network call is NOT made
// until the application adds a new item
it('does not make POST /todos request on load', () => {
  // a cy.spy() creates a "pass-through" function
  // that can function as a network interceptor that does nothing
  cy.intercept('POST', '/todos', cy.spy().as('post'))
  cy.visit('/')
  // in order to confirm the network call was not made
  // we need to wait for something to happen, like the application
  // loading or some time passing
  cy.wait(1000)
  cy.get('@post').should('not.have.been.called')
  // add a new item through the page UI
  cy.get('.new-todo').type('a new item{enter}')
  // now the network call should have been made
  cy.get('@post')
    .should('have.been.calledOnce')
    // confirm the network call was made with the correct data
    // get the first object to the first call
    .its('args.0.0.body')
    .should('deep.include', {
      title: 'a new item',
      completed: false
    })
})

describe('spying on load', () => {
  // use "beforeEach" callback to cleanly create a random
  // number of todos for each test
  beforeEach(() => {
    // reset the data on the server
    cy.request('POST', '/reset', { todos: [] })
    // create a random number of todos using cy.request
    // tip: use can use Lodash methods to draw a random number
    // look at the POST /todos calls the application sends
    Cypress._.times(Cypress._.random(10), (k) => {
      cy.request('POST', '/todos', {
        title: `todo ${k}`,
        completed: false,
        id: `id-${k}`
      })
    })
  })

  it('shows the items loaded from the server', () => {
    // spy on the route `GET /todos` to know how many items to expect
    cy.intercept('GET', '/todos', (req) => {
      // make sure the request is NOT cached by the browser
      // because we want to see the list of items in the response
      delete req.headers['if-none-match']
    }).as('getTodos')
    cy.visit('/')
    // wait for the network call to happen
    // confirm the response is 200, read the number of items
    // and compare to the number of displayed todos
    cy.wait('@getTodos')
      .its('response')
      .then((response) => {
        expect(response.statusCode).to.eq(200)
        cy.get('.todo').should('have.length', response.body.length)
      })
  })
})
