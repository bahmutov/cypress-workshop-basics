/// <reference types="cypress" />
/* eslint-disable no-unused-vars */

describe('retry-ability', () => {
  beforeEach(function resetData() {
    cy.request('POST', '/reset', {
      todos: []
    })
  })

  beforeEach(function visitSite() {
    cy.visit('/')
  })

  it('shows UL', function () {
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.contains('ul', 'todo A')
    // confirm that the above element
    //  1. is visible
    //  2. has class "todo-list"
    //  3. css property "list-style-type" is equal "none"
  })

  it('shows UL - TDD', function () {
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.contains('ul', 'todo A').then(($ul) => {
      // use TDD assertions
      // $ul is visible
      // $ul has class "todo-list"
      // $ul css has "list-style-type" = "none"
    })
  })

  it('every item starts with todo', function () {
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.get('.todo label').should(($labels) => {
      // confirm that there are 4 labels
      // and that each one starts with "todo-"
    })
  })

  it('has the right label', () => {
    cy.get('.new-todo').type('todo A{enter}')
    // get the li elements
    // find the label with the text
    // which should contain the text "todo A"
  })

  // flaky test - can pass or not depending on the app's speed
  // to make the test flaky add the timeout
  // in todomvc/app.js "addTodo({ commit, state })" method
  it('has two labels', () => {
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // command
      .find('label') // command
      .should('contain', 'todo A') // assertion

    cy.get('.new-todo').type('todo B{enter}')
    // ? copy the same check as above
    // then make the test flaky ...
  })

  it('solution 1: merges queries', () => {
    cy.get('.new-todo').type('todo A{enter}')
    // ?

    cy.get('.new-todo').type('todo B{enter}')
    // ?
  })

  it('solution 2: alternate commands and assertions', () => {
    cy.get('.new-todo').type('todo A{enter}')
    // ?

    cy.get('.new-todo').type('todo B{enter}')
    // ?
  })

  it('retries reading the JSON file', () => {
    // add N items via UI
    // then read the file ./todomvc/data.json
    // and assert it has the N items and the first item
    // is the one entered first
    // note cy.readFile retries reading the file until the should(cb) passes
    // https://on.cypress.io/readilfe
  })
})

// if the tests are flaky, add test retries
// https://on.cypress.io/test-retries
describe('Careful with negative assertions', () => {
  it('hides the loading element', () => {
    cy.visit('/')
    // the loading element should not be visible
  })

  it('uses negative assertion and passes for the wrong reason', () => {
    cy.visit('/?delay=3000')
    // the loading element should not be visible
  })

  it('slows down the network response', () => {
    // use cy.intercept to delay the mock response
    cy.visit('/?delay=1000')

    // first, make sure the loading indicator shows up (positive assertion)
    // then assert it goes away (negative assertion)
  })
})

describe('timing commands', () => {
  // reset data before each test

  it('takes less than 2 seconds for the app to load', () => {
    // intercept the GET /todos load and randomly delay the response
    cy.visit('/')

    // check the loading indicator is visible
    // take a timestamp after the loading indicator is visible
    // how to check if the loading element goes away in less than 2 seconds?
    // take another timestamp when the indicator goes away.
    // compute the elapsed time
    // assert the elapsed time is less than 2 seconds
  })
})
