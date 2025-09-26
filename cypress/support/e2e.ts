// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global setup for cross-browser compatibility testing
beforeEach(() => {
  // Set up error tracking
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as('consoleError')
    cy.spy(win.console, 'warn').as('consoleWarn')
  })

  // Set up performance monitoring
  cy.window().then((win) => {
    win.performance.mark('test-start')
  })
})

afterEach(() => {
  // Check for console errors after each test
  cy.get('@consoleError').should('not.have.been.called')

  // Log performance metrics
  cy.window().then((win) => {
    win.performance.mark('test-end')
    win.performance.measure('test-duration', 'test-start', 'test-end')
  })
})

// Custom assertions for accessibility
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('body').should('have.attr', 'role').or('not.have.attr', 'role')
  cy.get('[role]').should('exist')
  cy.get('h1, h2, h3, h4, h5, h6').should('exist')
})

// Custom command for checking responsive behavior
Cypress.Commands.add('checkResponsive', () => {
  // Test different viewport sizes
  const viewports = [
    { width: 375, height: 667 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1280, height: 720 } // Desktop
  ]

  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')
    // Check for horizontal overflow
    cy.get('body').should('not.have.css', 'overflow-x', 'scroll')
  })
})

// Custom command for performance validation
Cypress.Commands.add('validatePerformance', () => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      expect(loadTime).to.be.lessThan(3000) // 3 second requirement
    }
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      checkA11y(): Chainable<void>
      checkResponsive(): Chainable<void>
      validatePerformance(): Chainable<void>
    }
  }
}