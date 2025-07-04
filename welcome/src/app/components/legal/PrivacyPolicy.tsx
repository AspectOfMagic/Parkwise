import { Box, Typography } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography paragraph>
        ParkWise is committed to protecting your privacy and ensuring the safety of your data. This Privacy Policy describes how we collect, use, and share information when you use our application and website.
      </Typography>
      <Typography paragraph>
        <strong>1. Information We Collect:</strong> We collect personal data such as your name, email address, and vehicle information when you register. We may also gather usage data (e.g., how you interact with the app), device information, and location data if you enable location services.
      </Typography>
      <Typography paragraph>
        <strong>2. How We Use Your Information:</strong> Your information helps us provide features like real-time parking availability, account security, and personalized user experiences. We also use aggregated data for analytics to improve app performance.
      </Typography>
      <Typography paragraph>
        <strong>3. Sharing Your Information:</strong> We do not sell your data. We may share data with third-party services that help us operate ParkWise (e.g., cloud hosting or analytics providers), but only under strict confidentiality agreements.
      </Typography>
      <Typography paragraph>
        <strong>4. Data Security:</strong> We implement strong safeguards to protect your personal data, including encryption, secure servers, and access controls.
      </Typography>
      <Typography paragraph>
        <strong>5. User Rights:</strong> You have the right to view, edit, or delete your personal data at any time. Please contact us for assistance.
      </Typography>
      <Typography paragraph>
        <strong>6. Changes:</strong> We may update this policy from time to time. Updates will be posted in the app, and your continued use means acceptance of the updated policy.
      </Typography>
      <Typography paragraph>
        This policy is for academic and demo purposes as part of the ParkWise school project.
      </Typography>
    </Box>
  );
}
