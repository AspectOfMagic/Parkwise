'use client';

import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SignupView from './SignupView';
import LoginView from './LoginView';
import Background from '../components/Background';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  const handleAuthModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'signup' | 'login' | null
  ) => {
    if (newMode !== null) {
      setAuthMode(newMode);
    }
  };

  return (
    <GoogleOAuthProvider clientId='695579055672-g224ijr01525qcvrluoj2bdaloprrevh.apps.googleusercontent.com'>
      <Background />

      <div>
        {authMode === 'signup' ? (
          <SignupView authMode={authMode} onAuthModeChange={handleAuthModeChange} />
        ) : (
          <LoginView authMode={authMode} onAuthModeChange={handleAuthModeChange} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
