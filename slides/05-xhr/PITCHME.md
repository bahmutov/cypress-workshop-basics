## ☀️ Part 5: Control network calls

### 📚 You will learn

- how to spy on / stub network calls
- how to wait for the network calls from tests
- how to use network calls in assertions

+++

- keep `todomvc` app running
- open `cypress/integration/05-xhr/spec.js`
- `cy.route` is deprecated, use `cy.intercept`

📖 Fun read: [https://glebbahmutov.com/blog/cypress-intercept-problems/](https://glebbahmutov.com/blog/cypress-intercept-problems/)

---

## Situation

- there is **no resetting** the state before each test
- the test passes but _something is wrong_

```javascript
it('starts with zero items', () => {
  cy.visit('/')
  cy.get('li.todo').should('have.length', 0)
})
```

![Should have failed](./img/test-passes-but-this-is-wrong.png)

+++

## Problem

- page loads
- web application makes XHR call "GET /todos"
  - meanwhile it shows an empty list of todos
- Cypress assertion passes! <!-- .element: class="fragment" -->
- "GET /todos" returns with 2 items <!-- .element: class="fragment" -->
  - they are added to the DOM
  - but the test has already finished

---

## Waiting

```javascript
// 05-xhr/spec.js
it('starts with zero items (waits)', () => {
  cy.visit('/')
  cy.wait(1000)
  cy.get('li.todo').should('have.length', 0)
})
```

![Waiting works](./img/waiting.png)

+++

## Wait for application signal

```js
// todomvc/app.js
axios.get('/todos')
  ...
  .finally(() => {
    // an easy way for the application to signal
    // that it is done loading
    document.body.classList.add('loaded')
  })
```

**TODO:** write a test that waits for the body to have class "loaded" after the visit

⌨️ test "starts with zero items (check body.loaded)"

+++

**better** to wait on a specific XHR request. Network is just observable public effect, just like DOM.

+++

### Todo

Use the test "starts with zero items" in the file `05-xhr/spec.js`

- spy on specific route with "cy.intercept" <!-- .element: class="fragment" -->
  - should we set the spy _before_ or _after_ `cy.visit`?
- save as an alias <!-- .element: class="fragment" -->
- wait for this XHR alias <!-- .element: class="fragment" -->
  - then check the DOM

**tips:** [`cy.intercept`]('https://on.cypress.io/intercept), [Network requests guide](https://on.cypress.io/network-requests)

+++

💡 No need to `cy.wait(...).then(...)`. All Cypress commands will be chained automatically.

```js
cy.intercept('GET', '/todos').as('todos')
cy.visit('/')
cy.wait('@todos')
// cy.get() will run AFTER cy.wait() finishes
cy.get('li.todo').should('have.length', 0)
```

Read [Introduction to Cypress](https://on.cypress.io/introduction-to-cypress) "Commands Run Serially"

---

## Todo

add to the test "starts with zero items":

- wait for the XHR alias like before
- its response body should be an empty array

![Checking response body](./img/response-body.png)

---

## Todo

There are multiple tests in the "spec.js" that you can go through

- 'starts with zero items (delay)'
- 'starts with zero items (delay plus render delay)'
- 'starts with zero items (check body.loaded)'
- 'starts with zero items (check the window)'
- 'starts with N items'
- 'starts with N items and checks the page'

---

## Stub the network call

Update test "starts with zero items (stubbed response)"

- instead of just spying on XHR call, let's return some mock data

```javascript
// returns an empty list
// when `GET /todos` is requested
cy.intercept('GET', '/todos', [])
```

+++

```javascript
it('starts with zero items (fixture)', () => {
  // stub `GET /todos` with fixture "empty-list"

  // visit the page
  cy.visit('/')

  // then check the DOM
  cy.get('li.todo').should('have.length', 0)
})
```

**tip:** use [`cy.fixture`](https://on.cypress.io/fixture) command

+++

```javascript
it('loads several items from a fixture', () => {
  // stub route `GET /todos` with data from a fixture file "two-items.json"
  // THEN visit the page
  cy.visit('/')
  // then check the DOM: some items should be marked completed
  // we can do this in a variety of ways
})
```

---

### Spying on adding an item network call

When you add an item through the DOM, the app makes `POST` XHR call.

![Post new item](./img/post-item.png)

Note:
It is important to be able to use DevTools network tab to inspect the XHR and its request and response.

+++

**Todo 1/3**

- write a test "posts new item to the server" that confirms that new item is posted to the server

![Post new item](./img/post-item.png)

Note:
see instructions in the `05-xhr/spec.js` for the test

+++

**Todo 2/3**

- write a test "posts new item to the server response" that confirms that RESPONSE when a new item is posted to the server

![Post new item response](./img/post-item-response.png)

Note:
see instructions in the `05-xhr/spec.js` for the test

+++

**Todo 3/3**

- after you waited for the intercept once, you can use `cy.get('@alias')` to get its as many times as needed. Verify the request body and the response body of the intercept. Implement the test "'confirms the request and the response"

![Post new item response](./img/post-item-response.png)

Note:
see instructions in the `05-xhr/spec.js` for the test

---

## Bonus

Network requests guide at [https://on.cypress.io/network-requests](https://on.cypress.io/network-requests), blog post [https://glebbahmutov.com/blog/network-requests-with-cypress/](https://glebbahmutov.com/blog/network-requests-with-cypress/)

**Question:** which requests do you spy on, which do you stub?

---

## Caching

⚠️ Be careful with the browser caching the data. If the browser caches the data, the server might return "304" HTTP code.

⌨️ test "shows the items loaded from the server"

---

## Testing the loading element

In the application we are showing (very quickly) "Loading" state

```html
<div class="loading" v-show="loading">Loading data ...</div>
```

+++

## Todo

- delay the loading XHR request
- assert the UI is showing "Loading" element
- assert the "Loading" element goes away after XHR completes

⌨️ test "shows loading element"

**Note:** most querying commands have the built-in `should('exist')` assertion, thus in this case we need to use `should('be.visible')` and `should('not.be.visible')` assertions.

---

## Refactor a failing test

```js
// can you fix this test?
const id = cy.wait('@postTodo').then((intercept) => {
  // assert the response fields
  return intercept.response.body.id
})
console.log(id)
```

⌨️ test "refactor example"

---

## Let's test an edge data case

User cannot enter blank titles. What if our database has old data records with blank titles which it returns on load? Does the application show them? Does it crash?

**Todo:** write the test `handles todos with blank title`

---

## Test periodic network requests

The application loads Todos every minute

```js
// how would you test the periodic loading of todos?
setInterval(() => {
  this.$store.dispatch('loadTodos')
}, 60000)
```

+++

## Todo

- learn about controlling the web page clock using [cy.clock](https://on.cypress.io/clock) command
- set up a test "loads todos every minute" that intercepts the `GET /todos` with different responses using `times: 1` option
- advance the clock by 1 minute and confirm different responses are displayed

⌨️ test "test periodic loading"

---

## Wait for Network Idle

You can spy on every network request and keep track of its timestamp. Waiting for network idle means waiting for the network request to be older than N milliseconds before continuing the test.

**Todo:** implement the test "waits for the network to be idle for 2 seconds". Bonus for logging the timings.

---

## 🏁 Spy and stub the network from your tests

- confirm the REST calls
- stub random data

➡️ Pick the [next section](https://github.com/bahmutov/cypress-workshop-basics#contents)
