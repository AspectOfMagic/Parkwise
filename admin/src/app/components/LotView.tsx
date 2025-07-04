import { Box, Typography, Divider, Container, Button, InputAdornment, TextField } from '@mui/material'

import LotList from './LotList'

export default function LotView() {
	return (
		<Box
		sx={{
			pt: '80px',
		}}
		>
			<Typography align="center"
			  sx={{
					justifyContent: 'center',
					color: 'darkgreen',
					fontWeight: 'bold',
					fontSize: '0.9rem',
					fontFamily: 'Verdana',
					pb: '10px'
				}}
			>
				Lot Viewing & Operations
			</Typography>
			<Divider
			  sx={{
					width: '65%',
					margin: 'auto',
					backgroundColor: 'darkgrey',
					borderBottomWidth: '1px solid darkgrey'
				}}>
			</Divider>
			<Box sx={{display: 'flex', pt: '25px'}}>
				<Container sx={{ width: '50%', maxWidth: '50%', flexBasis: '50%', px: 2 }}>
						<Box
							sx={{
								borderRadius: '16px',
								p: 4,
								mb: 4,
								bgcolor: 'white',
								boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
								border: '1px solid #f0f0f0'
							}}
						>
							<Typography align="center" 
								sx={{
									fontWeight: 'bold',
									pb: '25px'
								}}
							>
								Current Parking Lots
							</Typography>
							<LotList/>
						</Box>
					</Container>
					<Container sx={{ width: '50%', maxWidth: '50%', flexBasis: '50%', px: 2 }}>
          <Box
            sx={{
              borderRadius: '16px',
              p: 4,
              mb: 4,
              bgcolor: 'white',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Typography align="center" 
              sx={{
                fontWeight: 'bold',
                pb: '25px'
              }}
            >
              Create New Lot
            </Typography>
            <Box component="form" sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                aria-label="lot-name"
                placeholder="Remote Lot"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                InputProps={{
                  style: { textTransform: 'uppercase' },
                  startAdornment: (
                    <InputAdornment position="start">
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
								label="Capacity"
                variant="outlined"
                aria-label="capacity"
                placeholder="100"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                InputProps={{
                  style: { textTransform: 'uppercase' },
                  startAdornment: (
                    <InputAdornment position="start">
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
								label="Permit Type"
                variant="outlined"
                aria-label="permit-type"
                placeholder="Daily, Remote, Quarter, Semester, etc."
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
                InputProps={{
                  style: { textTransform: 'uppercase' },
                  startAdornment: (
                    <InputAdornment position="start">
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                aria-label="create-enforcer"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#7bc144',
                  '&:hover': {
                    bgcolor: '#69a939'
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#9e9e9e'
                  }
                }}
              >
                Create Lot
              </Button>
            </Box>
          </Box>
        </Container>
			</Box>
		</Box>

	)
}
