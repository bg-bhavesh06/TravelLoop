const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function repairJson(jsonStr) {
  if (!jsonStr) return null;
  let str = jsonStr.trim();
  if (str.startsWith('```')) {
    str = str.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
  }

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

export const aiService = {
  generateItinerary: async (payload, onChunk, token) => {
    const response = await fetch(`${API_URL}/ai/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to generate itinerary');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = '';
    let fullText = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.chunk) {
              fullText += data.chunk;
              onChunk(fullText);
            }
            if (data.done && data.full) {
              const parsed = repairJson(data.full);
              if (parsed) return parsed;
            }
          } catch (e) {
            if (e.message && e.message.includes('Rate limit')) {
              throw e;
            }
          }
        }
      }
    }

    // Process remaining buffer if done signal was in the final popped line
    if (buffer.trim().startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.trim().slice(6));
        if (data.done && data.full) {
          const parsed = repairJson(data.full);
          if (parsed) return parsed;
        }
      } catch (e) {}
    }

    // Robust Fallback: parse fullText accumulated from chunks
    if (fullText.trim()) {
      const parsed = repairJson(fullText);
      if (parsed) return parsed;
    }

    throw new Error('AI generation completed but failed to parse itinerary JSON');
  },
  saveItinerary: async (aiItinerary, token) => {
    const response = await fetch(`${API_URL}/ai/save-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ aiItinerary })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to save itinerary');
    }
    return response.json();
  }
};
