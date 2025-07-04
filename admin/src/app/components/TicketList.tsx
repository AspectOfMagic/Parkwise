import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography, 
  CircularProgress 
} from '@mui/material'
import { useState, useEffect } from 'react'
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { styled, alpha } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DialogActions, Button } from '@mui/material';

import { Ticket } from '@/verify';
import { fetchChallenges, acceptChallenge, rejectChallenge } from '../dashboard/actions';

const ModernList = styled(List)({
  padding: 0,
});

const HeaderItem = styled(ListItem)({
  justifyContent: 'center',
  backgroundColor: alpha('#10b981', 0.05),
  borderRadius: '12px',
  marginBottom: '16px',
  padding: '16px 24px',
  border: `1px solid ${alpha('#10b981', 0.1)}`,
});

const HeaderText = styled(Typography)({
  fontWeight: 700,
  textAlign: 'center',
  color: '#059669',
  fontSize: '0.9rem',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
});

const DataItem = styled(ListItem)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  marginBottom: '8px',
  padding: '20px 24px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)',
    borderColor: alpha('#10b981', 0.2),
  },
});

const DataText = styled(Typography)({
  textAlign: 'center',
  color: '#374151',
  fontSize: '0.9rem',
  fontWeight: 500,
  fontFamily: '"Inter", "Segoe UI", sans-serif',
});

const ActionButtonsBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  flex: 1,
  gap: '8px',
});

const AcceptButton = styled(IconButton)({
  backgroundColor: alpha('#10b981', 0.1),
  color: '#10b981',
  borderRadius: '12px',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#10b981',
    color: 'white',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
  },
  '&:active': {
    transform: 'scale(1.05)',
  },
});

const RejectButton = styled(IconButton)({
  backgroundColor: alpha('#ef4444', 0.1),
  color: '#ef4444',
  borderRadius: '12px',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#ef4444',
    color: 'white',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
  },
  '&:active': {
    transform: 'scale(1.05)',
  },
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    padding: theme.spacing(2),
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    maxWidth: '480px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)({
  fontWeight: 700,
  fontSize: '1.1rem',
  color: '#111827',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
});

const StyledDialogContent = styled(DialogContent)({
  paddingTop: '12px',
  paddingBottom: '16px',
});

const StyledDialogText = styled(Typography)({
  fontSize: '0.95rem',
  color: '#374151',
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  whiteSpace: 'pre-wrap',
});

export default function TicketList() {
  const [challenges, setChallenges] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDesc, setSelectedDesc] = useState<string | null>(null);
  const [descDialogOpen, setDescDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  };

  const handleOpenDesc = (desc: string | null) => {
    setSelectedDesc(desc || 'No challenge description.');
    setDescDialogOpen(true);
  };
  
  const handleCloseDesc = () => {
    setDescDialogOpen(false);
    setSelectedDesc(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchChallenges();
      setChallenges(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    await acceptChallenge(id);
    setChallenges(prev => prev.filter(challenge => challenge.id !== id));
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    await rejectChallenge(id);
    setChallenges(prev => prev.filter(challenge => challenge.id !== id));
  };

  return (
    <ModernList>
      <HeaderItem>
        <ListItemText primary={<HeaderText>Issued At</HeaderText>} sx={{ flex: 1 }} />
        <ListItemText primary={<HeaderText>Cost</HeaderText>} sx={{ flex: 1 }} />
        <ListItemText primary={<HeaderText>Actions</HeaderText>} sx={{ flex: 1 }} />
      </HeaderItem>

      {/* Loading State */}
      {loading && (
        <DataItem>
          <ActionButtonsBox>
            <CircularProgress size={24} sx={{ color: '#10b981' }} />
            <DataText sx={{ marginLeft: 2 }}>Loading challenged tickets…</DataText>
          </ActionButtonsBox>
        </DataItem>
      )}

      {/* Empty State */}
      {!loading && challenges.length === 0 && (
        <DataItem>
          <DataText>No challenged tickets found.</DataText>
        </DataItem>
      )}

      {/* Data List */}
      {!loading && challenges.map((challenge, index) => (
        <DataItem key={challenge.id}>
          <ListItemText 
            primary={
              <DataText 
                sx={{ cursor: 'pointer', textDecoration: 'underline' }} 
                onClick={() => handleOpenDesc(challenge.desc || null)}
                aria-label={`open-desc${index}`}
              >
                {formatDate(challenge.issued)}
              </DataText>
            } 
            sx={{ flex: 1 }} 
          />
          <ListItemText primary={<DataText>${challenge.cost}.00</DataText>} sx={{ flex: 1 }} />
          <ActionButtonsBox>
            <AcceptButton
              onClick={() => handleAccept(challenge.id)}
              aria-label={`accept-challenge${index}`}
              disabled={processingId === challenge.id}
            >
              <CheckBoxIcon />
            </AcceptButton>
            <RejectButton
              onClick={() => handleReject(challenge.id)}
              aria-label={`reject-challenge${index}`}
            >
              <DisabledByDefaultIcon />
            </RejectButton>
          </ActionButtonsBox>
        </DataItem>
      ))}

      <StyledDialog open={descDialogOpen} onClose={handleCloseDesc}>
        <StyledDialogTitle>Challenge Description</StyledDialogTitle>
        <StyledDialogContent>
          <StyledDialogText>
            {selectedDesc}
          </StyledDialogText>
        </StyledDialogContent>
        <DialogActions sx={{ padding: '8px 16px' }}>
          <Button aria-label="close-desc" onClick={handleCloseDesc} sx={{ color: '#10b981' }}>Close</Button>
        </DialogActions>
      </StyledDialog>
    </ModernList>

    
  );
}
