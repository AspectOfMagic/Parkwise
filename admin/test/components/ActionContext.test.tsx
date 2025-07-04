import { renderHook } from '@testing-library/react';
import { useSelectedAction, ActionProvider } from '@/app/components/ActionContext';
import { describe, it, expect } from 'vitest';

describe('useSelectedAction', () => {
  it('returns context values when used inside ActionProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ActionProvider>{children}</ActionProvider>
    );

    const { result } = renderHook(() => useSelectedAction(), { wrapper });

    expect(result.current.selectedAction).toBe(null);
    result.current.setSelectedAction('DELETE');
    expect(result.current.setSelectedAction).toBeTypeOf('function');
  });

  it('throws error when used outside of ActionProvider', () => {
    expect(() => renderHook(() => useSelectedAction())).toThrow(
      'useSelectedAction must be used within a ActionProvider'
    );
  });
});
