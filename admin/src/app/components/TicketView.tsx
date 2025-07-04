import { 
  Box, 
  Typography, 
  Container,
  Card,
  CardContent,
  Stack,
  Badge
} from '@mui/material'

import TicketList from './TicketList'

export default function TicketView() {

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        py: { xs: 4, md: 8 },
        px: 2
      }}
    >
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1"
          >
            Ticket Management
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Monitor and track outstanding challenges and ticket resolution
          </Typography>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Stack 
          direction={{ xs: 'column', lg: 'row' }} 
          spacing={4}
          sx={{ alignItems: 'stretch', justifyContent: 'center' }}
        >
          {/* Outstanding Challenges Card - Takes up more space */}
          <Box sx={{ flex: { xs: 1, lg: 2 }, maxWidth: { lg: '800px' } }}>
            <Card>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box>
                    <Badge
                      badgeContent="!"
                      color="error"
                    />
                  </Box>
                  
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1
                    }}
                  >
                    Outstanding Challenges
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Active tickets requiring attention and resolution
                  </Typography>
                </Box>

                {/* Ticket List Container */}
                <Box 
                  sx={{ 
                    flex: 1,
                    minHeight: { xs: 300, md: 400 },
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.5)',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  role="region"
                  aria-label="List of outstanding challenge tickets"
                  aria-describedby="ticket-list-description"
                >
                  
                  {/* Content */}
                  <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                    <TicketList />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
