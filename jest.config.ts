import type { Config } from 'jest';

const config: Config = {
  displayName: 'frame-events-api',

  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../jest.preset.js',
};

export default config;
