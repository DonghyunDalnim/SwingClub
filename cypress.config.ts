import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Cross-browser testing configuration
    chromeWebSecurity: false,

    env: {
      // Environment variables for testing
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'testpassword123'
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Browser launch arguments for better compatibility
      on('before:browser:launch', (browser, launchOptions) => {
        // Chrome/Chromium flags for better testing
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-web-security')
          launchOptions.args.push('--disable-features=VizDisplayCompositor')
          launchOptions.args.push('--no-sandbox')
        }

        // Firefox flags
        if (browser.family === 'firefox') {
          launchOptions.args.push('--disable-dev-shm-usage')
        }

        return launchOptions
      })

      // Task for performance validation
      on('task', {
        validatePerformance(metrics) {
          // Custom task to validate performance metrics
          const { loadTime, interactionTime } = metrics

          return {
            loadTime: loadTime < 3000, // 3 second requirement
            interactionTime: interactionTime < 100
          }
        }
      })
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})