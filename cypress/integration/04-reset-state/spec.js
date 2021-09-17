/// <reference types="cypress" />
/**
 * Adds a todo item
 * @param {string} text
 */
const addItem = (text) => {
  cy.get('.new-todo').type(`${text}{enter}`)
}

describe('ANTI-PATTERN: reset state through the UI', () => {
  beforeEach(() => {
    cy.visit('/')
    // we need to wait for the items to be loaded
    cy.wait(1000)

    // how do you remove all items?
    // what happens if there are NO items?
    // Try removing all items and re-running the test
    cy.get('li.todo')
      // by default, cy.get retries until it finds at least 1 item
      // we can "trick" it to give us the items or not items
      // by adding our own assertion to pass even if
      // the number of items is zero
      .should('have.length.gte', 0)
      .then(($todos) => {
        // if there are no todos, we have nothing to clean up
        // the test thus has to use IF/ELSE statement
        // implementing its own logic
        // https://on.cypress.io/conditional-testing
        //
        // if
        //  there are no todos, return
        // else:
        //  there might be multiple items to click
        //   and the destroy button is not visible
        //  until the user hovers over it, thus
        //  we need to force it to be clickable
      })
  })

  it('adds two items starting with zero', () => {
    // this test does not clean up after itself
    // leaving two items for the other test
  })

  it('adds and removes an item', () => {
    // this test adds an item then cleans up after itself
    // leaving no items for other test to clean up
  })
})

describe('reset data using XHR call', () => {
  beforeEach(() => {
    // application should be running at port 3000
    // and the "localhost:3000" is set as "baseUrl" in "cypress.json"
    // TODO call /reset endpoint with POST method and object {todos: []}
    cy.visit('/')
  })

  it('adds two items', () => {
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })
})

describe('reset data using cy.writeFile', () => {
  beforeEach(() => {
    // TODO write file "todomvc/data.json" with stringified todos object
    // file path is relative to the project's root folder
    // where cypress.json is located
    cy.visit('/')
  })

  it('adds two items', () => {
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })
})

describe('reset data using a task', () => {
  beforeEach(() => {
    // TODO call a task to reset data
    cy.visit('/')
  })

  it('adds two items', () => {
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })
})

describe('set initial data', () => {
  it('sets data to complex object right away', () => {
    // TODO call task and pass an object with todos
    cy.visit('/')
    // check what is rendered
  })

  it('sets data using fixture', () => {
    // TODO load todos from "cypress/fixtures/two-items.json"
    // and then call the task to set todos
    cy.visit('/')
    // check what is rendered
  })
})

describe('create todos using API', () => {
  it('creates a random number of items', () => {
    // reset the data on the server
    // pick a random number of todos to create between 1 and 10
    // form the todos array with random titles
    // tip: you can use console.table to print an array of objects
    // call cy.request to post each TODO item
    // visit the page and check the displayed number of todos
  })

  it('creates a random number of items (Lodash)', () => {
    // reset the data on the server
    // create a random number of todos using cy.request
    // tip: use can use Lodash methods to draw a random number
    // look at the POST /todos calls the application sends
    // visit the page and check the displayed number of todos
  })
})
