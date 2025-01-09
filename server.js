const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Load key from environment variable
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Basic route to confirm server is running
app.get('/', (req, res) => {
    res.send('Stripe Terminal API is running!');
});

// Endpoint to create a connection token
app.post('/connection_token', async (req, res) => {
    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        res.json({ secret: connectionToken.secret });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating connection token');
    }
});

// Start the server
const PORT = process.env.PORT || 3000; // Use Render's assigned port
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
