require('dotenv').config();
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

// Endpoint to create a PaymentIntent
app.post('/create_payment_intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card_present'],
            capture_method: 'manual', // Capture manually for card_present payments
        });
        res.json(paymentIntent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating PaymentIntent');
    }
});

// Endpoint to capture a PaymentIntent
app.post('/capture_payment_intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.capture(req.body.payment_intent_id);
        res.json(paymentIntent);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error capturing PaymentIntent');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
