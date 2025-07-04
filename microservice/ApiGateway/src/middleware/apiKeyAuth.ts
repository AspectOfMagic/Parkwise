import { Request, Response, NextFunction } from 'express';

import config from '../config';

interface ApiClientDetails {
  name: string;
  role: string;
}

type ApiKeys = Record<string, ApiClientDetails>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiClient?: ApiClientDetails;
    }
  }
}

// Use the config's API keys
const API_KEYS: ApiKeys = config.apiKeys;

export const apiKeyAuth = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }

    const keyDetails = API_KEYS[apiKey];

    if (!keyDetails) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Check if the role is an array or a string and verify permissions
    if (keyDetails.role !== requiredRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    req.apiClient = keyDetails;

    next();
  };
};