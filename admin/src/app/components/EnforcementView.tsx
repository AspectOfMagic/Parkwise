'use client'

import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  TextField, 
  Stack,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Fade,
  InputAdornment,
  IconButton
} from '@mui/material'
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon
} from '@mui/icons-material'
import EnforcerList from './EnforcerList'
import { makeEnforcer } from '../dashboard/actions'

export default function EnforcementView() {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [createdEnforcer, setCreatedEnforcer] = useState<{ name: string; email: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    const name = `${first} ${last}`.toUpperCase()
    const creds = { name, email, password }
    const result = await makeEnforcer(creds)

    if (result) {
      setCreatedEnforcer({ name: result.name, email: result.email })
    }
  }

  const handleReset = () => {
    setFirst('')
    setLast('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setCreatedEnforcer(null)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: { xs: 4, md: 8 },
        px: 2
      }}
    >
      {/* Header Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Enforcement Management
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Create and manage enforcement accounts with secure access controls
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            height: '4px',
            background: 'linear-gradient(90deg, #2e7d32, #4caf50, #81c784)',
            borderRadius: '2px',
            maxWidth: 200,
            mx: 'auto'
          }} 
        />
      </Container>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={4}
          sx={{ alignItems: 'stretch' }}
        >
          {/* Create Enforcer Card */}
          <Box sx={{ flex: 1 }}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box 
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #4caf50, #81c784)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {createdEnforcer ? (
                      <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 32, color: 'white' }} />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1
                    }}
                  >
                    {createdEnforcer ? 'Account Created Successfully' : 'Create New Enforcer'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {createdEnforcer 
                      ? 'Enforcer account has been created and is ready for use'
                      : 'Fill out the form below to create a new enforcer account'
                    }
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  {createdEnforcer ? (
                    <Fade in={true}>
                      <Box>
                        <Alert 
                          severity="success" 
                          sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                              fontSize: '1.5rem'
                            }
                          }}
                        >
                          <AlertTitle sx={{ fontWeight: 600 }}>Account Details</AlertTitle>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Name:</strong> {createdEnforcer.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {createdEnforcer.email}
                          </Typography>
                        </Alert>
                        
                        <Button
                          variant="contained"
                          onClick={handleReset}
                          fullWidth
                          size="large"
                          startIcon={<AddIcon />}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                              boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                          aria-label="create-another"
                        >
                          Create Another Enforcer
                        </Button>
                      </Box>
                    </Fade>
                  ) : (
                    <Box 
                      component="form" 
                      onSubmit={handleSubmit}
                      role="form"
                      aria-labelledby="create-enforcer-heading"
                    >
                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <TextField
                            fullWidth
                            label="First Name"
                            aria-label="First Name"
                            variant="outlined"
                            value={first}
                            onChange={(e) => setFirst(e.target.value)}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover fieldset': {
                                  borderColor: '#4caf50'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4caf50'
                                }
                              }
                            }}
                            inputProps={{
                              'aria-describedby': 'first-name-help'
                            }}
                          />
                          
                          <TextField
                            fullWidth
                            label="Last Name"
                            aria-label="Last Name"
                            variant="outlined"
                            value={last}
                            onChange={(e) => setLast(e.target.value)}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover fieldset': {
                                  borderColor: '#4caf50'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4caf50'
                                }
                              }
                            }}
                            inputProps={{
                              'aria-describedby': 'last-name-help'
                            }}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          label="Email Address"
                          aria-label="Email Address"
                          variant="outlined"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover fieldset': {
                                borderColor: '#4caf50'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4caf50'
                              }
                            }
                          }}
                          inputProps={{
                            'aria-describedby': 'email-help'
                          }}
                        />

                        <TextField
                          fullWidth
                          type={showPassword ? 'text' : 'password'}
                          label="Password"
                          aria-label="Password"
                          variant="outlined"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  onClick={togglePasswordVisibility}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover fieldset': {
                                borderColor: '#4caf50'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4caf50'
                              }
                            }
                          }}
                          inputProps={{
                            'aria-describedby': 'password-help'
                          }}
                        />

                        <TextField
                          fullWidth
                          type={showConfirmPassword ? 'text' : 'password'}
                          label="Confirm Password"
                          aria-label="Confirm Password"
                          variant="outlined"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                  onClick={toggleConfirmPasswordVisibility}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover fieldset': {
                                borderColor: '#4caf50'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4caf50'
                              }
                            }
                          }}
                          inputProps={{
                            'aria-describedby': 'confirm-password-help'
                          }}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<AddIcon />}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                              boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                          aria-label="create-new-enforcer"
                        >
                          Create Enforcer Account
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Enforcer List Card */}
          <Box sx={{ flex: 1 }}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box 
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1
                    }}
                  >
                    Current Enforcers
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    View and manage all active enforcer accounts
                  </Typography>
                </Box>

                <Box 
                  sx={{ 
                    flex: 1,
                    minHeight: 300,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 2,
                    backgroundColor: 'rgba(248, 250, 252, 0.5)',
                    p: 2
                  }}
                  role="region"
                  aria-label="List of current enforcers"
                >
                  <EnforcerList />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
