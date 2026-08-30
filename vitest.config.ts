import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: [
      'src/app/ui/course-card/course-card.component.spec.ts',
      'src/app/services/enrollment.service.spec.ts',
      'src/app/store/enrollment.store.spec.ts'
    ]
  },
});
