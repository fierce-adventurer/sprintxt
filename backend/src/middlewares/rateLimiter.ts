import rateLimit from 'express-rate-limit';

export const aiCompletionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit each IP to 50 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many text generation requests from this IP. Please try again after 10 minutes.',
  },
  skipFailedRequests: true, 
});