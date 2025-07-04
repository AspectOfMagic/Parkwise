'use client'
import { Box, AppBar, Toolbar, Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'
import { styled, alpha } from '@mui/material/styles'

import { logout } from '../login/actions'

const drawerWidth = 220;

const ModernAppBar = styled(AppBar)({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
});

const BrandText = styled(Typography)({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  fontSize: '1.4rem',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  letterSpacing: '-0.5px',
});

const UserInfoBox = styled(Box)({
  marginLeft: 'auto',
  paddingRight: '15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const UserNameText = styled(Typography)({
  color: '#1f2937',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  lineHeight: 1.2,
});

const UserRoleText = styled(Typography)({
  color: '#6b7280',
  fontSize: '0.75rem',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  fontWeight: 500,
});

const ModernAvatar = styled(Avatar)({
  width: '42px',
  height: '42px',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  border: '2px solid rgba(255, 255, 255, 0.8)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
  },
});

const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    marginTop: '8px',
    minWidth: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    '& .MuiMenuItem-root': {
      borderRadius: '12px',
      margin: '4px 8px',
      padding: '12px 16px',
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#374151',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: alpha('#10b981', 0.1),
        color: '#059669',
        transform: 'translateY(-1px)',
      },
    },
  },
});

export default function TopBar() {
	const [name, setName] = useState<string | null>(null);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	useEffect(() => {
		const storedName = window.sessionStorage.getItem('name');
		setName(storedName);
	}, []);

	const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = async () => {
		window.sessionStorage.removeItem('name');
		handleClose();
		await logout();
	};

	return (
		<>
			<ModernAppBar
				position="fixed"
				sx={{
					width: `calc(100% - ${drawerWidth}px)`, 
					ml: `${drawerWidth}px`,
				}}
			>
				<Toolbar sx={{ minHeight: '70px !important' }}>
					<BrandText variant="h6" noWrap>
						@ ParkWise
					</BrandText>
					<UserInfoBox>
						<UserNameText>
							{name}
						</UserNameText>
						<UserRoleText>
							Admin
						</UserRoleText>
					</UserInfoBox>
					<IconButton
						onClick={handleAvatarClick}
						sx={{ p: 0, ml: 2 }}
						aria-label="Open account menu"
						aria-controls={open ? 'account-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={open ? 'true' : undefined}
					>
						<ModernAvatar />
					</IconButton>
					<StyledMenu
						anchorEl={anchorEl}
						id="account-menu"
						open={open}
						onClose={handleClose}
						onClick={handleClose}
						transformOrigin={{ horizontal: 'right', vertical: 'top' }}
						anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
					>
						<MenuItem onClick={handleLogout}>
							<LogoutIcon sx={{ mr: 2, fontSize: '1.2rem', color: '#10b981' }} />
							Logout
						</MenuItem>
					</StyledMenu>
				</Toolbar>
			</ModernAppBar>
		</>
	)
}
