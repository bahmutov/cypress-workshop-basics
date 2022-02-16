/// <reference types="cypress" />
/**
 * Adds a todo item
 * @param {string} text
 */
const addItem = (text) => {
  cy.get('.new-todo').type(`${text}{enter}`)
}

// application should be running at port 3000
// and the "localhost:3000" is set as "baseUrl" in "cypress.json"
beforeEach(() => {
  cy.request('POST', '/reset', {
    todos: []
  })
})
beforeEach(() => {
  cy.visit('/')
})

it('logs a todo add message to the console', () => {
  // get the window object from the app's iframe
  // using https://on.cypress.io/window
  // get its console object and spy on the "log" method
  // using https://on.cypress.io/spy
  // add a new todo item
  // get the spy and check that it was called
  // with the expected arguments
})

it('has window.app property', () => {
  // get its "app" property
  // and confirm it is an object
  // see https://on.cypress.io/its
  cy.window()
})

it('has vuex store', () => {
  // check app's $store property
  // and confirm it has typical Vuex store methods
  // see https://on.cypress.io/its
  cy.window()
})

it('starts with an empty store', () => {
  // the list of todos in the Vuex store should be empty
  cy.window()
})

it('adds items to store', () => {
  addItem('something')
  addItem('something else')
  // get application's window
  // then get app, $store, state, todos
  // it should have 2 items
})

it('creates an item with id 1', () => {
  cy.server()
  cy.route('POST', '/todos').as('new-item')

  // TODO change Math.random to be deterministic

  // STEPS
  // get the application's "window" object using cy.window
  // then change its Math object and replace it
  // with your function that always returns "0.1"

  addItem('something')
  // confirm the item sent to the server has the right values
  cy.wait('@new-item').its('request.body').should('deep.equal', {
    id: '1',
    title: 'something',
    completed: false
  })
})

// stub function Math.random using cy.stub
it('creates an item with id using a stub', () => {
  // get the application's "window.Math" object using cy.window
  // replace Math.random with cy.stub and store the stub under an alias
  // create a todo using addItem("foo")
  // and then confirm that the stub was called once
})

it('puts the todo items into the data store', () => {
  // application uses data store to store its items
  // you can get the data store using "window.app.$store.state.todos"
  // add a couple of items
  // get the data store
  // check its contents
})

it('handles todos with blank title', () => {
  // bypass the UI and call app's actions directly from the test
  // app.$store.dispatch('setNewTodo', <desired text>)
  // app.$store.dispatch('addTodo')
  // using https://on.cypress.io/invoke
  // and then
  // confirm the application is not breaking
})
