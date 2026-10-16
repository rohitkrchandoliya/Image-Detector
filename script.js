const uploadedImage = document.getElementById('uploadedImage');
const output = document.getElementById('output');
const imageInput = document.getElementById('imageInput');

let modelPromise;

function handleImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    output.textContent = '';

    if (!file) {
        uploadedImage.removeAttribute('src');
        return;
    }

    if (!file.type.startsWith('image/')) {
        output.textContent = 'Please choose a valid image file.';
        imageInput.value = '';
        uploadedImage.removeAttribute('src');
        return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
        output.textContent = 'Could not read this image. Please try another file.';
    };
    reader.onload = () => {
        uploadedImage.onload = () => {
            output.textContent = 'Image ready. Select Detect Image to classify it.';
        };
        uploadedImage.onerror = () => {
            output.textContent = 'This file could not be decoded as an image.';
            uploadedImage.removeAttribute('src');
        };
        uploadedImage.src = String(reader.result);
    };
    reader.readAsDataURL(file);
}

imageInput.addEventListener('change', handleImageUpload);

async function detectImage() {
    if (!uploadedImage.src || !uploadedImage.complete || uploadedImage.naturalWidth === 0) {
        output.textContent = 'Please upload a valid image and wait for it to load.';
        output.style.display = 'block';
        output.style.opacity = 1;
        return;
    }

    output.style.opacity = 1;
    output.style.display = 'block';
    output.textContent = 'Loading model and analyzing image…';

    try {
        if (typeof mobilenet === 'undefined') {
            throw new Error('The image classification library could not be loaded. Check your connection and reload the page.');
        }

        // Reuse the model between classifications instead of downloading it every time.
        if (!modelPromise) modelPromise = mobilenet.load();
        const model = await modelPromise;
        const predictions = await model.classify(uploadedImage);

        if (predictions.length > 0) {
            const best = predictions[0];
            output.textContent = 'Prediction: ' + best.className + ' (' + (best.probability * 100).toFixed(1) + '% confidence).';
        } else {
            output.textContent = 'Unable to detect the image content.';
        }
    } catch (error) {
        modelPromise = undefined;
        output.textContent = error instanceof Error
            ? 'Image classification failed: ' + error.message
            : 'Image classification failed. Please try again.';
        console.error(error);
    }
}
