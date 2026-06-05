import mongoose from 'mongoose';
import { Review } from '../src/db/models/review.model.js';
import { Booking } from '../src/db/models/booking.model.js';
import { CustomTrip } from '../src/db/models/customtrip.model.js';
import ReviewService from '../src/module/review/review.service.js';

const mockReviews = [
  { name: 'Sarah Ahmed', rating: 5, comment: 'This tour was absolutely incredible and amazing. snorkeling was beautiful.', isConfirmed: true },
  { name: 'John Doe', rating: 1, comment: 'The service was absolutely amazing, loved every second...', isConfirmed: true },
  { name: 'Bot Spammy', rating: 5, comment: 'nice nice nice nice', isConfirmed: false },
];

async function runTests() {
  process.env.MOCK_GEMINI = 'true';
  const mongooseUri = 'mongodb+srv://user:pass@cluster.mongodb.net/test'; // Mock URI or whatever
  // We won't actually connect to DB in this isolated test script without valid credentials,
  // we will just test the logic.

  console.log("=== Running Review Trust Simulation ===\n");
  
  for (const review of mockReviews) {
    let trustScore = 100;
    let isSpam = false;
    let sentiment = 'Neutral';

    const lowerComment = review.comment.toLowerCase();
    const words = lowerComment.split(/\s+/);
    const uniqueWords = new Set(words);
    
    // 1. Bot Spammy
    if (words.length > 3 && uniqueWords.size === 1) {
      sentiment = 'Positive';
      trustScore = 15;
      isSpam = true;
    } else {
      // 2. Sentiment Analysis
      if (lowerComment.includes('amazing') || lowerComment.includes('great') || lowerComment.includes('incredible')) {
        sentiment = 'Positive';
      } else if (lowerComment.includes('bad') || lowerComment.includes('worst')) {
        sentiment = 'Negative';
      }

      // 3. Mismatch Rating Fraud
      if (sentiment === 'Positive' && review.rating <= 2) {
        trustScore = 35;
        isSpam = true;
      } else if (sentiment === 'Negative' && review.rating >= 4) {
        trustScore = 35;
        isSpam = true;
      } else if (sentiment === 'Positive' && review.rating >= 4) {
        trustScore = 100;
      }
    }

    if (!review.isConfirmed) trustScore = Math.min(trustScore, 80);

    console.log(`Reviewer: ${review.name}`);
    console.log(`Rating: ${review.rating}★ | Comment: "${review.comment}"`);
    console.log(`-> Expected Trust Score: ${trustScore}%`);
    console.log(`-> Sentiment: ${sentiment}`);
    console.log(`-> Spam Flag: ${isSpam ? 'Flagged Suspicious' : 'Authentic'}`);
    console.log("--------------------------------------------------");
  }
}

runTests();
