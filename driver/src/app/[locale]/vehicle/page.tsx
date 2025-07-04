'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link as MUILink,
  Paper,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Header from '../home/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {getVehicles, deleteVehicle} from './actions';
import {Vehicle} from '../../../verify/index';

export default function VehiclePage() {
  const router = useRouter();
  const v = useTranslations('vehicle');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    async function fetchData() {
      const vehicleResult = await getVehicles();
      if (vehicleResult) {
        setVehicles(vehicleResult);
      }
    }
    fetchData();
  }, []);

  const handleDeleteVehicle = async (plate: string, state: string) => {
    await deleteVehicle(plate, state);
    const vehicleResult = await getVehicles();
    if (vehicleResult) {
        setVehicles(vehicleResult);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Varela Round, sans-serif',
        background: 'linear-gradient(to bottom, #f7fff0, #e0f4e4)',
      }}
    >
      <Header />

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="carGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6fcf97" />
            <stop offset="100%" stopColor="#4e9e24" />
          </linearGradient>
        </defs>
      </svg>

      <Box
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 400,
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
            marginLeft: '100px',
            marginTop: '-50px',
            marginBottom: '20px',
          }}
        >
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <MUILink component={Link} href="/" underline="hover" color="inherit">
              {v('top1')}
            </MUILink>
            <Typography color="text.primary">{v('top2')}</Typography>
          </Breadcrumbs>
        </motion.div>

        {/* Animated Car Icon + Smoke */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: -200, x: 150, rotate: -10 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: [150, 100, 50, 130, 0],
            rotate: [-15, -8, 0, 5, 0, -15, 20, 0],
          }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            type: 'tween',
          }}
          style={{ position: 'relative', width: '80px', height: '80px' }} // matches icon size
        >
          {/* Multiple Smoke Puffs with Offsets */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5, scale: 0.5, y: -150 + i * 20, x: 120 - i * 30 }}
              animate={{ opacity: 0, scale: 1.2, y: 0, x: 0 }}
              transition={{ duration: 2.5, delay: i * 0.2, ease: 'easeOut' }}
              style={{
                width: 30 + i * 5,
                height: 35 + i * 5,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(0, 0, 0, 0.3) 100%, rgba(0, 0, 0, 0) 100%)',
                filter: 'blur(4px)',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
              }}
            />
          ))}
        {/* Left Tire Track */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{
            delay: 0.85,  
            duration: 2.5,
            ease: 'easeOut',
            times: [0, 0.48, 0.55, 0.7],
          }}
          style={{
            position: 'absolute',
            top: 70, // lower on screen (closer to car)
            left: 110, // move further right
            width: '60px',
            height: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '2px',
            zIndex: 0,
            transform: 'rotate(-2deg)'
          }}
        />

        {/* Right Tire Track */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{
            delay: 0.85,  
            duration: 2.5,
            ease: 'easeOut',
            times: [0, 0.48, 0.55, 0.7],
          }}
          style={{
            position: 'absolute',
            top: 70, // match vertical alignment
            left: 135, // space it slightly
            width: '60px',
            height: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '2px',
            zIndex: 0,
            transform: 'rotate(-2deg)'
          }}
        />

          <DirectionsCarIcon
            sx={{
              fontSize: 80,
              mt: 2,
              fill: 'url(#carGradient)',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </motion.div>


        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, mb: 3 }}>
            {v('text1')}
          </Typography>
        </motion.div>

        {/* Registered Vehicles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
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
          >
            {vehicles.map((vehicle) => (
              <Box
                key={vehicle.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <Box>
                  <Typography fontWeight="bold">{vehicle.make}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehicle.plate}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleDeleteVehicle(vehicle.plate, vehicle.state)}
                  sx={{
                    border: '2px solid red',
                    color: 'red',
                    width: 26,
                    height: 26,
                  }}
                  aria-label="remove vehicle"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {/* Add Vehicle (+) */}
            <Box sx={{ display: 'flex', justifyContent: 'center'}}>
              <IconButton
                onClick={() => router.push('/vehicle/register')}
                sx={{
                  background: 'linear-gradient(145deg, #6fcf97, #4e9e24)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #5bbf7a, #3a7a1c)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
