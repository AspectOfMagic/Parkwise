import { useSelectedAction } from './ActionContext'; 
// import PermitView from './PermitView'
import EnforcementView from './EnforcementView';
// import LotView from './LotView';
import TicketView from './TicketView';

import { Box } from '@mui/material'
// conditionally renders the selected action in actions list
// action cards for conditioned view will be inside of box
export default function ActionView () {
	const { selectedAction } = useSelectedAction();
	return (
		<Box sx={{
		  pt: '64px',
			pl: '15px',
			pr: '15px',
			pb: '10px',
		}}>
			{selectedAction === 'Enforcement' ? <EnforcementView/> :
				<TicketView/>}
		</Box>
	)
}
