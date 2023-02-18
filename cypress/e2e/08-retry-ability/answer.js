// @ts-check
/// <reference types="cypress" />
import 'cypress-map'
import { recurse } from 'cypress-recurse'

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
      .should('be.visible')
      // 2. has class "todo-list"
      .and('have.class', 'todo-list')
      // 3. css property "list-style-type" is equal "none"
      .and('have.css', 'list-style-type', 'none')
  })

  it('shows UL - TDD', function () {
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.contains('ul', 'todo A').should(($ul) => {
      // use TDD assertions
      // $ul is visible
      // $ul has class "todo-list"
      // $ul css has "list-style-type" = "none"
      assert.isTrue($ul.is(':visible'), 'ul is visible')
      assert.include($ul[0].className, 'todo-list')
      assert.isTrue($ul.hasClass('todo-list'))
      assert.equal($ul.css('list-style-type'), 'none')
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
      expect($labels).to.have.length(4)

      $labels.each((k, el) => {
        expect(el.textContent).to.match(/^todo /)
      })
    })
  })

  it('has 2 items', () => {
    cy.get('.new-todo') // command
      .type('todo A{enter}') // command
      .type('todo B{enter}') // command
    cy.get('.todo-list li') // command
      .should('have.length', 2) // assertion
  })

  it('has the right label', () => {
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // query
      .then(console.log) // command
      .find('label') // query
      .should('contain', 'todo A') // assertion
  })

  // flaky test - can pass or not depending on the app's speed
  // to make the test flaky add the timeout
  // in todomvc/app.js "addTodo({ commit, state })" method
  it('has two labels', { retries: 2 }, () => {
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // query
      .then(console.log) // command
      .find('label') // query
      .should('contain', 'todo A') // assertion

    cy.get('.new-todo').type('todo B{enter}')
    cy.get('.todo-list li') // query
      .then(console.log) // command
      .find('label') // query
      .should('contain', 'todo B') // assertion
  })

  it('solution 1: remove cy.then', () => {
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // query
      .find('label') // query
      .should('contain', 'todo A') // assertion

    cy.get('.new-todo').type('todo B{enter}')
    cy.get('.todo-list li') // query
      .find('label') // query
      .should('contain', 'todo B') // assertion
  })

  it('solution 2: alternate commands and assertions', () => {
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // query
      .should('have.length', 1) // assertion
      .then(console.log) // command
      .find('label') // query
      .should('contain', 'todo A') // assertion

    cy.get('.new-todo').type('todo B{enter}')
    cy.get('.todo-list li') // query
      .should('have.length', 2) // assertion
      .then(console.log) // command
      .find('label') // query
      .should('contain', 'todo B') // assertion
  })

  it('solution 3: replace cy.then with a query', () => {
    // @ts-ignore
    Cypress.Commands.addQuery('later', (fn) => {
      return (subject) => {
        // @ts-ignore
        fn(subject)
        return subject
      }
    })
    cy.get('.new-todo').type('todo A{enter}')
    cy.get('.todo-list li') // query
      // @ts-ignore
      .later(console.log) // query
      .find('label') // query
      .should('contain', 'todo A') // assertion

    cy.get('.new-todo').type('todo B{enter}')
    cy.get('.todo-list li') // query
      // @ts-ignore
      .later(console.log) // query
      .find('label') // query
      .should('contain', 'todo B') // assertion
  })

  it('confirms the text of each todo', () => {
    // add several todo items
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    // use cypress-map queries to get the text from
    // each todo and confirm the list of strings
    // add printing the strings before the assertion
    // Tip: there are queries for this in cypress-map
    cy.get('.todo-list li label')
      .map('innerText')
      .print()
      .should('deep.equal', ['todo A', 'todo B', 'todo C', 'todo D'])
  })

  it('adds todos until we have 5 of them', () => {
    recurse(
      () => cy.get('.todo-list li').should(Cypress._.noop),
      ($li) => $li.length >= 5,
      {
        log: '5 todos',
        delay: 1000,
        timeout: 6000,
        post({ iteration }) {
          cy.get('.new-todo').type(`todo ${iteration}{enter}`)
        }
      }
    )
  })

  it('retries reading the JSON file', () => {
    // note cy.readFile retries reading the file until the should(cb) passes
    // https://on.cypress.io/readfile
    cy.get('.new-todo')
      .type('todo A{enter}')
      .type('todo B{enter}')
      .type('todo C{enter}')
      .type('todo D{enter}')
    cy.readFile('./todomvc/data.json').should((data) => {
      expect(data).to.have.property('todos')
      expect(data.todos).to.have.length(4, '4 saved items')
      expect(data.todos[0], 'first item').to.include({
        title: 'todo A',
        completed: false
      })
    })
  })
})

describe('should vs then', () => {
  it('retries should(cb) but does not return value', () => {
    cy.wrap(42)
      .should((x) => {
        expect(x).to.equal(42)
        // the return here does nothing
        // the original subject 42 is yielded instead
        return 10
      })
      // assert the value is 42
      .should('equal', 42)
  })

  it('first use should(cb) then then(cb) to change the value', () => {
    cy.wrap(42)
      .should((x) => {
        expect(x).to.equal(42)
        // the returned value is ignored
        return 10
      })
      .then((x) => {
        // check the current value
        expect(x).to.equal(42)
        return 10
      })
      // assert the value is 10
      .should('equal', 10)
  })
})

describe('Careful with negative assertions', { retries: 2 }, () => {
  beforeEach(function resetData() {
    // cy.intercept('/todos', { body: [], delayMs: 5000 })
  })

  // this assertion can pass - but for the wrong reason
  // the indicator initially is NOT shown, thus this assertion
  // pass immediately, and probably not when the app finishes loading
  it('hides the loading element', () => {
    cy.visit('/')
    cy.get('.loading').should('not.be.visible')
  })

  it('uses negative assertion and passes for the wrong reason', () => {
    cy.visit('/?delay=3000')
    cy.get('.loading').should('not.be.visible')
  })

  // NOTE: skipping because it is flakey and slowing down the request is better
  it.skip('use positive then negative assertion (flakey)', () => {
    cy.visit('/?delay=3000')
    // first, make sure the loading indicator shows up (positive assertion)
    cy.get('.loading').should('be.visible')
    // then assert it goes away (negative assertion)
    cy.get('.loading').should('not.be.visible')
  })

  it('uses cy.route to slow down network response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/todos'
      },
      {
        body: [],
        delay: 2000
      }
    )
    cy.visit('/?delay=3000')
    // first, make sure the loading indicator shows up (positive assertion)
    cy.get('.loading').should('be.visible')
    // then assert it goes away (negative assertion)
    cy.get('.loading').should('not.be.visible')
  })

  it('slows down the network response', () => {
    cy.intercept('/todos', {
      body: [],
      delayMs: 1000
    })
    cy.visit('/?delay=1000')
    // first, make sure the loading indicator shows up (positive assertion)
    cy.get('.loading').should('be.visible')
    // then assert it goes away (negative assertion)
    cy.get('.loading').should('not.be.visible')
  })

  it('slows down the network response (programmatic)', () => {
    cy.intercept('/todos', (req) => {
      req.reply({
        body: [],
        delayMs: 1000
      })
    })
    cy.visit('/?delay=1000')
    // first, make sure the loading indicator shows up (positive assertion)
    cy.get('.loading').should('be.visible')
    // then assert it goes away (negative assertion)
    cy.get('.loading').should('not.be.visible')
  })

  it('loading element is visible, while todos do not exist', () => {
    cy.intercept('/todos', {
      delayMs: 1000,
      fixture: 'two-items.json'
    })
    cy.visit('/?delay=1000')
    cy.get('.loading').should(($loading) => {
      // single function with synchronous assertions
      expect($loading).to.be.visible
      const doc = $loading[0].ownerDocument
      const todoList = doc.querySelector('.todo-list')
      expect(todoList).to.be.empty
    })
    // the loading element goes away and the list appears
    cy.get('.loading').should('not.be.visible')
    cy.get('.todo-list li').should('have.length', 2)
  })
})

describe('aliases', () => {
  context('are reset before each test', () => {
    before(() => {
      cy.wrap('some value').as('exampleValue')
    })

    it('works in the first test', () => {
      cy.get('@exampleValue').should('equal', 'some value')
    })

    // NOTE the second test is failing because the alias is reset
    it.skip('does not exist in the second test', () => {
      // there is not alias because it is created once before
      // the first test, and is reset before the second test
      cy.get('@exampleValue').should('equal', 'some value')
    })
  })

  context('should be created before each test', () => {
    beforeEach(() => {
      // we will create a new alias before each test
      cy.wrap('some value').as('exampleValue')
    })

    it('works in the first test', () => {
      cy.get('@exampleValue').should('equal', 'some value')
    })

    it('works in the second test', () => {
      cy.get('@exampleValue').should('equal', 'some value')
    })
  })
})

describe('timing commands', () => {
  beforeEach(function resetData() {
    cy.request('POST', '/reset', {
      todos: []
    })
  })

  it('takes less than 2 seconds for the app to load', () => {
    cy.intercept('GET', '/todos', {
      fixture: 'two-items.json',
      delay: Cypress._.random(1000, 1999)
    })
    cy.visit('/')

    let started
    cy.get('.loading')
      .should('be.visible')
      .then(() => {
        // take a timestamp after the loading indicator is visible
        started = +new Date()
      })
    // how to check if the loading element goes away in less than 2 seconds?
    cy.get('.loading')
      .should('not.be.visible')
      .then(() => {
        // take another timestamp when the indicator goes away.
        // compute the elapsed time
        // assert the elapsed time is less than 2 seconds (be lenient)
        const finished = +new Date()
        const elapsed = finished - started
        expect(elapsed, 'loading takes less than 2 seconds').to.be.lessThan(
          2100
        )
      })
  })
})
