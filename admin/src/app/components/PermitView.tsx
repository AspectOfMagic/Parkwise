import { Box, Typography, Divider, MenuItem, Container, Button, TextField, InputAdornment} from '@mui/material'

export default function PermitView() {
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
				Issue Permit
			</Typography>
			<Divider
			  sx={{
					width: '65%',
					margin: 'auto',
					backgroundColor: 'darkgrey',
					borderBottomWidth: '1px solid darkgrey'
				}}>
			</Divider>
			<Container sx={{pt: '25px'}}>
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
        <Box component="form" sx={{ width: '100%' }}>
					<TextField
              fullWidth
              label="Driver ID"
              variant="outlined"
              aria-label="plate-entry"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
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
							select
							label="Permit Type"
              value="Daily"
							sx={{ width: '250px', mb: '20px' }}
						>
							<MenuItem value="Daily">Daily</MenuItem>
						</TextField>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              aria-label="issue-permit"
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
              Issue Permit
            </Button>
          </Box>
        </Box>
      </Container>
		</Box>
	)
}
