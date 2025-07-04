import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import SignupView from '@/app/[locale]/login/SignupView';
import { signup, googleLoginAction } from '@/app/[locale]/login/actions';

// Mock LocaleSwitcher
vi.mock('@/app/[locale]/components/LocaleSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="locale-switcher">LocaleSwitcher</div>,
}));

// Mock translations
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const map: Record<string, string> = {
      'signup.title1': 'Create Account',
      'button.signup': 'Sign up',
      'button.login': 'Login',
      'placeholder.text1': 'First Name',
      'placeholder.text2': 'Last Name',
      'placeholder.text3': 'Email',
      'placeholder.text4': 'Password',
      'placeholder.text5': 'Confirm Password',
    };
    return (key: string) => map[`${namespace}.${key}`] ?? key;
  },
}));

// Router mock
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
vi.mock('@/app/[locale]/login/actions', async () => {
  return {
    signup: vi.fn(() => Promise.resolve({ name: 'Yoyo Yoyo', email: 'yoyo@example.com' })),
    googleLoginAction: vi.fn(() => Promise.resolve({ name: 'Yoyo Yoyo', email: 'yoyo@example.com' })),
  };
});

// Mock GoogleLogin with multiple buttons for success, empty credential, and error
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: (props: any) => (
    <>
      <button onClick={() => props.onSuccess?.({ credential: 'mock_token' })}>
        Google Login
      </button>
      <button onClick={() => props.onSuccess?.({})} data-testid="google-login-empty" />
      <button onClick={() => props.onError?.()} data-testid="google-login-error" />
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

describe('SignupView', () => {
  it('renders UI elements', () => {
    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    expect(screen.getByText('Create Account')).toBeDefined();
    expect(screen.getByPlaceholderText('First Name')).toBeDefined();
    expect(screen.getByPlaceholderText('Last Name')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeDefined();
    expect(screen.getByText('Google Login')).toBeDefined();
  });

  it('shows error if passwords do not match', async () => {
    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: '456' },
    });

    fireEvent.click(screen.getAllByText('Sign up')[1]);

    expect(await screen.findByText('Passwords do not match')).toBeDefined();
  });

  it('calls signup and stores session on success', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'Yoyo' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Yoyo' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'yoyo@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getAllByText('Sign up')[1]);

    await waitFor(() => {
      expect(sessionStorage.getItem('name')).toBe('Yoyo Yoyo');
      expect(sessionStorage.getItem('email')).toBe('yoyo@example.com');
      expect(push).toHaveBeenCalledWith('/');
    });

    alertSpy.mockRestore();
  });

  it('handles signup error', async () => {
    const error = new Error('Signup failed');
    vi.mocked(signup).mockImplementationOnce(() => { throw error });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'Yoyo' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Yoyo' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'yoyo@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getAllByText('Sign up')[1]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
  });

  it('handles Google signup success', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
      expect(sessionStorage.getItem('name')).toBe('Yoyo Yoyo');
      expect(sessionStorage.getItem('email')).toBe('yoyo@example.com');
      expect(push).toHaveBeenCalledWith('/');
    });

    alertSpy.mockRestore();
  });

  it('handles Google login with no credential', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByTestId('google-login-empty'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('No credential received from Google login.');
    });

    consoleSpy.mockRestore();
  });

  it('handles Google login failure via onError', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByTestId('google-login-error'));

    expect(consoleSpy).toHaveBeenCalledWith('Google Login Failed');

    consoleSpy.mockRestore();
  });

  it('logs error if googleLoginAction throws', async () => {
    const error = new Error('Google failed');
    vi.mocked(googleLoginAction).mockImplementationOnce(() => { throw error });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Something went wrong:', error);
    });

    consoleSpy.mockRestore();
  });
    it('shows alert if googleLoginAction returns undefined', async () => {
    vi.mocked(googleLoginAction).mockImplementationOnce(() => Promise.resolve(undefined));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    fireEvent.click(screen.getByText('Google Login'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Google login failed.');
    });

    alertSpy.mockRestore();
  });
  it('redirects to home on back arrow click', () => {
    const originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    render(<SignupView authMode="signup" onAuthModeChange={() => {}} />);
    const backArrow = screen.getByTestId('back-arrow');
    fireEvent.click(backArrow);

    expect(window.location.href).toBe('/');

    // Optional: restore if needed later
    window.location.href = originalHref;
  });
});
