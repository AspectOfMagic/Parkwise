'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import LocaleSwitcher from '../components/LocaleSwitcher'

import {
  Box,
  Button,
  Typography,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import DoNotSellInfo from '../components/legal/DoNotSellInfo';
import PrivacyPolicy from '../components/legal/PrivacyPolicy';
import TermsOfUse from '../components/legal/TermsOfUse';

export default function Home() {
  const b = useTranslations('body');
  const f = useTranslations('footer');
  const e = useTranslations('enhanced');

  const [fadeIn, setFadeIn] = useState(false);
  const [openDialog, setOpenDialog] = useState<null | 'privacy' | 'terms' | 'sell'>(null);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDialog = (type: 'privacy' | 'terms' | 'sell') => {
    setOpenDialog(type);
  }
  const handleCloseDialog = () => {
    setOpenDialog(null)
  };

  return (
    <Box sx={{ bgcolor: '#1d2a1f', color: '#f5f5f5', minHeight: '100vh' }}>
      {/* Locale Switcher */}
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1100 }}>
        <LocaleSwitcher />
      </Box>

      {/* Only render after client mounts (prevents hydration error) */}
      {fadeIn && (
        <Box sx={{ opacity: 1, transition: 'opacity 0.5s ease-in-out' }}>
          {/* Banner */}
          <Box
            sx={{
              width: '100%',
              backgroundImage: 'url("/banner.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 1,
            }}
          >
            <Box textAlign="center" color="white">
              <Image src="/parkwiselogo.png" alt="ParkWise Logo" width={100} height={100} priority />
              <Typography sx={{ fontSize: 20, fontWeight: 'bold', fontStyle: 'italic', mt: 2 }}>
                {b('slogan1')} <br />
                {b('slogan2')} <br />
                {b('slogan3')}
              </Typography>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ px: 3, py: 5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '22px', fontWeight: 600, mb: 1, color: '#d8e7c5' }}>
              {e('headline')}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: '#c2d2bd', mb: 2 }}>{e('line1')}</Typography>
            <Typography sx={{ fontSize: '13px', color: '#a9b8a1', mb: 4 }}>{e('line2')}</Typography>

            <Button
              onClick={() => (window.location.href = '/driver')}
              sx={{
                backgroundColor: '#BAC095',
                color: '#fff',
                px: 4,
                py: 1.5,
                borderRadius: '20px',
                fontWeight: 500,
                fontSize: '14px',
                boxShadow: '0px 3px 10px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: '#3b741a',
                },
              }}
            >
              {b('button')}
            </Button>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              backgroundColor: '#1d2a1f',
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '80px',
              zIndex: 100,
            }}
          >
            <Box
              sx={{
                height: '1px',
                backgroundColor: '#1d2a1f',
                width: '100vw',
                mx: 'calc(-50vw + 50%)',
                mb: 2,
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: 375,
                mx: 'auto',
                height: '90px',
              }}
            >
              <Box display="flex" alignItems="center" mb={5}>
                <Image src="/parkwiselogo.png" alt="Footer Logo" width={57} height={57} />
                <Typography
                  sx={{
                    width: '115px',
                    height: '36px',
                    color: '#ffffff',
                    fontFamily: '"Varela Round"',
                    fontWeight: 400,
                    fontSize: '26px',
                  }}
                >
                  {f('title')}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'left' }}>
                <Link
                  onClick={() => handleOpenDialog('sell')}
                  underline="hover"
                  color="inherit"
                  sx={{
                    fontFamily: '"Varela Round"',
                    fontSize: '10px',
                    fontWeight: 400,
                    display: 'block',
                    mb: 0.5,
                    cursor: 'pointer',
                  }}
                >
                  {f('line1')}
                </Link>
                <Link
                  onClick={() => handleOpenDialog('privacy')}
                  underline="hover"
                  color="inherit"
                  sx={{
                    fontFamily: '"Varela Round"',
                    fontSize: '10px',
                    fontWeight: 400,
                    display: 'block',
                    mb: 0.5,
                    cursor: 'pointer',
                  }}
                >
                  {f('line2')}
                </Link>
                <Link
                  onClick={() => handleOpenDialog('terms')}
                  underline="hover"
                  color="inherit"
                  sx={{
                    fontFamily: '"Varela Round"',
                    fontSize: '10px',
                    fontWeight: 400,
                    display: 'block',
                    mb: 5,
                    cursor: 'pointer',
                  }}
                >
                  {f('line3')}
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Legal Dialogs */}
      <Dialog
        open={Boolean(openDialog)}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 3,
            minWidth: 300,
            backgroundColor: 'white',
            maxWidth: 600,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Varela Round"',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          {openDialog === 'sell' && 'Do Not Sell My Personal Information'}
          {openDialog === 'privacy' && 'Privacy Policy'}
          {openDialog === 'terms' && 'Terms of Use'}
        </DialogTitle>
        <DialogContent dividers>
          {openDialog === 'sell' && <DoNotSellInfo />}
          {openDialog === 'privacy' && <PrivacyPolicy />}
          {openDialog === 'terms' && <TermsOfUse />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}