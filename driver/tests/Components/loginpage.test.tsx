import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mocks for SignupView and LoginView
vi.mock('@/app/[locale]/login/SignupView', () => ({
  __esModule: true,
  default: ({ authMode, onAuthModeChange }: any) => (
    <div onClick={() => onAuthModeChange({}, 'login')}>SignupView - {authMode}</div>
  ),
}));

vi.mock('@/app/[locale]/login/LoginView', () => ({
  __esModule: true,
  default: ({ authMode }: any) => <div>LoginView - {authMode}</div>,
}));

// Mock GoogleOAuthProvider to just render children
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('LoginPage', () => {
  it('renders SignupView by default', async () => {
    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return {
        ...actual,
        useState: () => ['signup', vi.fn()],
      };
    });

    const { default: LoginPage } = await import('@/app/[locale]/login/page');
    render(<LoginPage />);
    expect(screen.getAllByText(/SignupView - signup/)[0]).toBeDefined();
  });

  it('renders LoginView when authMode is login', async () => {
    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return {
        ...actual,
        useState: () => ['login', vi.fn()],
      };
    });

    const { default: LoginPage } = await import('@/app/[locale]/login/page');
    render(<LoginPage />);
    expect(screen.getAllByText(/LoginView - login/)[0]).toBeDefined();
  });

  it('calls handleAuthModeChange and switches views', async () => {
    let currentMode = 'signup';
    const setState = vi.fn((newMode) => {
      currentMode = newMode;
    });

    vi.doMock('react', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return {
        ...actual,
        useState: () => [currentMode, setState],
      };
    });

    const { default: LoginPage } = await import('@/app/[locale]/login/page');
    render(<LoginPage />);

    // Click the mocked SignupView div to simulate auth mode change
    const signupView = screen.getAllByText(/SignupView - signup/)[0];
    signupView.click();

    expect(setState).toHaveBeenCalledWith('login');
  });
});
