#!/bin/bash

# Script to install required testing dependencies for React component testing

echo "Installing required testing dependencies..."

npm install --save-dev \
  @testing-library/jest-dom@^6.8.0 \
  @testing-library/react@^16.3.0 \
  @testing-library/user-event@^14.6.1 \
  jest-environment-jsdom@^30.1.3

echo "Testing dependencies installed successfully!"
echo ""
echo "You can now run the tests with:"
echo "  npm test                 # Run tests once"
echo "  npm run test:watch       # Run tests in watch mode"
echo "  npm run test:coverage    # Run tests with coverage report"