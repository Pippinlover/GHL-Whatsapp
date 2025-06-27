document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const locationIdInput = document.getElementById('locationId');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['ghlApiKey', 'ghlLocationId'], function(result) {
        if (result.ghlApiKey) {
            apiKeyInput.value = result.ghlApiKey;
        }
        if (result.ghlLocationId) {
            locationIdInput.value = result.ghlLocationId;
        }
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const locationId = locationIdInput.value.trim();

        if (!apiKey || !locationId) {
            showStatus('Please fill in both fields', 'error');
            return;
        }

        chrome.storage.sync.set({
            ghlApiKey: apiKey,
            ghlLocationId: locationId
        }, function() {
            showStatus('Settings saved successfully!', 'success');
            
            // Notify content script to reload
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] && tabs[0].url && tabs[0].url.includes('web.whatsapp.com')) {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'settingsUpdated'});
                }
            });
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        setTimeout(function() {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 3000);
    }
});