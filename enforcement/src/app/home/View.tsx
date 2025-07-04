'use client'

import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LogoutIcon from '@mui/icons-material/Logout';

import { useRouter } from 'next/navigation'
import LicensePlateScanner from './CameraPlateScanner';
import { logout } from '../login/actions';

export default function EnforcementPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  };

  return (
    <Box sx={{
      overflowX: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#4E9E24',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          width: '100%',
          top: 0,
          left: 0,
        }}
      >
        <Toolbar>
          <LocalPoliceIcon sx={{ mr: 2.5 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600
            }}
          >
            ParkWise Enforcement
          </Typography>

          <Button
            onClick={handleLogout}
            aria-label='logout-button'
            sx={{
              minWidth: 0,
              padding: 1,
              borderRadius: '50%',
              color: 'white',
              transition: 'background-color 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <LogoutIcon />
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          py: 2,
          paddingTop: '60px',
          px: { xs: 2, sm: 3 }
        }}
        disableGutters
      >
        <Box
          sx={{
            mb: 0.25,
            textAlign: 'center',
            px: 2
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              backgroundColor: '#d8ead8',
              borderRadius: '16px',
              px: 3,
              py: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <DirectionsCarIcon sx={{ color: '#4E9E24', fontSize: '32px' }} />
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  color: '#2a5c0f',
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  wordBreak: 'break-word',
                  margin: 0
                }}
              >
                Parking Permit Verification
              </Typography>
            </Box>
          </Box>
        </Box>

        <LicensePlateScanner />
      </Container>
    </Box>
  );
}