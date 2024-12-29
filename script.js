const qrText = document.querySelector('.qr-text');
const sizes = document.querySelector('.sizes');
const lightColor = document.querySelector('.light');
const darkColor = document.querySelector('.dark');
const downloadBtn = document.querySelector('.download-btn');
const shareBtn = document.querySelector('.share-btn');
const qrContainer = document.querySelector('#qr-code');

let qrCode = null;
function generateQRCode() {
    const text = qrText.value.trim();
    if (!text) return;
    qrContainer.innerHTML = '';

    qrCode = new QRCode(qrContainer, {
        text: text,
        width: parseInt(sizes.value),
        height: parseInt(sizes.value),
        colorLight: lightColor.value,
        colorDark: darkColor.value,
        correctLevel: QRCode.CorrectLevel.H
    });
}

function downloadQR() {
    if (!qrContainer.querySelector('img')) {
        return;
    }

    const img = qrContainer.querySelector('img');
    downloadBtn.href = img.src;
}

qrText.addEventListener('input', generateQRCode);
sizes.addEventListener('change', generateQRCode);
lightColor.addEventListener('input', generateQRCode);
darkColor.addEventListener('input', generateQRCode);

shareBtn.addEventListener('click', async () => {
    if (!qrContainer.querySelector('img')) return;
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'QR Code',
                text: qrText.value,
                url: qrContainer.querySelector('img').src
            });
        } else {
            alert('Web Share API not supported');
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
});

const observer = new MutationObserver(downloadQR);
observer.observe(qrContainer, { childList: true, subtree: true });