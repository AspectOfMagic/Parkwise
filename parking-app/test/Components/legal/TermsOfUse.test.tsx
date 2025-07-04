import '@testing-library/jest-dom';
import {  it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import TermsOfUse from '../../../src/app/components/legal/TermsOfUse';

afterEach(() => {
  cleanup()
})

it('renders without crashing', () => {
  render(<TermsOfUse />);
  expect(screen.getByText('Terms of Use')).toBeInTheDocument();
});

it('renders all expected terms text', () => {
  render(<TermsOfUse />);

  expect(screen.getByText('Terms of Use')).toBeInTheDocument();

  expect(
    screen.getByText(/Welcome to ParkWise\. By accessing or using our app/i)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/1. Use of the App:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/2. Account Responsibilities:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/3. Intellectual Property:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/4. Disclaimers:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/5. Limitation of Liability:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/6. Changes to Terms:/)
  ).toBeInTheDocument();

  expect(
    screen.getByText(/These Terms of Use are for academic purposes only/i)
  ).toBeInTheDocument();
});