import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup/test-environment.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/contracts/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        statements: 40,
        branches: 30,
        functions: 40,
        lines: 45,
      },
      reportsDirectory: './coverage',
      include: [
        'src/helpers/localStorage/save.tsx',
        'src/features/grades/services/**/*.ts',
        'src/features/tuition/services/financial-logic.ts',
        'src/logic/import-preview.ts',
        'src/logic/import-metadata.ts',
        'src/logic/scheduler/**/*.ts',
        'src/features/group-schedule/services/group-scheduler.ts',
        'src/features/user-guide/services/**/*.ts',
      ],
      exclude: ['**/*.d.ts'],
    },
  },
});
