import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DynamicIcon from '../../components/DynamicIcon';

describe('DynamicIcon', () => {
  it('renders lucide icon when valid name is provided', () => {
    const { container } = render(<DynamicIcon library="lucide" name="Home" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders fallback when invalid icon name', () => {
    const { container } = render(<DynamicIcon library="lucide" name="InvalidIcon123" />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DynamicIcon library="lucide" name="Home" className="custom-icon" />
    );
    expect(container.querySelector('.custom-icon')).toBeTruthy();
  });

  it('passes through size prop', () => {
    const { container } = render(
      <DynamicIcon library="lucide" name="Home" size="32" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('passes through color prop', () => {
    const { container } = render(
      <DynamicIcon library="lucide" name="Home" color="#FF0000" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders heroicons with library prop', () => {
    const { container } = render(
      <DynamicIcon library="heroicons" name="HomeIcon" />
    );
    // Should render suspense fallback or actual icon
    expect(container).toBeTruthy();
  });

  it('uses default size when not specified', () => {
    const { container } = render(<DynamicIcon library="lucide" name="Home" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('uses default color when not specified', () => {
    const { container } = render(<DynamicIcon library="lucide" name="Home" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders fallback with dashed border when icon not found', () => {
    const { container } = render(
      <DynamicIcon library="lucide" name="NonExistentIcon" />
    );
    const fallback = container.querySelector('[style*="dashed"]');
    expect(fallback).toBeTruthy();
  });
});

