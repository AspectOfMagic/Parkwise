'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Breadcrumbs,
  Link as MUILink,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Header from '../../home/Header';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslations } from "next-intl";
import { Vehicle } from '@/verify';
import { getVehicles } from './action';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SelectVehiclePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[] | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const b = useTranslations('button');
  const p = useTranslations('permit');

  const handleSelect = (plate: string, state: string) => {
    setSelectedVehicle(prev => (prev === plate ? null : plate));
    Cookies.set('plate', plate, {
      expires: new Date(Date.now() + 5 * 60 * 1000),
      path: '/',
      sameSite: 'Lax',
    });
    Cookies.set('state', state, {
      expires: new Date(Date.now() + 5 * 60 * 1000),
      path: '/',
      sameSite: 'Lax',
    });
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      const data = await getVehicles();
      setVehicles(data);
    };
    fetchVehicles();
  }, []);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          overflowX: 'hidden',
          fontFamily: 'Varela Round, sans-serif',
          background: 'linear-gradient(to bottom right, #f2fff5, #d4f3db)',
        }}
      >
        <Header />

        {/* Gradient for icon use */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="carGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6fcf97" />
              <stop offset="100%" stopColor="#4e9e24" />
            </linearGradient>
          </defs>
        </svg>

        {/* Breadcrumbs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              width: '100%',
              display: 'flex',
              marginLeft: '40px',
              marginTop: '15px',
              zIndex: 2,
              position: 'relative',
            }}
          >
            <Breadcrumbs separator="›" aria-label="breadcrumb">
              <MUILink component={Link} href="/" underline="hover" color="inherit">
                {p('top1')}
              </MUILink>
              <MUILink component={Link} href="/permit" underline="hover" color="inherit">
                {p('top2')}
              </MUILink>
              <Typography color="text.primary">{p('top3')}</Typography>
            </Breadcrumbs>
          </motion.div>
        </Box>

        {/* Page Content */}
        <Box sx={{ maxWidth: 500, mx: 'auto', px: 2, pb: 12 }}>
          {/* Animated Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DirectionsCarIcon
                sx={{
                  fontSize: 35,
                  fill: 'url(#carGradient)',
                  marginRight: '10px',
                }}
              />
              <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                {p('text2')}
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography sx={{ fontWeight: 500, mb: 1 }}>{p('text3')}</Typography>
          </motion.div>

          {vehicles?.map((vehicle, idx) => (
            <motion.div
              key={vehicle.plate}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
            >
              <Paper
                sx={{
                  p: 2,
                  mb: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: selectedVehicle === vehicle.plate ? '1px solid #4E9E24' : '1px solid #ddd',
                  backgroundColor: selectedVehicle === vehicle.plate ? '#E6F4E6' : 'white',
                  borderRadius: '12px',
                  boxShadow: selectedVehicle === vehicle.plate ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedVehicle === vehicle.plate}
                      onChange={() => handleSelect(vehicle.plate, vehicle.state)}
                      sx={{
                        color: '#4E9E24',
                        '&.Mui-checked': { color: '#4E9E24' },
                      }}
                    />
                  }
                  label={`${vehicle.make} — ${vehicle.plate}`}
                />
              </Paper>
            </motion.div>
          ))}

          <Box sx={{ height: 40 }} />

          {selectedVehicle && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                data-testid="checkout-button"
                variant="contained"
                onClick={() => router.push('/permit/checkout')}
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
                    animation: 'shine 0.9s ease-in-out 0.5s forwards',
                  },
                }}
              >
                {b('order')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
