/// <reference types="cypress" />
/* eslint-disable no-unused-vars */

import 'cypress-cdp'

describe('retry-ability', () => {
  beforeEach(function resetData() {
    cy.request('POST', '/reset', {
      todos: []
    })
  })

  beforeEach(function visitSite() {
    // do not delay adding new items after pressing Enter
    cy.visit('/')
    // enable a delay when adding new items
    // cy.visit('/?addTodoDelay=1000')
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

describe('should vs then', () => {
  it('retries should(cb) but does not return value', () => {
    cy.wrap(42).should((x) => {
      // the return here does nothing
      // the original subject 42 is yielded instead
    })
    // assert the value is 42
  })

  it('first use should(cb) then then(cb) to change the value', () => {
    cy.wrap(42)
      .should((x) => {
        // the returned value is ignored
      })
      .then((x) => {
        // check the current value
        return 10
      })
      // assert the value is 10
      .should('equal', 10)
  })
})

describe('timing commands', () => {
  // reset data before each test

  // see solution in the video
  // "Time Part Of A Cypress Test Or A Single Command"
  // https://youtu.be/tjK_FCYikzI
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

// TODO: finish this exercise
describe.skip('delayed app start', () => {
  it('waits for the event listeners to be attached', () => {
    cy.visit('/?appStartDelay=2000')
    const selector = 'input.new-todo'

    function checkListeners() {
      cy.CDP('Runtime.evaluate', {
        expression: 'frames[0].document.querySelector("' + selector + '")'
      })
        .should((v) => {
          expect(v.result).to.have.property('objectId')
        })
        .its('result.objectId')
        .then(cy.log)
        .then((objectId) => {
          cy.CDP('DOMDebugger.getEventListeners', {
            objectId,
            depth: -1,
            pierce: true
          }).then((v) => {
            if (v.listeners && v.listeners.length > 0) {
              // all good
              return
            }
            cy.wait(100).then(checkListeners)
          })
        })
    }

    checkListeners()
    // cy.hasEventListeners('input.new-todo')
  })
})
