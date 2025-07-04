'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '../../../i18n/navigation';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const switchLocale = (locale: string) => {
    router.replace({ pathname }, { locale });
    handleClose();
  };

  return (
    <Box>
      <Tooltip title="Select Language">
        <IconButton
          onClick={handleClick}
          sx={{
            color: 'black',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'lightgrey',
            },
            boxShadow: 'none',
          }}
        >
          <LanguageIcon />
        </IconButton>

      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            '& .MuiMenuItem-root:hover': {
              backgroundColor: '#343a40 !important',
              color: 'white !important',
            },
          },
        }}
      >
        <MenuItem onClick={() => switchLocale('en')}>
          {t('english')}
        </MenuItem>
        <MenuItem onClick={() => switchLocale('cn')}>
          {t('chinese')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
