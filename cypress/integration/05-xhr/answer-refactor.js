/// <reference types="cypress" />

import spok from 'cy-spok'

// read the blog post "How To Check Network Requests Using Cypress"
// https://glebbahmutov.com/blog/network-requests-with-cypress/
describe('Refactor network code example', () => {
  beforeEach(() => {
    cy.intercept('GET', '/todos', []).as('todos')
    cy.visit('/')
  })

  it('validates and processes the intercept object', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .then((intercept) => {
        // get the field from the intercept object
        const { statusCode, body } = intercept.response
        // confirm the status code is 201
        expect(statusCode).to.eq(201)
        // confirm some properties of the response data
        expect(body.title).to.equal(title)
        expect(body.completed).to.equal(completed)
        // return the field from the body object
        return body.id
      })
      .then(cy.log)
  })

  it('extracts the response property first', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .then((response) => {
        const { statusCode, body } = response
        // confirm the status code is 201
        expect(statusCode).to.eq(201)
        // confirm some properties of the response data
        expect(body.title).to.equal(title)
        expect(body.completed).to.equal(completed)
        // return the field from the body object
        return body.id
      })
      .then(cy.log)
  })

  it('checks the status code', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .then((response) => {
        const { body } = response
        // confirm the status code is 201
        expect(response).to.have.property('statusCode', 201)
        // confirm some properties of the response data
        expect(body.title).to.equal(title)
        expect(body.completed).to.equal(completed)
        // return the field from the body object
        return body.id
      })
      .then(cy.log)
  })

  it('checks the status code in its own then', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .then((response) => {
        // confirm the status code is 201
        expect(response).to.have.property('statusCode', 201)
      })
      .its('body')
      .then((body) => {
        // confirm some properties of the response data
        expect(body.title).to.equal(title)
        expect(body.completed).to.equal(completed)
        // return the field from the body object
        return body.id
      })
      .then(cy.log)
  })

  it('checks the body object', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .then((response) => {
        // confirm the status code is 201
        expect(response).to.have.property('statusCode', 201)
      })
      .its('body')
      .then((body) => {
        // confirm some properties of the response data
        expect(body).to.deep.include({
          title,
          completed
        })
      })
      .its('id')
      .then(cy.log)
  })

  it('checks the body object using should', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .then((response) => {
        // confirm the status code is 201
        expect(response).to.have.property('statusCode', 201)
      })
      .its('body')
      .should('deep.include', { title, completed })
      .its('id')
      .then(cy.log)
  })

  it('checks the body object using cy-spok', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .should(
        spok({
          statusCode: 201
        })
      )
      .its('body')
      .should(
        spok({
          title,
          completed
        })
      )
      .its('id')
      .then(cy.log)
  })

  it('checks the response using cy-spok', () => {
    cy.intercept('POST', '/todos').as('postTodo')
    const title = 'new todo'
    const completed = false
    cy.get('.new-todo').type(title + '{enter}')
    cy.wait('@postTodo')
      .its('response')
      .should(
        spok({
          statusCode: 201,
          body: {
            title,
            completed,
            id: spok.string
          }
        })
      )
      .its('body.id')
      .then(cy.log)
  })
})
