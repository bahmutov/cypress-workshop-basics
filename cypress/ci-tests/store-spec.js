/// <reference types="cypress" />
import {
  enterTodo,
  getNewTodoInput,
  getTodoItems,
  makeTodo,
  newId,
  resetDatabase,
  stubMathRandom,
  visit
} from '../support/utils'

// do not truncate the assertion messages
chai.config.truncateThreshold = 200

// testing the central Vuex data store
describe('UI to Vuex store', { retries: 2 }, () => {
  beforeEach(resetDatabase)

  const getStore = () => cy.window().its('app.$store')

  context('custom delay', () => {
    it('parses the delay in the url', () => {
      cy.visit('/?delay=1000')
      getStore().its('state').should('include', {
        delay: 1000
      })
    })
  })

  context('without delay', () => {
    beforeEach(() => visit())

    it('has loading, newTodo and todos properties', () => {
      getStore()
        .its('state')
        // best practice: only check if certain keys are included
        // using "include.keys", rather than the strict "have.keys"
        // But for the smaller app it is acceptable to be strict
        .should('have.keys', [
          'loading',
          'newTodo',
          'todos',
          'delay',
          'renderDelay'
        ])
    })

    it('starts empty', () => {
      // let's remove properties that are unimportant to the app's data
      const omitLoading = (state) =>
        Cypress._.omit(state, 'loading', 'delay', 'renderDelay')

      getStore().its('state').then(omitLoading).should('deep.equal', {
        todos: [],
        newTodo: ''
      })
    })

    it('can enter new todo text', () => {
      const text = 'learn how to test with Cypress.io'
      cy.get('.todoapp').find('.new-todo').type(text).trigger('change')

      getStore().its('state.newTodo').should('equal', text)
    })

    it('stores todos in the store', () => {
      enterTodo('first todo')
      enterTodo('second todo')

      getStore().its('state.todos').should('have.length', 2)

      const removeIds = (list) => list.map((todo) => Cypress._.omit(todo, 'id'))
      getStore()
        .its('state.todos')
        .then(removeIds)
        .should('deep.equal', [
          {
            title: 'first todo',
            completed: false
          },
          {
            title: 'second todo',
            completed: false
          }
        ])
    })

    const stubMathRandom = () => {
      // first two digits are disregarded, so our "random" sequence of ids
      // should be '1', '2', '3', ...
      let counter = 101
      cy.window().then((win) => {
        cy.stub(win.Math, 'random').callsFake(() => counter++)
      })
    }

    it('stores todos in the store (with ids)', () => {
      stubMathRandom()
      enterTodo('first todo')
      enterTodo('second todo')

      getStore().its('state.todos').should('have.length', 2)

      getStore()
        .its('state.todos')
        .should('deep.equal', [
          {
            title: 'first todo',
            completed: false,
            id: '1'
          },
          {
            title: 'second todo',
            completed: false,
            id: '2'
          }
        ])
    })
  })

  describe('Vuex store', () => {
    beforeEach(resetDatabase)
    beforeEach(() => visit())
    beforeEach(stubMathRandom)

    let store

    const getVuex = () => cy.window({ log: false }).its('app.$store')

    beforeEach(() => {
      getVuex().then((s) => {
        store = s
      })
    })

    const toJSON = (x) => JSON.parse(JSON.stringify(x))

    // returns the entire Vuex store state
    const getStore = () => cy.then(() => cy.wrap(toJSON(store.state)))

    // returns given getter value from the store
    const getFromStore = (property) =>
      cy.then(() => cy.wrap(store.getters[property]))

    // and a helper methods because we are going to pull "todos" often
    const getStoreTodos = getFromStore.bind(null, 'todos')

    it('starts empty', () => {
      getStoreTodos().should('deep.equal', [])
    })

    it('can enter new todo text', () => {
      const text = 'learn how to test with Cypress.io'
      cy.get('.todoapp').find('.new-todo').type(text).trigger('change')

      getFromStore('newTodo').should('equal', text)
    })

    it('can compare the entire store', () => {
      // make sure the application has finished loading
      cy.get('body').should('have.class', 'loaded')
      getStore().should('deep.equal', {
        loading: false,
        todos: [],
        newTodo: '',
        delay: 0,
        renderDelay: 0
      })
    })

    it('starts typing after delayed server response', () => {
      // this will force new todo item to be added only after a delay
      cy.intercept(
        {
          method: 'POST',
          url: '/todos'
        },
        { delay: 3000, body: {} }
      )

      const title = 'first todo'
      enterTodo(title)

      const newTitleText = 'this is a second todo title, slowly typed'
      getNewTodoInput().type(newTitleText, { delay: 100 }).trigger('change')

      getNewTodoInput().should('have.value', newTitleText)
    })

    it('can add a todo, type and compare entire store', () => {
      const title = 'a random todo'
      enterTodo(title)

      const text = 'learn how to test with Cypress.io'
      cy.get('.todoapp').find('.new-todo').type(text).trigger('change')

      getStore().should('deep.equal', {
        delay: 0,
        renderDelay: 0,
        loading: false,
        todos: [
          {
            title,
            completed: false,
            id: '1'
          }
        ],
        newTodo: text
      })
    })

    it('can add a todo', () => {
      const title = `a single todo ${newId()}`
      enterTodo(title)
      getStoreTodos()
        .should('have.length', 1)
        .its('0')
        .and('have.all.keys', 'id', 'title', 'completed')
    })

    // thanks to predictable random id generation
    // we know the objects in the todos list
    it('can add a particular todo', () => {
      const title = `a single todo ${newId()}`
      enterTodo(title)
      getStoreTodos().should('deep.equal', [
        {
          title,
          completed: false,
          id: '2'
        }
      ])
    })

    it('can add two todos and delete one', () => {
      const first = makeTodo()
      const second = makeTodo()

      enterTodo(first.title)
      enterTodo(second.title)

      getTodoItems()
        .should('have.length', 2)
        .first()
        .find('.destroy')
        .click({ force: true })

      getTodoItems().should('have.length', 1)

      getStoreTodos().should('deep.equal', [
        {
          title: second.title,
          completed: false,
          id: '4'
        }
      ])
    })

    it('can wait on promise-returning store actions', () => {
      // automatically waits for promise returned by the action to resolve
      getVuex().invoke('dispatch', 'addTodoAfterDelay', {
        milliseconds: 2000,
        title: 'async task'
      })
      // log message appears after 2 seconds
      cy.log('after invoke')

      // assert UI
      getTodoItems().should('have.length', 1).first().contains('async task')
    })

    it('can be driven by dispatching actions', () => {
      store.dispatch('setNewTodo', 'a new todo')
      store.dispatch('addTodo')
      store.dispatch('clearNewTodo')

      // assert UI
      getTodoItems().should('have.length', 1).first().contains('a new todo')

      // assert store
      getStore().should('deep.equal', {
        delay: 0,
        renderDelay: 0,
        loading: false,
        todos: [
          {
            title: 'a new todo',
            completed: false,
            id: '1'
          }
        ],
        newTodo: ''
      })
    })
  })

  describe('Store actions', () => {
    const getStore = () => cy.window().its('app.$store')

    beforeEach(resetDatabase)
    beforeEach(() => visit())
    beforeEach(stubMathRandom)

    it('changes the state', () => {
      getStore().then((store) => {
        store.dispatch('setNewTodo', 'a new todo')
        store.dispatch('addTodo')
        store.dispatch('clearNewTodo')
      })

      getStore()
        .its('state')
        .should('deep.equal', {
          delay: 0,
          renderDelay: 0,
          loading: false,
          todos: [
            {
              title: 'a new todo',
              completed: false,
              id: '1'
            }
          ],
          newTodo: ''
        })
    })

    it('changes the state after delay', () => {
      // this will force store action "setNewTodo" to commit
      // change to the store only after 3 seconds
      cy.intercept(
        {
          method: 'POST',
          url: '/todos'
        },
        {
          delay: 3000,
          body: {}
        }
      )

      getStore().then((store) => {
        store.dispatch('setNewTodo', 'a new todo')
        store.dispatch('addTodo')
        store.dispatch('clearNewTodo')
      })

      getStore()
        .its('state')
        .should('deep.equal', {
          delay: 0,
          renderDelay: 0,
          loading: false,
          todos: [
            {
              title: 'a new todo',
              completed: false,
              id: '1'
            }
          ],
          newTodo: ''
        })
    })

    it('changes the ui', () => {
      getStore().then((store) => {
        store.dispatch('setNewTodo', 'a new todo')
        store.dispatch('addTodo')
        store.dispatch('clearNewTodo')
      })

      // assert UI
      getTodoItems().should('have.length', 1).first().contains('a new todo')
    })

    it('calls server', () => {
      cy.intercept({
        method: 'POST',
        url: '/todos'
      }).as('postTodo')

      getStore().then((store) => {
        store.dispatch('setNewTodo', 'a new todo')
        store.dispatch('addTodo')
        store.dispatch('clearNewTodo')
      })

      // assert server call
      cy.wait('@postTodo').its('request.body').should('deep.equal', {
        title: 'a new todo',
        completed: false,
        id: '1'
      })
    })

    it('calls server with delay', () => {
      cy.intercept(
        {
          method: 'POST',
          url: '/todos'
        },
        {
          delay: 3000,
          body: {}
        }
      ).as('postTodo')

      getStore().then((store) => {
        store.dispatch('setNewTodo', 'a new todo')
        store.dispatch('addTodo')
        store.dispatch('clearNewTodo')
      })

      // assert server call - will wait 3 seconds until stubbed server responds
      cy.wait('@postTodo').its('request.body').should('deep.equal', {
        title: 'a new todo',
        completed: false,
        id: '1'
      })
    })
  })
})
