/**
 * RealTimeNotifications.ts
 * Integrates directly with the Telegram Bot API to deliver dopamine-driven alerts.
 */

// Providing the user-supplied token for the "Live City" phase.
// NOTE: For production, this should be moved to a secure Cloud Function backend.
// Providing the user-supplied token for the "Live City" phase.
// NOTE: For production, this should be moved to a secure Cloud Function backend.
const BOT_TOKEN = "8524844089:AAE65asUrxrT9ey21HubCE6TvZTdK4NgzAE";
const RESEND_API_KEY = "re_Ta2TAJZH_QBmnru1zAojNRgobaiBeirzX";

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

/**
 * Sends an email invite via Resend API.
 */
export const sendEmailInvite = async (to: string, inviterName: string, referralLink: string) => {
    console.log(`[EmailInvite] Sending to ${to} from ${inviterName}`);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SaraFun <onboarding@resend.dev>', // Note: This is the default testing sender
                to: [to],
                subject: `You've been added to ${inviterName}'s Trust Network!`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #1a1c1e;">
                        <h2>Hello!</h2>
                        <p><strong>${inviterName}</strong> has just added you to their private trust circles on <strong>SaraFun</strong>.</p>
                        <p>Join the network to see your standing and start earning rewards for your reputation:</p>
                        <div style="margin: 30px 0;">
                            <a href="${referralLink}" style="background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Join SaraFun</a>
                        </div>
                        <p style="color: #64748b; font-size: 12px;">This link will open Telegram Mini App.</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error(`[Resend] Error:`, err);
        }
    } catch (error) {
        console.error(`[EmailInvite] Error:`, error);
    }
};

export const notifyNetworking = async (targetUid: string) => {
    const msg = `👤 Someone added you to their circles on SaraFun. Add them back?`;
    return await sendBotNotification(targetUid, msg);
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
