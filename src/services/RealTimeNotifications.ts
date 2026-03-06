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
    return await sendBotNotification(targetUid, msg);
};

export const notifyFinancial = async (targetUid: string, type: 'cashback' | 'mlm' | 'low_balance', amount: number) => {
    let msg = '';
    if (type === 'cashback') msg = `💰 Cashback Unlocked: ${amount}⭐️ has been moved to your Available Balance.`;
    else if (type === 'mlm') msg = `🌳 Split Bonus: You received ${amount}⭐️ from your referral network.`;
    else if (type === 'low_balance') msg = `⚠️ Yellow Status Warning: Your balance is dropping. Top up to maintain visibility!`;
    return await sendBotNotification(targetUid, msg);
};

export const notifyDispute = async (targetUid: string, action: 'opened' | 'verdict', details: string) => {
    let msg = '';
    if (action === 'opened') msg = `⚖️ Arbitration Alert: A dispute has been opened against your review. Details: ${details}`;
    else if (action === 'verdict') msg = `⚖️ Arbitration Verdict: The judges have ruled. ${details}`;
    return await sendBotNotification(targetUid, msg);
};

export const notifySubscription = async (targetUid: string, action: 'deducted' | 'shadowed') => {
    let msg = '';
    if (action === 'deducted') msg = `🧾 Visibility Fee: 250⭐️ ($5) has been deducted for this month's placement.`;
    else if (action === 'shadowed') msg = `🌑 Shadowed: Your balance could not cover the Visibility Fee. Your profile is now hidden from Discovery.`;
    return await sendBotNotification(targetUid, msg);
};
