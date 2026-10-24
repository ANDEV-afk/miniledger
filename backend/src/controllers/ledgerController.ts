import type { Response } from 'express';
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../middleware/auth.js';

const mockOtpStore: Record<string, string> = {}; // Memory store for mock OTP

// Auth 1: Send OTP
export const sendOtp = async (req: AuthRequest, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

  const otp = '1234'; // Fixed mock OTP for testing
  mockOtpStore[phoneNumber] = otp;

  console.log(`\n========================================`);
  console.log(`[MOCK OTP SERVER LOG] Phone: ${phoneNumber} | OTP: ${otp}`);
  console.log(`========================================\n`);

  return res.json({ message: 'OTP sent successfully (Check server logs)' });
};

// Auth 2: Verify OTP
export const verifyOtp = async (req: AuthRequest, res: Response) => {
  const { phoneNumber, otp } = req.body;

  if (mockOtpStore[phoneNumber] !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  delete mockOtpStore[phoneNumber];

  let user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    user = await prisma.user.create({ data: { phoneNumber } });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return res.json({ token, user });
};

// Loans: Add Entry
export const addLoan = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const { friendName, amount, dueDate, receiptUrl } = req.body;
  
  if (!friendName || !amount || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const loan = await prisma.loanEntry.create({
    data: {
      userId,
      friendName,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      receiptUrl,
    },
  });

  return res.status(201).json(loan);
};

// Loans: Get All Entries
export const getLoans = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const loans = await prisma.loanEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(loans);
};

// Loans: Mark Repaid
export const markRepaid = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const { id } = req.params;
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ error: 'Loan ID required' });
  }

  const loan = await prisma.loanEntry.updateMany({
    where: { id, userId },
    data: { isRepaid: true },
  });

  return res.json({ message: 'Loan marked as repaid' });
};

// Loans: Get Summary
export const getSummary = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const loans = await prisma.loanEntry.findMany({ where: { userId } });
  const now = new Date();

  let totalLent = 0;
  let totalRepaid = 0;
  let overdueAmount = 0;

  for (const loan of loans) {
    totalLent += loan.amount;
    if (loan.isRepaid) {
      totalRepaid += loan.amount;
    } else if (new Date(loan.dueDate) < now) {
      overdueAmount += loan.amount;
    }
  }

  return res.json({
    totalLent,
    totalRepaid,
    overdueAmount,
    pendingAmount: totalLent - totalRepaid,
  });
};
