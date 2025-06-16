const qrText = document.querySelector('.qr-text');
const sizes = document.querySelector('.sizes');
const lightColor = document.querySelector('.light');
const darkColor = document.querySelector('.dark');
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const qrContainer = document.querySelector('#qr-code');
const themeToggle = document.querySelector('#themeToggle');

let qrCode;
let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];

themeToggle.addEventListener('click', () => {
    theme.toggle();
});

const theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateIcon(savedTheme);
    },

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateIcon(newTheme);
    },
    
    updateIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }
    loadHistory();
    loadPresets();
});

function generateQRCode(text) {
    if (qrCode) {
        qrCode.clear();
        qrCode.makeCode(text);
    } else {
        qrCode = new QRCode(qrContainer, {
            text: text || ' ',
            width: sizes.value,
            height: sizes.value,
            colorLight: lightColor.value,
            colorDark: darkColor.value,
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    // Add to history if text is not empty
    if (text && text.trim()) {
        addToHistory(text);
    }
}

function addToHistory(text) {
    const timestamp = new Date().toISOString();
    const historyItem = {
        text: text,
        timestamp: timestamp,
        size: sizes.value,
        lightColor: lightColor.value,
        darkColor: darkColor.value
    };
    
    qrHistory = qrHistory.filter(item => item.text !== text);
    qrHistory.unshift(historyItem);
    qrHistory = qrHistory.slice(0, 20);
    
    // Save to localStorage
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    updateHistoryDisplay();
}

function loadHistory() {
    const historyContainer = document.querySelector('#history-container');
    if (historyContainer) {
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const historyContainer = document.querySelector('#history-container');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    qrHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-text">${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}</div>
            <div class="history-date">${new Date(item.timestamp).toLocaleDateString()}</div>
            <div class="history-actions">
                <button onclick="loadFromHistory(${index})" class="load-btn">Load</button>
                <button onclick="removeFromHistory(${index})" class="remove-btn">×</button>
            </div>
        `;
        historyContainer.appendChild(historyItem);
    });
}

function loadFromHistory(index) {
    const item = qrHistory[index];
    if (item) {
        qrText.value = item.text;
        sizes.value = item.size;
        lightColor.value = item.lightColor;
        darkColor.value = item.darkColor;
        generateQRCode(item.text);
    }
}

function removeFromHistory(index) {
    qrHistory.splice(index, 1);
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    updateHistoryDisplay();
}

function clearHistory() {
    qrHistory = [];
    localStorage.removeItem('qrHistory');
    updateHistoryDisplay();
}

function validateQRText(text) {
    const errors = [];
    
    if (text.length > 2953) {
        errors.push('Text is too long for QR code (max 2953 characters)');
    }
    
    if (text.includes('\n') && text.split('\n').length > 50) {
        errors.push('Too many line breaks');
    }
    
    return errors;
}

function detectAndFormatURL(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
    
    if (urlRegex.test(text)) {
        return { type: 'url', formatted: text };
    } else if (emailRegex.test(text)) {
        return { type: 'email', formatted: `mailto:${text}` };
    } else if (phoneRegex.test(text)) {
        return { type: 'phone', formatted: `tel:${text.replace(/\s/g, '')}` };
    }
    
    return { type: 'text', formatted: text };
}

function generateBatch(textArray) {
    const batchContainer = document.querySelector('#batch-container');
    if (!batchContainer) return;
    
    batchContainer.innerHTML = '';
    
    textArray.forEach((text, index) => {
        const qrDiv = document.createElement('div');
        qrDiv.className = 'batch-qr-item';
        qrDiv.innerHTML = `
            <div class="batch-qr-code" id="batch-qr-${index}"></div>
            <div class="batch-text">${text.substring(0, 30)}...</div>
            <button onclick="downloadBatchItem(${index}, '${text}')" class="batch-download-btn">Download</button>
        `;
        batchContainer.appendChild(qrDiv);
        
        // Generate QR code for this item
        new QRCode(document.getElementById(`batch-qr-${index}`), {
            text: text,
            width: 128,
            height: 128,
            colorLight: lightColor.value,
            colorDark: darkColor.value,
            correctLevel: QRCode.CorrectLevel.H
        });
    });
}

function downloadBatchItem(index, text) {
    const qrImage = document.querySelector(`#batch-qr-${index} img`);
    if (qrImage) {
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = `QRCode_${text.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const colorPresets = [
    { name: 'Classic', light: '#ffffff', dark: '#000000' },
    { name: 'Blue Theme', light: '#e3f2fd', dark: '#1976d2' },
    { name: 'Green Theme', light: '#e8f5e8', dark: '#2e7d32' },
    { name: 'Red Theme', light: '#ffebee', dark: '#d32f2f' },
    { name: 'Purple Theme', light: '#f3e5f5', dark: '#7b1fa2' },
    { name: 'Orange Theme', light: '#fff3e0', dark: '#f57c00' }
];

function loadPresets() {
    const presetContainer = document.querySelector('#color-presets');
    if (!presetContainer) return;
    
    colorPresets.forEach(preset => {
        const presetBtn = document.createElement('button');
        presetBtn.className = 'preset-btn';
        presetBtn.innerHTML = `
            <div class="preset-colors">
                <div class="preset-color" style="background-color: ${preset.light}"></div>
                <div class="preset-color" style="background-color: ${preset.dark}"></div>
            </div>
            <span>${preset.name}</span>
        `;
        presetBtn.onclick = () => applyPreset(preset);
        presetContainer.appendChild(presetBtn);
    });
}

function applyPreset(preset) {
    lightColor.value = preset.light;
    darkColor.value = preset.dark;
    
    if (qrText.value.trim()) {
        qrContainer.innerHTML = '';
        qrCode = null;
        generateQRCode(qrText.value);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Text copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Text copied to clipboard!');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function generateWiFiQR(ssid, password, security = 'WPA', hidden = false) {
    const wifiString = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    qrText.value = wifiString;
    generateQRCode(wifiString);
    showNotification('WiFi QR code generated!');
}

function generateVCardQR(contactData) {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactData.name}
TEL:${contactData.phone}
EMAIL:${contactData.email}
ORG:${contactData.organization || ''}
URL:${contactData.website || ''}
END:VCARD`;
    
    qrText.value = vcard;
    generateQRCode(vcard);
    showNotification('Contact QR code generated!');
}

qrText.addEventListener('input', () => {
    const text = qrText.value.trim();
    const errors = validateQRText(text);
    const errorContainer = document.querySelector('#error-container');
    if (errorContainer) {
        errorContainer.innerHTML = errors.map(error => `<div class="error">${error}</div>`).join('');
    }
    
    if (text && errors.length === 0) {
        const formatted = detectAndFormatURL(text);
        generateQRCode(formatted.formatted);
        const formatInfo = document.querySelector('#format-info');
        if (formatInfo) {
            formatInfo.textContent = `Detected: ${formatted.type}`;
        }
    }
});

sizes.addEventListener('change', () => {
    if (qrText.value.trim()) {
        qrContainer.innerHTML = '';
        qrCode = null;
        generateQRCode(qrText.value);
    }
});

lightColor.addEventListener('change', () => {
    if (qrText.value.trim()) {
        qrContainer.innerHTML = '';
        qrCode = null;
        generateQRCode(qrText.value);
    }
});

darkColor.addEventListener('change', () => {
    if (qrText.value.trim()) {
        qrContainer.innerHTML = '';
        qrCode = null;
        generateQRCode(qrText.value);
    }
});

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const qrImage = qrContainer.querySelector('img');
    
    if (qrImage && qrText.value.trim()) {
        const link = document.createElement('a');
        link.href = qrImage.src;
        const content = qrText.value.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        link.download = `QRCode_${content}_${Date.now()}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('QR code downloaded successfully!');
    }
});

shareBtn.addEventListener('click', async () => {
    if (!qrContainer.querySelector('img') || !qrText.value.trim()) return;
    
    try {
        if (navigator.share) {
            const qrImage = qrContainer.querySelector('img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = async () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                    
                    try {
                        await navigator.share({
                            title: 'QR Code',
                            text: qrText.value,
                            files: [file]
                        });
                        showNotification('QR code shared successfully!');
                    } catch (shareError) {
                        await navigator.share({
                            title: 'QR Code',
                            text: qrText.value,
                            url: window.location.href
                        });
                        showNotification('Content shared successfully!');
                    }
                });
            };
            
            img.src = qrImage.src;
        } else {
            await copyToClipboard(qrText.value);
        }
    } catch (err) {
        console.error('Error sharing:', err);
        showNotification('Failed to share. Content copied to clipboard instead.', 'error');
        await copyToClipboard(qrText.value);
    }
});

function exportSettings() {
    const settings = {
        theme: localStorage.getItem('theme'),
        defaultSize: sizes.value,
        defaultLightColor: lightColor.value,
        defaultDarkColor: darkColor.value,
        history: qrHistory
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `qr_generator_settings_${Date.now()}.json`;
    link.click();
}

function importSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            
            if (settings.theme) {
                localStorage.setItem('theme', settings.theme);
                document.documentElement.setAttribute('data-theme', settings.theme);
            }
            
            if (settings.defaultSize) sizes.value = settings.defaultSize;
            if (settings.defaultLightColor) lightColor.value = settings.defaultLightColor;
            if (settings.defaultDarkColor) darkColor.value = settings.defaultDarkColor;
            
            if (settings.history) {
                qrHistory = settings.history;
                localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
                updateHistoryDisplay();
            }
            
            showNotification('Settings imported successfully!');
        } catch (error) {
            showNotification('Failed to import settings', 'error');
        }
    };
    reader.readAsText(file);
}