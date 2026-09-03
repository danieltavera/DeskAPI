module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'auth-service/src/**/*.js',
    'reservation-service/src/**/*.js',
    'activity-service/src/**/*.js',
    '!**/server.js',
  ],
  coverageReporters: ['text', 'html'],
};
