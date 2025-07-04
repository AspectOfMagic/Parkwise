import React from 'react';
import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { checkVehiclePermit } from '../../src/app/home/actions';
import LicensePlateScanner from '../../src/app/home/CameraPlateScanner';

process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY = 'test-key';

const mockGetScreenshot = vi.fn().mockReturnValue('data:image/jpeg;base64,mockImageData123');
vi.mock('react-webcam', async () => {
  const MockWebcam = React.forwardRef((_props: any, ref: any) => {
    if (ref) {
      ref.current = {
        getScreenshot: mockGetScreenshot
      };
    }
    return <div>Mock Webcam</div>;
  });

  MockWebcam.displayName = 'MockWebcam';

  return {
    __esModule: true,
    default: MockWebcam
  };
});

const mockResponse = {
  hasValidPermit: false,
  message: 'Test vehicle found',
  vehicle: {
    id: '123',
    make: 'Toyota',
    model: 'Prius',
    plate: 'ABC123',
    ownerId: '456'
  }
};

vi.mock('../../src/app/home/actions', () => ({
  checkVehiclePermit: vi.fn(),
  issueTicket: vi.fn()
}));

vi.mock('server-only', () => ({}));

beforeEach(() => {
  vi.restoreAllMocks();

  // Set the mock implementation for checkVehiclePermit for each test
  vi.mocked(checkVehiclePermit).mockResolvedValue(mockResponse);

  // Mock fetch for all tests with a default response
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { GetByPlate: null } }),
    } as Response)
  );
});

afterEach(() => {
  cleanup();
});

it('handles entering plate number', async () => {
  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.type(screen.getByPlaceholderText('e.g. ABC123'), 'ABC123');

  await user.click(screen.getByLabelText('check-button'));

  expect(screen.getByText('Test vehicle found')).toBeDefined();
});

it('resets properly', async () => {
  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.type(screen.getByPlaceholderText('e.g. ABC123'), 'ABC123');

  await user.click(screen.getByLabelText('check-button'));

  await user.click(screen.getByLabelText('reset-button'));

  expect(screen.getByText('License Plate Scanner')).toBeDefined();
});

it('handles error when retrieving vehicle information', async () => {
  // Override the mock to reject with an error for this test only
  vi.mocked(checkVehiclePermit).mockRejectedValueOnce(new Error('API Error'));

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.type(screen.getByPlaceholderText('e.g. ABC123'), 'ABC123');

  await user.click(screen.getByLabelText('check-button'));

  expect(screen.getByText('Failed to retrieve vehicle information. Please try again.')).toBeDefined();

  expect(screen.queryByText('Vehicle Information')).toBeNull();
});

it('issues ticket successfully', async () => {
  vi.mocked(checkVehiclePermit).mockResolvedValue(mockResponse);

  const { issueTicket } = await import('../../src/app/home/actions');
  vi.mocked(issueTicket).mockResolvedValue({
    success: true,
    message: 'Ticket issued successfully',
    ticket: {
      id: '123',
      vehicleId: '123',
      licensePlate: 'ABC123',
      timestamp: new Date().toISOString(),
      location: 'Campus Parking',
      violation: 'No Valid Permit',
      amount: 50,
      isPaid: false,
      enforcerId: '456'
    }
  });

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.type(screen.getByPlaceholderText('e.g. ABC123'), 'ABC123');
  await user.click(screen.getByLabelText('check-button'));

  await screen.findByText('Vehicle Information');

  const ticketButton = screen.getByLabelText('ticket-button');
  await user.click(ticketButton);

  expect(screen.getByText('Ticket issued successfully')).toBeDefined();
});

it('displays valid permit status when vehicle has a valid permit', async () => {
  const validPermitResponse = {
    ...mockResponse,
    hasValidPermit: true,
    message: 'Vehicle has a valid permit'
  };

  vi.mocked(checkVehiclePermit).mockResolvedValue(validPermitResponse);

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.type(screen.getByPlaceholderText('e.g. ABC123'), 'ABC123');
  await user.click(screen.getByLabelText('check-button'));

  await screen.findByText('Vehicle Information');

  expect(screen.getByText('Valid')).toBeDefined();
});

it('processes license plate from captured image', async () => {
  process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY = 'test-key';

  const mockFetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        results: [{
          plate: 'XYZ789',
          score: 0.95,
          region: { code: 'US-NY' }
        }]
      }),
    } as unknown as Response);

  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);

  vi.mocked(checkVehiclePermit).mockResolvedValue({
    ...mockResponse,
    vehicle: {
      ...mockResponse.vehicle,
      plate: 'XYZ789'
    }
  });

  mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData123');

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.click(screen.getByRole('tab', { name: /camera/i }));

  const captureButton = screen.getByLabelText('capture-button');
  await user.click(captureButton);

  expect(mockGetScreenshot).toHaveBeenCalled();

  const readButton = screen.getByLabelText('read-button');
  await user.click(readButton);

  expect(mockFetch).toHaveBeenCalled();

  expect(vi.mocked(checkVehiclePermit)).toHaveBeenCalledWith('XYZ789', 'NY');
});

it('allows retaking image capture', async () => {
  const mockFetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        results: [{
          plate: 'XYZ789',
          score: 0.95,
          region: { code: 'US-NY' }
        }]
      }),
    } as unknown as Response);

  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);

  vi.mocked(checkVehiclePermit).mockResolvedValue({
    ...mockResponse,
    vehicle: {
      ...mockResponse.vehicle,
      plate: 'XYZ789'
    }
  });

  mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData123');

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.click(screen.getByRole('tab', { name: /camera/i }));

  const captureButton = screen.getByLabelText('capture-button');
  await user.click(captureButton);

  const retakeButton = screen.getByLabelText('retake-button');
  await user.click(retakeButton);

  expect(mockFetch).not.toHaveBeenCalled();
  expect(vi.mocked(checkVehiclePermit)).not.toHaveBeenCalled();
  expect(screen.getByLabelText('capture-button')).toBeDefined();
});

it('shows error if API key is missing when processing image', async () => {
  delete process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY;

  const mockFetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        results: [{
          plate: 'XYZ789',
          score: 0.95,
          region: { code: 'US-NY' }
        }]
      }),
    } as unknown as Response);

  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);

  vi.mocked(checkVehiclePermit).mockResolvedValue({
    ...mockResponse,
    vehicle: {
      ...mockResponse.vehicle,
      plate: 'XYZ789'
    }
  });

  mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData123');

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.click(screen.getByRole('tab', { name: /camera/i }));

  await user.click(screen.getByLabelText('capture-button'));

  await user.click(screen.getByLabelText('read-button'));

  expect(await screen.findByText('Configuration error: API key is missing')).toBeDefined();
});

it('handles API response error when processing image', async () => {
  process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY = 'test-key';

  const mockFetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    text: () => Promise.resolve('Invalid image format'),
  } as Response);

  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);

  vi.mocked(checkVehiclePermit).mockResolvedValue({
    ...mockResponse,
    vehicle: {
      ...mockResponse.vehicle,
      plate: 'XYZ789'
    }
  });

  mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData123');

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.click(screen.getByRole('tab', { name: /camera/i }));

  await user.click(screen.getByLabelText('capture-button'));

  await user.click(screen.getByLabelText('read-button'));

  expect(await screen.findByText('Failed to process image: API request failed: 400')).toBeDefined();
});

it('shows error when no license plate is detected in the image', async () => {
  process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY = 'test-key';

  const mockFetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      results: [] // Empty array means no plates detected
    }),
  } as Response);

  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);

  mockGetScreenshot.mockReturnValue('data:image/jpeg;base64,mockImageData123');

  const user = userEvent.setup();

  render(<LicensePlateScanner />);

  await user.click(screen.getByRole('tab', { name: /camera/i }));

  await user.click(screen.getByLabelText('capture-button'));

  await user.click(screen.getByLabelText('read-button'));

  expect(await screen.findByText('No license plate detected. Try again or enter manually.')).toBeDefined();
});