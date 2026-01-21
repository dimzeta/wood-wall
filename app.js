// Configuration et état global
const state = {
    slats: [],
    config: {}
};

// Couleurs de bois
const woodColors = {
    walnut: { base: '#4a3728', grain: '#3d2d20', highlight: '#5c4535' },
    oak: { base: '#c4a574', grain: '#b08f5a', highlight: '#d4b584' },
    pine: { base: '#deb887', grain: '#c9a066', highlight: '#e8c89a' },
    ebony: { base: '#2d2926', grain: '#1a1816', highlight: '#3d3936' },
    cherry: { base: '#8b4513', grain: '#722d0a', highlight: '#a0522d' }
};

// Éléments DOM
const elements = {
    canvas: document.getElementById('wallCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    randomizeBtn: document.getElementById('randomizeBtn'),
    materialsSummary: document.getElementById('materialsSummary'),
    menuToggle: document.getElementById('menuToggle'),
    configPanel: document.getElementById('configPanel'),
    closePanel: document.getElementById('closePanel'),
    configOverlay: document.getElementById('configOverlay')
};

const ctx = elements.canvas.getContext('2d');

// Récupérer la configuration depuis les inputs
function getConfig() {
    return {
        wall: {
            width: parseFloat(document.getElementById('wallWidth').value),
            height: parseFloat(document.getElementById('wallHeight').value),
            color: document.getElementById('wallColor').value
        },
        slat: {
            width: parseFloat(document.getElementById('slatWidth').value),
            thickness: parseFloat(document.getElementById('slatThickness').value),
            maxLength: parseFloat(document.getElementById('slatMaxLength').value)
        },
        layout: {
            gap: parseFloat(document.getElementById('slatGap').value),
            pattern: document.getElementById('pattern').value,
            minLength: parseFloat(document.getElementById('minLength').value),
            maxLengthPercent: parseFloat(document.getElementById('maxLengthPercent').value),
            startSide: document.getElementById('startSide').value
        },
        appearance: {
            woodColor: document.getElementById('woodColor').value
        }
    };
}

// Générer les lames selon le motif choisi
function generateSlats(config) {
    const slats = [];
    const { wall, slat, layout } = config;

    // Calculer le nombre de lames possibles
    const totalSlatHeight = slat.width + layout.gap;
    const numSlats = Math.floor((wall.height - layout.gap) / totalSlatHeight);

    // Marge verticale pour centrer
    const usedHeight = numSlats * totalSlatHeight - layout.gap;
    const verticalMargin = (wall.height - usedHeight) / 2;

    const maxSlatLength = (wall.width * layout.maxLengthPercent) / 100;

    for (let i = 0; i < numSlats; i++) {
        const y = verticalMargin + i * totalSlatHeight;
        let length, x;

        switch (layout.pattern) {
            case 'staggered':
                // Motif décalé comme sur l'image - crée un effet de vague
                const wavePosition = Math.sin((i / numSlats) * Math.PI * 2) * 0.3 + 0.5;
                const variation = (Math.random() - 0.5) * 0.2;
                length = layout.minLength + (maxSlatLength - layout.minLength) * (wavePosition + variation);
                length = Math.max(layout.minLength, Math.min(maxSlatLength, length));

                if (layout.startSide === 'left') {
                    x = 0;
                } else if (layout.startSide === 'right') {
                    x = wall.width - length;
                } else {
                    // Alterner gauche/droite
                    x = i % 2 === 0 ? 0 : wall.width - length;
                }
                break;

            case 'centered':
                // Symétrique autour du centre
                const centerProgress = Math.abs((i - numSlats / 2) / (numSlats / 2));
                length = maxSlatLength - (maxSlatLength - layout.minLength) * centerProgress;
                x = (wall.width - length) / 2;
                break;

            case 'diagonal':
                // Effet diagonal
                const diagProgress = i / numSlats;
                length = layout.minLength + (maxSlatLength - layout.minLength) * diagProgress;
                if (layout.startSide === 'right') {
                    x = wall.width - length;
                } else {
                    x = 0;
                }
                break;

            case 'random':
                // Aléatoire contrôlé
                length = layout.minLength + Math.random() * (maxSlatLength - layout.minLength);
                if (layout.startSide === 'left') {
                    x = 0;
                } else if (layout.startSide === 'right') {
                    x = wall.width - length;
                } else {
                    x = Math.random() > 0.5 ? 0 : wall.width - length;
                }
                break;
        }

        // Arrondir la longueur au cm
        length = Math.round(length);

        slats.push({
            index: i + 1,
            x: Math.round(x),
            y: Math.round(y),
            length: length,
            width: slat.width
        });
    }

    return slats;
}

// Dessiner une lame avec texture bois
function drawSlat(slat, config, scale) {
    const colors = woodColors[config.appearance.woodColor];
    const x = slat.x * scale;
    const y = slat.y * scale;
    const width = slat.length * scale;
    const height = slat.width * scale;

    // Ombre portée
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetX = 3 * scale;
    ctx.shadowOffsetY = 3 * scale;

    // Corps de la lame
    ctx.fillStyle = colors.base;
    ctx.fillRect(x, y, width, height);

    // Réinitialiser l'ombre pour les détails
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texture grain de bois
    ctx.strokeStyle = colors.grain;
    ctx.lineWidth = 0.5;

    const grainLines = Math.floor(height / (3 * scale));
    for (let i = 0; i < grainLines; i++) {
        const lineY = y + (i + 0.5) * (height / grainLines);
        ctx.beginPath();
        ctx.moveTo(x, lineY);

        // Ligne ondulée pour le grain
        for (let gx = 0; gx < width; gx += 10) {
            const offsetY = Math.sin(gx * 0.05 + i) * 1.5;
            ctx.lineTo(x + gx, lineY + offsetY);
        }
        ctx.stroke();
    }

    // Reflet sur le bord supérieur
    const gradient = ctx.createLinearGradient(x, y, x, y + height * 0.3);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height * 0.3);

    // Bordure subtile
    ctx.strokeStyle = colors.grain;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

// Dessiner le mur complet
function drawWall(config, slats) {
    const { wall } = config;

    // Calculer l'échelle pour le canvas
    const maxCanvasWidth = 800;
    const maxCanvasHeight = 600;
    const scaleX = maxCanvasWidth / wall.width;
    const scaleY = maxCanvasHeight / wall.height;
    const scale = Math.min(scaleX, scaleY, 2); // Max scale de 2 pour la qualité

    // Ajuster les dimensions du canvas
    elements.canvas.width = wall.width * scale;
    elements.canvas.height = wall.height * scale;

    // Fond du mur
    ctx.fillStyle = wall.color;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Texture subtile du mur
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * elements.canvas.width;
        const y = Math.random() * elements.canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }

    // Dessiner chaque lame
    slats.forEach(slat => {
        drawSlat(slat, config, scale);
    });

    // Cotations (dimensions)
    drawDimensions(config, scale);
}

// Dessiner les cotations
function drawDimensions(config, scale) {
    const { wall } = config;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${12 * Math.min(scale, 1)}px Arial`;
    ctx.textAlign = 'center';

    // Largeur du mur
    ctx.fillText(`${wall.width} cm`, elements.canvas.width / 2, elements.canvas.height - 5);

    // Hauteur du mur
    ctx.save();
    ctx.translate(12, elements.canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${wall.height} cm`, 0, 0);
    ctx.restore();
}

// Calculer et afficher le récapitulatif des matériaux
function displayMaterialsSummary(config, slats) {
    const { slat } = config;

    // Grouper les lames par longueur
    const lengthGroups = {};
    slats.forEach(s => {
        const length = s.length;
        if (!lengthGroups[length]) {
            lengthGroups[length] = [];
        }
        lengthGroups[length].push(s);
    });

    // Calculer les totaux
    const totalSlats = slats.length;
    const totalLength = slats.reduce((sum, s) => sum + s.length, 0);
    const totalLengthMeters = (totalLength / 100).toFixed(2);

    // Calculer le nombre de lames à acheter (basé sur la longueur max disponible)
    const maxAvailable = slat.maxLength;
    let slatsToBuy = 0;
    let wasteLength = 0;

    // Trier les longueurs par ordre décroissant pour optimiser les coupes
    const sortedLengths = Object.keys(lengthGroups).map(Number).sort((a, b) => b - a);
    const cutPlan = [];

    // Algorithme de bin packing simple (First Fit Decreasing)
    const bins = []; // Chaque bin représente une lame achetée

    sortedLengths.forEach(length => {
        const count = lengthGroups[length].length;
        for (let i = 0; i < count; i++) {
            // Chercher un bin existant où cette lame peut rentrer
            let placed = false;
            for (let bin of bins) {
                if (bin.remaining >= length) {
                    bin.cuts.push(length);
                    bin.remaining -= length;
                    placed = true;
                    break;
                }
            }

            // Si pas trouvé, créer un nouveau bin
            if (!placed) {
                bins.push({
                    cuts: [length],
                    remaining: maxAvailable - length
                });
            }
        }
    });

    slatsToBuy = bins.length;
    wasteLength = bins.reduce((sum, bin) => sum + bin.remaining, 0);
    const wastePercent = ((wasteLength / (slatsToBuy * maxAvailable)) * 100).toFixed(1);

    // Générer le HTML du récapitulatif
    let html = `
        <div class="materials-grid">
            <div class="material-card">
                <h3>Nombre de lames à poser</h3>
                <span class="value">${totalSlats}</span>
                <span class="unit">pièces</span>
            </div>
            <div class="material-card">
                <h3>Longueur totale</h3>
                <span class="value">${totalLengthMeters}</span>
                <span class="unit">mètres linéaires</span>
            </div>
            <div class="material-card">
                <h3>Lames à acheter</h3>
                <span class="value">${slatsToBuy}</span>
                <span class="unit">lames de ${maxAvailable} cm</span>
            </div>
            <div class="material-card">
                <h3>Chutes estimées</h3>
                <span class="value">${(wasteLength / 100).toFixed(2)}</span>
                <span class="unit">m (${wastePercent}%)</span>
            </div>
        </div>

        <div class="slats-breakdown">
            <h3>Détail des découpes par longueur</h3>
    `;

    // Afficher les groupes de longueur
    sortedLengths.forEach(length => {
        const count = lengthGroups[length].length;
        html += `
            <div class="length-group-header">
                <span class="length">${length} cm</span>
                <span class="count">${count} pièce${count > 1 ? 's' : ''}</span>
            </div>
        `;
    });

    // Plan de coupe optimisé
    html += `
        <div class="shopping-list">
            <h3>🪚 Plan de coupe optimisé</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 0.9rem;">
                Comment découper vos ${slatsToBuy} lames de ${maxAvailable} cm :
            </p>
    `;

    bins.forEach((bin, index) => {
        const cutsStr = bin.cuts.join(' + ');
        const used = bin.cuts.reduce((a, b) => a + b, 0);
        html += `
            <div class="shopping-item">
                <span class="item-name">Lame ${index + 1}: ${cutsStr} cm</span>
                <span class="item-qty">Chute: ${bin.remaining} cm</span>
            </div>
        `;
    });

    html += `
        </div>

        <div class="shopping-list">
            <h3>🛒 Liste d'achats</h3>
            <div class="shopping-item">
                <span class="item-name">Lames ${slat.width} × ${slat.thickness} × ${maxAvailable} cm</span>
                <span class="item-qty">${slatsToBuy} pièces</span>
            </div>
            <div class="shopping-item">
                <span class="item-name">Vis de fixation (2 par lame)</span>
                <span class="item-qty">${totalSlats * 2} pièces</span>
            </div>
            <div class="shopping-item">
                <span class="item-name">Chevilles murales</span>
                <span class="item-qty">${totalSlats * 2} pièces</span>
            </div>
        </div>

        <button class="export-btn" onclick="exportData()">📋 Exporter la liste</button>
    `;

    elements.materialsSummary.innerHTML = html;

    // Sauvegarder l'état pour l'export
    state.slats = slats;
    state.config = config;
    state.bins = bins;
}

// Exporter les données
function exportData() {
    const { config, slats, bins } = state;

    let text = `SIMULATEUR MUR EN LAMES DE BOIS\n`;
    text += `${'='.repeat(40)}\n\n`;

    text += `CONFIGURATION\n`;
    text += `-`.repeat(20) + `\n`;
    text += `Mur: ${config.wall.width} × ${config.wall.height} cm\n`;
    text += `Lames: ${config.slat.width} × ${config.slat.thickness} cm\n`;
    text += `Écart entre lames: ${config.layout.gap} cm\n`;
    text += `Longueur dispo: ${config.slat.maxLength} cm\n\n`;

    text += `RÉSUMÉ\n`;
    text += `-`.repeat(20) + `\n`;
    text += `Nombre de lames à poser: ${slats.length}\n`;
    text += `Lames à acheter: ${bins.length} × ${config.slat.maxLength} cm\n\n`;

    text += `DÉTAIL DES DÉCOUPES\n`;
    text += `-`.repeat(20) + `\n`;

    // Grouper par longueur
    const groups = {};
    slats.forEach(s => {
        if (!groups[s.length]) groups[s.length] = 0;
        groups[s.length]++;
    });

    Object.keys(groups).sort((a, b) => b - a).forEach(len => {
        text += `${len} cm: ${groups[len]} pièce(s)\n`;
    });

    text += `\nPLAN DE COUPE\n`;
    text += `-`.repeat(20) + `\n`;
    bins.forEach((bin, i) => {
        text += `Lame ${i + 1}: ${bin.cuts.join(' + ')} cm (chute: ${bin.remaining} cm)\n`;
    });

    text += `\nLISTE D'ACHATS\n`;
    text += `-`.repeat(20) + `\n`;
    text += `- ${bins.length} lames de ${config.slat.width} × ${config.slat.thickness} × ${config.slat.maxLength} cm\n`;
    text += `- ${slats.length * 2} vis de fixation\n`;
    text += `- ${slats.length * 2} chevilles murales\n`;

    // Télécharger le fichier
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mur-lames-bois.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Générer la simulation
function generate() {
    const config = getConfig();
    const slats = generateSlats(config);
    drawWall(config, slats);
    displayMaterialsSummary(config, slats);
}

// Variation aléatoire
function randomize() {
    const config = getConfig();
    // Modifier légèrement les paramètres pour créer une variation
    config.layout.pattern = 'random';
    const slats = generateSlats(config);
    drawWall(config, slats);
    displayMaterialsSummary(config, slats);
}

// Mobile menu functions
function openMenu() {
    elements.configPanel.classList.add('open');
    elements.configOverlay.classList.add('active');
    elements.menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    elements.configPanel.classList.remove('open');
    elements.configOverlay.classList.remove('active');
    elements.menuToggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners
elements.generateBtn.addEventListener('click', () => {
    generate();
    // Fermer le menu sur mobile après génération
    if (window.innerWidth <= 900) {
        closeMenu();
    }
});
elements.randomizeBtn.addEventListener('click', () => {
    randomize();
    if (window.innerWidth <= 900) {
        closeMenu();
    }
});

// Mobile menu events
elements.menuToggle.addEventListener('click', () => {
    if (elements.configPanel.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

elements.closePanel.addEventListener('click', closeMenu);
elements.configOverlay.addEventListener('click', closeMenu);

// Générer au chargement
window.addEventListener('load', generate);

// Mettre à jour en temps réel (optionnel)
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', generate);
});
