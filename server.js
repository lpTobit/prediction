require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration PayPal
const PAYPAL_API = process.env.PAYPAL_MODE === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Obtenir le token d'accès PayPal
async function getPayPalAccessToken() {
    try {
        const response = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID,
                    password: process.env.PAYPAL_CLIENT_SECRET
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting PayPal access token:', error);
        throw error;
    }
}

// Route pour créer un paiement PayPal
app.post('/create-paypal-payment', async (req, res) => {
    try {
        const accessToken = await getPayPalAccessToken();
        const { amount, currency, description, return_url, cancel_url } = req.body;

        const response = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount
                    },
                    description: description
                }],
                application_context: {
                    return_url: return_url,
                    cancel_url: cancel_url,
                    brand_name: 'ProPredict',
                    user_action: 'PAY_NOW',
                    shipping_preference: 'NO_SHIPPING'
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const approvalUrl = response.data.links.find(link => link.rel === 'approve');
        res.json({ approval_url: approvalUrl.href, order_id: response.data.id });
    } catch (error) {
        console.error('PayPal API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erreur lors de la création du paiement PayPal' });
    }
});

// Route pour capturer le paiement
app.post('/capture-payment', async (req, res) => {
    try {
        const accessToken = await getPayPalAccessToken();
        const { orderId } = req.body;

        const response = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (response.data.status === 'COMPLETED') {
            // Paiement réussi
            await sendConfirmationEmail(response.data.payer.email_address);
            const accessLink = generatePremiumAccessLink(response.data.payer.email_address);
            
            res.json({
                success: true,
                message: 'Paiement effectué avec succès',
                access_link: accessLink
            });
        } else {
            throw new Error('Le paiement n\'a pas été complété');
        }
    } catch (error) {
        console.error('PayPal Capture Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erreur lors de la capture du paiement' });
    }
});

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tobitlionel@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const accessLink = generatePremiumAccessLink(email);
    const mailOptions = {
        from: 'tobitlionel@gmail.com',
        to: email,
        subject: 'Confirmation de votre abonnement ProPredict',
        html: `
            <h1>Merci pour votre abonnement !</h1>
            <p>Votre paiement a été effectué avec succès.</p>
            <p>Voici votre lien d'accès premium : <a href="${accessLink}">Accéder aux pronostics</a></p>
            <p>Ce lien est valable pendant 30 jours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Fonction pour générer un lien d'accès premium
function generatePremiumAccessLink(email) {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Ici, vous devriez stocker le token et la date d'expiration dans une base de données
    return `${process.env.BASE_URL}/premium-access?token=${token}`;
}

// Route pour l'API de contact
app.post('/api/contact', (req, res) => {
    const { email, message } = req.body;
    res.json({ success: true });
});

// Servir les fichiers statiques
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 