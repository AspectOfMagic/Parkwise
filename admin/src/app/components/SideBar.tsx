'use client'
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles'
import Image from 'next/image';
import ActionList from './ActionList'

const drawerWidth = 220;

const ModernDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
    border: 'none',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
  },
});

const LogoToolbar = styled(Toolbar)({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  justifyContent: 'center',
  minHeight: '70px !important',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
  }
});

const LogoContainer = styled(Box)({
  padding: '8px',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

const StyledDivider = styled(Divider)({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  height: '1px',
});

export default function SideBar() {
	return (
		<>
		<ModernDrawer
			variant="permanent"
			anchor="left"
	>
		<LogoToolbar>
			<LogoContainer>
				<Image
					src="/parkwiselogo.png"
					alt="ParkWise Logo"
					width={64}
					height={64}
					priority
					style={{
						filter: 'brightness(0) invert(1)',
					}}
	      />
			</LogoContainer>
		</LogoToolbar>
		<StyledDivider />
		<ActionList />
	</ModernDrawer>
	</>
	)
}
