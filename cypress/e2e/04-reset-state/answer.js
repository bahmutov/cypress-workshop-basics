/// <reference types="cypress" />
/**
 * Adds a todo item
 * @param {string} text
 */
const addItem = (text) => {
  cy.get('.new-todo').type(`${text}{enter}`)
}

describe.skip('ANTI-PATTERN: reset state through the UI', () => {
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
          // NOTE: because there is a race condition between clicking
          // and the app updating the elements after deleting each one
          // Cypress will throw an error saying "the DOM has changed"
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

// It seems json-server can easily crash on CI if you overwrite the file
describe.skip('reset data using cy.writeFile', () => {
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

describe('create todos using API', () => {
  it('creates a random number of items', () => {
    // reset the data on the server
    cy.request('POST', '/reset', { todos: [] })
    // pick a random number of todos to create between 1 and 10
    const numTodos = Math.floor(Math.random() * 10) + 1
    cy.log(`Creating **${numTodos}** todos`)
    // form the todos array with random titles
    const todos = Array.from({ length: numTodos }).map((o, k) => ({
      title: `todo ${k}`,
      completed: false,
      id: `id-${k}`
    }))
    // tip: you can use console.table to print an array of objects
    console.table(todos)
    // call cy.request to post each TODO item
    todos.forEach((todo) => {
      cy.request('POST', '/todos', todo)
        // the API a chance to save the todo
        .wait(100)
    })
    // visit the page and check the displayed number of todos
    cy.visit('/')
    cy.get('.todo').should('have.length', numTodos)
  })

  it('creates a random number of items (Lodash)', () => {
    // reset the data on the server
    cy.request('POST', '/reset', { todos: [] })
    // create a random number of todos using cy.request
    // tip: use can use Lodash methods to draw a random number
    const numTodos = Cypress._.random(1, 10)
    // look at the POST /todos calls the application sends
    Cypress._.times(numTodos, (k) => {
      cy.request('POST', '/todos', {
        title: `todo ${k}`,
        completed: false,
        id: `id-${k}`
      })
    })
    // visit the page and check the displayed number of todos
    cy.visit('/')
    cy.get('.todo').should('have.length', numTodos)
  })

  it('can modify JSON fixture as text and create todo', () => {
    // load the "two-items.json" from a fixture without converting it to JSON
    cy.fixture('two-items.json', null)
      .invoke({ log: false }, 'toString')
      // replace the first item's title with some other text
      .invoke({ log: false }, 'replace', 'first item from fixture', 'First!')
      // replace the second item's title with some other text
      .invoke({ log: false }, 'replace', 'second item from fixture', 'Second!')
      // convert the string to JSON and reset the data on the server
      .then(JSON.parse)
      .then((todos) => {
        // visit the page and confirm each item is present
        cy.task('resetData', { todos }, { log: false })
        cy.visit('/')
        // verify the page
        cy.get('li.todo').should('have.length', todos.length)
        todos.forEach((todo) => {
          cy.contains('li.todo', todo.title)
        })
      })
  })
})

describe('conditional reset data using XHR call', () => {
  function validate() {
    return cy
      .request('/todos')
      .its('body.length')
      .then((n) => n === 0)
  }

  function reset() {
    cy.request('POST', '/reset', {
      todos: []
    })
  }

  /**
   * A little utility function to run the "Set" commands
   * only if the "Validate" command chain yields false
   * @param {Function} validateFn
   * @param {Function} setFn
   * @returns Cypress.Chainable<any>
   */
  function validateAndSet(validateFn, setFn) {
    return validateFn().then((valid) => {
      if (!valid) {
        cy.log('**need to set**')
        return setFn()
      } else {
        return cy.log('**validated**')
      }
    })
  }

  beforeEach(() => {
    validateAndSet(validate, reset)
  })

  it('adds two items', () => {
    cy.visit('/')
    addItem('first item')
    addItem('second item')
    cy.get('li.todo').should('have.length', 2)
  })

  it('starts with zero items', () => {
    cy.visit('/')
    cy.get('body').should('have.class', 'loaded')
    cy.get('li.todo').should('have.length', 0)
  })

  it('starts with zero items', () => {
    cy.visit('/')
    cy.get('body').should('have.class', 'loaded')
    cy.get('li.todo').should('have.length', 0)
  })
})

describe('routing', () => {
  beforeEach(() => {
    // reset the app to have a few todos
    cy.fixture('three-items').then((todos) => {
      cy.request('POST', '/reset', { todos })
    })
  })

  it('shows todos based on selected filter', () => {
    cy.visit('/')
    // by default, all todos are shown
    cy.get('[data-cy="filter-all"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 3)

    cy.log('**active todos**')
    cy.contains('[data-cy="filter-active"]', 'Active').click()
    cy.location('hash').should('eq', '#/active')
    cy.get('[data-cy="filter-active"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 2)
    cy.get('.todo.completed').should('have.length', 0)

    cy.log('**completed todos**')
    cy.contains('[data-cy="filter-completed"]', 'Completed').click()
    cy.location('hash').should('eq', '#/completed')
    cy.get('[data-cy="filter-completed"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 1)
    cy.get('.todo:not(.completed)').should('have.length', 0)

    cy.log('**all todos again**')
    cy.contains('[data-cy="filter-all"]', 'All').click()
    cy.location('hash').should('eq', '#/all')
    cy.get('.todo').should('have.length', 3)
    cy.get('.todo:not(.completed)').should('have.length', 2)
    cy.get('.todo.completed').should('have.length', 1)
  })

  it('navigates to /active', () => {
    // visit the active route and make sure it loads
    cy.visit('/#/active')
    cy.get('[data-cy="filter-active"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 2)
    cy.get('.todo.completed').should('have.length', 0)
  })

  it('navigates to /completed', () => {
    // visit the completed route and make sure it loads
    cy.visit('/#/completed')
    cy.get('[data-cy="filter-completed"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 1)
    cy.get('.todo.completed').should('have.length', 1)
  })

  it('navigates to /all', () => {
    // visit the all route and make sure it loads
    cy.visit('/#/all')
    cy.get('[data-cy="filter-all"]').should('have.class', 'selected')
    cy.get('.todo').should('have.length', 3)
  })
})
