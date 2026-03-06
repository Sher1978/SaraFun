import WebApp from '@twa-dev/sdk';

// As per Chapter 05 constraints
const STARS_EXCHANGE_RATE = 50; // 1 USD = 50 Stars

export const createInvoice = async (serviceId: string, amountUsd: number): Promise<boolean> => {
    const starsAmount = Math.ceil(amountUsd * STARS_EXCHANGE_RATE);

    // In a real implementation, we would call our Firebase Function to generate an invoice link
    // using Telegram's Bot API (creating an invoice link for given amount/payload).
    // For the frontend TMA logic, we open that link using WebApp.openInvoice.

    console.log(`[Payment] Creating invoice for ${starsAmount} Stars (${amountUsd} USD)`);

    // Mock url assuming backend provided it
    const mockInvoiceUrl = `https://t.me/$invoice_mock_${serviceId}_${starsAmount}`;

    return new Promise((resolve) => {
        // We check if SDK is fully active
        if (WebApp.initDataUnsafe?.user) {
            WebApp.openInvoice(mockInvoiceUrl, (status) => {
                if (status === 'paid') {
                    console.log('[Payment] Success: User paid the invoice.');
                    resolve(true);
                } else if (status === 'cancelled') {
                    console.log('[Payment] Cancelled: User closed the invoice.');
                    resolve(false);
                } else if (status === 'failed') {
                    console.error('[Payment] Error: Transaction failed.');
                    resolve(false);
                } else {
                    // pending
                    resolve(false);
                }
            });
        } else {
            console.warn('[Payment] Cannot open invoice, not in Telegram WebApp context.');
            // Mock successful payment for local dev
            resolve(true);
        }
    });
};
