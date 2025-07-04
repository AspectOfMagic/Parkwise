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
  Avatar,
  styled,
  alpha,
} from '@mui/material';
import Image from 'next/image';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';
import { login } from './actions';

const StyledContainer = styled(Container)({
  padding: 0,
  height: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  }
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '24px',
  height: 'auto',
  width: '90vw',
  maxWidth: '420px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
  position: 'relative',
  zIndex: 1,
}));

const LogoContainer = styled(Box)({
  marginBottom: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

const StyledAvatar = styled(Avatar)(() => ({
  width: 80,
  height: 80,
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
  }
}));

const ContentBox = styled(Box)(() => ({
  width: '100%',
  maxWidth: '350px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: alpha('#f8fafc', 0.8),
    border: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha('#f1f5f9', 0.9),
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
    },
    '& fieldset': {
      border: `1px solid ${alpha('#e2e8f0', 0.5)}`,
    },
    '&:hover fieldset': {
      border: `1px solid ${alpha('#10b981', 0.3)}`,
    },
    '&.Mui-focused fieldset': {
      border: `2px solid #10b981`,
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px 14px',
  },
}));

const ModernButton = styled(Button)(() => ({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  fontWeight: '600',
  fontSize: '1.1rem',
  borderRadius: '16px',
  padding: '16px 0',
  textTransform: 'none',
  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 35px rgba(16, 185, 129, 0.5)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #a0aec0 0%, #9ca3af 100%)',
    transform: 'none',
    boxShadow: '0 5px 15px rgba(160, 174, 192, 0.3)',
  },
}));

const WelcomeText = styled(Typography)({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  marginBottom: '0.5rem',
});

const SubtitleText = styled(Typography)({
  color: '#64748b',
  fontSize: '0.95rem',
  textAlign: 'center',
  marginBottom: '2rem',
});

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.currentTarget
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const authenticated = await login(credentials)
      if (authenticated) {
        window.sessionStorage.setItem('name', authenticated.name)
        router.push('/')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={0}>
        <LogoContainer>
          <StyledAvatar>
            <Image
              src="/parkwiselogo.png"
              alt="ParkWise Logo"
              width={64}
              height={64}
              priority
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
          </StyledAvatar>
          <Box textAlign="center">
            <WelcomeText variant="h4">
              Welcome Back
            </WelcomeText>
            <SubtitleText>
              Sign in to your Admin dashboard
            </SubtitleText>
          </Box>
        </LogoContainer>

        <ContentBox>
          <StyledTextField
            fullWidth
            name="email"
            aria-label="email-input"
            placeholder="Enter your email"
            variant="outlined"
            type="email"
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#10b981', fontSize: '1.3rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            name="password"
            aria-label="pw-input"
            placeholder="Enter your password"
            type="password"
            variant="outlined"
            onChange={handleInputChange}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#10b981', fontSize: '1.3rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <ModernButton 
            fullWidth
            aria-label="login-button"
            variant="contained"
            size="large"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </ModernButton>
        </ContentBox>
      </StyledPaper>
    </StyledContainer>
  );
};
