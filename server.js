require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors package
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'fallback_stripe_key'); // Fallback key for testing

const app = express();

// Add CORS configuration
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to create a connection token
app.post('/create_payment_intent', async (req, res) => {
    try {
        console.log('Creating PaymentIntent with:', req.body);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card_present'], // Ensure card_present is included
            capture_method: 'manual', // Manual capture for card_present
            description: req.body.description || 'Stripe Terminal Payment',
        });

        console.log('Created PaymentIntent:', paymentIntent);

        res.json(paymentIntent);
    } catch (error) {
        console.error('Error creating PaymentIntent:', error.message, error.code);
        res.status(500).json({
            error: 'Error creating PaymentIntent',
            message: error.message,
            code: error.code,
        });
    }
});

// Endpoint to create a PaymentIntent
app.post('/create_payment_intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card_present'],
            capture_method: 'manual', // Manual capture for card_present
        });
        res.json(paymentIntent);
    } catch (error) {
        console.error('Error creating PaymentIntent:', error.message, error.code);
        res.status(500).json({
            error: 'Error creating PaymentIntent',
            message: error.message,
            code: error.code,
        });
    }
});

// Endpoint to capture a PaymentIntent
app.post('/capture_payment_intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.capture(req.body.payment_intent_id);
        res.json(paymentIntent);
    } catch (error) {
        console.error('Error capturing PaymentIntent:', error.message, error.code);
        res.status(500).json({
            error: 'Error capturing PaymentIntent',
            message: error.message,
            code: error.code,
        });
    }
});
// Endpoint to confirm a PaymentIntent with a payment method
app.post('/confirm_payment_intent', async (req, res) => {
    try {
        const { payment_intent_id, payment_method } = req.body;

        const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
            payment_method: payment_method, // The payment method to attach
        });

        res.json(paymentIntent);
    } catch (error) {
        console.error('Error confirming PaymentIntent:', error.message, error.code);
        res.status(500).json({
            error: 'Error confirming PaymentIntent',
            message: error.message,
            code: error.code,
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
