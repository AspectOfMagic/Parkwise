'use client'

import { useState } from 'react';
import { Button, Snackbar, Alert, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import { issueTicket } from './actions';
import { UUID } from '../../verify';

interface TicketIssueButtonProps {
  vehicleId: UUID;
  licensePlate: string;
  onTicketIssued?: (success: boolean, message: string) => void;
}

export default function TicketIssueButton({
  vehicleId,
  licensePlate,
  onTicketIssued
}: TicketIssueButtonProps) {
  const [issuingTicket, setIssuingTicket] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ success: boolean; message: string } | null>(null);
  const [ticketIssued, setTicketIssued] = useState(false);

  const handleIssueTicket = async () => {
    // if (!vehicleId || !licensePlate) return;

    setIssuingTicket(true);

    try {
      const result = await issueTicket({
        licensePlate,
        location: 'Campus Parking',
        violation: 'No Valid Permit',
        amount: 50, // Fixed amount for simplicity
        vehicleId
      });

      setTicketResult(result);
      setSnackbarOpen(true);

      if (result.success) {
        setTicketIssued(true);
      }

      if (onTicketIssued) {
        onTicketIssued(result.success, result.message);
      }
    } catch (error) {
      console.error("Error issuing ticket:", error);

      const errorResult = {
        success: false,
        message: 'Failed to issue ticket'
      };

      setTicketResult(errorResult);
      setSnackbarOpen(true);

      if (onTicketIssued) {
        onTicketIssued(false, errorResult.message);
      }
    } finally {
      setIssuingTicket(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {!ticketIssued ? (
        <Button
          variant="contained"
          color="error"
          fullWidth
          aria-label='ticket-button'
          disabled={issuingTicket}
          onClick={handleIssueTicket}
          startIcon={<ReportProblemIcon />}
          sx={{
            mt: 2,
            py: 1.2,
            borderRadius: '12px',
            bgcolor: '#ff3d00',
            '&:hover': {
              bgcolor: '#dd2c00'
            }
          }}
        >
          {issuingTicket ? 'Issuing Ticket...' : 'Issue Parking Ticket'}
        </Button>
      ) : (
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mt: 2,
            py: 1.2,
            color: 'success.main',
            fontWeight: 'medium'
          }}
        >
          Ticket successfully issued
        </Typography>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={ticketResult?.success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {ticketResult?.message || ""}
        </Alert>
      </Snackbar>
    </>
  );
}