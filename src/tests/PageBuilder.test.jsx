import { describe, it, expect } from 'vitest';

describe('PageBuilder', () => {
  it('module exports PageBuilder component', async () => {
    const module = await import('../PageBuilder');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('function');
  });

  it('PageBuilder is a React component', async () => {
    const PageBuilder = (await import('../PageBuilder')).default;
    expect(PageBuilder.name).toBe('PageBuilder');
  });
});

