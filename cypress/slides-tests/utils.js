/// <reference types="cypress" />

import { updateRelativeUrls } from '../../slides-utils'

describe('Slides utils', () => {
  const baseUrl = '/slides/'

  it('changes relative image links', () => {
    const md = '![JSDoc example](./img/jsdoc.png)'

    const changed = updateRelativeUrls(baseUrl, md)

    if (changed !== '![JSDoc example](/slides/img/jsdoc.png)') {
      throw new Error(`Expected changed to be ${md}, got ${changed}`)
    }
  })

  it('does not change other dots', () => {
    const md = "import '../../support/hooks'"
    const changed = updateRelativeUrls(baseUrl, md)
    expect(changed, 'should not change').to.equal(md)
  })
})
