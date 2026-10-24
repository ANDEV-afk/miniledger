import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
export declare const sendOtp: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addLoan: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLoans: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markRepaid: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSummary: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=ledgerController.d.ts.map