export default {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setup/loadEnv.js'],
    globalSetup: '<rootDir>/tests/setup/globalSetup.js',
    globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
    setupFilesAfterEnv: ['<rootDir>/tests/setup/truncate.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    transform: {},
    testTimeout: 20000,
    maxWorkers: 1,
    forceExit: true,
    verbose: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/scripts/**',
        '!src/server.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'tests/reports',
            outputName: 'junit.xml'
        }]
    ]
};
