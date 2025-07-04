'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Typography, Toolbar, Divider } from '@mui/material';
import LocaleSwitcher from '@/app/[locale]/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
  const a = useTranslations('app');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Toolbar
          sx={{
            fontFamily: '"Varela Round", sans-serif',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
      {/* Left side: Logo + Text */}
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          {mounted ? (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              style={{ marginTop: '12px' }}
            >
              <Image
                src="/driver/parkwiselogo.png"
                alt="ParkWise Logo"
                width={50}
                height={50}
                priority
              />
            </motion.div>
          ) : (
            <Image
              src="/driver/parkwiselogo.png"
              alt="ParkWise Logo"
              width={50}
              height={50}
              priority
              style={{ opacity: 0 }}
            />
          )}

          {mounted ? (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
              style={{ marginTop: '12px' }}
            >
              <Typography sx={{ fontSize: '26px' }}>{a('name')}</Typography>
            </motion.div>
          ) : (
            <Typography sx={{ fontSize: '26px', opacity: 0 }}>{a('name')}</Typography>
          )}
        </Box>
      </Link>

        {/* Right side: LocaleSwitcher */}
        {mounted ? (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
            style={{ marginTop: '12px' }}
          >
            <LocaleSwitcher />
          </motion.div>
        ) : (
          <Box sx={{ opacity: 0 }}>
            <LocaleSwitcher />
          </Box>
        )}
      </Toolbar>
      <Divider sx={{ mt: 1 }} />
    </>
  );
}
