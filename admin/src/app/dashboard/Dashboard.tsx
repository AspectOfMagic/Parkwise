'use client'

import { Box, CssBaseline} from '@mui/material'

import BarViewContainer from '../components/BarViewContainer'
import SideBar from '../components/SideBar'

export default function Dashboard () {
	return (
		// SideBar goes before app bar
		// #D3D3D3
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<BarViewContainer/>
			<SideBar/>
		</Box>
	)
}
// #373b40
