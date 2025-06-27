// WhatsApp GHL Contact Lookup Content Script
class WhatsAppGHLLookup {
    constructor() {
        this.apiKey = null;
        this.locationId = null;
        this.contactCache = new Map();
        this.overlays = new Map();
        this.init();
    }

    async init() {
        await this.loadSettings();
        if (this.apiKey && this.locationId) {
            this.startObserving();
        }
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['ghlApiKey', 'ghlLocationId'], (result) => {
                this.apiKey = result.ghlApiKey;
                this.locationId = result.ghlLocationId;
                resolve();
            });
        });
    }

    startObserving() {
        // Wait for WhatsApp to fully load
        const checkReady = () => {
            const chatList = document.querySelector('[data-testid="chat-list"]');
            if (chatList) {
                this.observeChats();
            } else {
                setTimeout(checkReady, 1000);
            }
        };
        checkReady();
    }

    observeChats() {
        // Observe chat list for new chats
        const chatList = document.querySelector('[data-testid="chat-list"]');
        if (chatList) {
            const observer = new MutationObserver(() => {
                this.processVisibleChats();
            });
            
            observer.observe(chatList, {
                childList: true,
                subtree: true
            });
            
            // Process existing chats
            this.processVisibleChats();
        }

        // Also observe the main chat area for active conversations
        const mainArea = document.querySelector('#main');
        if (mainArea) {
            const mainObserver = new MutationObserver(() => {
                this.processActiveChat();
            });
            
            mainObserver.observe(mainArea, {
                childList: true,
                subtree: true
            });
        }
    }

    processVisibleChats() {
        const chatElements = document.querySelectorAll('[data-testid="chat-list"] > div');
        
        chatElements.forEach(chatElement => {
            const phoneNumber = this.extractPhoneNumber(chatElement);
            if (phoneNumber && !this.overlays.has(phoneNumber)) {
                this.addContactOverlay(chatElement, phoneNumber);
            }
        });
    }

    processActiveChat() {
        const header = document.querySelector('[data-testid="conversation-header"]');
        if (header) {
            const phoneNumber = this.extractPhoneNumberFromHeader(header);
            if (phoneNumber) {
                this.addHeaderOverlay(header, phoneNumber);
            }
        }
    }

    extractPhoneNumber(element) {
        // Try to find phone number in various ways
        const titleElement = element.querySelector('[title]');
        if (titleElement) {
            const title = titleElement.getAttribute('title');
            const phoneMatch = title.match(/\+?[\d\s\-\(\)]+/);
            if (phoneMatch) {
                return this.cleanPhoneNumber(phoneMatch[0]);
            }
        }

        // Look for spans with phone-like text
        const spans = element.querySelectorAll('span');
        for (const span of spans) {
            const text = span.textContent.trim();
            if (this.isPhoneNumber(text)) {
                return this.cleanPhoneNumber(text);
            }
        }

        return null;
    }

    extractPhoneNumberFromHeader(header) {
        const spans = header.querySelectorAll('span');
        for (const span of spans) {
            const text = span.textContent.trim();
            if (this.isPhoneNumber(text)) {
                return this.cleanPhoneNumber(text);
            }
        }
        return null;
    }

    isPhoneNumber(text) {
        // Basic phone number detection
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(text.replace(/\s/g, ''));
    }

    cleanPhoneNumber(phone) {
        // Remove all non-digit characters except +
        return phone.replace(/[^\d+]/g, '');
    }

    async addContactOverlay(chatElement, phoneNumber) {
        const contact = await this.getContactInfo(phoneNumber);
        if (contact) {
            this.createOverlay(chatElement, contact, phoneNumber);
        }
    }

    async addHeaderOverlay(header, phoneNumber) {
        const contact = await this.getContactInfo(phoneNumber);
        if (contact) {
            this.createHeaderOverlay(header, contact, phoneNumber);
        }
    }

    async getContactInfo(phoneNumber) {
        // Check cache first
        if (this.contactCache.has(phoneNumber)) {
            return this.contactCache.get(phoneNumber);
        }

        try {
            const response = await fetch(`https://services.leadconnectorhq.com/contacts/search?locationId=${this.locationId}&query=${phoneNumber}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const contact = data.contacts && data.contacts.length > 0 ? data.contacts[0] : null;
                
                // Cache the result
                this.contactCache.set(phoneNumber, contact);
                return contact;
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }

        return null;
    }

    createOverlay(chatElement, contact, phoneNumber) {
        // Remove existing overlay if any
        const existingOverlay = chatElement.querySelector('.ghl-contact-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'ghl-contact-overlay';
        overlay.innerHTML = `
            <div class="ghl-contact-info">
                <div class="ghl-contact-name">${contact.firstName || ''} ${contact.lastName || ''}</div>
                <div class="ghl-contact-email">${contact.email || ''}</div>
                <div class="ghl-contact-tags">${contact.tags ? contact.tags.join(', ') : ''}</div>
            </div>
        `;

        chatElement.style.position = 'relative';
        chatElement.appendChild(overlay);
        
        this.overlays.set(phoneNumber, overlay);
    }

    createHeaderOverlay(header, contact, phoneNumber) {
        const existingOverlay = header.querySelector('.ghl-header-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'ghl-header-overlay';
        overlay.innerHTML = `
            <div class="ghl-header-info">
                <div class="ghl-header-name">${contact.firstName || ''} ${contact.lastName || ''}</div>
                <div class="ghl-header-email">${contact.email || ''}</div>
            </div>
        `;

        header.appendChild(overlay);
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
        // Reload the lookup system
        window.whatsappGHLLookup = new WhatsAppGHLLookup();
    }
});

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.whatsappGHLLookup = new WhatsAppGHLLookup();
    });
} else {
    window.whatsappGHLLookup = new WhatsAppGHLLookup();
}