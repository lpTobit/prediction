// Fonction pour charger et afficher l'historique des prédictions
async function loadPredictionHistory() {
    try {
        const response = await fetch('data/predictions.json');
        const data = await response.json();

        // Afficher l'historique des prédictions du matin
        const morningHistory = document.getElementById('morning-history');
        data.morning_predictions.history.forEach(prediction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(prediction.date).toLocaleDateString('fr-FR')}</td>
                <td>${prediction.value}</td>
                <td><span class="badge bg-${prediction.result === 'win' ? 'success' : 'danger'}">${prediction.result === 'win' ? 'Gagné' : 'Perdu'}</span></td>
                <td>${prediction.confidence}</td>
            `;
            morningHistory.appendChild(row);
        });

        // Afficher l'historique des prédictions du soir
        const eveningHistory = document.getElementById('evening-history');
        data.evening_predictions.history.forEach(prediction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(prediction.date).toLocaleDateString('fr-FR')}</td>
                <td>${prediction.value}</td>
                <td><span class="badge bg-${prediction.result === 'win' ? 'success' : 'danger'}">${prediction.result === 'win' ? 'Gagné' : 'Perdu'}</span></td>
                <td>${prediction.confidence}</td>
            `;
            eveningHistory.appendChild(row);
        });
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        alert('Une erreur est survenue lors du chargement de l\'historique.');
    }
}

// Charger l'historique au chargement de la page
document.addEventListener('DOMContentLoaded', loadPredictionHistory); 