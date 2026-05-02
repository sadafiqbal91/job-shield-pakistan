document.getElementById('check').addEventListener('click', async () => {
    const text = document.getElementById('text').value;
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');

    if (!text) return alert("Please paste some text first");

    loader.style.display = 'block';
    resultDiv.textContent = '';

    try {
        const response = await fetch('https://job-shield-pakistan.vercel.app/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, lang: 'en' })
        });

        const data = await response.json();
        loader.style.display = 'none';

        if (data.analysis) {
            resultDiv.textContent = data.analysis;
        } else {
            resultDiv.textContent = 'Error: ' + (data.error || 'Failed to analyze');
        }
    } catch (error) {
        loader.style.display = 'none';
        resultDiv.textContent = 'Error: Could not connect to JobShield server.';
    }
});
