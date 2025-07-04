import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import LoginView from '@/app/[locale]/login/LoginView';

// Mock LocaleSwitcher
vi.mock('@/app/[locale]/components/LocaleSwitcherLogin', () => ({
  __esModule: true,
  default: () => <div data-testid="locale-switcher">LocaleSwitcherLogin</div>,
}));

// Mock translations with correct nested keys
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const map: Record<string, string> = {
      'login.title': 'Login to ParkWise',
      'login.text3': 'or login with',
      'button.signup': 'Sign up',
      'button.login': 'Login',
      'placeholder.text3': 'Email',
      'placeholder.text4': 'Password',
    };

    return (key: string) => {
      return map[`${namespace}.${key}`] ?? key;
    };
  },
}));

// Mock router
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/mock-path',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/mock-path',
}));

// Mock login actions
vi.mock('@/app/[locale]/login/actions', () => ({
  login: vi.fn(() => Promise.resolve({ name: 'John', email: 'john@example.com' })),
  googleLoginAction: vi.fn(() => Promise.resolve({ name: 'John', email: 'john@example.com' })),
}));

// Mock GoogleLogin component with both success and error handlers
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: (props: any) => (
    <>
      <button onClick={() => props.onSuccess?.({ credential: 'mock_token' })}>
        Google Login
      </button>
      <button onClick={() => props.onError?.()} data-testid="google-login-error">
        Trigger Google Error
      </button>
    </>
  ),
}));


beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('LoginView', () => {
  it('renders UI elements correctly', () => {
    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);

    expect(screen.getByText('Login to ParkWise')).toBeDefined();
    expect(screen.getAllByText('Login')[0]).toBeDefined(); // ToggleButton
    expect(screen.getAllByText('Login')[1]).toBeDefined(); // Submit Button
    expect(screen.getByText('Sign up')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByTestId('locale-switcher')).toBeDefined();
    expect(screen.getByText('Google Login')).toBeDefined();
  });

  it('calls login and stores user session on login', async () => {
    const { login } = await import('@/app/[locale]/login/actions');

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    // Click the actual login submit button (2nd "Login")
    fireEvent.click(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });

  it('handles Google login and sets session', async () => {
    const { googleLoginAction } = await import('@/app/[locale]/login/actions');

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
      expect(googleLoginAction).toHaveBeenCalledWith('mock_token');
      expect(sessionStorage.getItem('name')).toBe('John');
      expect(sessionStorage.getItem('email')).toBe('john@example.com');
      expect(push).toHaveBeenCalledWith('/');
    });
  });
  it('logs failure if googleLoginAction returns null', async () => {
    const { googleLoginAction } = await import('@/app/[locale]/login/actions');
    // @ts-ignore override mock implementation
    googleLoginAction.mockResolvedValueOnce(null);
    const consoleSpy = vi.spyOn(console, 'log');

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Google login failed');
    });

    consoleSpy.mockRestore();
    });
    it('handles Google login failure via onError', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByTestId('google-login-error'));

    expect(consoleSpy).toHaveBeenCalledWith('Google Login Failed');

    consoleSpy.mockRestore();
    });
    it('logs error if login throws', async () => {
    const { login } = await import('@/app/[locale]/login/actions');
    const error = new Error('Login failed');
    (login as any).mockImplementationOnce(() => { throw error });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getAllByText('Login')[1]);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
    });
    it('logs error if googleLoginAction throws', async () => {
    const { googleLoginAction } = await import('@/app/[locale]/login/actions');
    const error = new Error('Google failed');
    (googleLoginAction as any).mockImplementationOnce(() => { throw error });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(`Google login failed: ${error}`);
    });

    consoleSpy.mockRestore();
    });
    it('logs error if Google login response has no credential', async () => {
    // Reset module cache so we can apply a fresh mock
    vi.resetModules();

    // Mock GoogleLogin to simulate missing credential
    vi.doMock('@react-oauth/google', () => ({
        GoogleLogin: (props: any) => (
        <button onClick={() => props.onSuccess?.({})}>Google Login</button>
        )
    }));

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Re-import after mock
    const { default: LoginView } = await import('@/app/[locale]/login/LoginView');

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('No credential received from Google login.');
    });

    consoleSpy.mockRestore();
    });

  it('redirects to home on back arrow click', () => {
    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    render(<LoginView authMode="login" onAuthModeChange={() => {}} />);
    const backArrow = screen.getByTestId('back-arrow');
    fireEvent.click(backArrow);

    expect(window.location.href).toBe('/');

    // Optional: restore if needed later
    window.location.href = originalHref;
  });
});
