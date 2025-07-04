'use client';

import React, { ChangeEvent, useState } from 'react';
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
import { signup, googleLoginAction } from './actions';

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

const SignupView = ({ authMode, onAuthModeChange }: AuthViewProps) => {
  const b = useTranslations('button');
  const p = useTranslations('placeholder');
  const s = useTranslations('signup');
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async () => {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const userCreds = {
        name: `${credentials.firstName} ${credentials.lastName}`,
        email: credentials.email,
        password: credentials.password
      };

      const registered = await signup(userCreds);
      if (registered) {
        window.sessionStorage.setItem('name', registered.name);
        window.sessionStorage.setItem('email', registered.email);
        router.push('/');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    console.log(response)
    // check if user exists already
    // if they do, googleLogin
    // otherwise, signup
    if (response.credential) {
      try {
        const user = await googleLoginAction(response.credential);
        if (user) {
          window.sessionStorage.setItem('name', user.name);
          window.sessionStorage.setItem('email', user.email);
          router.push('/');
        } else {
          alert('Google login failed.');
        }
      } catch (e) {
        console.log('Something went wrong:', e);
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
            <Typography variant="h4" align="center" fontWeight="bold" sx={{ flex: 1 }}>
              {s('title1')}
            </Typography>
          </Box>

          <ViewToggleButton
            value={authMode}
            exclusive
            onChange={onAuthModeChange}
            aria-label="authentication mode"
          >
            <ToggleButton value="signup">{b('signup')}</ToggleButton>
            <ToggleButton value="login">{b('login')}</ToggleButton>
          </ViewToggleButton>

          <Box display="flex" gap={2} mb={2}>
            <TextField
              name="firstName"
              fullWidth
              placeholder={p('text1')}
              variant="outlined"
              size="small"
              value={credentials.firstName}
              onChange={handleInputChange}
              InputProps={{ sx: { borderRadius: 25 } }}
            />
            <TextField
              name="lastName"
              fullWidth
              placeholder={p('text2')}
              variant="outlined"
              size="small"
              value={credentials.lastName}
              onChange={handleInputChange}
              InputProps={{ sx: { borderRadius: 25 } }}
            />
          </Box>

          <TextField
            name="email"
            fullWidth
            placeholder={p('text3')}
            variant="outlined"
            size="small"
            margin="normal"
            value={credentials.email}
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
            name="password"
            fullWidth
            placeholder={p('text4')}
            type="password"
            variant="outlined"
            size="small"
            margin="normal"
            value={credentials.password}
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

          <TextField
            name="confirmPassword"
            fullWidth
            placeholder={p('text5')}
            type="password"
            variant="outlined"
            size="small"
            margin="normal"
            value={credentials.confirmPassword}
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

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}

          <Box mt={2}>
            <GreenButton fullWidth variant="contained" size="large" onClick={handleSignup}>
              {b('signup')}
            </GreenButton>
          </Box>

          <Divider sx={{ mt: 2, mb: 2 }}>
            <Typography sx={{ fontFamily: 'Helvetica' }}>Or</Typography>
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
    </StyledContainer>
  );
};

export default SignupView;
