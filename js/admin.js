// Gestion des pronostics dans le localStorage
let predictions = JSON.parse(localStorage.getItem('predictions')) || [];

// Fonction pour sauvegarder les pronostics dans le localStorage
function savePredictions() {
    localStorage.setItem('predictions', JSON.stringify(predictions));
}

// Gestion du formulaire d'ajout de pronostic
document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Création d'un nouvel objet pronostic
    const prediction = {
        id: Date.now(), // ID unique basé sur le timestamp
        date: document.getElementById('match-date').value,
        time: document.getElementById('match-time').value,
        homeTeam: document.getElementById('home-team').value,
        awayTeam: document.getElementById('away-team').value,
        type: document.getElementById('prediction-type').value,
        prediction: document.getElementById('prediction').value,
        odds: parseFloat(document.getElementById('odds').value),
        status: 'pending' // Statut initial : en attente
    };

    // Ajout du pronostic à la liste
    predictions.push(prediction);
    
    // Sauvegarde et affichage
    savePredictions();
    displayPredictions();
    
    // Réinitialisation du formulaire
    this.reset();
    
    // Affichage d'un message de succès
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
    alertDiv.innerHTML = `
        Pronostic ajouté avec succès !
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.card-body').prepend(alertDiv);
});

// Fonction pour afficher les pronostics dans le tableau
function displayPredictions() {
    const tbody = document.getElementById('predictions-list');
    tbody.innerHTML = '';

    // Tri des pronostics par date et heure
    predictions.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .forEach(prediction => {
            // Création d'une nouvelle ligne
            const tr = document.createElement('tr');
            
            // Définition du contenu de la ligne
            tr.innerHTML = `
                <td>${prediction.date} ${prediction.time}</td>
                <td>${prediction.homeTeam} vs ${prediction.awayTeam}</td>
                <td>Pronostic ${prediction.type}</td>
                <td>${prediction.prediction}</td>
                <td>${prediction.odds}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="updatePredictionStatus(${prediction.id}, 'won')">Gagné</button>
                    <button class="btn btn-sm btn-danger" onclick="updatePredictionStatus(${prediction.id}, 'lost')">Perdu</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePrediction(${prediction.id})">Supprimer</button>
                </td>
            `;
            
            // Ajout de la ligne au tableau
            tbody.appendChild(tr);
        });
}

// Fonction pour mettre à jour le statut d'un pronostic
function updatePredictionStatus(id, status) {
    // Recherche du pronostic par ID
    const prediction = predictions.find(p => p.id === id);
    
    if (prediction) {
        // Mise à jour du statut
        prediction.status = status;
        
        // Sauvegarde et affichage
        savePredictions();
        displayPredictions();
        
        // Affichage d'un message de confirmation
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-info alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            Statut du pronostic mis à jour !
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.card-body').prepend(alertDiv);
    }
}

// Fonction pour supprimer un pronostic
function deletePrediction(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pronostic ?')) {
        // Filtrage pour supprimer le pronostic
        predictions = predictions.filter(p => p.id !== id);
        
        // Sauvegarde et affichage
        savePredictions();
        displayPredictions();
        
        // Affichage d'un message de confirmation
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            Pronostic supprimé avec succès !
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.card-body').prepend(alertDiv);
    }
}

// Affichage initial des pronostics au chargement de la page
document.addEventListener('DOMContentLoaded', displayPredictions); 