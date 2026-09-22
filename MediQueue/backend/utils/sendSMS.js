/**
 * Sends SMS notification.
 * Uses Twilio SDK if environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are configured.
 * Otherwise, gracefully logs the SMS message to the server console.
 */
function sendSMS(toPhone, message) {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE_NUMBER;

        if (accountSid && authToken && fromPhone) {
            const twilio = require("twilio");
            const client = twilio(accountSid, authToken);
            client.messages
                .create({
                    body: message,
                    from: fromPhone,
                    to: toPhone,
                })
                .catch((err) => console.log("[Twilio SMS Error]:", err.message));
        } else {
            console.log(`[SMS Notification] To: ${toPhone} | Message: ${message}`);
        }
    } catch (err) {
        console.log("[SMS Notification Error]:", err.message);
    }
}

module.exports = { sendSMS };
