// server/geminiService.js — Gemini Vision disease detection with retry & model fallback
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// ─── Model fallback chain ─────────────────────────────────────────────────────
// Tries each model in order until one works
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

// ─── Retry helper ─────────────────────────────────────────────────────────────
async function withRetry(fn, maxRetries = 3, delayMs = 5000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      const isRateLimit = msg.includes('429') || msg.includes('retry') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isModel = msg.includes('404') || msg.includes('not found') || msg.includes('MODEL_NOT_FOUND');

      if (isModel) throw err; // Don't retry model-not-found errors

      if (attempt < maxRetries) {
        // Extract retry delay from error message if present (e.g. "retry in 40s")
        const retryMatch = msg.match(/retry[^\d]*(\d+(?:\.\d+)?)\s*s/i);
        const waitMs = retryMatch ? Math.min(parseFloat(retryMatch[1]) * 1000, 45000) : delayMs * attempt;
        console.log(`⏳ Attempt ${attempt}/${maxRetries} failed (${isRateLimit ? 'rate limit' : 'error'}). Waiting ${Math.round(waitMs / 1000)}s before retry...`);
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
  }
  throw lastError;
}

// ─── Core Gemini prompt ───────────────────────────────────────────────────────
const ANALYSIS_PROMPT = `
You are an expert plant pathologist AI specialized in crop disease detection for Indian farmers.
Analyze this plant/leaf image carefully and respond ONLY with a valid JSON object — no markdown, no explanation outside JSON.

Return exactly this JSON structure:
{
  "disease_name": "Disease Name or 'Healthy Plant'",
  "confidence": 88.5,
  "severity": "Low",
  "affected_area_percent": 20,
  "is_healthy": false,
  "why_it_happened": "Clear 2-3 sentence explanation of root cause in simple farming language.",
  "causes": [
    "Specific cause 1 (e.g. excess moisture during humid season)",
    "Specific cause 2 (e.g. pathogen Phytophthora infestans)",
    "Specific cause 3 (e.g. poor field drainage)"
  ],
  "treatment": [
    "Step 1: Immediate action — isolate and remove badly infected leaves",
    "Step 2: Apply specific fungicide or bio-agent with exact dosage",
    "Step 3: Improve farm conditions (drainage, spacing, etc.)",
    "Step 4: Re-inspect after 7 days and repeat if needed"
  ],
  "prevention": [
    "Prevention tip 1",
    "Prevention tip 2",
    "Prevention tip 3"
  ],
  "pesticides": [
    {
      "name": "Exact product name and formulation (e.g. Ridomil Gold MZ 68 WG)",
      "description": "One-line description of what it treats",
      "active_ingredient": "Active chemical (e.g. Mancozeb + Metalaxyl)",
      "purchase_link": "https://www.amazon.in/s?k=Ridomil+Gold+MZ+fungicide",
      "price_range": "₹350–₹700 per 500g",
      "usage_steps": [
        "Mix X grams/ml in Y litres of water",
        "Apply as foliar spray covering upper and lower leaf surfaces",
        "Repeat every X days during active infection",
        "Pre-harvest interval: X days",
        "Use gloves, mask and glasses while applying"
      ]
    },
    {
      "name": "Organic / alternative option (e.g. Neem Oil Spray)",
      "description": "Eco-friendly option for mild infections",
      "active_ingredient": "Azadirachtin / neem extract",
      "purchase_link": "https://www.amazon.in/s?k=neem+oil+organic+pesticide+agriculture",
      "price_range": "₹80–₹250 per litre",
      "usage_steps": [
        "Mix 5ml neem oil + 1ml liquid soap per litre of water",
        "Shake well before spraying",
        "Apply on all plant surfaces every 5-7 days",
        "Best applied in the evening to avoid leaf burn",
        "Safe to use up to harvest day"
      ]
    }
  ]
}

Rules:
- disease_name: exact common name (e.g. "Tomato Late Blight", "Rice Leaf Blast", "Wheat Powdery Mildew")
- confidence: 0-100 float representing your certainty
- severity: MUST be exactly "Low", "Medium", "High", or "Critical"
- affected_area_percent: visible infected area estimate (0-100)
- is_healthy: true ONLY if plant is completely disease-free and healthy
- If healthy: disease_name="Healthy Plant", severity="Low", is_healthy=true, pesticides=[]
- why_it_happened: 2-3 sentences, plain language, explain the root cause
- causes: exactly 3 specific causes
- treatment: exactly 4 actionable numbered steps
- prevention: exactly 3 practical tips
- pesticides: exactly 2 entries unless healthy (then empty array [])
  - purchase_link: valid Amazon India URL: https://www.amazon.in/s?k=keyword+with+plus
  - price_range: in Indian Rupees (₹)
  - usage_steps: 4-5 steps with dosage and pre-harvest interval

Output ONLY the JSON — no markdown fences, no explanation.
`;

// ─── Main analysis function ───────────────────────────────────────────────────
async function analyzeWithGemini(imagePath) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file. Get a free key at https://aistudio.google.com/app/apikey');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  let lastModelError = null;

  // Try each model in the fallback chain
  for (const modelName of MODEL_CHAIN) {
    console.log(`   🔄 Trying model: ${modelName}`);
    try {
      const rawResponse = await withRetry(async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { inlineData: { data: base64Image, mimeType } },
          { text: ANALYSIS_PROMPT },
        ]);
        return result.response.text().trim();
      }, 3, 8000);

      // Parse and validate response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Model returned non-JSON: ${rawResponse.substring(0, 200)}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Normalize/validate all fields
      const pesticides = Array.isArray(parsed.pesticides)
        ? parsed.pesticides.map((p) => ({
          name: p.name || 'General Fungicide',
          description: p.description || '',
          active_ingredient: p.active_ingredient || '',
          purchaseLink: p.purchase_link || 'https://www.amazon.in/s?k=fungicide+crop+disease',
          priceRange: p.price_range || '₹150–₹500',
          usageSteps: Array.isArray(p.usage_steps) ? p.usage_steps : ['Follow product label instructions'],
        }))
        : [];

      console.log(`   ✅ Model ${modelName} succeeded`);
      return {
        disease_name: parsed.disease_name || 'Unknown Disease',
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
        severity: ['Low', 'Medium', 'High', 'Critical'].includes(parsed.severity) ? parsed.severity : 'Medium',
        affected_area_percent: Math.min(100, Math.max(0, Number(parsed.affected_area_percent) || 10)),
        is_healthy: Boolean(parsed.is_healthy),
        why_it_happened: parsed.why_it_happened || 'Detailed analysis not available. Please consult a local agronomist.',
        causes: Array.isArray(parsed.causes) && parsed.causes.length > 0
          ? parsed.causes.slice(0, 5)
          : ['Environmental stress', 'Fungal/bacterial pathogen', 'Poor crop management'],
        treatment: Array.isArray(parsed.treatment) && parsed.treatment.length > 0
          ? parsed.treatment.slice(0, 6)
          : ['Remove infected plant parts', 'Apply suitable fungicide', 'Improve drainage', 'Consult local agronomist'],
        prevention: Array.isArray(parsed.prevention) && parsed.prevention.length > 0
          ? parsed.prevention.slice(0, 5)
          : ['Regular crop monitoring', 'Proper irrigation management', 'Use disease-resistant varieties'],
        pesticides,
        _model: modelName,
      };

    } catch (err) {
      const isModel404 = err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('MODEL_NOT_FOUND'));
      console.warn(`   ⚠️  ${modelName} failed: ${err.message ? err.message.substring(0, 120) : err}`);
      lastModelError = err;

      if (!isModel404) {
        // Non-404 errors (rate limit, parse error) — try next model
        continue;
      }
      // 404 from this model — try next
      continue;
    }
  }

  // All models failed
  const isRateLimit = lastModelError && (
    lastModelError.message?.includes('429') ||
    lastModelError.message?.includes('quota') ||
    lastModelError.message?.includes('retry') ||
    lastModelError.message?.includes('RESOURCE_EXHAUSTED')
  );

  if (isRateLimit) {
    throw new Error('RATE_LIMIT: Gemini API quota exceeded. Please wait a minute and try again. If this persists, consider upgrading your Google AI Studio plan or using a different API key.');
  }

  throw new Error(lastModelError?.message || 'All Gemini models failed to analyze the image.');
}

module.exports = { analyzeWithGemini };
