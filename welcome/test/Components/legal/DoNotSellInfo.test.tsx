import '@testing-library/jest-dom';
import {  it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import DoNotSellInfo from '../../../src/app/components/legal/DoNotSellInfo';

afterEach(() => {
  cleanup()
})

it('renders without crashing', () => {
  render(<DoNotSellInfo />);
  expect(screen.getByText('Do Not Sell My Personal Information')).toBeInTheDocument();
});

it('contains all exact text content from the component', () => {
    render(<DoNotSellInfo />);
    
    // Heading text
    expect(screen.getByText('Do Not Sell My Personal Information')).toBeInTheDocument();
    
    // First paragraph
    expect(screen.getByText(
      'At ParkWise, we respect your privacy and are committed to protecting your personal information. As part of our dedication to transparency and user control, we do not sell your personal information to third parties.'
    )).toBeInTheDocument();
    
    // Second paragraph
    expect(screen.getByText(
      'The California Consumer Privacy Act (CCPA) grants California residents the right to opt out of the sale of personal data. ParkWise does not engage in such practices. We do not exchange your data for money, services, or any other consideration with external advertisers or data brokers.'
    )).toBeInTheDocument();
    
    // Third paragraph
    expect(screen.getByText(
      'We may share your data with trusted service providers who help us operate the app, such as analytics or hosting services. These parties are contractually obligated to use your data solely for our purposes and not sell or disclose it.'
    )).toBeInTheDocument();
    
    // Fourth paragraph
    expect(screen.getByText(
      'Because ParkWise does not sell your personal data, there is no need for you to opt out. However, if you have any questions or concerns, or would like to verify or delete any personal data we may have, please contact our team using the information provided in the Privacy Policy.'
    )).toBeInTheDocument();
    
    // Fifth paragraph
    expect(screen.getByText(
      'This policy applies to all users of the ParkWise app and website, and will be updated if our data-sharing practices change in the future.'
    )).toBeInTheDocument();
  });