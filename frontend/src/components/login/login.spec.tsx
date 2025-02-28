import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Login from '@/components/login/login';

describe('Login', () => {
  it('should render the login form for unauthorized user', () => {
    render(
      <Login
        boardName=""
        loggedIn={false}
        setBoardName={() => {}}
        setLoggedIn={() => {}}
        setUsername={() => {}}
        username=""
      />);

    expect(document.getElementById('loginForm')?.textContent).toContain('Create or Join a Board');
  });
});