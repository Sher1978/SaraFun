/**
 * RealTimeNotifications.ts
 * Integrates directly with the Telegram Bot API to deliver dopamine-driven alerts.
 */

// Providing the user-supplied token for the "Live City" phase.
// NOTE: For production, this should be moved to a secure Cloud Function backend.
const BOT_TOKEN = "8524844089:AAE65asUrxrT9ey21HubCE6TvZTdK4NgzAE";

export const sendBotNotification = async (chatId: string, message: string) => {
    console.log(`[BotNotification] To ${chatId}: ${message}`);

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
        });

        if (!response.ok) {
            console.error(`[BotNotification] Failed to send message: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`[BotNotification] Error sending message:`, error);
    }
};

export const notifyGoldenFive = async (targetUid: string, adderName: string) => {
    const msg = `🌟 Congratulations! You've been promoted to someone's Golden Five on SaraFun. Your reputation is growing!`;
    // Note: targetUid must be a valid Telegram chat_id (number) for this to work.
    return await sendBotNotification(targetUid, msg);
};
