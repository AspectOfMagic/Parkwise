import { Box } from '@mui/material'

import ActionView from '../components/ActionView'
import TopBar from '../components/TopBar'
export default function BarViewContainer () {
	return (
		<Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: 'calc(100% - 220px)',
      position: 'absolute',
			right: 0,
			}}>
      <Box>
        <TopBar />
      </Box>
      <Box sx={{
        flexGrow: 1,
      }}>
        <ActionView />
      </Box>
    </Box>
	)
}
