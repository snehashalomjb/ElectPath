const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const SYSTEM_PROMPT = `You are ElectPath AI, a friendly, knowledgeable, and encouraging assistant that helps users navigate the election and voting process.

Your personality:
- Warm, approachable, and patient — like a trusted civic educator
- Clear and concise — avoid jargon, use plain language
- Encouraging — celebrate civic participation
- Non-partisan — never express opinions on candidates, parties, or political issues
- Structured — use bullet points, numbered lists, and bold text for clarity

Your expertise covers:
- Voter registration (deadlines, online/in-person/mail options, eligibility)
- Voter ID requirements (varies by state/country)
- Election Day logistics (polling places, hours, what to bring)
- Early voting and absentee/mail-in voting
- Election timeline and key dates
- How votes are counted and certified
- Rights at the polling place
- Frequently asked questions about the voting process

INDIA-SPECIFIC KNOWLEDGE (EPIC / Voter ID):
- The Voter ID card in India is called EPIC (Electors Photo Identity Card)
- Issued by the Election Commission of India (ECI)
- Eligibility: Indian citizen, aged 18+, ordinarily resident
- Application: Fill Form 6 on https://voters.eci.gov.in/
- Required documents: Aadhaar card, proof of age (birth cert/10th marksheet), proof of address, passport-size photo
- Also accepted: Passport, PAN card, driving licence as identity proof
- After applying you get a Reference ID to track your application
- Voter Helpline: 1950 | NVSP = National Voters Service Portal
- Voter ID status: Not Applied / Applied / Under Verification / Approved
- First-time voters use Form 6; corrections via Form 8; address change via Form 8A

Formatting rules:
- Use **bold** for key terms and important facts
- Use numbered lists for step-by-step instructions
- Use bullet points for options or lists
- Keep responses to 3-5 sentences or a short list — be concise
- End with an encouraging note or a follow-up question when appropriate
- If the user shares personal info (name, location), use it to personalize your response

Do NOT:
- Express political opinions or endorse any candidate/party
- Provide legal advice
- Discuss topics unrelated to elections and voting`;

// POST /api/chat — Standard (non-streaming)
router.post('/', async (req, res) => {
  try {
    const { message, history = [], userProfile = null } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      const fallback = getFallbackResponse(message.trim().toLowerCase(), userProfile);
      return res.json({ reply: fallback, isDemo: true });
    }
    const openai = new OpenAI({ apiKey });
    let systemPrompt = SYSTEM_PROMPT;
    if (userProfile?.name) {
      systemPrompt += `\n\nUser context: Name: ${userProfile.name}, Age: ${userProfile.age}, Location: ${userProfile.location}. Has Voter ID: ${userProfile.hasVoterId}. Personalise responses using this context.`;
    }
    const recentHistory = history.slice(-14).map(m => ({ role: m.role, content: m.content }));
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...recentHistory, { role: 'user', content: message.trim() }],
      max_tokens: 600,
      temperature: 0.65,
    });
    const reply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
    const followUps = generateFollowUps(message.toLowerCase());
    res.json({ reply, followUps, isDemo: false });
  } catch (err) {
    console.error('Chat error:', err.message);
    const fallback = getFallbackResponse(req.body?.message?.toLowerCase() || '', req.body?.userProfile);
    res.json({ reply: fallback, followUps: [], isDemo: true, error: 'AI temporarily unavailable.' });
  }
});

// POST /api/chat/stream — Streaming SSE
router.post('/stream', async (req, res) => {
  const { message, history = [], userProfile = null } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

  const apiKey = process.env.OPENAI_API_KEY;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    const fallback = getFallbackResponse(message.toLowerCase(), userProfile);
    const words = fallback.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(r => setTimeout(r, 35));
      sendEvent({ type: 'delta', content: (i === 0 ? '' : ' ') + words[i] });
    }
    sendEvent({ type: 'done', followUps: generateFollowUps(message.toLowerCase()), isDemo: true });
    res.end();
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });
    let systemPrompt = SYSTEM_PROMPT;
    if (userProfile?.name) {
      systemPrompt += `\n\nUser context: Name: ${userProfile.name}, Age: ${userProfile.age}, Location: ${userProfile.location}. Has Voter ID: ${userProfile.hasVoterId}.`;
    }
    const stream = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-14).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 600, temperature: 0.65, stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) sendEvent({ type: 'delta', content: delta });
    }
    sendEvent({ type: 'done', followUps: generateFollowUps(message.toLowerCase()), isDemo: false });
    res.end();
  } catch (err) {
    console.error('Stream error:', err.message);
    sendEvent({ type: 'error', message: 'AI service error. Please try again.' });
    res.end();
  }
});

// ─── Follow-up suggestions ────────────────────────────────────────────────────
function generateFollowUps(msg) {
  if (msg.includes('india') || msg.includes('epic') || msg.includes('eci') || msg.includes('nvsp') || msg.includes('form 6')) {
    return ['What documents do I need for EPIC?', 'How long does approval take?', 'How do I track my Voter ID?'];
  }
  if (msg.includes('voter id') && (msg.includes('apply') || msg.includes('get') || msg.includes('how'))) {
    return ['What is Form 6?', 'What documents do I need?', 'Where do I apply online?'];
  }
  if (msg.includes('eligib')) {
    return ['I am 18, am I eligible?', 'What if I am an NRI?', 'Can I apply online?'];
  }
  if (msg.includes('register') || msg.includes('registration')) {
    return ['What documents do I need?', "What's the deadline?", 'Can I register online?'];
  }
  if (msg.includes('id') || msg.includes('identification')) {
    return ["What if I don't have a photo ID?", 'Is a passport accepted?', 'How do I get a free voter ID?'];
  }
  if (msg.includes('vote') || msg.includes('voting') || msg.includes('ballot') || msg.includes('poll')) {
    return ['What time do polls open?', 'Can I vote early?', "What if I'm in line at closing time?"];
  }
  if (msg.includes('mail') || msg.includes('absentee')) {
    return ['When is the mail-in ballot deadline?', 'How do I track my ballot?', 'Where do I drop off my ballot?'];
  }
  if (msg.includes('deadline') || msg.includes('date') || msg.includes('when')) {
    return ['When does early voting start?', 'When is registration due?', 'When are results announced?'];
  }
  if (msg.includes('result') || msg.includes('count')) {
    return ['How long does counting take?', 'How are results certified?', 'What if I suspect fraud?'];
  }
  return ['How do I register to vote?', 'How do I apply for Voter ID in India?', 'Can I vote early?'];
}

// ─── Fallback responses ───────────────────────────────────────────────────────
function getFallbackResponse(msg, profile) {
  const name = profile?.name ? profile.name.split(' ')[0] : null;
  const greeting = name ? `Great question, ${name}! ` : '';

  // India-specific
  if (msg.includes('india') || msg.includes('epic') || msg.includes('eci') || msg.includes('nvsp') ||
      (msg.includes('voter id') && (msg.includes('apply') || msg.includes('india') || msg.includes('how')))) {
    return `${greeting}🇮🇳 **Voter ID in India (EPIC)**\n\nTo apply for your **Voter ID (EPIC card)**:\n1. Go to **voters.eci.gov.in** — the official ECI portal\n2. Select **"New Voter Registration (Form 6)"**\n3. Fill in your details and upload documents\n4. Submit and save your **Reference ID**\n\nDocuments needed: **Aadhaar, Age proof, Address proof, Passport photo**\n\nUse the **"Get Your Voter ID"** card on the Home screen for a guided step-by-step flow! 🎉`;
  }
  if (msg.includes('form 6') || msg.includes('form-6')) {
    return `${greeting}📋 **Form 6 — New Voter Registration (India)**\n\n**Form 6** is used by first-time voters to register in India.\n\n1. Visit **voters.eci.gov.in**\n2. Click "New Voter Registration" → Fill Form 6\n3. Upload: Aadhaar, Age proof, Photo\n4. Submit online — no office visit needed!\n\nYou can also fill it at your nearest BLO (Booth Level Officer). Good luck! 🗳️`;
  }
  if (msg.includes('eligib') || msg.includes('qualify')) {
    return `${greeting}✅ **Voter ID Eligibility (India)**\n\nTo be eligible for an EPIC (Voter ID) in India:\n\n- Be an **Indian citizen**\n- Be **18 years or older** (as of 1st January of the qualifying year)\n- Be **ordinarily resident** at your address\n\nUse the **Eligibility Check** in the Voter ID module to verify instantly! 🎊`;
  }
  if (msg.includes('document') && (msg.includes('india') || msg.includes('epic') || msg.includes('voter'))) {
    return `${greeting}📁 **Documents for Voter ID (India)**\n\nYou will need:\n- **Identity Proof**: Aadhaar, Passport, PAN Card, or Driving Licence\n- **Age Proof**: Birth Certificate or 10th Marksheet\n- **Address Proof**: Aadhaar, Utility bill, or Bank passbook\n- **Passport-size Photo**: White background, clear face\n\nAadhaar alone covers both identity and address. Simple! 😊`;
  }
  if (msg.includes('track') || msg.includes('reference') || (msg.includes('status') && msg.includes('voter'))) {
    return `${greeting}🔍 **Track Your Voter ID Application (India)**\n\n1. Go to **voters.eci.gov.in**\n2. Click **"Track Application Status"**\n3. Enter your **Reference ID** received after applying\n\nAlternatively, call the **Voter Helpline: 1950** for support.\n\nSave your Reference ID in ElectPath's Track step! 📊`;
  }
  // General responses
  if (msg.includes('register') || msg.includes('registration')) {
    return `${greeting}📋 **Voter Registration**\n\nTo register to vote:\n1. Visit your state's official election website\n2. Fill out the form with your name, address, and ID\n3. Submit before the deadline (usually 15–30 days before Election Day)\n\nSome states allow **same-day registration** — check yours! 🎉`;
  }
  if (msg.includes('id') || msg.includes('identification')) {
    return `${greeting}🪪 **Voter ID Requirements**\n\nID requirements vary by state:\n- **Strict photo ID**: Driver's license, passport, or government ID\n- **Non-strict**: Various documents or affidavit\n- **No ID required**: Signature verification only\n\nCheck your state's official election site to confirm.`;
  }
  if (msg.includes('mail') || msg.includes('absentee')) {
    return `${greeting}✉️ **Mail-In / Absentee Voting**\n\n1. Check if your state allows no-excuse absentee voting\n2. Request your ballot before the deadline\n3. Complete and **sign** your ballot carefully\n4. Return via mail or official drop box\n\n⚠️ Do not put your ballot in a regular mailbox on Election Day!`;
  }
  if (msg.includes('vote') || msg.includes('voting') || msg.includes('ballot') || msg.includes('poll')) {
    return `${greeting}🗳️ **Voting on Election Day**\n\n1. Find your polling place at **vote.gov**\n2. Bring your required ID\n3. Check in and receive your ballot\n4. Mark privately and submit\n\nPolls open **7 AM – 8 PM**. If you're in line at closing time, you have the right to vote! 🎊`;
  }
  if (msg.includes('deadline') || msg.includes('date') || msg.includes('when')) {
    return `📅 **Key Election Dates**\n\n- **Registration Deadline**: 15–30 days before Election Day\n- **Early Voting**: Starts ~2 weeks before Election Day\n- **Mail-in Deadline**: ~1 week before Election Day\n- **Election Day**: November for US general elections\n\nCheck the **Timeline** tab for your specific dates!`;
  }
  if (msg.includes('early')) {
    return `${greeting}⏰ **Early Voting**\n\nEarly voting lets you vote **before** Election Day!\n\n- Starts 10–14 days before Election Day\n- Available at designated early voting centres\n- Same process as Election Day voting\n- Great way to beat long queues!\n\nCheck your county election office for exact dates.`;
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `👋 ${name ? `Hello, ${name}!` : 'Hello!'} Welcome to **ElectPath AI**!\n\nI can help you with:\n\n- 🇮🇳 **Apply for Voter ID in India** (EPIC via ECI)\n- 📋 How to **register to vote**\n- 🪪 **Voter ID** requirements\n- 📅 Important **deadlines and dates**\n- 🗳️ What to expect on **Election Day**\n\nWhat would you like to know? 😊`;
  }
  return `${greeting}👋 I'm **ElectPath AI** — your personal voting guide!\n\nHere are some things I can help with:\n\n- 🇮🇳 Apply for **Voter ID in India** (EPIC via ECI)\n- 📋 Voter registration steps\n- 🪪 ID requirements at the polls\n- 📅 Key election dates & deadlines\n- 🗳️ Election Day what-to-know\n\nAsk me anything!\n\n*(Add your OpenAI API key in \`server/.env\` for full AI-powered responses.)*`;
}

module.exports = router;
