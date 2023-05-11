/// <reference types="cypress" />
it('loads', () => {
  // application should be running at port 3000
  cy.visit('localhost:3000')
  cy.contains('h1', 'todos')
})

// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
// remember to manually delete all items before running the test
// IMPORTANT ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

it('adds two items', () => {
  // visit the site
  // https://on.cypress.io/visit
  // repeat twice
  //    get the input field
  //    https://on.cypress.io/get
  //    type text and "enter"
  //    https://on.cypress.io/type
  //    assert that the new Todo item
  //    has been added added to the list
  // cy.get(...).should('have.length', 2)
})

it('can mark an item as completed', () => {
  // visit the site
  // adds a few items
  // marks the first item as completed
  // https://on.cypress.io/get
  // https://on.cypress.io/find
  // https://on.cypress.io/first
  // confirms the first item has the expected completed class
  // confirms the other items are still incomplete
  // check the number of remaining items
})

it('can delete an item', () => {
  // adds a few items
  // deletes the first item
  // use force: true because we don't want to hover
  // confirm the deleted item is gone from the dom
  // confirm the other item still exists
})

it('can add many items', () => {
  const N = 5
  for (let k = 0; k < N; k += 1) {
    // add an item
    // probably want to have a reusable function to add an item!
  }
  // check number of items
})

it('shows the expected elements', () => {
  // TODO: remove duplicate commands that get an element
  // and check if it is visible
  // https://youtu.be/DnmnzemS_HA
  cy.get('header').should('be.visible')
  cy.get('footer').should('be.visible')
  cy.get('.new-todo').should('be.visible')
})

it('adds item with random text', () => {
  // use a helper function with Math.random()
  // or Cypress._.random() to generate unique text label
  // add such item
  // and make sure it is visible and does not have class "completed"
})

it('starts with zero items', () => {
  // check if the list is empty initially
  //   find the selector for the individual TODO items in the list
  //   use cy.get(...) and it should have length of 0
  //   https://on.cypress.io/get
  //   ".should('have.length', 0)"
  //   or ".should('not.exist')"
})

it('disables the built-in assertion', () => {
  // try to get a non-existent element
  // without failing the test
  // pass it to the `.then($el)` callback
  // to check it yourself
})

it('deletes all items at the start', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  // get all todo items (there might not be any!)
  // for each todo item click the remove button
  // tip: use cy.each and cy.wrap commands
  // confirm that the item is gone from the dom
  // using "should not exist" or "should have length 0" assertion
})

it('deletes all items at the start (click multiple elements)', () => {
  // visit the page
  // wait for the page to load the todos
  // using cy.wait() for now
  // get all todo elements and their destroy buttons
  // (there might not be any!)
  // the click on them all at once
  // see https://on.cypress.io/click documentation
  // confirm that the item is gone from the dom
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
})

it('saves the added todos', () => {
  // use a random label
  // make sure the application has saved the item
  cy.wait(1000)
  // get the saved todos using cy.task from the plugins file
  // confirm the list includes an item with "title: randomLabel"
})

it('does not allow adding blank todos', () => {
  // https://on.cypress.io/catalog-of-events#App-Events
  cy.on('uncaught:exception', () => {
    // check e.message to match expected error text
    // return false if you want to ignore the error
  })

  // try adding an item with just spaces
})

it('shows remaining count only if there are items', () => {
  // make sure the application has loaded first
  cy.wait(1000)
  // there are no todos
  // there is no footer
  // add one todo item
  // the footer should be visible and have the count of 1
  // delete the single todo
  // the footer is gone
})

it('clears completed items', () => {
  // make sure the application has loaded first
  cy.wait(1000)
  // there are no todos
  // add two items
  // make both items completed
  const items = ['first', 'second']
  // click the "Clear completed" button
  // the todo items should be gone
  // the footer should be gone
  // reload the page just to be sure the server has removed the items
  // there should be no items
})

// watch the video "Write An API Test Using Cypress"
// https://youtu.be/OWTrczUUVpA
it('adds and deletes items using REST API calls', () => {
  // reset the backend data using POST /request call
  // https://on.cypress.io/request
  // add an item using POST /todos call
  // passing the title and the completed: false properties
  // from the response get the body and confirm
  // it has the expected properties, including the "id"
  // get the "id" property and confirm it is a number
  // TIP: add a short wait for our simple server to
  // really save the added item
  // then use the "id" property to get the item
  // and then use the DELETE /todos/:id call to delete it
  // the status of the response should be 200
  //
  // bonus: use cy.fixture command to reset the todos
  // or to create items one by one. Then visit the page
  // and verify the shown items
})

it('completes an item using REST call', () => {
  // reset the todos on the server
  // create a new item using cy.request POST /todos call
  // and get its ID from the response
  // confirm the item is not completed by fetching it using GET /todos/:id
  // complete the item using the PATCH /todos/:id call
  // with { completed: true }
  //
  // after completing the item via an API call
  // visit the page (or reload) and confirm it is shown as completed
  // confirm the count of remaining items is 0
})

it('creates todos from a fixture', () => {
  // reset the todos on the server
  //
  // load a list of todos from a fixture file using cy.fixture
  // https://on.cypress.io/fixture
  // get the list of todos from the fixture using .then callback
  // for each item make a cy.request to create it on the server
  // after creating all items,
  // reload the page and confirm each item is shown
  //
  // bonus: import the fixture directly into the spec for simplicity
  // read https://glebbahmutov.com/blog/import-cypress-fixtures/
})

it('checks the meta tags in the head element', () => {
  // visit the page "/"
  // https://on.cypress.io/visit
  // confirm the page title includes the string "TodoMVC"
  // tip: how would you set the title element from the DevTools console?
  // confirm the meta tag name is "Gleb Bahmutov"
  // confirm the meta tag description includes the expected text "workshop"
})

describe('Title', () => {
  it('adds an item with test case title', () => {
    // confirm the current test title
    // confirm the current full test name
    // (the parent suite title(s) plus the test title)
    //
    // visit the page
    //
    // let all todos load
    cy.wait(1000)
    // normalize the full test title to remove characters
    // and maybe make it into a single string like "foo-bar-baz-..."
    //
    // add a new todo with the normalized title
    //
    // confirm the list has the new todo at the first position in the list
  })
})

// what a challenge?
// test more UI at http://todomvc.com/examples/vue/
