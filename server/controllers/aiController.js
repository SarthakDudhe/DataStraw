import { ai } from '../configs/gemini.js';

/**
 * Controller for Gemini AI endpoints
 */
export const summarizeTicket = async (req, res) => {
  try {
    const { subject, description, customer_name } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    // Clean code fences if present
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return res.json({
      success: true,
      summary: parsed,
    });
  } catch (error) {
    console.error('Gemini Summarize Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate summary with Gemini AI',
    });
  }
};

export const generateReply = async (req, res) => {
  try {
    const { subject, description, customer_name, replyType = 'investigating', tone = 'professional' } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      reply: response.text?.trim() || '',
    });
  } catch (error) {
    console.error('Gemini Reply Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate reply with Gemini AI',
    });
  }
};
