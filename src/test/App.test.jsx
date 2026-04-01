import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App'; // Pointing back to your App component

describe('App Component', () => {
  it('renders the application', () => {
    render(<App />);
    
    // This is a basic "smoke test"
    // It passes if the component renders without crashing
    expect(true).toBe(true);
  });
});