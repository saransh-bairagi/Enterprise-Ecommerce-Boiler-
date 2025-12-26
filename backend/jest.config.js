module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/modules/**/*.js',
    '!src/tests/**',
    '!**/node_modules/**',
  ],
};
