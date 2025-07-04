'use client'

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from '../../../i18n/navigation';
import { Box, Button } from '@mui/material';

export default function LocaleSwitcherLogin() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common')

  const switchLocale = (locale: string) => {
    router.replace(
      {pathname},
      {locale: locale}
    )
  }

  return (
    <Box display="flex" gap={1}>
      <Button
        variant="contained"
        onClick={() => switchLocale('en')}
        sx={{
          backgroundColor: '#4E9E24',
          borderRadius: '15px',
          boxShadow: 'none',
          textTransform: 'none',
        }}
      >
        {t('english')}
      </Button>
      <Button
        variant="contained"
        onClick={() => switchLocale('cn')}
        sx={{
          backgroundColor: '#343a40',
          borderRadius: '15px',
          boxShadow: 'none',
          textTransform: 'none',
        }}
      >
        {t('chinese')}
      </Button>
    </Box>
  );
};


