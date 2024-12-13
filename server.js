const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const DAILY_API_KEY = 'aca98b12456ce73b6adf26626f02b24c0bc05204dd469b5ce97092e1f1e5e696'; // Ganti dengan API Key Anda

// Endpoint untuk menghasilkan token
app.post('/create-token', async (req, res) => {
    const { isHost, userName } = req.body;
    const tokenOptions = {
        properties: {
            enable_screenshare: isHost,
            enable_recording: isHost,
            start_video_off: true,
            start_audio_off: !isHost, // Host: audio aktif, Audience: audio mati
            user_name: userName || (isHost ? 'Host' : 'Audience'),
            permissions: isHost ? ['start_audio', 'start_video'] : [],
        },
    };

    const fetch = (await import('node-fetch')).default;
    try {
        const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DAILY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokenOptions),
        });

        const token = await response.json();

        if (!token.token) {
            return res.status(400).json({ error: 'Invalid token generated' });
        }

        res.json(token);
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
