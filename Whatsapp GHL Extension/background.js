// Background script for WhatsApp GHL Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp GHL Contact Lookup extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes('web.whatsapp.com')) {
        chrome.action.openPopup();
    } else {
        chrome.tabs.create({
            url: 'https://web.whatsapp.com'
        });
    }
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('web.whatsapp.com')) {
        // Content script should already be injected via manifest
        // But we can send a message to reinitialize if needed
        chrome.tabs.sendMessage(tabId, {action: 'pageReloaded'}).catch(() => {
            // Ignore errors if content script isn't ready yet
        });
    }
});