'use client'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Alert,
  Chip
} from '@mui/material';

import TicketIssueButton from './TicketIssueButton';

export interface VehicleInfo {
  id?: string;
  make: string | undefined;
  model: string | undefined;
  permitStatus: boolean | undefined;
  licensePlate?: string;
  state?: string;
}

interface VehicleInfoCardProps {
  error: string | null;
  vehicleInfo: VehicleInfo | null;
  permitStatus: PermitInfo | null;
  onTicketIssued?: (success: boolean, message: string) => void;
}

export interface PermitInfo {
  status: string | undefined;
  // type: string | undefined;
}

export default function VehicleInfoCard({
  error,
  vehicleInfo,
  permitStatus,
  onTicketIssued
}: VehicleInfoCardProps) {
  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  if (!vehicleInfo) {
    return <Alert severity="info" sx={{ my: 2 }}>No vehicle information found.</Alert>;
  }

  // Determine the status color
  const statusColor = permitStatus?.status === 'Valid' ? 'success' : 'error';
  // Show ticket button only for invalid permits when we have a vehicle ID
  const showTicketButton = permitStatus?.status !== 'Valid' && vehicleInfo.id;

  return (
    <Card sx={{
      my: 3,
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #4E9E24'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#2a5c0f', fontWeight: 600 }}>
          Vehicle Information
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Make</Typography>
            <Typography variant="body1">{vehicleInfo.make}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Model</Typography>
            <Typography variant="body1">{vehicleInfo.model}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ color: '#2a5c0f', fontWeight: 600 }}>
          Permit Status
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Chip
              label={permitStatus?.status}
              color={statusColor}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {showTicketButton && vehicleInfo.licensePlate && (
          <TicketIssueButton
            vehicleId={vehicleInfo.id!}
            licensePlate={vehicleInfo.licensePlate}
            onTicketIssued={onTicketIssued}
          />
        )}
      </CardContent>
    </Card>
  );
}