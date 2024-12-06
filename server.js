const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());

const DAILY_API_KEY = 'aca98b12456ce73b6adf26626f02b24c0bc05204dd469b5ce97092e1f1e5e696';

app.post('/create-token', async (req, res) => {
    const { isHost, userName } = req.body;
    const tokenOptions = {
        properties: {
            enable_screenshare: isHost,
            enable_recording: isHost,
            start_video_off: true,
            start_audio_off: !isHost,
            user_name: userName || (isHost ? 'Host' : 'Audience'),
            permissions: isHost ? ['start_audio'] : [],
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
        console.log('Generated token:', token);

        if (!token.token || typeof token.token !== 'string') {
            console.error('Invalid token generated:', token);
            return res.status(400).json({ error: 'Invalid token generated' });
        }

        res.json(token);
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
