/**
 * Places an automated voice call to a patient using Twilio Voice,
 * with Twilio's built-in text-to-speech (no extra service needed).
 *
 * Uses the SAME Twilio credentials already set up for SMS in .env
 * (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).
 *
 * Note: unlike the free WhatsApp integration (CallMeBot), real phone
 * calls always cost a small per-minute fee through any provider —
 * there is no permanently-free voice calling API. Twilio's free trial
 * credit is enough to fully test and demo this feature at no cost.
 *
 * Phone numbers must be in E.164 format, e.g. "+919876543210".
 */

let twilioClient = null;

function getClient() {
    if (twilioClient) return twilioClient;

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;

    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
}

/**
 * @param {string} toPhoneNumber - E.164 format, e.g. "+919876543210"
 * @param {string} message - what the AI voice should say
 * @param {string} voice - Twilio TTS voice, e.g. "Polly.Aditi" (Hindi-English) or "alice" (default)
 */
async function makeVoiceCall(toPhoneNumber, message, voice = "Polly.Aditi") {
    const client = getClient();

    if (!client) {
        console.log(`[Voice call not made - Twilio not configured] To: ${toPhoneNumber} | Message: ${message}`);
        return { simulated: true };
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="en-IN">${message}</Say>
</Response>`;

    try {
        const call = await client.calls.create({
            twiml,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber,
        });
        return call;
    } catch (error) {
        console.log("Voice call failed:", error.message);
        return { error: error.message };
    }
}

module.exports = { makeVoiceCall };