/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@ayasemota/firebase$': '<rootDir>/../../packages/firebase/index.ts',
    '^@ayasemota/types$': '<rootDir>/../../packages/types/index.ts',
    '^react$': '<rootDir>/../../node_modules/react'
  }
};
