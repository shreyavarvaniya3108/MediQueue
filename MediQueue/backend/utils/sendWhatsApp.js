/**
 * Sends a WhatsApp message using CallMeBot — a genuinely free-forever service
 * with no credit card and no paid tiers, ideal for student/demo projects.
 *
 * How it works: each recipient must opt in ONCE by messaging CallMeBot's
 * WhatsApp number themselves. After that, this function can message them
 * for free, indefinitely.
 *
 * One-time setup per phone number (do this for your own test numbers):
 * 1. Save +34 644 51 95 23 as a contact
 * 2. WhatsApp them: "I allow callmebot to message me"
 * 3. You'll get a reply with an API key (e.g. "123456")
 * 4. Store that key against the user (see note in User model)
 *
 * Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */

const axios = require("axios");

/**
 * @param {string} phone - phone number in international format, e.g. "919876543210" (no + or spaces)
 * @param {string} apiKey - the key the recipient received from CallMeBot
 * @param {string} message - the text to send
 */
async function sendWhatsApp(phone, apiKey, message) {
    if (!phone || !apiKey) {
        console.log(`[WhatsApp not sent - missing phone/apiKey] To: ${phone} | Message: ${message}`);
        return { simulated: true };
    }

    try {
        const url = "https://api.callmebot.com/whatsapp.php";
        const response = await axios.get(url, {
            params: {
                phone,
                text: message,
                apikey: apiKey,
            },
        });
        return response.data;
    } catch (error) {
        console.log("WhatsApp sending failed:", error.message);
        return { error: error.message };
    }
}

module.exports = { sendWhatsApp };