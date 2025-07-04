'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Paper,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Link as MUILink,
  Breadcrumbs,
} from '@mui/material';
import Header from '../home/Header';
import GavelIcon from '@mui/icons-material/Gavel';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { getVehicles, getTickets, challengeTicket } from './actions';
import { Vehicle, Ticket } from '../../../verify/index';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { selectAllTicketsHelper } from './helpers';


type TicketMap = Record<string, Ticket[]>;

export default function TicketPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tickets, setTickets] = useState<TicketMap>({});
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeMessage, setChallengeMessage] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState('');

  const b = useTranslations('button');
  const t = useTranslations('ticket');

  useEffect(() => {
    async function fetchData() {
      const vehicleResult = await getVehicles();
      if (vehicleResult) {
        setVehicles(vehicleResult);
        const ticketMap: TicketMap = {};
        for (const vehicle of vehicleResult) {
          const ticketResult = await getTickets(vehicle.id);
          if (ticketResult) {
            ticketMap[vehicle.id] = ticketResult;
          }
        }
        setTickets(ticketMap);
      }
    }
    fetchData();
  }, []);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vehicleId = e.target.value;
    setSelectedVehicleId(vehicleId);
    setSelectedTicketIds([]);
  };

  const toggleTicket = (id: string) => {
    setSelectedTicketIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };
  const selectAllTickets = () => {
    const updated = selectAllTicketsHelper(tickets, selectedVehicleId, selectedTicketIds);
    setSelectedTicketIds(updated);
  };

  const handleChallengeTicket = async (ticketId: string) => {
    setShowPopup(true);
    try {
      await challengeTicket(ticketId, challengeMessage);
      setTimeout(() => setChallengeSuccess(true), 1200);
      setTimeout(() => {
        setShowPopup(false);
        setChallengeSuccess(false);
      }, 2500);

      if (selectedVehicleId) {
        const ticketRes = await getTickets(selectedVehicleId);
        if (ticketRes) {
          setTickets(prev => ({
            ...prev,
            [selectedVehicleId]: ticketRes,
          }));
        }
      }
    } catch (err) {
      console.error('Challenge failed', err);
      setShowPopup(false);
    }
  };

  const visibleTickets = selectedVehicleId ? tickets[selectedVehicleId] || [] : [];
  const total = visibleTickets
    .filter(t => selectedTicketIds.includes(t.id))
    .reduce((sum, t) => sum + t.cost, 0);

  return (
    <Box sx={{
      minHeight: '100vh',
      overflowX: 'hidden',
      fontFamily: 'Varela Round, sans-serif',
      background: 'linear-gradient(to bottom right, #f2fff5, #d4f3db)',
    }}>
      <Header />

      {/* Challenge Popup */}
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
                width: '320px',
              }}
            >
              {!challengeSuccess ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" mb={2}>Describe your challenge</Typography>
                  <textarea
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                    placeholder="Enter your reason here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      borderRadius: '10px',
                      border: '1px solid #ccc',
                      padding: '10px',
                      marginBottom: '20px',
                      resize: 'vertical',
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => { handleChallengeTicket(currentTicketId) }}
                    sx={{
                      backgroundColor: '#4E9E24',
                      '&:hover': { backgroundColor: '#3a7a1c' },
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 60, color: 'green' }} />
                  <Typography mt={2} fontWeight="bold">
                    Challenge successfully sent!
                  </Typography>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ width: '100%', marginLeft: '40px', marginTop: '15px', marginBottom: '25px', zIndex: 2, position: 'relative' }}
        >
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <MUILink component={Link} href="/" underline="hover" color="inherit">
              {t('top1')}
            </MUILink>
            <Typography color="text.primary">{t('top2')}</Typography>
          </Breadcrumbs>
        </motion.div>
      </Box>

      <Box sx={{ maxWidth: 500, mx: 'auto', px: 2, pb: 12 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '18px', mb: 2 }}>{t('text1')}</Typography>
        </motion.div>

        <FormControl fullWidth>
          <RadioGroup value={selectedVehicleId || ''} onChange={handleVehicleChange}>
            {vehicles.map((vehicle, idx) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + idx * 0.1 }}>
                <FormControlLabel
                  value={vehicle.id}
                  control={<Radio sx={{ color: '#4E9E24', '&.Mui-checked': { color: '#4E9E24' } }} />}
                  label={`${vehicle.make} ${vehicle.model}`}
                />
              </motion.div>
            ))}
          </RadioGroup>
        </FormControl>

        {selectedVehicleId && (
          <Button
            onClick={selectAllTickets}
            sx={{
              mt: 3, mb: 3,
              borderRadius: 20,
              borderColor: '#4E9E24',
              color: '#4E9E24',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '12px',
              '&:hover': { backgroundColor: '#E0F2E0' },
            }}
            variant="outlined"
          >
            {t('text2')}
          </Button>
        )}

        {visibleTickets.map((ticket, idx) => {
          if (['paid', 'accepted'].includes(ticket.status)) return null;
          const isSelected = selectedTicketIds.includes(ticket.id);
          const showGavel = !['challenged', 'rejected'].includes(ticket.status);

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <Paper
                sx={{
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#E6F4E6' : 'white',
                  border: isSelected ? '1px solid #4E9E24' : '1px solid #ddd',
                  borderRadius: '12px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {showGavel && (
                    <GavelIcon
                      onClick={() => {
                        setCurrentTicketId(ticket.id)
                        setShowPopup(true);
                      }}
                      sx={{
                        color: '#4E9E24',
                        cursor: 'pointer',
                        '&:hover': { color: '#2f6e18' },
                        transition: 'color 0.2s ease',
                      }}
                    />
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleTicket(ticket.id)}
                        sx={{ color: '#4E9E24', '&.Mui-checked': { color: '#4E9E24' } }}
                      />
                    }
                    label={`${t('text4')} #${ticket.id}`}
                  />
                </Box>
                <Typography sx={{ fontWeight: 500 }}>${ticket.cost}</Typography>
              </Paper>
            </motion.div>
          );
        })}

        {selectedVehicleId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 'bold' }}>{t('text3')} ${total}</Typography>
            </Box>
          </motion.div>
        )}

        {selectedTicketIds.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => {
                localStorage.setItem('pendingTicketIds', JSON.stringify(selectedTicketIds));
                Cookies.set('tickets', JSON.stringify(selectedTicketIds), {
                  expires: new Date(Date.now() + 30 * 60 * 1000),
                  path: '/',
                  sameSite: 'Lax',
                });
                router.push('/ticket/checkout');
              }}
              sx={{
                background: 'linear-gradient(145deg, #6fcf97, #4e9e24)',
                color: '#fff',
                borderRadius: '30px',
                fontWeight: 'bold',
                px: 4,
                py: 1.2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #5bbf7a, #3a7a1c)',
                  transform: 'scale(1.03)',
                },
                '&:active': {
                  transform: 'scale(0.97)',
                },
              }}
            >
              {b('pay')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

