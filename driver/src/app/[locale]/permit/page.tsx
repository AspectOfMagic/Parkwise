'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Breadcrumbs,
  Link as MUILink,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import Header from '../home/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getPermits } from './action';
import { useTranslations } from "next-intl";
import { motion } from 'framer-motion';

export default function PermitPage() {
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [permits, setPermits] = useState<
    { classname: string; type: string; id: string; price: number }[] | null
  >(null);

  const b = useTranslations('button');
  const p = useTranslations('permit');
  const router = useRouter();

  useEffect(() => {
    const fetchPermits = async () => {
      const data = await getPermits();
      setPermits(data);
    };
    fetchPermits()
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.value;
    setSelectedPermit(id);
    Cookies.set('permit', id, {
      expires: new Date(Date.now() + 30 * 60 * 1000),
      path: '/',
      sameSite: 'Lax',
    });
  };

  return (
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

      {/* Animated Breadcrumbs */}
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
            <Typography color="text.primary">{p('top2')}</Typography>
          </Breadcrumbs>
        </motion.div>
      </Box>

      <Box sx={{ maxWidth: 500, mx: 'auto', px: 2, pb: 12 }}>
        {/* Animated Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DescriptionIcon
              sx={{
                fontSize: 30,
                fill: 'url(#carGradient)',
                position: 'relative',
                zIndex: 1,
                marginRight: '10px',
              }}
            />
            <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
              {p('text1')}
            </Typography>
          </Box>
        </motion.div>

        {/* Animated Permits List */}
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={selectedPermit || ''} onChange={handleChange}>
            {permits?.map((permit, idx) => {
              const label = `${permit.classname} - ${permit.type}`;
              return (
                <motion.div
                  key={permit.id}
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
                      border: selectedPermit === permit.id ? '1px solid #4E9E24' : '1px solid #ddd',
                      backgroundColor: selectedPermit === permit.id ? '#E6F4E6' : 'white',
                      borderRadius: '12px',
                      boxShadow: selectedPermit === permit.id ? '0 4px 10px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <FormControlLabel
                      value={permit.id}
                      control={
                        <Radio
                          sx={{
                            color: '#4E9E24',
                            '&.Mui-checked': { color: '#4E9E24' },
                          }}
                        />
                      }
                      label={label}
                    />
                    <Typography sx={{ fontWeight: 500 }}>${permit.price}</Typography>
                  </Paper>
                </motion.div>
              );
            })}
          </RadioGroup>
        </FormControl>

        <Box sx={{ height: 40 }} />

        {/* Select Button */}
        {selectedPermit && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => router.push('/permit/SelectVehicle')}
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
              {b('select')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
