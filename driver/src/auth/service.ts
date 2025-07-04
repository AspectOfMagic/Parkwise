import 'server-only';

import { SessionUser, Credentials, Authenticated, NewAccountCredentials } from '.';

export async function verifyAuth(token: string | undefined): Promise<SessionUser> {
  if (!token) {
    throw new Error('Unauthorized - No token provided');
  }
  
  try {
    const response = await fetch('http://localhost:3010/api/v0/checkDriver', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (response.status !== 200) {
      throw new Error('Unauthorized');
    }
    
    return await response.json();
  } catch (error) {
    console.log(error);
    throw new Error('Unauthorized');
  }
}

export async function authenticate(credentials: Credentials): Promise<Authenticated|undefined> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3010/api/v0/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    .then(response => { 
      if (response.status != 200) {
        reject('Unauthorized')
      }
      return response.json()} 
    )
    .then(data => resolve(data))
    .catch(() => reject('Unauthorized'))
  })
}

export async function register(credentials: NewAccountCredentials): Promise<Authenticated|undefined> {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3010/api/v0/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    .then(response => { 
      if (response.status != 201) {
        reject('Unauthorized')
      }
      return response.json()} 
    )
    .then(data => resolve(data))
    .catch(() => reject('Unauthorized'))
  })
}

export async function googleLogin(googleIdToken: string): Promise<Authenticated|undefined> {
  try {
    const response = await fetch('http://localhost:3010/api/v0/googleLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({credential: googleIdToken}),
    });

    // Handle different error cases with specific messages
    if (!response.ok) {
      const statusCode = response.status;

      // Authentication failures (unauthorized)
      if (statusCode === 401 || statusCode === 403) {
        throw new Error('Invalid credentials. Please check your email and password.');
      }
      // Server errors
      else if (statusCode >= 500) {
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object' && errorData.message) {
            throw new Error(`Server error: ${errorData.message}`);
          } else {
            throw new Error(`Server error (${statusCode}): The server encountered an unexpected error.`);
          }
        } catch (parseError) {
          console.log(parseError);
          throw new Error(`Server error (${statusCode}): Could not process the server response.`);
        }
      }
      else {
        throw new Error(`Authentication failed with status code: ${statusCode}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Authentication failed due to an unexpected error.');
  }
}
