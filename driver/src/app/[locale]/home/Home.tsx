'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { logout } from '../login/actions';

export default function HomeMenu() {
  const h = useTranslations('home');
  const router = useRouter();
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem('name');
    if (storedName) setName(storedName);
    setMounted(true);
  }, []);

  const menuItems = [
    {
      icon: <AccountBoxIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      text: h('text3'),
      href: '/account',
    },
    {
      icon: <DirectionsCarIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      text: h('text4'),
      href: '/vehicle',
    },
    {
      icon: <DescriptionIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      text: h('text5'),
      href: '/permit',
    },
    {
      icon: <ReceiptLongIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      text: h('text6'),
      href: '/ticket',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        paddingTop: 3,
        paddingBottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Varela Round, sans-serif',
        overflowY: 'auto',
        width: '100%',
      }}
    >
      {/* Greeting Box */}
      {mounted ? (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          style={{ width: '85%', maxWidth: 360, marginBottom: '24px' }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {h('text1')}, {name}
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <Paper
          elevation={0}
          sx={{
            opacity: 0,
            width: '85%',
            maxWidth: 360,
            marginBottom: '24px',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {h('text1')}, {name}
          </Typography>
        </Paper>
      )}

      {/* Menu Grid */}
      {mounted ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '90%',
            maxWidth: 360,
          }}
        >
          {menuItems.map((item, idx) => (
            <Box key={idx} sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ y: 60, x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ y: 0, x: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 18,
                  delay: 0.50 + idx * 0.3,
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <Paper
                  onClick={() => router.push(item.href)}
                  elevation={3}
                  sx={{
                    height: 100,
                    padding: 2,
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {item.icon}
                  <Typography sx={{ mt: 1, fontSize: '14px' }}>{item.text}</Typography>
                </Paper>
              </motion.div>
            </Box>
          ))}

          {/* Logout Button */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 180,
              damping: 18,
              delay: 0.5 + menuItems.length * 0.3,
            }}
          >
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={async () => {
                  sessionStorage.clear();
                  await logout();
                }}
                sx={{
                  background: 'linear-gradient(145deg, #6fcf97, #4e9e24)',
                  color: '#fff',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  paddingY: 1,
                  paddingX: 4,
                  textTransform: 'none',
                  minWidth: '160px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #5bbf7a, #3a7a1c)',
                    transform: 'scale(1.03)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'scale(0.97)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </motion.div>
        </Box>
      ) : (
        <Box sx={{ opacity: 0, width: '90%', maxWidth: 360 }} />
      )}
    </Box>
  );
}
