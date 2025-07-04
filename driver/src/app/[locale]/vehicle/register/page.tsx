'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MUILink,
  Breadcrumbs,
  Paper,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import Header from '../../home/Header';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { registerVehicle } from '../actions';

export default function RegisterVehiclePage() {
  const router = useRouter();
  const v = useTranslations('vehicle');

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [state, setState] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(false);

  const allFilled = plate && make && model && year && color && state;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await registerVehicle(make, model, plate, year, color, state);
      if (response?.id) {
        // Clear all fields
        setMake('');
        setModel('');
        setPlate('');
        setYear('');
        setColor('');
        setState('');

        // Show popup + checkmark and redirect
        setShowPopup(true);
        setTimeout(() => setSuccess(true), 1200); // checkmark
        setTimeout(() => router.push('/vehicle'), 2500); // redirect
      }
    } catch (err) {
      console.log(err);
    }
  }

  const fields = [
    { label: 'License Plate Number', value: plate, set: setPlate, placeholder: 'e.g. ABC123' },
    { label: 'Vehicle Make', value: make, set: setMake, placeholder: 'e.g. Subaru', visible: plate },
    { label: 'Vehicle Model', value: model, set: setModel, placeholder: 'e.g. Outback', visible: make },
    { label: 'Vehicle Year', value: year, set: setYear, placeholder: 'e.g. 2025', visible: model },
    { label: 'Vehicle Color', value: color, set: setColor, placeholder: 'e.g. White', visible: year },
    { label: 'State of Registration', value: state, set: setState, placeholder: 'e.g. CA', visible: color },
  ];

  const animations = [
    { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } },
    { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
    { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
    { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    { initial: { opacity: 0, rotate: -5 }, animate: { opacity: 1, rotate: 0 } },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Varela Round, sans-serif',
        background: 'linear-gradient(to bottom, #f7fff0, #e0f4e4)',
        position: 'relative',
      }}
    >
      <Header />

      {/* Popup Overlay */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '100vw',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: '#fff',
                padding: '30px 40px',
                borderRadius: '20px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                textAlign: 'center',
              }}
            >
              {!success ? (
                <>
                  <CircularProgress size={50} />
                  <Typography mt={2}>Registering vehicle...</Typography>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 60, color: 'green' }} />
                  <Typography mt={2} fontWeight="bold">
                    Vehicle successfully registered!
                  </Typography>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Box
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 2,
          pt: 8,
          boxSizing: 'border-box',
        }}
      >
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            width: '100%',
            display: 'flex',
            marginLeft: '65px',
            marginTop: '-50px',
            marginBottom: '20px',
          }}
        >
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <MUILink component={Link} href="/" underline="hover" color="inherit">
              {v('top1')}
            </MUILink>
            <MUILink component={Link} href="/vehicle" underline="hover" color="inherit">
              {v('top2')}
            </MUILink>
            <Typography color="text.primary">{v('text2')}</Typography>
          </Breadcrumbs>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
            component="form"
            onSubmit={handleRegister}
          >
            {fields.map((field, i) => {
              if (i === 0 || field.visible) {
                const animation = animations[i % animations.length];
                return (
                  <motion.div
                    key={field.label}
                    initial={animation.initial}
                    animate={animation.animate}
                    transition={{ duration: 0.5, delay: i * 0.2 }}
                  >
                    <Typography fontWeight="bold">{field.label}</Typography>
                    <TextField
                      fullWidth
                      placeholder={field.placeholder}
                      variant="outlined"
                      size="small"
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      sx={{ borderRadius: '30px' }}
                      required
                    />
                  </motion.div>
                );
              }
              return null;
            })}

            {allFilled && (
              <motion.div
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.4, delay: 1.3 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #6fcf97, #4e9e24)',
                    color: '#fff',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    paddingY: 1.2,
                    paddingX: 4,
                    textTransform: 'none',
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
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-75%',
                      width: '50%',
                      height: '100%',
                      background:
                        'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
                      transform: 'skewX(-20deg)',
                      animation: 'shine 1.8s ease-in-out 1.5s forwards',
                    },
                  }}
                >
                  Register
                </Button>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
