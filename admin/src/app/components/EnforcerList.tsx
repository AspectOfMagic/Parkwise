'use client'

import { List, ListItem, IconButton, Typography, Box } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import { styled, alpha } from '@mui/material/styles'

import { useEffect, useState } from 'react'
import { fetchEnforcers, removeEnforcer } from '../dashboard/actions';
import { Enforcer } from '@/verify';

const ModernList = styled(List)({
  padding: 0,
});

const EnforcerItem = styled(ListItem)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  marginBottom: '12px',
  padding: '20px 24px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)',
    borderColor: alpha('#10b981', 0.2),
  }
});

const EnforcerEmail = styled(Typography)({
  color: '#374151',
  fontSize: '0.95rem',
  fontWeight: 500,
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  flex: 1,
});

const DeleteButton = styled(IconButton)({
  backgroundColor: alpha('#ef4444', 0.1),
  color: '#ef4444',
  borderRadius: '12px',
  padding: '12px',
  marginLeft: 'auto',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
  },
  '&:active': {
    transform: 'scale(1.05)',
  }
});

const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: '#9ca3af',
  textAlign: 'center',
});

const EmptyStateText = styled(Typography)({
  fontSize: '0.9rem',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  color: '#6b7280',
});

const LoadingState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: '#9ca3af',
  textAlign: 'center',
  animation: 'fadeIn 0.5s ease',
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
});

const LoadingText = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 500,
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  color: '#6b7280',
});

export default function EnforcerList() {
	const [enforcers, setEnforcers] = useState<Enforcer[]>([])
  const [loading, setLoading] = useState(true);

  const getEnforcers = async () => {
    try {
      setLoading(true);
      const data = await fetchEnforcers();
      setEnforcers(data);
    } catch (error) {
      console.error('Failed to fetch enforcers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnforcers();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeEnforcer(id);
      await getEnforcers();
    } catch (error) {
      console.error('Failed to remove enforcer:', error);
    }
  };

  if (loading) {
    return (
      <LoadingState>
        <LoadingText>Loading enforcers…</LoadingText>
      </LoadingState>
    );
  }
  
  if (enforcers.length === 0) {
    return (
      <EmptyState>
        <EmptyStateText>
          No enforcers found
        </EmptyStateText>
      </EmptyState>
    );
  }
	
  
	return (
		<ModernList>
			{enforcers.map((enforcer, index) => {
				return (
					<EnforcerItem key={index}>
						<EnforcerEmail>
							{enforcer.email}
						</EnforcerEmail>
						<DeleteButton 
							onClick={() => {handleRemove(enforcer.id)}}
							aria-label={`remove-enforcer-${index}`}
						>
							<DeleteIcon />
						</DeleteButton>
					</EnforcerItem>
				)
			})}
		</ModernList>
	)
}
