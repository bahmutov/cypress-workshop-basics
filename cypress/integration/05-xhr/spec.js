/// <reference types="cypress" />
//
// note, we are not resetting the server before each test
// and we want to confirm that IF the application has items already
// (for example add them manually using the browser localhost:3000)
// then these tests fail!
//
// see https://on.cypress.io/intercept

/* eslint-disable no-unused-vars */

it('starts with zero items (waits)', () => {
  cy.visit('/')
  // wait 1 second
  // then check the number of items
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (network wait)', () => {
  // spy on route `GET /todos`
  //  with cy.intercept(...).as(<alias name>)
  // THEN visit the page
  cy.visit('/')
  // wait for `GET /todos` route
  //  using "@<alias name>" string
  // then check the DOM
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (delay)', () => {
  // spy on the network call GET /todos
  // visit the page with /?delay=2000 query parameter
  // this will delay the GET /todos call by 2 seconds
  cy.visit('/?delay=2000')
  // wait for todos call
  // confirm there are no items on the page
})

it('starts with zero items (delay plus render delay)', () => {
  // spy on the GET /todos call and give it an alias
  // visit the page with query parameters
  // to delay the GET call and delay rendering the received items
  // /?delay=2000&renderDelay=1500
  cy.visit('/?delay=2000&renderDelay=1500')
  // wait for the network call to happen
  // confirm there are no todos
  // Question: can the items appear on the page
  // AFTER you have checked?
})

it('starts with zero items (check body.loaded)', () => {
  // cy.visit('/')
  // or use delays to simulate the delayed load and render
  cy.visit('/?delay=2000&renderDelay=1500')
  // the application sets "loaded" class on the body
  // in the test we can check for this class
  // THEN check the number of items
  cy.get('li.todo').should('have.length', 0)
})

it('starts with zero items (check the window)', () => {
  // use delays to simulate the delayed load and render
  cy.visit('/?delay=2000&renderDelay=1500')
  // the application code sets the "window.todos"
  // when it finishes loading the items
  // (see app.js)
  //  if (window.Cypress) {
  //    window.todos = todos
  //  }
  // thus we can check from the test if the "window"
  // object has property "todos"
  // https://on.cypress.io/window
  // https://on.cypress.io/its
  // then check the number of items rendered on the page
})

it('starts with N items', () => {
  // use delays to simulate the delayed load and render
  cy.visit('/?delay=2000&renderDelay=1500')
  // access the loaded Todo items
  // from the window object
  // using https://on.cypress.io/window
  // you can drill down nested properties using "."
  // https://on.cypress.io/its
  // "todos.length"
  // then check the number of items
  // rendered on the page - it should be the same
  // as "todos.length"
})

it('starts with N items and checks the page', () => {
  // use delays to simulate the delayed load and render
  cy.visit('/?delay=2000&renderDelay=1500')
  // access the loaded Todo items
  // from the window object
  // https://on.cypress.io/window
  // https://on.cypress.io/its "todos"
  // use https://on.cypress.io/then callback
  // then check the number of items on the page
  // it should be the same as "window.todos" length
  // go through the list of items
  // and for each item confirm it is rendered correctly
  // and the "completed" class is set correctly
})

it('starts with zero items (stubbed response)', () => {
  // using cy.intercept() stub `GET /todos` with []
  // save the stub as an alias

  // THEN visit the page
  cy.visit('/')

  // wait for the intercept alias
  // grab its response body
  // and make sure the body is an empty list
})

it('starts with zero items (fixture)', () => {
  // start Cypress network server
  // stub `GET /todos` with fixture "empty-list"

  // visit the page
  cy.visit('/')

  // then check the DOM
  cy.get('li.todo').should('have.length', 0)
})

it('loads several items from a fixture', () => {
  // stub route `GET /todos` with data from a fixture file "two-items.json"
  // THEN visit the page
  cy.visit('/')
  // then check the DOM: some items should be marked completed
  // we can do this in a variety of ways
})

it('posts new item to the server', () => {
  // spy on "POST /todos", save as alias
  cy.visit('/')
  cy.get('.new-todo').type('test api{enter}')

  // wait on XHR call using the alias, grab its request or response body
  // and make sure it contains
  // {title: 'test api', completed: false}
  // hint: use cy.wait(...).its(...).should('have.contain', ...)
})

it('posts new item to the server response', () => {
  // spy on "POST /todos", save as alias
  cy.visit('/')
  cy.get('.new-todo').type('test api{enter}')
  // get the intercept and confirm the response body
})

it('confirms the request and the response', () => {
  // spy on "POST /todos", save as alias
  cy.visit('/')
  cy.get('.new-todo').type('test api{enter}')
  // wait for the intercept and verify its request body
  // get the same intercept again and verify its response body
})

it('handles 404 when loading todos', () => {
  // when the app tries to load items
  // set it up to fail with 404 to GET /todos
  // after delay of 2 seconds
  cy.visit('/', {
    // spy on console.error because we expect app would
    // print the error message there
    onBeforeLoad: (win) => {
      // spy
    }
  })
  // observe external effect from the app - console.error(...)
  // cy.get('@console-error')
  //   .should(...)
})

it('shows loading element', () => {
  // delay XHR to "/todos" by a few seconds
  // and respond with an empty list
  // shows Loading element
  // wait for the network call to complete
  // now the Loading element should go away
})

it('handles todos with blank title', () => {
  // return a list of todos with one todo object
  // having blank spaces or null
  // confirm the todo item is shown correctly
})

it('waits for network to be idle for 1 second', () => {
  // intercept all requests
  // on every intercept set the timestamp
  // retry using should(cb) checking the time
  // that has passed since the network timestamp
})

// a test that confirms a specific network call is NOT made
// until the application adds a new item.
it('does not make POST /todos request on load', () => {
  // a cy.spy() creates a "pass-through" function
  // that can function as a network interceptor that does nothing
  cy.intercept('POST', '/todos', cy.spy().as('post'))
  // in order to confirm the network call was not made
  // we need to wait for something to happen, like the application
  // loading or some time passing
  // add a new item through the page UI
  // now the network call should have been made
  // confirm the network call was made with the correct data
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
    // make sure the request is NOT cached by the browser
    // because we want to see the list of items in the response
    // wait for the network call to happen
    // confirm the response is 200, read the number of items
    // and compare to the number of displayed todos
    // Tip: to prevent the server from returning "304 Not Modified"
    // remove the caching headers from the outgoing request
  })
})

describe('waits for network idle', () => {
  // we want to wait for the app to finish all network calls
  // before proceeding with the test commands

  beforeEach(() => {
    // before each test, stub the network call to load zero items
  })

  it('waits for the network to be idle for 2 seconds', () => {
    // keep track of the timestamp of the network call
    // intercept all calls (or maybe a specific pattern)
    // and in the callback save the current timestamp
    // load the page, but delay loading of the data by some random number
    // using /?delay=<number> query param
    // wait for network to be idle for 1 second
    // using a .should(cb) assertion that looks at the current timestamp
    // vs the timestamp of the last network call
    // see assertion examples at
    // https://glebbahmutov.com/cypress-examples/commands/assertions.html
    // TIP: cy.wrap('message').should(cb) works really well
    // by now everything should have been loaded
    // we can check the page and use a very short timeout
    // because the page is ready to be tested
  })
})

describe('refactor example', () => {
  // this test is incorrect on purpose
  // can you refactor it to do what you think it should be doing?
  it.skip('confirms the right Todo item is sent to the server', () => {
    cy.intercept('GET', '/todos', []).as('todos')
    cy.visit('/')
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    const id = cy.wait('@postTodo').then((intercept) => {
      // get the field from the intercept object
      const { statusCode, body } = intercept.response
      // confirm the status code is 201
      expect(statusCode).to.eq(201)
      // confirm some properties of the response data
      expect(body.title).to.equal(title)
      expect(body.completed).to.equal(completed)
      // return the field from the body object
      return body.id
    })
    console.log(id)
    cy.request('/todos/' + id) // validate the response
  })
})

describe('visit non-html page', () => {
  // before each test, create todos from the fixture data
  // the REST API serves each todo at /todos/:id
  // for example, can you visit the page at /todos/1 using cy.visit()?
  // you might need to "fix" the response type header

  // read https://glebbahmutov.com/blog/test-plain-or-markdown-file/
  it('visits the todo JSON response', function () {
    // do not forget to verify the page contents and the URL
  })
})

describe('test periodic loading', () => {
  // application periodically loads todos from the server
  // we do not want to wait 1 minute for the load call
  // instead we want to speed up the application's clock
  it('loads todos every minute', () => {
    // answer different network calls to load Todos with different responses
    cy.visit('/')
    // confirm the first call has happened
    // make the application think an entire minute has passed
    // confirm the second call has happened
    // another minute passes
    // confirm the third call has happened
  })
})
