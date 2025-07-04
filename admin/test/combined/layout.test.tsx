import React from 'react';
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';

import RootLayout from '../../src/app/layout';

it('renders children within the body tag', () => {
  const testChild = <div aria-label="test-child">Test Content</div>;

  const { getByLabelText } = render(<RootLayout>{testChild}</RootLayout>);

  const child = getByLabelText('test-child');
  expect(child).toBeDefined();
  expect(child.textContent).toBe('Test Content');
});
