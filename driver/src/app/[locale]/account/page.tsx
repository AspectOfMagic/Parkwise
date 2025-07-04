'use client';

import {
  Box,
  Avatar,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AccountPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const p = useTranslations('placeholder');
  const c = useTranslations('contact');

  useEffect(() => {
    const storedName = sessionStorage.getItem('name');
    const storedEmail = sessionStorage.getItem('email');
    setName(storedName);
    setEmail(storedEmail);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const [firstName, lastName] = name?.split(' ') ?? [];

  return (
    <Box
      className="account-background"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 4,
        fontFamily: 'Varela Round, sans-serif',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '90%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(6px)',
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {/* Back Button */}
        <Box
          onClick={() => router.back()}
          sx={{
            position: 'absolute',
            top: 15,
            left: 15,
            cursor: 'pointer',
            color: '#aaa',
            '&:hover': { color: '#888' },
          }}
        >
          <ArrowBackIcon data-testid="back-icon" />
        </Box>

        {/* Avatar + Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Avatar sx={{ width: 64, height: 64, mb: 1 }} />
          <Typography variant="h6">{name}</Typography>
        </Box>

        <Divider />

        {/* Info */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">{p('text1')}</Typography>
          <Typography sx={{ mb: 2 }}>{firstName || ''}</Typography>

          <Typography variant="subtitle2" fontWeight="bold">{p('text2')}</Typography>
          <Typography sx={{ mb: 2 }}>{lastName || ''}</Typography>

          <Typography variant="subtitle2" fontWeight="bold">{c('email')}</Typography>
          <Typography>{email}</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
