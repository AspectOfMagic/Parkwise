import React from 'react';
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';

import RootLayout from '../../src/app/layout';

it('renders children within the body tag', () => {
  const testChild = <div data-testid="test-child">Test Content</div>;

  const { getByTestId } = render(<RootLayout>{testChild}</RootLayout>);

  const child = getByTestId('test-child');
  expect(child).toBeDefined();
  expect(child.textContent).toBe('Test Content');
});