import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TopBar from './top-bar';

describe('renders the top bar', () => {
  it('should render the top bar for logged out user', () => {
    render(TopBar({ loggedIn: false }));
    expect(document.querySelector('.top-0')).not.toBeNull();
    expect(document.querySelector('.rounded')).toBeNull();
  });

  it('should render the top bar for logged in user', () => {
    const username = 'test';
    render(TopBar({ loggedIn: true, username }));
    expect(document.querySelector('.top-0')).not.toBeNull();
    expect(document.querySelector('.rounded')?.textContent).toEqual(username);
  });
});