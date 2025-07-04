import { Request, Response, NextFunction } from 'express';
interface ApiClientDetails {
    name: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            apiClient?: ApiClientDetails;
        }
    }
}
export declare const apiKeyAuth: (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => void;
export {};
