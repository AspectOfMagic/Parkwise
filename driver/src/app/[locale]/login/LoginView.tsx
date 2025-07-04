'use client';

import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  styled,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import LocaleSwitcherLogin from '@/app/[locale]/components/LocaleSwitcherLogin';
import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation';
import { login, googleLoginAction } from './actions';

type AuthViewProps = {
  authMode: 'signup' | 'login';
  onAuthModeChange: (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'signup' | 'login' | null
  ) => void;
};

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: '15%',
  borderRadius: '20px',
  height: '530px',
  maxWidth: '90vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const ContentBox = styled(Box)(() => ({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
}));

const GreenButton = styled(Button)(() => ({
  backgroundColor: '#4E9E24',
  color: 'black',
  fontWeight: 'medium',
  borderRadius: 25,
  padding: '10px 0',
  '&:hover': {
    backgroundColor: '#67A344',
  },
}));

const ViewToggleButton = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
  borderRadius: 25,
  backgroundColor: '#f0f0f0',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: 25,
    width: '50%',
    textTransform: 'none',
    color: 'black',
    '&.Mui-selected': {
      backgroundColor: '#4E9E24',
      color: 'black',
      fontWeight: 'medium',
    },
  },
}));

const LoginView = ({ authMode, onAuthModeChange }: AuthViewProps) => {
  const [credentials, setCredentials] = useState({email: '', password: ''})
  const router = useRouter()

  const b = useTranslations('button');
  const p = useTranslations('placeholder');
  const l = useTranslations('login');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value, name} = event.currentTarget
    const u = credentials
    if (name == 'email') {
      u.email = value
    } else {
      u.password = value
    }
    setCredentials(u)
  }

  const handleLogin = async () => {
    try {
      const authenticated = await login(credentials)
      if (authenticated) {
        window.sessionStorage.setItem('name', authenticated.name)
        window.sessionStorage.setItem('email', authenticated.email)
        router.push('/')
      }
    } catch (e) {
      console.log(e)
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (response.credential) {
      try {
        const user = await googleLoginAction(response.credential);
        if (user) {
          window.sessionStorage.setItem('name', user.name);
          window.sessionStorage.setItem('email', user.email);
          router.push('/')
        } else {
          console.log('Google login failed')
        }
      } catch(e) {
        console.log(`Google login failed: ${e}`);
      }
    } else {
      console.error('No credential received from Google login.');
    }
  };

  return (
    <StyledContainer>
      <StyledPaper elevation={3}>
        <Box
          sx={{
            position: 'fixed',
            top: 10,
            right: 30,
            zIndex: 1300,
          }}
        >
          <LocaleSwitcherLogin />
        </Box>
        <ContentBox>
        <Box display="flex" alignItems="center" mb={1}>
        <Box
          data-testid="back-arrow"
          onClick={() => (window.location.href = '/')}
          sx={{
            position: 'absolute',
            top: 15,
            left: 15,
            cursor: 'pointer',
            color: '#aaa',
            '&:hover': { color: '#888' },
          }}
        >
          <ArrowBackIcon />
        </Box>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            {l('title')}
          </Typography>
        </Box>
          <Box mb={1}></Box>

          <ViewToggleButton
            value={authMode}
            exclusive
            onChange={onAuthModeChange}
            aria-label="authentication mode"
          >
            <ToggleButton value="signup">{b('signup')}</ToggleButton>
            <ToggleButton value="login">{b('login')}</ToggleButton>
          </ViewToggleButton>

          <TextField
            fullWidth
            name="email"
            placeholder={p('text3')}
            variant="outlined"
            size="small"
            margin="normal"
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 25 },
            }}
          />

          <TextField
            fullWidth
            name="password"
            placeholder={p('text4')}
            type="password"
            variant="outlined"
            size="small"
            margin="normal"
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 25 },
            }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          </Box>

          <Box mt={3}>
            <GreenButton fullWidth variant="contained" size="large" onClick={handleLogin}>
              {b('login')}
            </GreenButton>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography sx={{ fontFamily: 'Helvetica' }}>{l('text3')}</Typography>
          </Divider>

          <Box display="flex" justifyContent="center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Google Login Failed');
              }}
            />
          </Box>
        </ContentBox>
      </StyledPaper>
      <Box />
    </StyledContainer>
  );
};

export default LoginView;
