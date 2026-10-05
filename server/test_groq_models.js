const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function findBestModel() {
  const list = await groq.models.list();
  const activeModels = list.data.map((m) => m.id);
  console.log("Available models:", activeModels);

  for (const model of activeModels) {
    if (
      model.includes("whisper") ||
      model.includes("guard") ||
      model.includes("arabic")
    )
      continue;
    try {
      console.log(`Testing model: ${model}...`);
      const res = await groq.chat.completions.create({
        messages: [
          { role: "user", content: 'Say hello in JSON: {"hello": "world"}' },
        ],
        model: model,
        max_tokens: 100,
      });
      console.log(
        `✅ WORKING MODEL FOUND: ${model} -> ${res.choices[0]?.message?.content}`,
      );
    } catch (err) {
      console.log(`❌ FAILED ${model}: ${err.message}`);
    }
  }
}

findBestModel();
