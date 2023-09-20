## ☀️ Custom commands

### 📚 You will learn

- adding new commands to `cy`
- supporting retry-ability
- TypeScript definition for new command
- useful 3rd party commands

+++

- keep `todomvc` app running
- open `cypress/e2e/09-custom-commands/spec.js`

---

### 💯 Code reuse and clarity

```js
// name the beforeEach functions
beforeEach(function resetData() {
  cy.request('POST', '/reset', {
    todos: []
  })
})
beforeEach(function visitSite() {
  cy.visit('/')
})
```

Note:
Before each test we need to reset the server data and visit the page. The data clean up and opening the site could be a lot more complex that our simple example. We probably want to factor out `resetData` and `visitSite` into reusable functions every spec and test can use.

---

### Todo: move them into `cypress/support/e2e.js`

Now these `beforeEach` hooks will be loaded _before every_ test in every spec. The test runner loads the spec files like this:

```html
<script src="cypress/support/e2e.js"></script>
<script src="cypress/e2e/09-custom-commands/spec.js"></script>
```

Note:
Is this a good solution?

---

## My opinion

> Little reusable functions are the best

```js
import {
  enterTodo,
  getTodoApp,
  getTodoItems,
  resetDatabase,
  visit
} from '../../support/utils'
beforeEach(() => {
  resetDatabase()
  visit()
})
it('loads the app', () => {
  getTodoApp().should('be.visible')
  enterTodo('first item')
  enterTodo('second item')
  getTodoItems().should('have.length', 2)
})
```

Todo: look at the "cypress/support/utils.js"

Note:
Some functions can return `cy` instance, some don't, whatever is convenient. I also find small functions that return complex selectors very useful to keep selectors from duplication.

+++

Pro: functions are easy to document with JSDoc

![JSDoc example](./img/jsdoc.png)

+++

And then IntelliSense works immediately

![IntelliSense](./img/intellisense.jpeg)

+++

And MS IntelliSense can understand types from JSDoc and check those!

[https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript)

More details in: [https://slides.com/bahmutov/ts-without-ts](https://slides.com/bahmutov/ts-without-ts)

---

## Use cases for custom commands

- share code in entire project without individual imports
- complex logic with custom logging into Command Log
  - login sequence
  - many application actions

📝 [on.cypress.io/custom-commands](https://on.cypress.io/custom-commands) and Read [https://glebbahmutov.com/blog/writing-custom-cypress-command/](https://glebbahmutov.com/blog/writing-custom-cypress-command/)

+++

## Custom commands and queries

- add a custom command
- add a custom query
- overwrite a command
- overwrite a query (v12.6.0+)

---

Let's write a custom command to create a todo

```js
// instead of this
cy.get('.new-todo').type('todo 0{enter}')
// use a custom command "createTodo"
cy.createTodo('todo 0')
```

+++

## Todo: write and use "createTodo"

```js
Cypress.Commands.add('createTodo', (todo) => {
  cy.get('.new-todo').type(`${todo}{enter}`)
})
it('creates a todo', () => {
  cy.createTodo('my first todo')
})
```

+++

## ⬆️ Make it better

- have IntelliSense working for `createTodo`
- have nicer Command Log

+++

## Todo: add `createTodo` to `cy` object

How: [https://github.com/cypress-io/cypress-example-todomvc#cypress-intellisense](https://github.com/cypress-io/cypress-example-todomvc#cypress-intellisense)

+++

⌨️ in file `cypress/e2e/09-custom-commands/custom-commands.d.ts`

```ts
/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Creates one Todo using UI
     * @example
     * cy.createTodo('new item')
     */
    createTodo(todo: string): Chainable<any>
  }
}
```

+++

Load the new definition file in `cypress/e2e/09-custom-commands/spec.js`

```js
/// <reference path="./custom-commands.d.ts" />
```

+++

![Custom command IntelliSense](./img/create-todo-intellisense.jpeg)

More JSDoc examples: [https://slides.com/bahmutov/ts-without-ts](https://slides.com/bahmutov/ts-without-ts)

Note:
Editors other than VSCode might require work.

+++

## Better Command Log

```js
Cypress.Commands.add('createTodo', (todo) => {
  cy.get('.new-todo', { log: false }).type(`${todo}{enter}`, { log: false })
  cy.log('createTodo', todo)
})
```

+++

## Even better Command Log

```js
Cypress.Commands.add('createTodo', (todo) => {
  const cmd = Cypress.log({
    name: 'create todo',
    message: todo,
    consoleProps() {
      return {
        'Create Todo': todo
      }
    }
  })
  cy.get('.new-todo', { log: false }).type(`${todo}{enter}`, { log: false })
})
```

+++

![createTodo log](./img/create-todo-log.png)

---

### Mark command completed

```js
cy.get('.new-todo', { log: false })
  .type(`${todo}{enter}`, { log: false })
  .then(($el) => {
    cmd.set({ $el }).snapshot().end()
  })
```

**Pro-tip:** you can have multiple command snapshots.

---

### Show result in the console

```js
// result will get value when command ends
let result
const cmd = Cypress.log({
  consoleProps() {
    return { result }
  }
})
  // custom logic then:
  .then((value) => {
    result = value
    cmd.end()
  })
```

+++

## 3rd party custom commands

- [cypress-map](https://github.com/bahmutov/cypress-map) 👍👍👍
- [cypress-real-events](https://github.com/dmtrKovalenko/cypress-real-events) 👍👍
- [@bahmutov/cy-grep](https://github.com/bahmutov/cy-grep)
- [cypress-recurse](https://github.com/bahmutov/cypress-recurse) 👍
- [cypress-plugin-snapshots](https://github.com/meinaart/cypress-plugin-snapshots)
- [cypress-xpath](https://github.com/cypress-io/cypress-xpath) 🔻

[on.cypress.io/plugins#custom-commands](https://on.cypress.io/plugins#custom-commands)

---

## Try `cypress-xpath`

```sh
# already done in this repo
npm install -D cypress-xpath
```

in `cypress/support/e2e.js`

```js
require('cypress-xpath')
```

+++

With `cypress-xpath`

```js
it('finds list items', () => {
  cy.xpath('//ul[@class="todo-list"]//li').should('have.length', 3)
})
```

---

## Custom command with retries

How does `xpath` command retry the assertions that follow it?

```js
cy.xpath('...') // command
  .should('have.length', 3) // assertions
```

+++

```js
// use cy.verifyUpcomingAssertions
const resolveValue = () => {
  return Cypress.Promise.try(getValue).then((value) => {
    return cy.verifyUpcomingAssertions(value, options, {
      onRetry: resolveValue
    })
  })
}
```

---

## Advanced concepts

- parent vs child command
- overwriting `cy` command

[on.cypress.io/custom-commands](https://on.cypress.io/custom-commands), [https://www.cypress.io/blog/2018/12/20/element-coverage/](https://www.cypress.io/blog/2018/12/20/element-coverage/)

+++

## Example: overwrite `cy.type`

```js
Cypress.Commands.overwrite('type', (type, $el, text, options) => {
  console.log($el)
  return type($el, text, options)
})
```

[https://www.cypress.io/blog/2018/12/20/element-coverage/](https://www.cypress.io/blog/2018/12/20/element-coverage/)

---

## Best practices

- Making reusable function is often faster than writing a custom command
- Know Cypress API to avoid writing what's already available <!-- .element: class="fragment" -->

Read [https://glebbahmutov.com/blog/writing-custom-cypress-command/](https://glebbahmutov.com/blog/writing-custom-cypress-command/) and [https://glebbahmutov.com/blog/publishing-cypress-command/](https://glebbahmutov.com/blog/publishing-cypress-command/)

---

## My Fav Plugins

- https://cypresstips.substack.com/p/my-favorite-cypress-plugins
- https://cypresstips.substack.com/p/my-favorite-cypress-plugins-part

➡️ Pick the [next section](https://github.com/bahmutov/cypress-workshop-basics#contents) or jump to the [10-component-testing](?p=10-component-testing) chapter
