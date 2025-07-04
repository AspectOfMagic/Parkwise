'use client'

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  InputAdornment,
  styled,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';
import LocalParkingIcon from '@mui/icons-material/LocalParking';

import { login } from './actions';

const StyledContainer = styled(Container)({
  padding: '16px',
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '@media (max-width: 600px)': {
    padding: '8px',
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '24px',
  width: '100%',
  maxWidth: '360px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '@media (max-width: 600px)': {
    padding: theme.spacing(2.5),
    borderRadius: '20px',
    margin: '0 8px',
  },
}));

const ContentBox = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const GreenGradientButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 50%, #2e7d32 100%)',
  color: 'white',
  fontWeight: '600',
  borderRadius: '25px',
  padding: '12px 0',
  fontSize: '16px',
  textTransform: 'none',
  boxShadow: '0 4px 15px',
  '&:hover': {
    background: 'linear-gradient(135deg, #43a047 0%, #388e3c 50%, #2e7d32 100%)',
    boxShadow: '0 6px 20px',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.3s ease',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '& fieldset': {
      borderColor: 'rgba(102, 187, 106, 0.3)', // #66bb6a
    },
    '&:hover fieldset': {
      borderColor: 'rgba(102, 187, 106, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#66bb6a',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '16px',
    '@media (max-width: 600px)': {
      fontSize: '16px',
    },
  },
}));

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.currentTarget;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const authenticated = await login(credentials);
      if (authenticated) {
        window.sessionStorage.setItem('name', authenticated.name);
        window.sessionStorage.setItem('accessToken', authenticated.accessToken);
        router.push('/');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper elevation={0}>
        <ContentBox>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '28px',
                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
              }}
            >
              <LocalParkingIcon sx={{ fontSize: 40, color: '#ffffff' }} />
            </Box>
          </Box>

          <Typography 
            variant="h4" 
            align="center" 
            fontWeight="bold" 
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 1,
            }}
          >
            Welcome Back
          </Typography>

          <Typography 
            variant="h6" 
            align="center" 
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: 'text.secondary',
              marginBottom: 3,
              fontWeight: 500,
            }}
          >
            Sign in to your enforcer dashboard
          </Typography>

          <StyledTextField
            fullWidth
            name="email"
            aria-label='email-input'
            placeholder="Enter your email"
            variant="outlined"
            size="medium"
            margin="normal"
            value={credentials.email}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#66bb6a' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            name="password"
            aria-label='pw-input'
            placeholder="Enter your password"
            type="password"
            variant="outlined"
            size="medium"
            margin="normal"
            value={credentials.password}
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#66bb6a' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box mt={3}>
            <GreenGradientButton
              fullWidth
              aria-label='login-button'
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </GreenGradientButton>
          </Box>
        </ContentBox>
      </StyledPaper>
    </StyledContainer>
  );
};
