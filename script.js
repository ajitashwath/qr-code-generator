const qrText = document.guerySelector('.qr-text');
const generateBtn = document.querySelector('.generate-btn');
const sizes = document.querySelector('.sizes');
const lightColor = document.querySelector('.light');
const darkColor = document.querySelector('.dark');
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const qrContainer = document.querySelector('#qr-code');
const loadingSpinner = document.querySelector('.loading-spinner');
const themeToggle = document.querySelector('#themeToggle');

let QR;

const theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.querySelector('i').className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    },
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeToggle.querySelector('i').className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
};

const qrCodeGenerator = {
    async generate(text) {
        loadingSpinner.classList.remove('hidden');
        qrContainer.innerHTML = '';
        try {
            if(text) {
                QR = new QRCode(qrContainer, {
                    text,
                    width: sizes.value,
                    height: sizes.value,
                    colorLight: lightColor.value,
                    colorDark: darkColor.value,
                    correctLevel: QRCode.CorrectLevel.H 
                });
            }
        } catch(err) {
            console.error('Error generating QR code: ', err);
            this.showError('Failed to generate QR code. Please try again');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    },

    showError(message) {
        alert(message);
    },

    updateQR() {
        if(QR && qrText.value.trim()) {
            QR.clear()
            QR.makeCode(qrText.value.trim());
        }
    }
};

const downloadQR = () => {
    if(!qrContainer.querySelector('img')) {
        return alert("Please generate a QR code first!");
    }

    const image = qrContainer.querySelector('img').src;

    const link = document.createElement('a');
    link.href = image;
    link.download = `QR_Code_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const shareQR = async() => {
    if(!qrContainer.querySelector('img')) {
        return alert('Please generate a QR code first!');
    }
    try {
        if(navigator.share) {
            await navigator.share({
                title: 'QR Code',
                text: 'Check out this QR code!',
                url: qrText.value.trim()
            });
        } else {
            await navigator.clipboard.writeText(qrText.value.trim());
            alert('QR code text copied to clipboard!');
        }
    } catch(err) {
        console.error('Error sharing QR code: ', err);
        alert("Unable to share QR code. Please try again.");
    }
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

document.addEventListener('DOMContentLoaded', () => {
    theme.init();
});

themeToggle.addEventListener('click', () => {
    theme.toggle();
});

generateBtn.addEventListener('click', () => {
    const text = qrText.value.trim();
    if(!text) {
        return alert('Please enter text or URL!');
    }
    qrCodeGenerator.generate(text);
});

qrText.addEventListener('input', debounce(() => {
    const text = qrText.value.trim();
    if(text) {
        qrCodeGenerator.generate(text);
    }
}, 300));

sizes.addEventListener('change', () => qrCodeGenerator.updateQR());
lightColor.addEventListener('input', () => qrCodeGenerator.updateQR());
darkColor.addEventListener('input', () => qrCodeGenerator.updateQR());

downloadBtn.addEventListener('click', downloadQR);
shareBtn.addEventListener('click', shareQR);

qrText.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        generateBtn.click();
    }
});

document.querySelector('form')?.addEventListener('submit', (e) => {
    e.preventDefault();
});
