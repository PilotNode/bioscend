/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const callOpenRouter = onCall({ cors: true }, async (request) => {
    // Ensure the user is authenticated
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { model, messages } = request.data;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        logger.error("OPENROUTER_API_KEY is not set.");
        throw new HttpsError('failed-precondition', 'API key not configured.');
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://bioscend.app", // Adjust as needed
                "X-Title": "BioScend"
            },
            body: JSON.stringify({
                model: model || "google/gemini-2.0-flash-lite-preview-02-05:free",
                messages: messages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error("OpenRouter API error", errorText);
            // Attempt to parse error JSON if possible
            try {
                const errorJson = JSON.parse(errorText);
                throw new HttpsError('unknown', errorJson.error?.message || response.statusText, errorJson);
            } catch (e) {
                throw new HttpsError('unknown', `OpenRouter API error: ${response.statusText}`, errorText);
            }
        }

        const data = await response.json() as any;
        return data.choices[0].message; // Return the message content object
    } catch (error: any) {
        logger.error("Fetch error", error);
        throw new HttpsError('internal', 'Failed to call OpenRouter API', error.message);
    }
});
