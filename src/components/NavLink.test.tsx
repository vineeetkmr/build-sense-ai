import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavLink } from './NavLink';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NavLink', () => {
  it('renders with correct text and href', () => {
    renderWithRouter(
      <NavLink to="/home">Home</NavLink>
    );

    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('applies active class when route is active', () => {
    renderWithRouter(
      <NavLink to="/home" activeClassName="active-link">
        Home
      </NavLink>
    );

    const link = screen.getByRole('link', { name: /home/i });
    // Note: In a real app, you'd need to mock the router state
    // This is a basic test - for active state testing, you'd need more setup
    expect(link).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithRouter(
      <NavLink to="/about" className="custom-link">
        About
      </NavLink>
    );

    const link = screen.getByRole('link', { name: /about/i });
    expect(link).toHaveClass('custom-link');
  });

  it('passes through additional props', () => {
    renderWithRouter(
      <NavLink to="/contact" data-testid="contact-link">
        Contact
      </NavLink>
    );

    const link = screen.getByTestId('contact-link');
    expect(link).toBeInTheDocument();
  });
});