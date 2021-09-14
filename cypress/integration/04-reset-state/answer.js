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
        if (!$todos.length) {
          // nothing to clean up
          return
        }

        cy.wrap($todos)
          .find('.destroy')
          // there might be multiple items to click
          // and the destroy button is not visible
          // until the user hovers over it, thus
          // we need to force it to be clickable
          .click({ multiple: true, force: true })
      })
  })

  it('adds two items starting with zero', () => {
    // this test does not clean up after itself
    // leaving two items for the other test
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })

  it('adds and removes an item', () => {
    // this test adds an item then cleans up after itself
    // leaving no items for other test to clean up
    addItem('only item')
    cy.contains('.todo', 'only item').find('.destroy').click({ force: true })
  })
})

describe('reset data using XHR call', () => {
  // you can use separate "beforeEach" hooks or a single one
  beforeEach(() => {
    cy.request('POST', '/reset', {
      todos: []
    })
  })
  beforeEach(() => {
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
    const emptyTodos = {
      todos: []
    }
    const str = JSON.stringify(emptyTodos, null, 2) + '\n'
    // file path is relative to the project's root folder
    // where cypress.json is located
    cy.writeFile('todomvc/data.json', str, 'utf8')
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
    cy.task('resetData')
    cy.visit('/')
    cy.get('li.todo').should('have.length', 0)
  })

  it('adds two items', () => {
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })
})

describe('set initial data', () => {
  it('sets data to complex object right away', () => {
    cy.task('resetData', {
      todos: [
        {
          id: '123456abc',
          completed: true,
          title: 'reset data before test'
        }
      ]
    })

    cy.visit('/')
    // check what is rendered
    cy.get('li.todo').should('have.length', 1)
  })

  it('sets data using fixture', () => {
    cy.fixture('two-items').then((todos) => {
      // "todos" is an array
      cy.task('resetData', { todos })
    })

    cy.visit('/')
    // check what is rendered
    cy.get('li.todo').should('have.length', 2)
  })
})
