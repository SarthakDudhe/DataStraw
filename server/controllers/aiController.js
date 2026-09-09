import { ai } from '../configs/gemini.js';

// High-capacity model list with automatic fallback
const MODELS_TO_TRY = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

const generateWithFallback = async (prompt) => {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: modelName };
      }
    } catch (err) {
      lastError = err;
      // If 503 (high demand) or 404, continue to next model
      if (err.status === 503 || err.status === 404 || err.status === 429) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models unavailable');
};

/**
 * Controller for Gemini AI endpoints
 */
export const summarizeTicket = async (req, res) => {
  const { subject, description, customer_name } = req.body;

  try {
    const prompt = `You are an elite customer support operations AI copilot.
Analyze this customer support ticket and return a JSON object with:
- "coreProblem": A 1-2 sentence precise technical diagnosis of what failed or was requested.
- "sentiment": One of "Urgent / Frustrated", "High Priority", "Constructive / Feedback", or "Neutral".
- "nextStep": The single most impactful troubleshooting step or action the support engineer should take right now.

Customer: ${customer_name || 'Customer'}
Subject: ${subject || 'No subject'}
Description: ${description || 'No description'}

Respond ONLY with a valid JSON object in this exact format:
{
  "coreProblem": "...",
  "sentiment": "...",
  "nextStep": "..."
}`;

    const { text, modelUsed } = await generateWithFallback(prompt);

    // Clean code fences if present
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return res.json({
      success: true,
      summary: parsed,
      model: modelUsed,
    });
  } catch (error) {
    console.warn('Gemini Summarize Fallback triggered:', error.message);

    // Provide intelligent heuristic fallback so UI never breaks on temporary Google 503 spikes
    const isUrgent = /(urgent|critical|fail|crash|down|broken|payment)/i.test(`${subject} ${description}`);
    return res.json({
      success: true,
      summary: {
        coreProblem: `${subject || 'Reported inquiry'}: ${description?.slice(0, 120) || 'Reviewing customer details.'}...`,
        sentiment: isUrgent ? 'High Priority' : 'Neutral',
        nextStep: 'Acknowledge inquiry and inspect error logs or account records.',
      },
      fallback: true,
    });
  }
};

export const generateReply = async (req, res) => {
  const { subject, description, customer_name, replyType = 'investigating', tone = 'professional' } = req.body;

  try {
    const prompt = `You are a professional customer support specialist.
Draft an email response to the customer.

Ticket Details:
- Customer Name: ${customer_name || 'Customer'}
- Subject: ${subject || 'Support Ticket'}
- Issue: ${description || 'N/A'}
- Desired Intent: ${replyType} (e.g. investigating the issue, fix deployed, or asking for more info)
- Tone: ${tone} (e.g. professional, empathetic, or concise)

Draft a polished, friendly, and complete support message signed off by "Customer Support Team". 
Do not include subject lines or placeholders. Return only the message body.`;

    const { text, modelUsed } = await generateWithFallback(prompt);

    return res.json({
      success: true,
      reply: text.trim(),
      model: modelUsed,
    });
  } catch (error) {
    console.warn('Gemini Reply Fallback triggered:', error.message);

    return res.json({
      success: true,
      reply: `Hi ${customer_name || 'there'},\n\nThank you for reaching out regarding "${subject || 'your ticket'}". We have logged your request and our technical team is currently reviewing the issue.\n\nWe will update you as soon as we have progress.\n\nBest regards,\nCustomer Support Team`,
      fallback: true,
    });
  }
};
