// Configuration du bouton PayPal avec des options personnalisées
paypal.Buttons({
    // Style du bouton PayPal
    style: {
        shape: 'rect',      // Forme rectangulaire
        color: 'gold',      // Couleur dorée
        layout: 'vertical', // Disposition verticale
        label: 'subscribe'  // Étiquette pour l'abonnement
    },

    // Création de l'abonnement
    createSubscription: function(data, actions) {
        // Vérification du formulaire avant de procéder au paiement
        if (!validateForm()) {
            return false;
        }

        return actions.subscription.create({
            'plan_id': 'P-XXXXXXXXXXXXX', // À remplacer par votre ID de plan PayPal
            'application_context': {
                'brand_name': 'ProPredict', // Nom de la marque
                'locale': 'fr_FR',         // Langue française
                'shipping_preference': 'NO_SHIPPING', // Pas de livraison nécessaire
                'user_action': 'SUBSCRIBE_NOW' // Action de l'utilisateur
            }
        });
    },

    // Gestion de l'approbation du paiement
    onApprove: function(data, actions) {
        // Sauvegarde des informations utilisateur
        saveUserData();
        
        // Afficher un message de succès
        const message = 'Paiement effectué avec succès ! Votre abonnement est maintenant actif.';
        
        // Créer une alerte stylisée
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Ajouter l'alerte à la page
        document.querySelector('.card-body').prepend(alertDiv);
        
        // Rediriger vers la page principale après 3 secondes
        setTimeout(() => {
            window.location.href = '../pages/index.html';
        }, 3000);
    },

    // Gestion des erreurs
    onError: function(err) {
        console.error('Erreur de paiement:', err);
        
        // Créer une alerte d'erreur
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            Une erreur est survenue lors du paiement. Veuillez réessayer.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Ajouter l'alerte à la page
        document.querySelector('.card-body').prepend(alertDiv);
    },

    // Gestion de l'annulation
    onCancel: function(data) {
        // Créer une alerte d'annulation
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.innerHTML = `
            Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Ajouter l'alerte à la page
        document.querySelector('.card-body').prepend(alertDiv);
    }
}).render('#paypal-button-container'); // Rendre le bouton dans le conteneur spécifié

// Fonction de validation du formulaire
function validateForm() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const terms = document.getElementById('terms');

    // Réinitialiser les états de validation
    [firstName, lastName, email, password, terms].forEach(field => {
        field.classList.remove('is-invalid');
    });

    let isValid = true;

    // Vérification des champs requis
    if (!firstName.value) {
        firstName.classList.add('is-invalid');
        isValid = false;
    }

    if (!lastName.value) {
        lastName.classList.add('is-invalid');
        isValid = false;
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.classList.add('is-invalid');
        isValid = false;
    }

    // Vérification du mot de passe
    if (password.value.length < 8) {
        password.classList.add('is-invalid');
        isValid = false;
    }

    // Vérification des conditions générales
    if (!terms.checked) {
        terms.classList.add('is-invalid');
        isValid = false;
    }

    return isValid;
}

// Fonction pour afficher les erreurs
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.card-body').prepend(alertDiv);
}

// Fonction pour sauvegarder les données utilisateur
function saveUserData() {
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        subscriptionDate: new Date().toISOString(),
        subscriptionStatus: 'active'
    };

    // Sauvegarde dans le localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Gestionnaire d'événements pour le code promo
document.querySelector('.btn-outline-secondary').addEventListener('click', function() {
    const promoCode = document.getElementById('promoCode').value;
    if (promoCode === 'WELCOME20') {
        // Appliquer une réduction de 20%
        const originalPrice = 29.99;
        const discountedPrice = originalPrice * 0.8;
        
        // Mettre à jour l'affichage du prix
        document.querySelector('.h4').textContent = `${discountedPrice.toFixed(2)}€ / mois`;
        
        // Afficher un message de succès
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            Code promo appliqué avec succès ! 20% de réduction.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.card-body').prepend(alertDiv);
    } else {
        showError('Code promo invalide.');
    }
}); 