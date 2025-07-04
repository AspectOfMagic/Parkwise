import '@testing-library/jest-dom';
import {  it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import PrivacyPolicy from '../../../src/app/components/legal/PrivacyPolicy';

afterEach(() => {
  cleanup()
})

it('renders without crashing', () => {
  render(<PrivacyPolicy />);
  expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
});

it('renders all the expected policy text', () => {
  render(<PrivacyPolicy />);

  expect(screen.getByText('Privacy Policy')).toBeInTheDocument();

  expect(screen.getByText(/ParkWise is committed to protecting your privacy/i)).toBeInTheDocument();

  expect(
    screen.getByText(/1. Information We Collect:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/2. How We Use Your Information:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/3. Sharing Your Information:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/4. Data Security:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/5. User Rights:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/6. Changes:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/This policy is for academic and demo purposes/i)
  ).toBeInTheDocument();
});