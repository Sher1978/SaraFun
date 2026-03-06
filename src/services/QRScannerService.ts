import WebApp from '@twa-dev/sdk';
import { updateSocialGraph } from './userService';

/**
 * QRScannerService integrates Telegram's native QR scanner
 * to capture UIDs and add them to the Shadow List.
 */
export const openQRScanner = (currentUserUid: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!WebApp.initDataUnsafe?.user) {
            console.warn('[QR] Not in Telegram context. Simulating shadow add.');
            // Mock for local dev
            updateSocialGraph(currentUserUid, 'mock_scanned_user', 'Shadow')
                .then(() => resolve(true))
                .catch(() => resolve(false));
            return;
        }

        try {
            WebApp.showScanQrPopup({ text: "Scan SaraFun Contact" }, async (text) => {
                // Assume the QR text is just the targetUID or a defined structure like sarafun://user/123
                // Parsing logic here: (simplified to treat exact match as UID)
                let targetUid = text;
                if (text.startsWith('sarafun://user/')) {
                    targetUid = text.replace('sarafun://user/', '');
                }

                if (targetUid) {
                    // Add to shadow list natively
                    await updateSocialGraph(currentUserUid, targetUid, 'Shadow');
                    WebApp.closeScanQrPopup();
                    // Optionally show an alert native to Telegram
                    WebApp.showAlert('Contact added to Shadow List!');
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        } catch (err) {
            console.error("[QR] Error opening scanner", err);
            resolve(false);
        }
    });
};
