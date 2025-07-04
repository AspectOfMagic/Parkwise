import { List, ListItem, ListItemText, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';

export default function LotList() {
	const lots = ['West Lot', 'East Lot']
	// Enforcers will be in array storing data from fetch calls
	return (
		<List>
			<ListItem key='titleHeader'>
			<ListItemText 
					primary="Name" 
					primaryTypographyProps={{ fontWeight: 'bold'}} 
					sx={{color: '#283593'}}
				/>
				<ListItemText 
					primary="Capacity" 
					primaryTypographyProps={{ fontWeight: 'bold' }} 
					sx={{pr: '32px', color: '#283593'}}
				/>
			</ListItem>
			{lots.map((lot, index) => {
				return (
					<ListItem key={index}>
						<ListItemText 
							primary={lot} 
						/>
						<ListItemText 
							primary="100/200"
							sx={{
								pr: '20px'
							}} 
						/>
						<IconButton 
						  sx={{
								ml: 'auto',
						  }}
						>
							<DeleteIcon
							  sx={{
									ml: 'auto'
							  }}
							>
							</DeleteIcon>
						</IconButton>
					</ListItem>
				)
			})}
		</List>
	)
}
