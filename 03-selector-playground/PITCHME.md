## ☀️ Part 3: Selector playground

### 📚 You will learn

- Cypress Selector Playground tool
- best practices for selecting elements
- Cypress Studio for recording tests

+++

- keep `todomvc` app running
- open `03-selector-playground/spec.js`

---

> How do we select element in `cy.get(...)`?

- Browser's DevTools can suggest selector

+++

![Chrome suggests selector](./img/chrome-copy-js-path.png)

+++

Open "Selector Playground"

![Selector playground button](./img/selector-button.png)

+++

Selector playground can suggest much better selectors.

![Selector playground](./img/selector-playground.png)

+++

⚠️ It can suggest a weird selector

![Default suggestion](./img/default-suggestion.png)

+++

Read [best-practices.html#Selecting-Elements](https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements)

![Best practice](./img/best-practice.png)

+++

## Todo

- add test data ids to `todomvc/index.html` DOM markup
- use new selectors to write `cypress/integration/03-selector-playground/spec.js`

```js
// fill the selector, maybe use "tid" function
cy.get('...').should('have.length', 2)
```

Note:
The updated test should look something like the next image

+++

![Selectors](./img/selectors.png)

+++

## Cypress is just JavaScript

```js
import { selectors, tid } from './common-selectors'
it('finds element', () => {
  cy.get(selectors.todoInput).type('something{enter}')

  // "tid" forms "data-test-id" attribute selector
  // like "[data-test-id='item']"
  cy.get(tid('item')).should('have.length', 1)
})
```

---

## Cypress Studio

Record tests by clicking on the page

```json
{
  "experimentalStudio": true
}
```

Watch 📹 [Record A Test Using Cypress Studio](https://www.youtube.com/watch?v=kBYtqsK-8Aw) and read [https://on.cypress.io/studio](https://on.cypress.io/studio).

+++

## Start recording

![open Cypress Studio](./img/start-studio.png)

---

## 🏁 Selecting Elements

- Use Selector Playground
- follow [https://on.cypress.io/best-practices#Selecting-Elements](https://on.cypress.io/best-practices#Selecting-Elements)
- **bonus:** try [@testing-library/cypress](https://testing-library.com/docs/cypress-testing-library/intro)

+++

## 🏁 Quickly write tests

- pick elements using Selector Playground
- record tests using Cypress Studio

➡️ Pick the [next section](https://github.com/bahmutov/cypress-workshop-basics#contents)
