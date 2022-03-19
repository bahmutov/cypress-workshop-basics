/// <reference types="cypress" />
// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// remember to manually delete all items before running the test
// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

beforeEach(() => {
  cy.visit('localhost:3000')
})

it('loads', () => {
  cy.contains('h1', 'todos')
})

it('adds two items', () => {
  cy.get('.new-todo').type('first item{enter}')
  cy.contains('li.todo', 'first item').should('be.visible')
  cy.get('.new-todo').type('second item{enter}')
  cy.contains('li.todo', 'second item').should('be.visible')
})

it('can mark an item as completed', () => {
  // adds a few items
  addItem('simple')
  addItem('hard')

  // marks the first item as completed
  cy.contains('li.todo', 'simple').should('exist').find('.toggle').check()

  // confirms the first item has the expected completed class
  cy.contains('li.todo', 'simple').should('have.class', 'completed')
  // confirms the other items are still incomplete
  cy.contains('li.todo', 'hard').should('not.have.class', 'completed')
})

it('shows the expected elements', () => {
  // remove duplicate commands that get an element
  // and check if it is visible
  // https://youtu.be/DnmnzemS_HA
  const selectors = ['header', 'footer', '.new-todo']
  selectors.forEach((selector) => {
    cy.get(selector).should('be.visible')
  })
})

/**
 * Adds a todo item
 * @param {string} text
 */
const addItem = (text) => {
  cy.get('.new-todo').type(`${text}{enter}`)
}

it('adds item with random text', () => {
  const randomLabel = `Item ${Math.random().toString().slice(2, 14)}`

  addItem(randomLabel)
  cy.contains('li.todo', randomLabel)
    .should('be.visible')
    .and('not.have.class', 'completed')
})

it('starts with zero items', () => {
  // NOTE: this test passes for the wrong reason
  cy.get('li.todo').should('have.length', 0)
})

it('disables the built-in assertion', () => {
  // try to get a non-existent element
  // without failing the test
  // pass it to the `.then($el)` callback
  // to check it yourself
  cy.get('does-not-exist')
    .should(Cypress._.noop)
    .then(($el) => {
      if (!$el.length) {
        cy.log('There is no element')
      }
    })
})

it('deletes all items at the start', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  cy.wait(1000)
  // get all todo items (there might not be any!)
  cy.get('li.todo')
    .should(Cypress._.noop)
    // for each todo item click the remove button
    .each(($item) => {
      cy.wrap($item).find('.destroy').click({ force: true })
    })
  // confirm that the item is gone from the dom
  cy.get('li.todo').should('not.exist')
})

it('deletes all items at the start (click multiple elements)', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  cy.wait(1000)
  // get all todo elements and their destroy buttons
  // (there might not be any!)
  // the click on them all at once
  // see https://on.cypress.io/click documentation
  cy.get('li.todo .destroy')
    .should(Cypress._.noop)
    .then(($destroy) => {
      if ($destroy.length) {
        cy.wrap($destroy).click({ force: true, multiple: true })
      }
    })
  // confirm that the item is gone from the dom
  cy.get('li.todo').should('not.exist')
})

it('adds one more todo item', () => {
  // make sure the application has loaded first
  // maybe using cy.wait() or by spying on the network call
  // or by checking something in the DOM
  cy.wait(1000)
  // take the initial number of items (could be zero!)
  // add one more todo via UI
  // take the new number of items
  // confirm it is the initial number + 1
  cy.get('li.todo')
    .should(Cypress._.noop)
    .its('length')
    .then((n) => {
      addItem('my new item')
      // now we for sure have at least one item
      cy.get('li.todo').should('have.length', n + 1)
    })
})

it('saves the added todos', () => {
  // use a random label
  const randomLabel = `Item ${Math.random().toString().slice(2, 14)}`

  addItem(randomLabel)
  // make sure the application has saved the item
  cy.wait(1000)
  // get the saved todos using cy.task from the plugins file
  cy.task('getSavedTodos')
    .should('have.length.greaterThan', 0)
    // confirm the list includes an item with "title: randomLabel"
    .and((list) => {
      const found = Cypress._.find(list, (item) => item.title === randomLabel)
      expect(found, 'has the new item').to.be.an('object')
    })
})

it('does not allow adding blank todos', () => {
  cy.on('uncaught:exception', (e) => {
    // what will happen if this assertion fails?
    // will the test fail?
    // expect(e.message).to.include('Cannot add a blank todo')
    // return false

    // a better shortcut
    return !e.message.includes('Cannot add a blank todo')
  })
  addItem(' ')
})

describe('Tests from clean slate', () => {
  // these tests really need to start from zero items
  // thus we use a beforeEach hook to remove any existing items
  beforeEach(() => {
    // this approach uses the page to delete any items
    // which is not the best approach. Next section "reset-state"
    // will teach a better way of cleaning the state

    // make sure the application has loaded first
    cy.wait(1000)
    cy.get('li.todo')
      .should(Cypress._.noop)
      // for each todo item click the remove button
      .each(($item) => {
        cy.wrap($item).find('.destroy').click({ force: true })
      })
    // confirm that the item is gone from the dom
    cy.get('li.todo').should('not.exist')
  })

  it('shows the remaining count', () => {
    // adds a few items
    addItem('simple')
    addItem('difficult')

    cy.contains('[data-cy="remaining-count"]', '2').should('be.visible')

    // marks the first item as completed
    cy.contains('li.todo', 'simple').should('exist').find('.toggle').check()

    // confirms the first item has the expected completed class
    cy.contains('li.todo', 'simple').should('have.class', 'completed')
    // confirms the other items are still incomplete
    cy.contains('li.todo', 'difficult').should('not.have.class', 'completed')

    // check the number of remaining items
    cy.log('**completed items count**')
    cy.contains('[data-cy="remaining-count"]', '1').should('be.visible')
  })

  it('shows remaining count only if there are items', () => {
    // make sure the application has loaded first
    cy.wait(1000)
    // there are no todos
    cy.get('.todo-list').should('not.be.visible')
    // there is no footer
    cy.get('.footer').should('not.be.visible')
    // add one todo item
    addItem('one')
    // the footer should be visible and have the count of 1
    cy.get('.footer')
      .should('be.visible')
      .contains('[data-cy="remaining-count"]', '1')
    // delete the single todo
    cy.contains('.todo', 'one').find('.destroy').click({ force: true })
    // the footer is gone
    cy.get('.footer').should('not.be.visible')
  })

  it('clears completed items', () => {
    // make sure the application has loaded first
    cy.wait(1000)
    // there are no todos
    cy.get('.todo-list').should('not.be.visible')
    // add two items
    // make both items completed
    const items = ['first', 'second']
    items.forEach((title) => {
      addItem(title)
      cy.contains('.todo', title).find('.toggle').click()
    })
    // click the "Clear completed" button
    cy.get('.clear-completed').click()
    // the todo items should be gone
    cy.get('.todo-list').should('not.be.visible')
    // the footer should be gone
    cy.get('.footer').should('not.be.visible')
    // reload the page just to be sure the server has removed the items
    cy.reload().wait(1000)
    // there should be no items
    cy.get('.todo-list').should('not.be.visible')
    cy.get('.footer').should('not.be.visible')
  })
})

// watch the video "Write An API Test Using Cypress"
// https://youtu.be/OWTrczUUVpA
it('adds and deletes items using REST API calls', () => {
  // reset the backend data using POST /request call
  // https://on.cypress.io/request
  cy.request('POST', '/reset', { todos: [] })
  // add an item using POST /todos call
  // passing the title and the completed: false properties
  cy.request('POST', '/todos', { title: 'first', completed: false })
    // from the response get the body and confirm
    // it has the expected properties, including the "id"
    .its('body')
    .should('have.keys', ['id', 'title', 'completed'])
    // get the "id" property and confirm it is a number
    .its('id')
    .should('be.a', 'number')
    // TIP: add a short wait for our simple server to
    // really save the added item
    .wait(100)
    // then use the "id" property to get the item
    // and then use the DELETE /todos/:id call to delete it
    // the status of the response should be 200
    .then((id) => {
      cy.request('GET', `/todos/${id}`).its('body.title').should('eq', 'first')
      cy.request('DELETE', `/todos/${id}`).its('status').should('equal', 200)
    })
})
// what a challenge?
// test more UI at http://todomvc.com/examples/vue/
