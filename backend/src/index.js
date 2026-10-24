import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendOtp, verifyOtp, addLoan, getLoans, markRepaid, getSummary } from './controllers/ledgerController.js';
import { authenticateToken } from './middleware/auth.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Public Routes
app.post('/api/auth/send-otp', sendOtp);
app.post('/api/auth/verify-otp', verifyOtp);
// Protected Routes
app.get('/api/loans', authenticateToken, getLoans);
app.post('/api/loans', authenticateToken, addLoan);
app.patch('/api/loans/:id/repay', authenticateToken, markRepaid); // Mark a loan as repaid
app.get('/api/loans/summary', authenticateToken, getSummary); // Get summary of loans (total, repaid, outstanding)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map