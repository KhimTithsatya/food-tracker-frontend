import { render, screen } from '@testing-library/react';
import App from './App';

test('renders food tracker heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/food tracker/i);
  expect(headingElement).toBeInTheDocument();
});
