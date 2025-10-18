import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Renderer from '../Renderer';

describe('Renderer', () => {
  it('renders without crashing with empty components', () => {
    const { container } = render(<Renderer components={[]} />);
    expect(container).toBeTruthy();
  });

  it('renders heading component', () => {
    const components = [
      { id: '1', type: 'heading', content: 'Test Heading' }
    ];
    
    render(<Renderer components={components} />);
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders text component with markdown', () => {
    const components = [
      { id: '1', type: 'text', content: 'Test Content' }
    ];
    
    render(<Renderer components={components} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders button component', () => {
    const components = [
      { id: '1', type: 'button', content: 'Click Me', href: '/test' }
    ];
    
    render(<Renderer components={components} />);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('A');
  });

  it('renders image component', () => {
    const components = [
      { id: '1', type: 'image', content: 'https://example.com/test.jpg' }
    ];
    
    render(<Renderer components={components} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/test.jpg');
  });

  it('renders divider component', () => {
    const components = [
      { id: '1', type: 'divider' }
    ];
    
    const { container } = render(<Renderer components={components} />);
    const divider = container.querySelector('.divider');
    expect(divider).toBeInTheDocument();
  });

  it('renders spacer component', () => {
    const components = [
      { id: '1', type: 'spacer' }
    ];
    
    const { container } = render(<Renderer components={components} />);
    const spacer = container.querySelector('.h-12');
    expect(spacer).toBeInTheDocument();
  });

  it('applies custom className to components', () => {
    const components = [
      { id: '1', type: 'heading', content: 'Test', className: 'custom-heading' }
    ];
    
    const { container } = render(<Renderer components={components} />);
    expect(container.querySelector('.custom-heading')).toBeInTheDocument();
  });

  it('renders nested columns with children', () => {
    const components = [
      {
        id: '1',
        type: 'columns',
        children: [
          { id: '2', type: 'heading', content: 'Column 1' },
          { id: '3', type: 'heading', content: 'Column 2' }
        ]
      }
    ];
    
    render(<Renderer components={components} />);
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
  });

  it('renders multiple components in order', () => {
    const components = [
      { id: '1', type: 'heading', content: 'First' },
      { id: '2', type: 'text', content: 'Second' },
      { id: '3', type: 'button', content: 'Third', href: '#' }
    ];
    
    render(<Renderer components={components} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});

