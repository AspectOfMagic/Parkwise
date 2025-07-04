import { Box, Typography } from '@mui/material';

export default function DoNotSellInfo() {
  return (
    <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Do Not Sell My Personal Information
      </Typography>
      <Typography paragraph>
        At ParkWise, we respect your privacy and are committed to protecting your personal information. As part of our dedication to transparency and user control, we do not sell your personal information to third parties.
      </Typography>
      <Typography paragraph>
        The California Consumer Privacy Act (CCPA) grants California residents the right to opt out of the sale of personal data. ParkWise does not engage in such practices. We do not exchange your data for money, services, or any other consideration with external advertisers or data brokers.
      </Typography>
      <Typography paragraph>
        We may share your data with trusted service providers who help us operate the app, such as analytics or hosting services. These parties are contractually obligated to use your data solely for our purposes and not sell or disclose it.
      </Typography>
      <Typography paragraph>
        Because ParkWise does not sell your personal data, there is no need for you to opt out. However, if you have any questions or concerns, or would like to verify or delete any personal data we may have, please contact our team using the information provided in the Privacy Policy.
      </Typography>
      <Typography paragraph>
        This policy applies to all users of the ParkWise app and website, and will be updated if our data-sharing practices change in the future.
      </Typography>
    </Box>
  );
}
