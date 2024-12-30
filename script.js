const qrText = document.querySelector('.qr-text');
const sizes = document.querySelector('.sizes');
const lightColor = document.querySelector('.light');
const darkColor = document.querySelector('.dark');
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const qrContainer = document.querySelector('#qr-code');
const themeToggle = document.querySelector('#themeToggle');

let qrCode;
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
}
qrText.addEventListener('input', () => {
    const text = qrText.value.trim();
    if (text) {
        generateQRCode(text);
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
        link.download = `QRCode_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

shareBtn.addEventListener('click', async () => {
    if (!qrContainer.querySelector('img') || !qrText.value.trim()) return;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'QR Code',
                text: qrText.value,
                url: window.location.href
            });
        } else {
            alert('Web Share API is not supported in your browser');
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
});