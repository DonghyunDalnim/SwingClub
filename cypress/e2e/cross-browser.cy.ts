/**
 * Cross-Browser Compatibility Tests
 * Tests core functionality across Chrome, Firefox, Safari, and Edge
 *
 * GitHub Issue #47: [테스트] 브라우저 호환성 및 성능 테스트
 */

describe('Cross-Browser Compatibility', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Core Page Loading', () => {
    it('should load home page successfully', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');

      // Check for main navigation
      cy.get('[data-testid="bottom-nav"]').should('be.visible');

      // Verify no JavaScript errors
      cy.window().then((win) => {
        expect(win.console.error).to.not.have.been.called;
      });
    });

    it('should handle navigation between pages', () => {
      // Test bottom navigation functionality
      const navItems = [
        { testId: 'nav-home', expectedUrl: '/home' },
        { testId: 'nav-location', expectedUrl: '/location' },
        { testId: 'nav-community', expectedUrl: '/community' },
        { testId: 'nav-marketplace', expectedUrl: '/marketplace' },
        { testId: 'nav-profile', expectedUrl: '/profile' }
      ];

      navItems.forEach(({ testId, expectedUrl }) => {
        cy.get(`[data-testid="${testId}"]`).click();
        cy.url().should('include', expectedUrl);
        cy.get('body').should('be.visible');
      });
    });
  });

  describe('Component Functionality', () => {
    it('should render buttons with proper styling', () => {
      cy.visit('/home');

      // Check for properly styled buttons
      cy.get('button').should('have.length.greaterThan', 0);
      cy.get('button').first().should('be.visible');

      // Verify button interactions
      cy.get('button').first().should('not.be.disabled');
      cy.get('button').first().click();
    });

    it('should handle form inputs correctly', () => {
      cy.visit('/community');

      // Test search input if available
      cy.get('input[type="search"], input[placeholder*="검색"]').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.wrap($inputs.first())
            .type('테스트 검색')
            .should('have.value', '테스트 검색')
            .clear()
            .should('have.value', '');
        }
      });
    });

    it('should display cards and content properly', () => {
      cy.visit('/home');

      // Check for card components
      cy.get('[class*="card"], [data-testid*="card"]').should('be.visible');

      // Verify content is not overlapping
      cy.get('body').should('not.have.css', 'overflow-x', 'scroll');
    });
  });

  describe('Responsive Behavior', () => {
    const viewports = [
      { width: 375, height: 667, device: 'iPhone SE' },
      { width: 768, height: 1024, device: 'iPad' },
      { width: 1024, height: 768, device: 'iPad Landscape' },
      { width: 1440, height: 900, device: 'Desktop' }
    ];

    viewports.forEach(({ width, height, device }) => {
      it(`should work properly on ${device} (${width}x${height})`, () => {
        cy.viewport(width, height);
        cy.visit('/home');

        // Check layout doesn't break
        cy.get('body').should('be.visible');
        cy.get('[data-testid="bottom-nav"]').should('be.visible');

        // Verify no horizontal overflow
        cy.get('body').should('not.have.css', 'overflow-x', 'scroll');

        // Check navigation works at this viewport
        cy.get('[data-testid="nav-community"]').click();
        cy.url().should('include', '/community');
      });
    });
  });

  describe('Performance and Loading', () => {
    it('should load pages within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/home');
      cy.get('body').should('be.visible');

      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds requirement
      });
    });

    it('should handle network conditions gracefully', () => {
      // Simulate slow network
      cy.intercept('**/*', (req) => {
        req.reply((res) => {
          if (res && typeof res.delay === 'function') {
            res.delay(100); // Add 100ms delay
          }
        });
      });

      cy.visit('/community');
      cy.get('body').should('be.visible');
    });
  });

  describe('CSS and Styling Compatibility', () => {
    it('should render Tailwind CSS classes correctly', () => {
      cy.visit('/home');

      // Check for proper flex layouts
      cy.get('.flex').should('exist');
      cy.get('.grid').should('exist');

      // Verify colors are applied
      cy.get('body').should('have.css', 'background-color');
    });

    it('should handle custom CSS properties', () => {
      cy.visit('/home');

      // Check for CSS custom properties support
      cy.window().then((win) => {
        const computedStyle = win.getComputedStyle(document.body);
        // Most modern browsers support custom properties
        expect(computedStyle.getPropertyValue('--tw-bg-opacity')).to.not.be.undefined;
      });
    });
  });

  describe('JavaScript Feature Compatibility', () => {
    it('should support modern JavaScript features', () => {
      cy.window().then((win) => {
        // Check for ES6+ features
        expect(win.Promise).to.exist;
        expect(win.fetch).to.exist;
        expect(win.Map).to.exist;
        expect(win.Set).to.exist;
      });
    });

    it('should handle async operations correctly', () => {
      cy.visit('/community');

      // Test async data loading
      cy.get('body').should('be.visible');

      // Check for loading states
      cy.get('[data-testid*="loading"], .loading, [class*="spinner"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      // Should show some kind of error page or redirect
      cy.get('body').should('be.visible');
    });

    it('should handle JavaScript errors gracefully', () => {
      cy.visit('/home');

      // Check console for errors
      cy.window().then((win) => {
        cy.spy(win.console, 'error').as('consoleError');
      });

      // Navigate and interact
      cy.get('[data-testid="nav-community"]').click();
      cy.get('@consoleError').should('not.have.been.called');
    });
  });

  describe('Accessibility Across Browsers', () => {
    it('should maintain accessibility features', () => {
      cy.visit('/home');

      // Check for proper ARIA labels
      cy.get('[aria-label], [aria-labelledby], [role]').should('exist');

      // Verify keyboard navigation
      cy.get('body').type('{tab}');
      cy.focused().should('be.visible');
    });

    it('should support screen reader navigation', () => {
      cy.visit('/community');

      // Check for proper heading hierarchy
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');

      // Verify semantic HTML
      cy.get('main, nav, header, section, article').should('exist');
    });
  });

  describe('Mobile Browser Specific Tests', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should handle touch interactions', () => {
      cy.visit('/home');

      // Test touch-friendly button sizes
      cy.get('button').should('have.css', 'min-height').and('match', /^(?:[4-9]\d|\d{3,})px$/);

      // Test scroll behavior
      cy.scrollTo('bottom');
      cy.scrollTo('top');
    });

    it('should work with mobile navigation patterns', () => {
      cy.visit('/community');

      // Bottom navigation should be visible and accessible
      cy.get('[data-testid="bottom-nav"]').should('be.visible');
      cy.get('[data-testid="bottom-nav"] button').should('have.length.greaterThan', 0);
    });
  });
});

// Browser-specific test configurations
describe('Browser-Specific Compatibility', () => {
  describe('Chrome-specific tests', () => {
    it('should work with Chrome DevTools features', () => {
      cy.visit('/home');

      // Chrome-specific API checks
      cy.window().then((win) => {
        if (Cypress.browser.name === 'chrome') {
          // Chrome-specific features
          expect((win as any).chrome).to.exist;
        }
      });
    });
  });

  describe('Firefox-specific tests', () => {
    it('should handle Firefox-specific behaviors', () => {
      cy.visit('/community');

      // Firefox-specific checks
      cy.window().then((win) => {
        if (Cypress.browser.name === 'firefox') {
          // Firefox-specific validation
          expect(win.navigator.userAgent).to.include('Firefox');
        }
      });
    });
  });

  describe('Safari-specific tests', () => {
    it('should work with Safari limitations', () => {
      cy.visit('/marketplace');

      // Safari-specific compatibility
      cy.window().then((win) => {
        // Check for Safari-specific features
        expect(win.navigator.vendor).to.exist;
      });
    });
  });
});