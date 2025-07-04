'use client'

import { Box, Link, Typography } from '@mui/material'
import Image from 'next/image';
import { useTranslations } from "next-intl";

export default function Footer() {
    const a = useTranslations('app');
    const f = useTranslations('footer');

    return (
        <Box 
          sx={{
            backgroundColor: '#eae6e5',
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
              backgroundColor: '#D6D6D6',
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
              <Image src="/driver/parkwiselogo.png" alt="Footer Logo" width={57} height={57} />
              <Typography
                sx={{
                  width: '115px',
                  height: '36px',
                  color: '#000000',
                  fontFamily: '"Varela Round"',
                  fontWeight: 400,
                  fontSize: '26px',
                }}
              >
                {a('name')}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'left' }}>
              <Link
                href="#"
                underline="hover"
                color="inherit"
                sx={{
                  fontFamily: '"Varela Round"',
                  fontSize: '10px',
                  fontWeight: 400,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {f('text1')}
              </Link>
              <Link
                href="#"
                underline="hover"
                color="inherit"
                sx={{
                  fontFamily: '"Varela Round"',
                  fontSize: '10px',
                  fontWeight: 400,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {f('text2')}
              </Link>
              <Link
                href="#"
                underline="hover"
                color="inherit"
                sx={{
                  fontFamily: '"Varela Round"',
                  fontSize: '10px',
                  fontWeight: 400,
                  display: 'block',
                  mb: 5,
                }}
              >
                {f('text3')}
              </Link>
            </Box>
          </Box>
        </Box>
    )
};
