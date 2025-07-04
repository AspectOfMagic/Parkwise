'use client'

import { useState, useRef, useCallback } from 'react';
import {
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  Container,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import Webcam from 'react-webcam';
import Image from 'next/image';

import VehicleInfoCard, { VehicleInfo, PermitInfo } from './VehicleInfoCard';
import StateDropdown from './StateDropdown';
import { checkVehiclePermit } from './actions';

export default function LicensePlateScanner() {
  const [licensePlate, setLicensePlate] = useState('');
  const [plateState, setPlateState] = useState('CA');
  const [scannedPlate, setScannedPlate] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [permitInfo, setPermitInfo] = useState<PermitInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // states for camera functionality
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCapturedImage(null);
  };

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const resetCapture = () => {
    setCapturedImage(null);
    setError(null);
  };

  // function to process image with Plate Recognizer API
  const processImageWithALPR = async () => {
    // if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64Image = capturedImage!.split(',')[1];

      if (!process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY) {
        console.error("API key is missing!");
        setError("Configuration error: API key is missing");
        setIsProcessing(false);
        return;
      }

      const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.NEXT_PUBLIC_PLATE_RECOGNIZER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upload: base64Image,
          regions: ['us'],
          config: {
            threshold_d: 0.1,
            mode: "fast"
          }
        }),
      });

      if (!response.ok) {
        console.error(`API response error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.results && result.results.length > 0) {
        const plateInfo = result.results[0];
        const plateNumber = plateInfo.plate.toUpperCase();
        console.log(`Plate detected: ${plateNumber} with confidence: ${plateInfo.score}`);

        let detectedState = plateState;
        if (plateInfo.region && plateInfo.region.code) {
          let stateCode = plateInfo.region.code.toUpperCase();
          if (stateCode.startsWith('US-')) {
            stateCode = stateCode.substring(3);
          }
          detectedState = stateCode;
        }

        setLicensePlate(plateNumber);
        setPlateState(detectedState);
        handleScan(plateNumber, detectedState);
      } else {
        console.log("No plate detected in API response:", result);
        setError("No license plate detected. Try again or enter manually.");
      }
    } catch (err) {
      console.error("ALPR API Error:", err);
      setError(`Failed to process image: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (licensePlate.trim()) {
      handleScan(licensePlate.trim().toUpperCase(), plateState);
    }
  };

  const fetchVehicleInfo = async (plate: string, state: string) => {
    try {
      const vehicleData = await checkVehiclePermit(plate, state);

      const vehicleInfo: VehicleInfo = {
        id: vehicleData.vehicle?.id,
        make: vehicleData.vehicle?.make,
        model: vehicleData.vehicle?.model,
        permitStatus: vehicleData.hasValidPermit,
        licensePlate: plate,
        state: state
      };

      const permitInfo: PermitInfo = {
        status: vehicleData.hasValidPermit ? 'Valid' : 'Invalid',
      };

      return {
        vehicleInfo,
        permitInfo,
        message: vehicleData.message,
        licensePlate: plate
      };
    } catch (error) {
      console.error("Error fetching vehicle information:", error);
      throw error;
    }
  };

  const handleScan = async (plate: string, state: string) => {
    setScannedPlate(plate);
    setMessage(`Successfully scanned plate: ${plate} (${state})`);

    try {
      const { vehicleInfo, permitInfo, message } = await fetchVehicleInfo(plate, state);

      setVehicleInfo({
        ...vehicleInfo,
        licensePlate: plate,
        state: state
      });
      setPermitInfo(permitInfo);
      setMessage(message);
      setError(null);
    } catch (error) {
      console.log(error);
      setError("Failed to retrieve vehicle information. Please try again.");
      setVehicleInfo(null);
      setPermitInfo(null);
    }
  };

  const handleTicketIssued = (success: boolean, message: string) => {
    if (success) {
      setMessage(`Ticket issued successfully for plate: ${scannedPlate}`);
      console.log(message);
    }
  };

  const resetState = () => {
    setScannedPlate(null);
    setMessage(null);
    setLicensePlate('');
    setPlateState('CA');
    setVehicleInfo(null);
    setPermitInfo(null);
    setError(null);
    setCapturedImage(null);
  };

  if (!scannedPlate) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            borderRadius: '16px',
            p: 3,
            mb: 4,
            bgcolor: '#d8ead8',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{
              color: '#2a5c0f',
              fontWeight: 700,
              fontSize: { xs: '1.2rem' },
            }}
          >
            License Plate Scanner
          </Typography>

          <Paper sx={{ borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<KeyboardIcon />} label="Manual" />
              <Tab icon={<CameraAltIcon />} label="Camera" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <form onSubmit={handleSubmit}>
                  <StateDropdown
                    value={plateState}
                    onChange={setPlateState}
                  />

                  <TextField
                    fullWidth
                    placeholder="e.g. ABC123"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    aria-label="check-button"
                    fullWidth
                    disabled={!licensePlate.trim()}
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
                    Check Permit
                  </Button>
                </form>
              )}

              {tabValue === 1 && (
                <Box>
                  {!capturedImage ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 240,
                          mb: 2,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          bgcolor: 'black'
                        }}
                      >
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            facingMode: 'environment', // Use rear camera
                            width: 1280,
                            height: 720,
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        aria-label='capture-button'
                        onClick={handleCapture}
                        startIcon={<CameraAltIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#7bc144',
                          '&:hover': {
                            bgcolor: '#69a939'
                          }
                        }}
                      >
                        Capture Plate
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 240,
                          mb: 2,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          bgcolor: 'black'
                        }}
                      >
                        <Image
                          src={capturedImage}
                          alt="Captured license plate"
                          fill
                          sizes="100vw"
                          style={{
                            objectFit: 'cover'
                          }}
                          priority
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button
                          variant="outlined"
                          aria-label='retake-button'
                          onClick={resetCapture}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: '12px',
                            borderColor: '#7bc144',
                            color: '#7bc144',
                          }}
                        >
                          Retake
                        </Button>

                        <Button
                          variant="contained"
                          aria-label='read-button'
                          onClick={processImageWithALPR}
                          disabled={isProcessing}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: '12px',
                            bgcolor: '#7bc144',
                            '&:hover': {
                              bgcolor: '#69a939'
                            }
                          }}
                        >
                          {isProcessing ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Read Plate'
                          )}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          borderRadius: '16px',
          p: 4,
          mb: 4,
          bgcolor: 'white',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {message && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            icon={<DirectionsCarIcon />}
          >
            {message}
          </Alert>
        )}

        <VehicleInfoCard
          error={error}
          vehicleInfo={vehicleInfo}
          permitStatus={permitInfo}
          onTicketIssued={handleTicketIssued}
        />

        <Button
          variant="outlined"
          aria-label="reset-button"
          onClick={resetState}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: '12px',
            borderColor: '#7bc144',
            color: '#7bc144',
            '&:hover': {
              borderColor: '#69a939',
              backgroundColor: 'rgba(123, 193, 68, 0.04)'
            }
          }}
        >
          Scan Another Vehicle
        </Button>
      </Box>
    </Container>
  );
}