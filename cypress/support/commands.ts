/// <reference types="cypress" />

// Custom commands for browser compatibility testing

Cypress.Commands.add('tab', () => {
  cy.focused().tab()
})

Cypress.Commands.add('getBrowserInfo', () => {
  cy.window().then((win) => {
    return {
      userAgent: win.navigator.userAgent,
      browser: Cypress.browser.name,
      version: Cypress.browser.version,
      platform: win.navigator.platform
    }
  })
})

Cypress.Commands.add('checkCSSSupport', (property: string, value: string) => {
  cy.window().then((win) => {
    const testElement = win.document.createElement('div')
    testElement.style.setProperty(property, value)

    return testElement.style.getPropertyValue(property) === value
  })
})

Cypress.Commands.add('checkJSFeature', (feature: string) => {
  cy.window().then((win) => {
    switch (feature) {
      case 'fetch':
        return typeof win.fetch === 'function'
      case 'promise':
        return typeof win.Promise === 'function'
      case 'map':
        return typeof win.Map === 'function'
      case 'set':
        return typeof win.Set === 'function'
      case 'arrow-functions':
        try {
          // eslint-disable-next-line no-new-func
          new Function('() => {}')
          return true
        } catch {
          return false
        }
      default:
        return false
    }
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<JQuery<HTMLElement>>
      getBrowserInfo(): Chainable<{
        userAgent: string
        browser: string
        version: string
        platform: string
      }>
      checkCSSSupport(property: string, value: string): Chainable<boolean>
      checkJSFeature(feature: string): Chainable<boolean>
    }
  }
}