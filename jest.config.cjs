module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/backend/tests/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/frontend/dist/',
    '<rootDir>/.kilo/'
  ],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/coverage/**',
    '!backend/data/uploads/**',
    '!frontend/dist/**'
  ],
  coverageDirectory: 'backend/coverage',
  coverageReporters: ['lcov', 'text', 'json'],
  verbose: true
}
