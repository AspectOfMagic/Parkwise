import React from 'react';
import { useSelectedAction } from './ActionContext'; 
import {List, ListItem, Typography, ListItemButton, Divider} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'

const ModernList = styled(List)({
  paddingTop: 0,
  paddingBottom: 0,
});

const ModernListItem = styled(ListItem)({
  padding: 0,
  margin: 0,
  display: 'flex',
  justifyContent: 'center', // Center the button within the list item
});

const ModernListItemButton = styled(ListItemButton)(() => ({
  justifyContent: 'center',
  padding: '20px 24px',
  margin: 0, // Remove horizontal margins
  marginTop: '8px',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  maxWidth: 'calc(100% - 24px)', // Account for container padding if needed
  width: 'fit-content', // Make button only as wide as its content
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    backgroundColor: alpha('#10b981', 0.08),
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'scale(0.98)',
  }
}));

const ActionText = styled(Typography)({
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  fontWeight: 600,
  fontSize: '0.95rem',
  color: '#e5e7eb',
  letterSpacing: '0.5px',
  transition: 'color 0.3s ease',
  '.MuiListItemButton-root:hover &': {
    color: '#10b981',
  }
});

const ModernDivider = styled(Divider)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  margin: '12px 16px 4px 16px',
  height: '1px',
});

export default function ActionList () {
  const {setSelectedAction } = useSelectedAction();

	const actions = [
		'Resolve Tickets',
		'Enforcement'
	]

	const handleSelect = (action: string) => {
    setSelectedAction(action);
  };
	
	return (
		<ModernList>
			{actions.map((action, index) => {
				return (
					<React.Fragment key={index}>
						<ModernListItem>
							<ModernListItemButton 
								aria-label={action} 
								onClick={() => handleSelect(action)}
							>
								<ActionText noWrap>
									{action}
								</ActionText>
							</ModernListItemButton>
						</ModernListItem>
						{index < actions.length - 1 && <ModernDivider/>}
				  </React.Fragment>
				)})}
		</ModernList>
	)
}
