# WhatsApp GHL Contact Lookup Chrome Extension

## Overview

The **WhatsApp GHL Contact Lookup** is a Chrome extension that overlays GoHighLevel (GHL) contact information (name, email, and tags) on WhatsApp Web (`web.whatsapp.com`) for chats associated with phone numbers stored in your GHL account. It enhances your WhatsApp experience by displaying relevant contact details directly in the chat list and active conversation header.

## Features

- **Chat List Overlays**: Displays a contact's name, email, and tags in a styled overlay on each chat in the WhatsApp Web chat list.
- **Active Conversation Overlay**: Shows the contact's name and email in the conversation header for the active chat.
- **GHL API Integration**: Retrieves contact data from GoHighLevel using a provided API key and location ID.
- **Settings Popup**: Allows users to input and save their GHL API key and location ID.
- **Responsive Design**: Overlays adjust for smaller screens with responsive CSS.
- **Caching**: Stores contact data locally to reduce API calls.

## Installation

1. **Clone or Download the Repository**:
   - Download the extension files to a folder (e.g., `~/Downloads/Whatsapp GHL Extension/`).

2. **Ensure Correct File Structure**:
   - Verify the following files are in the root directory:
     ```
     ~/Downloads/Whatsapp GHL Extension/
     ├── manifest.json
     ├── background.js
     ├── content.js
     ├── styles.css
     ├── popup.html
     ├── popup.js
     ├── icon16.png
     ├── icon48.png
     ├── icon128.png
     ```
   - Note: If icon files are missing, create placeholder PNGs (16x16, 48x48, 128x128 pixels) or remove the `"icons"` section from `manifest.json` temporarily:
     ```json
     "icons": {}
     ```

3. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" (top right).
   - Click "Load unpacked" and select the folder containing the extension files (e.g., `~/Downloads/Whatsapp GHL Extension/`).
   - Ensure no errors appear on the Extensions page. If errors occur, see the [Troubleshooting](#troubleshooting) section.

## Usage

1. **Configure GHL API Settings**:
   - Click the extension icon in the Chrome toolbar to open the popup.
   - Enter your GoHighLevel API key and location ID.
   - Click "Save Settings" to store the credentials.
   - The popup will display "Settings saved successfully!" upon success.

2. **Open WhatsApp Web**:
   - Navigate to `https://web.whatsapp.com` and log in to your WhatsApp account.
   - Ensure you have chats with phone numbers that match contacts in your GHL account (e.g., `+1234567890`).

3. **View Contact Overlays**:
   - **Chat List**: For each chat with a matching phone number, a purple gradient overlay appears in the top-right corner, showing the contact’s name, email, and tags.
   - **Active Conversation**: When you open a chat, a green overlay in the conversation header displays the contact’s name and email.
   - Overlays are styled for visibility and include a fade-in animation.

4. **Debugging**:
   - Open Chrome Developer Tools (`Ctrl+Shift+J` or `Cmd+Opt+J` on Mac) on `web.whatsapp.com`.
   - Check the console for errors related to API calls or DOM interactions.
   - Inspect overlays (`.ghl-contact-overlay`, `.ghl-header-overlay`) to verify positioning and content.

## File Structure

- **`manifest.json`**: Defines the extension’s configuration, permissions, content scripts, background script, and popup.
- **`background.js`**: Handles extension initialization and tab interactions, opening WhatsApp Web or the popup as needed.
- **`content.js`**: Core logic for observing WhatsApp Web’s DOM, extracting phone numbers, fetching GHL contact data, and creating overlays.
- **`styles.css`**: Styles for contact overlays (chat list and header) with responsive design and animations.
- **`popup.html`**: UI for entering and saving GHL API key and location ID.
- **`popup.js`**: Handles saving settings and notifying the content script of updates.
- **`icon16.png`, `icon48.png`, `icon128.png`**: Icon files for the extension (16x16, 48x48, 128x128 pixels).

## Requirements

- **Chrome Browser**: Compatible with Chrome supporting Manifest V3.
- **GoHighLevel Account**: A valid API key and location ID are required for GHL API access.
- **WhatsApp Web**: Access to `https://web.whatsapp.com` with chats linked to phone numbers in your GHL account.
- **Phone Number Format**: Phone numbers in WhatsApp and GHL must match (e.g., include country codes like `+1234567890`).

## Troubleshooting

If the extension fails to load or overlays don’t appear, follow these steps:

1. **Extension Loading Errors**:
   - **Error**: "Could not load manifest" or issues with specific files (`background.js`, `content.js`, `icon16.png`, etc.).
   - **Fix**:
     - Ensure all files are correctly named (e.g., rename `content_js.js` to `content.js`, `popup_html.html` to `popup.html`, `styles_css.css` to `styles.css`).
     - Verify icon files exist or remove the `"icons"` section from `manifest.json`.
     - Reload the extension in Chrome (`chrome://extensions/` > "Load unpacked").
     - Check the Extensions page for detailed error messages.

2. **No Overlays Displayed**:
   - **Possible Causes**:
     - Invalid GHL API key or location ID.
     - Phone number format mismatch between WhatsApp and GHL.
     - WhatsApp Web DOM structure changes breaking selectors.
   - **Fix**:
     - Verify API credentials in the GHL dashboard.
     - Test the API directly (e.g., via Postman) with:
       ```
       GET https://services.leadconnectorhq.com/contacts/search?locationId=<your-location-id>&query=<phone-number>
       Authorization: Bearer <your-api-key>
       ```
     - Inspect WhatsApp Web’s DOM (`[data-testid="chat-list"]`, `[data-testid="conversation-header"]`) and update selectors in `content.js` if needed.
     - Check the console for errors like `Failed to fetch`.

3. **Overlay Styling Issues**:
   - **Problem**: Overlays are hidden, misaligned, or overlap incorrectly.
   - **Fix**: Inspect `.ghl-contact-overlay` and `.ghl-header-overlay` in Developer Tools. Adjust `styles.css` properties (e.g., `z-index`, `top`, `right`) as needed.

4. **Console Errors**:
   - Open Developer Tools on `web.whatsapp.com` and check for errors.
   - For background script errors, go to `chrome://extensions/`, click "Inspect views" > "background page", and review the console.

## Known Limitations

- **WhatsApp DOM Changes**: The extension relies on specific WhatsApp Web selectors (`[data-testid="chat-list"]`, `[data-testid="conversation-header"]`). Updates to WhatsApp’s interface may break phone number extraction.
- **Phone Number Matching**: Phone numbers must match exactly between WhatsApp and GHL. Inconsistent formats may prevent contact lookups.
- **API Dependency**: Requires a stable internet connection and valid GHL API credentials.

## Contributing

To contribute:
1. Fork the repository or create a local copy.
2. Make changes to the code (e.g., update selectors, improve styling, or add features).
3. Test thoroughly on `web.whatsapp.com`.
4. Submit a pull request or share feedback.

## License

This project is unlicensed. Use it at your own risk and ensure compliance with GoHighLevel and WhatsApp’s terms of service.