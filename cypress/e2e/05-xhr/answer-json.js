/// <reference types="cypress" />

// read the blog post "Visit Non-HTML Page"
// https://glebbahmutov.com/blog/visit-non-html-page/
describe(
  'visit non-html page',
  { viewportWidth: 400, viewportHeight: 100 },
  () => {
    beforeEach(() => {
      cy.fixture('two-items').as('todos')
    })

    beforeEach(function () {
      // by using "function () {}" callback we can access
      // the alias created in the previous hook using "this.<name>"
      cy.task('resetData', { todos: this.todos })
    })

    /*
      Skipping because this will cause an error:

        cy.visit() failed trying to load:

          http://localhost:3000/todos/1

        The content-type of the response we received from your web server was:

          > application/json

        This was considered a failure because responses must have content-type: 'text/html'
    */
    it.skip('tries to visit JSON resource', () => {
      cy.visit('/todos/1')
    })

    it('visits the todo JSON response', function () {
      cy.intercept('GET', '/todos/*', (req) => {
        req.continue((res) => {
          if (res.headers['content-type'].includes('application/json')) {
            res.headers['content-type'] = 'text/html'
            const text = `<body><pre>${JSON.stringify(
              res.body,
              null,
              2
            )}</pre></body>`
            res.send(text)
          }
        })
      }).as('todo')
      cy.visit('/todos/1')
      // make sure you intercept has worked
      cy.wait('@todo')
      // check the text shown in the browser
      cy.contains(this.todos[0].title)
      // confirm the item ID is in the URL
      // 1. less than ideal, since we use position arguments
      cy.location('pathname')
        .should('include', '/todos/')
        // we have a string, which we can split by '/'
        .invoke('split', '/')
        // and get the 3rd item in the array ["", "todos", "1"]
        .its(2)
        // and verify this is the same as the item ID
        .should('eq', '1')
      // 2. alternative: use regex exec with a capture group
      // https://javascript.info/regexp-groups
      cy.location('pathname')
        .should('match', /\/todos\/\d+/)
        // use named capture group to get the ID from the string
        .then((s) => /\/todos\/(?<id>\d+)/.exec(s))
        .its('groups.id')
        .should('equal', '1')
      // 3. use regular expression match with a capture group
      cy.location('pathname')
        .should('include', 'todos')
        // use named capture group to get the ID from the string
        .invoke('match', /\/todos\/(?<id>\d+)/)
        .its('groups.id')
        .should('equal', '1')
    })
  }
)
