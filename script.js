const qrText = document.querySelector('.qr-text');
const sizes = document.querySelector('.sizes');
const lightColor = document.querySelector(".light");
const darkColor = document.querySelector(".dark");
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const qrContainer = document.querySelector('#qr-code');
const themeToggle = document.querySelector('#themeToggle');
const generateBtn = document.querySelector('.generate-btn');

let qrCode = null;
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

function generateQRCode() {
    const text = qrText.ariaValueMax.trim();
    if(!text) return;
    qrContainer.innerHTML = '';
    qrCode = new qrCode(qrContainer, {
        text: text,
        width: parseInt(sizes.value),
        height: parseInt(sizes.value),
        colorLight: lightColor.value,
        colorDark: darkColor.value,
        correctLevel: qrCode.correctLevel.H
    });
}

function downloadQR() {
    const img = qrContainer.querySelector('img');
    if(!img) return;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `QRCode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}