const groq = require('../config/groqClient');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');

function cleanJsonString(str) {
  if (!str) return '{}';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return cleaned;
}

function repairTruncatedJson(jsonStr) {
  let str = cleanJsonString(jsonStr);
  try {
    return JSON.parse(str);
  } catch (e) {
    let openBrackets = 0;
    let openBraces = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces = Math.max(0, openBraces - 1);
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets = Math.max(0, openBrackets - 1);
      }
    }

    if (inString) str += '"';
    str = str.trim().replace(/,\s*$/, '');

    while (openBrackets > 0) {
      str += ']';
      openBrackets--;
    }
    while (openBraces > 0) {
      str += '}';
      openBraces--;
    }

    return JSON.parse(str);
  }
}

exports.generateItinerary = async (req, res) => {
  const { destination, startDate, endDate, budget, currency, travelers, interests, travelStyle, additionalNotes } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = `You are Traveloop AI planner. Return ONLY compact valid JSON adhering strictly to this schema:
{
  "tripTitle": "string",
  "destination": "string",
  "totalDays": 3,
  "estimatedTotalCost": 50000,
  "currency": "INR",
  "summary": "string",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "string",
      "location": "string",
      "dailyBudget": 15000,
      "activities": [
        {
          "time": "10:00 AM",
          "name": "string",
          "type": "sightseeing",
          "description": "string",
          "estimatedCost": 1000
        }
      ]
    }
  ]
}`;

  const userPrompt = `Create a 3-day travel itinerary for ${destination}. Budget: ${budget} ${currency}. Style: ${travelStyle || 'mid'}. Interests: ${interests?.join(', ') || 'Culture'}.`;

  const modelsToTry = ['groq/compound-mini', 'groq/compound', 'qwen/qwen3.8-27b'];

  for (const model of modelsToTry) {
    try {
      const stream = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: model,
        max_tokens: 2200,
        temperature: 0.6,
        stream: true,
        response_format: { type: 'json_object' }
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }
      }

      const cleanedFull = cleanJsonString(fullResponse);
      res.write(`data: ${JSON.stringify({ done: true, full: cleanedFull })}\n\n`);
      res.end();
      return;
    } catch (error) {
      console.warn(`[AI GENERATION ATTEMPT FAILED] Model: ${model}, Error: ${error.message}`);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }
};

exports.saveAiItinerary = async (req, res) => {
  try {
    let { aiItinerary } = req.body;
    if (!aiItinerary) {
      return res.status(400).json({ message: "No itinerary payload provided" });
    }

    if (typeof aiItinerary === 'string') {
      try {
        aiItinerary = repairTruncatedJson(aiItinerary);
      } catch (e) {
        console.error('Failed to repair string aiItinerary:', e);
      }
    }

    // Safely extract dates
    let startDate = new Date();
    let endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (aiItinerary.days && Array.isArray(aiItinerary.days) && aiItinerary.days.length > 0) {
      const firstDate = new Date(aiItinerary.days[0].date);
      const lastDate = new Date(aiItinerary.days[aiItinerary.days.length - 1].date);
      if (!isNaN(firstDate.getTime())) startDate = firstDate;
      if (!isNaN(lastDate.getTime())) endDate = lastDate;
    }

    // Create Trip in MongoDB
    const newTrip = await Trip.create({
      user: req.user._id,
      title: aiItinerary.tripTitle || aiItinerary.title || `Trip to ${aiItinerary.destination || 'Destination'}`,
      description: aiItinerary.summary || `AI Generated Trip to ${aiItinerary.destination || 'Destination'}`,
      startDate,
      endDate,
      destinations: [aiItinerary.destination || 'Destination'],
      totalBudget: Number(aiItinerary.estimatedTotalCost || aiItinerary.totalBudget || 0),
      status: 'upcoming',
      isPublic: false
    });

    // Create Itinerary in MongoDB
    const daysArray = Array.isArray(aiItinerary.days) ? aiItinerary.days : [];
    const sections = daysArray.map((day, idx) => {
      let dayDate = new Date(startDate.getTime() + idx * 24 * 60 * 60 * 1000);
      if (day.date && !isNaN(new Date(day.date).getTime())) {
        dayDate = new Date(day.date);
      }

      const activities = Array.isArray(day.activities) ? day.activities : [];

      return {
        title: `Day ${day.day || idx + 1} — ${day.title || 'Exploring'}`,
        description: day.location || '',
        budget: Number(day.dailyBudget || 0),
        dateRange: { start: dayDate, end: dayDate },
        activities: activities.map(act => {
          let mappedType = 'activity';
          const t = act.type ? String(act.type).toLowerCase() : 'activity';
          if (t.includes('hotel') || t.includes('accommodation')) mappedType = 'hotel';
          else if (t.includes('flight')) mappedType = 'flight';
          else if (t.includes('food') || t.includes('dine') || t.includes('restaurant')) mappedType = 'food';
          else if (t.includes('transport') || t.includes('bus') || t.includes('train')) mappedType = 'transport';
          else if (t.includes('sight') || t.includes('tour') || t.includes('visit')) mappedType = 'sightseeing';
          else mappedType = t || 'activity';

          return {
            name: act.name || 'Activity',
            type: mappedType,
            date: dayDate,
            time: act.time || '10:00 AM',
            cost: Number(act.estimatedCost || act.cost || 0),
            notes: (act.description || '') + (act.tips ? `\nTip: ${act.tips}` : '')
          };
        })
      };
    });

    await Itinerary.create({
      trip: newTrip._id,
      sections
    });

    console.log(`[SAVE AI TRIP SUCCESS] Saved Trip ID: ${newTrip._id} for user ${req.user._id}`);
    res.status(201).json({ success: true, tripId: newTrip._id });
  } catch (error) {
    console.error('Error saving AI itinerary:', error);
    res.status(500).json({ message: error.message });
  }
};
