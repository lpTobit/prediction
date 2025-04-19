// Initialize Stripe
const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');

// Chargement des pronostics depuis le localStorage
let predictions = JSON.parse(localStorage.getItem('predictions')) || [];

// Fonction pour charger les pronostics du matin (avant 12h)
function loadMorningPredictions() {
    const now = new Date();
    
    // Filtrage des pronostics du matin
    const morningPredictions = predictions.filter(p => {
        const matchTime = new Date(p.date + 'T' + p.time);
        return matchTime.getHours() < 12 && matchTime > now;
    });

    // Sélection du conteneur pour les pronostics du matin
    const container = document.getElementById('morning-predictions');
    container.innerHTML = '';

    // Affichage de chaque pronostic du matin
    morningPredictions.forEach(prediction => {
        const div = document.createElement('div');
        div.className = 'prediction-item mb-3';
        div.innerHTML = `
            <h5>${prediction.homeTeam} vs ${prediction.awayTeam}</h5>
            <p>Pronostic: ${prediction.prediction}</p>
            <p>Cote: ${prediction.odds}</p>
        `;
        container.appendChild(div);
    });
}

// Fonction pour charger les pronostics du soir (après 12h)
function loadEveningPredictions() {
    const now = new Date();
    
    // Filtrage des pronostics du soir
    const eveningPredictions = predictions.filter(p => {
        const matchTime = new Date(p.date + 'T' + p.time);
        return matchTime.getHours() >= 12 && matchTime > now;
    });

    // Sélection du conteneur pour les pronostics du soir
    const container = document.getElementById('evening-predictions');
    container.innerHTML = '';

    // Affichage de chaque pronostic du soir
    eveningPredictions.forEach(prediction => {
        const div = document.createElement('div');
        div.className = 'prediction-item mb-3';
        div.innerHTML = `
            <h5>${prediction.homeTeam} vs ${prediction.awayTeam}</h5>
            <p>Pronostic: ${prediction.prediction}</p>
            <p>Cote: ${prediction.odds}</p>
        `;
        container.appendChild(div);
    });
}

// Fonction pour charger l'historique des pronostics
function loadHistory() {
    const now = new Date();
    
    // Filtrage des pronostics passés avec un statut défini
    const historyPredictions = predictions.filter(p => {
        const matchTime = new Date(p.date + 'T' + p.time);
        return matchTime < now && p.status !== 'pending';
    });

    // Sélection du tableau d'historique
    const tbody = document.getElementById('history-table');
    tbody.innerHTML = '';

    // Tri des pronostics par date (du plus récent au plus ancien)
    historyPredictions.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
        .forEach(prediction => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prediction.date} ${prediction.time}</td>
                <td>${prediction.homeTeam} vs ${prediction.awayTeam}</td>
                <td>${prediction.prediction}</td>
                <td>${prediction.odds}</td>
                <td>
                    <span class="badge ${prediction.status === 'won' ? 'bg-success' : 'bg-danger'}">
                        ${prediction.status === 'won' ? 'Gagné' : 'Perdu'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

// Fonction pour charger tous les pronostics
function loadPredictions() {
    loadMorningPredictions();
    loadEveningPredictions();
    loadHistory();
}

// Configuration du compte à rebours pour Aviator
let countdownInterval;
let timeLeft = 15;

// Fonction pour générer une prédiction aléatoire pour Aviator
function generatePrediction() {
    // Génération d'un nombre aléatoire entre 1.5 et 3.5
    const prediction = (Math.random() * 2 + 1.5).toFixed(2);
    document.getElementById('prediction-value').textContent = prediction + 'x';
}

// Fonction pour démarrer le compte à rebours d'Aviator
function startCountdown() {
    // Initialisation du compte à rebours
    timeLeft = 15;
    document.getElementById('countdown').textContent = timeLeft.toString().padStart(2, '0');
    
    // Mise à jour du compte à rebours chaque seconde
    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').textContent = timeLeft.toString().padStart(2, '0');
        
        // Quand le compte à rebours atteint 0
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            generatePrediction(); // Générer une nouvelle prédiction
            startCountdown();    // Redémarrer le compte à rebours
        }
    }, 1000);
}

// Gestion du paiement PayPal
document.getElementById('checkout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/create-paypal-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: '29.99',
                currency: 'EUR',
                description: 'Abonnement Premium ProPredict',
                return_url: `${window.location.origin}/success`,
                cancel_url: `${window.location.origin}/cancel`
            })
        });

        const data = await response.json();
        if (data.approval_url) {
            // Ouvrir la fenêtre PayPal
            const paypalWindow = window.open(data.approval_url, 'PayPal', 'width=600,height=600');
            
            // Vérifier périodiquement si la fenêtre est fermée
            const checkWindow = setInterval(() => {
                if (paypalWindow.closed) {
                    clearInterval(checkWindow);
                    checkPaymentStatus(data.order_id);
                }
            }, 1000);
        } else {
            throw new Error('Erreur lors de la création du paiement');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de la création du paiement');
    }
});

// Vérifier le statut du paiement
async function checkPaymentStatus(orderId) {
    try {
        const response = await fetch('/capture-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
        });

        const data = await response.json();
        if (data.success) {
            alert('Paiement effectué avec succès ! Votre lien d\'accès premium vous a été envoyé par email.');
            // Rediriger vers la page de succès
            window.location.href = data.access_link;
        } else {
            throw new Error(data.error || 'Erreur lors de la vérification du paiement');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de la vérification du paiement');
    }
}

// Handle Contact Form Submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Message envoyé avec succès !');
            e.target.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadPredictions();    // Charger tous les pronostics
    generatePrediction(); // Générer la première prédiction Aviator
    startCountdown();     // Démarrer le compte à rebours Aviator
});

// Add scroll event listener for navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
}); 