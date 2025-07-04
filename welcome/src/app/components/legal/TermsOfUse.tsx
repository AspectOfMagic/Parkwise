import { Box, Typography } from '@mui/material';

export default function TermsOfUse() {
  return (
    <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Terms of Use
      </Typography>
      <Typography paragraph>
        Welcome to ParkWise. By accessing or using our app, you agree to the following terms and conditions. These terms are designed to govern your use of the app as part of a university class project.
      </Typography>
      <Typography paragraph>
        <strong>1. Use of the App:</strong> ParkWise is intended for academic demonstration only. You may not use the app for any unlawful or commercial purposes.
      </Typography>
      <Typography paragraph>
        <strong>2. Account Responsibilities:</strong> You are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.
      </Typography>
      <Typography paragraph>
        <strong>3. Intellectual Property:</strong> All content in the app, including code, logos, and visuals, is the property of the ParkWise team or its licensors and may not be used without permission.
      </Typography>
      <Typography paragraph>
        <strong>4. Disclaimers:</strong> The app is provided “as is” without warranties of any kind. We make no guarantees about the availability, accuracy, or performance of the platform.
      </Typography>
      <Typography paragraph>
        <strong>5. Limitation of Liability:</strong> In no event shall ParkWise or its developers be liable for any indirect, incidental, or consequential damages related to the use of the app.
      </Typography>
      <Typography paragraph>
        <strong>6. Changes to Terms:</strong> We reserve the right to update these terms. Continued use of the app implies acceptance of any changes.
      </Typography>
      <Typography paragraph>
        These Terms of Use are for academic purposes only, created as part of a group project for educational demonstration.
      </Typography>
    </Box>
  );
}
