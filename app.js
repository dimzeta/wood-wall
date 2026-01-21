// ==========================================
// Wood Wall Designer - Application
// ==========================================

// État global
const state = {
    slats: [],
    config: {},
    bins: [],
    history: []
};

// Couleurs de bois
const woodColors = {
    walnut: { base: '#4a3728', grain: '#3d2d20', highlight: '#5c4535', name: 'Noyer foncé' },
    oak: { base: '#c4a574', grain: '#b08f5a', highlight: '#d4b584', name: 'Chêne clair' },
    pine: { base: '#deb887', grain: '#c9a066', highlight: '#e8c89a', name: 'Pin naturel' },
    ebony: { base: '#2d2926', grain: '#1a1816', highlight: '#3d3936', name: 'Ébène' },
    cherry: { base: '#8b4513', grain: '#722d0a', highlight: '#a0522d', name: 'Cerisier' }
};

// Éléments DOM
const elements = {
    canvas: document.getElementById('wallCanvas'),
    generateBtn: document.getElementById('generateBtn'),
    saveBtn: document.getElementById('saveBtn'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    exportPdfBtnMobile: document.getElementById('exportPdfBtnMobile'),
    materialsSummary: document.getElementById('materialsSummary'),
    menuToggle: document.getElementById('menuToggle'),
    configPanel: document.getElementById('configPanel'),
    closePanel: document.getElementById('closePanel'),
    configOverlay: document.getElementById('configOverlay'),
    historyBtn: document.getElementById('historyBtn'),
    historyModal: document.getElementById('historyModal'),
    historyOverlay: document.getElementById('historyOverlay'),
    closeHistory: document.getElementById('closeHistory'),
    historyList: document.getElementById('historyList'),
    historyBadge: document.getElementById('historyBadge'),
    canvasDimensions: document.getElementById('canvasDimensions'),
    wallColor: document.getElementById('wallColor'),
    wallColorHex: document.getElementById('wallColorHex')
};

const ctx = elements.canvas.getContext('2d');

// ==========================================
// Configuration
// ==========================================

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

function setConfig(config) {
    document.getElementById('wallWidth').value = config.wall.width;
    document.getElementById('wallHeight').value = config.wall.height;
    document.getElementById('wallColor').value = config.wall.color;
    document.getElementById('wallColorHex').value = config.wall.color;
    document.getElementById('slatWidth').value = config.slat.width;
    document.getElementById('slatThickness').value = config.slat.thickness;
    document.getElementById('slatMaxLength').value = config.slat.maxLength;
    document.getElementById('slatGap').value = config.layout.gap;
    document.getElementById('pattern').value = config.layout.pattern;
    document.getElementById('minLength').value = config.layout.minLength;
    document.getElementById('maxLengthPercent').value = config.layout.maxLengthPercent;
    document.getElementById('startSide').value = config.layout.startSide;
    document.getElementById('woodColor').value = config.appearance.woodColor;
}

// ==========================================
// Génération des lames
// ==========================================

function generateSlats(config) {
    const slats = [];
    const { wall, slat, layout } = config;

    const totalSlatHeight = slat.width + layout.gap;
    const numSlats = Math.floor((wall.height - layout.gap) / totalSlatHeight);
    const usedHeight = numSlats * totalSlatHeight - layout.gap;
    const verticalMargin = (wall.height - usedHeight) / 2;
    const maxSlatLength = (wall.width * layout.maxLengthPercent) / 100;

    for (let i = 0; i < numSlats; i++) {
        const y = verticalMargin + i * totalSlatHeight;
        let length, x;

        switch (layout.pattern) {
            case 'staggered':
                const wavePosition = Math.sin((i / numSlats) * Math.PI * 2) * 0.3 + 0.5;
                const variation = (Math.random() - 0.5) * 0.2;
                length = layout.minLength + (maxSlatLength - layout.minLength) * (wavePosition + variation);
                length = Math.max(layout.minLength, Math.min(maxSlatLength, length));
                if (layout.startSide === 'left') {
                    x = 0;
                } else if (layout.startSide === 'right') {
                    x = wall.width - length;
                } else {
                    x = i % 2 === 0 ? 0 : wall.width - length;
                }
                break;

            case 'centered':
                const centerProgress = Math.abs((i - numSlats / 2) / (numSlats / 2));
                length = maxSlatLength - (maxSlatLength - layout.minLength) * centerProgress;
                x = (wall.width - length) / 2;
                break;

            case 'diagonal':
                const diagProgress = i / numSlats;
                length = layout.minLength + (maxSlatLength - layout.minLength) * diagProgress;
                if (layout.startSide === 'right') {
                    x = wall.width - length;
                } else {
                    x = 0;
                }
                break;

            case 'random':
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

// ==========================================
// Dessin
// ==========================================

function drawSlat(slat, config, scale) {
    const colors = woodColors[config.appearance.woodColor];
    const x = slat.x * scale;
    const y = slat.y * scale;
    const width = slat.length * scale;
    const height = slat.width * scale;

    // Ombre
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetX = 3 * scale;
    ctx.shadowOffsetY = 3 * scale;

    ctx.fillStyle = colors.base;
    ctx.fillRect(x, y, width, height);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Grain
    ctx.strokeStyle = colors.grain;
    ctx.lineWidth = 0.5;
    const grainLines = Math.floor(height / (3 * scale));
    for (let i = 0; i < grainLines; i++) {
        const lineY = y + (i + 0.5) * (height / grainLines);
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        for (let gx = 0; gx < width; gx += 10) {
            const offsetY = Math.sin(gx * 0.05 + i) * 1.5;
            ctx.lineTo(x + gx, lineY + offsetY);
        }
        ctx.stroke();
    }

    // Reflet
    const gradient = ctx.createLinearGradient(x, y, x, y + height * 0.3);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height * 0.3);

    // Bordure
    ctx.strokeStyle = colors.grain;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
}

function drawWall(config, slats) {
    const { wall } = config;

    const maxCanvasWidth = 800;
    const maxCanvasHeight = 600;
    const scaleX = maxCanvasWidth / wall.width;
    const scaleY = maxCanvasHeight / wall.height;
    const scale = Math.min(scaleX, scaleY, 2);

    elements.canvas.width = wall.width * scale;
    elements.canvas.height = wall.height * scale;

    // Fond
    ctx.fillStyle = wall.color;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * elements.canvas.width;
        const y = Math.random() * elements.canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }

    // Lames
    slats.forEach(slat => drawSlat(slat, config, scale));

    // Cotations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${12 * Math.min(scale, 1)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${wall.width} cm`, elements.canvas.width / 2, elements.canvas.height - 8);

    ctx.save();
    ctx.translate(15, elements.canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${wall.height} cm`, 0, 0);
    ctx.restore();

    // MAJ dimensions affichées
    elements.canvasDimensions.textContent = `${wall.width} × ${wall.height} cm`;
}

// ==========================================
// Calculs et affichage des matériaux
// ==========================================

function calculateBins(slats, maxAvailable) {
    const bins = [];
    const sortedLengths = {};

    slats.forEach(s => {
        if (!sortedLengths[s.length]) sortedLengths[s.length] = 0;
        sortedLengths[s.length]++;
    });

    const lengths = Object.keys(sortedLengths).map(Number).sort((a, b) => b - a);

    lengths.forEach(length => {
        const count = sortedLengths[length];
        for (let i = 0; i < count; i++) {
            let placed = false;
            for (let bin of bins) {
                if (bin.remaining >= length) {
                    bin.cuts.push(length);
                    bin.remaining -= length;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                bins.push({
                    cuts: [length],
                    remaining: maxAvailable - length
                });
            }
        }
    });

    return bins;
}

function displayMaterialsSummary(config, slats) {
    const { slat } = config;
    const bins = calculateBins(slats, slat.maxLength);

    const totalSlats = slats.length;
    const totalLength = slats.reduce((sum, s) => sum + s.length, 0);
    const totalLengthMeters = (totalLength / 100).toFixed(2);
    const slatsToBuy = bins.length;
    const wasteLength = bins.reduce((sum, bin) => sum + bin.remaining, 0);
    const wastePercent = ((wasteLength / (slatsToBuy * slat.maxLength)) * 100).toFixed(1);

    // Grouper par longueur
    const lengthGroups = {};
    slats.forEach(s => {
        if (!lengthGroups[s.length]) lengthGroups[s.length] = 0;
        lengthGroups[s.length]++;
    });
    const sortedLengths = Object.keys(lengthGroups).map(Number).sort((a, b) => b - a);

    let html = `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div class="bg-gradient-to-br from-wood-100 to-wood-50 rounded-xl p-4">
                <div class="text-xs text-wood-600 mb-1">Lames à poser</div>
                <div class="text-2xl font-bold text-wood-900">${totalSlats}</div>
                <div class="text-xs text-wood-500">pièces</div>
            </div>
            <div class="bg-gradient-to-br from-wood-100 to-wood-50 rounded-xl p-4">
                <div class="text-xs text-wood-600 mb-1">Longueur totale</div>
                <div class="text-2xl font-bold text-wood-900">${totalLengthMeters}</div>
                <div class="text-xs text-wood-500">mètres linéaires</div>
            </div>
            <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4">
                <div class="text-xs text-green-700 mb-1">Lames à acheter</div>
                <div class="text-2xl font-bold text-green-800">${slatsToBuy}</div>
                <div class="text-xs text-green-600">× ${slat.maxLength} cm</div>
            </div>
            <div class="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-4">
                <div class="text-xs text-amber-700 mb-1">Chutes</div>
                <div class="text-2xl font-bold text-amber-800">${(wasteLength / 100).toFixed(2)}</div>
                <div class="text-xs text-amber-600">m (${wastePercent}%)</div>
            </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
            <div>
                <h3 class="text-sm font-semibold text-wood-900 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-wood-100 flex items-center justify-center text-xs">📐</span>
                    Découpes par longueur
                </h3>
                <div class="space-y-2">
                    ${sortedLengths.map(length => `
                        <div class="flex items-center justify-between bg-wood-50 rounded-lg px-4 py-2">
                            <span class="font-medium text-wood-800">${length} cm</span>
                            <span class="bg-wood-200 text-wood-800 px-3 py-1 rounded-full text-sm font-medium">${lengthGroups[length]} pièce${lengthGroups[length] > 1 ? 's' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-wood-900 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-wood-100 flex items-center justify-center text-xs">🪚</span>
                    Plan de coupe optimisé
                </h3>
                <div class="space-y-2 max-h-64 overflow-y-auto pr-2">
                    ${bins.map((bin, index) => `
                        <div class="bg-wood-50 rounded-lg px-4 py-3">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-xs text-wood-500">Lame ${index + 1}</span>
                                <span class="text-xs text-amber-600">Chute: ${bin.remaining} cm</span>
                            </div>
                            <div class="text-sm font-medium text-wood-800">${bin.cuts.join(' + ')} cm</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="mt-6 pt-6 border-t border-wood-100">
            <h3 class="text-sm font-semibold text-wood-900 mb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded bg-wood-100 flex items-center justify-center text-xs">🛒</span>
                Liste d'achats
            </h3>
            <div class="grid sm:grid-cols-3 gap-3">
                <div class="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3">
                    <span class="text-sm text-green-800">Lames ${slat.width}×${slat.thickness}×${slat.maxLength}cm</span>
                    <span class="font-bold text-green-700">${slatsToBuy}</span>
                </div>
                <div class="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
                    <span class="text-sm text-blue-800">Vis de fixation</span>
                    <span class="font-bold text-blue-700">${totalSlats * 2}</span>
                </div>
                <div class="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3">
                    <span class="text-sm text-purple-800">Chevilles</span>
                    <span class="font-bold text-purple-700">${totalSlats * 2}</span>
                </div>
            </div>
        </div>
    `;

    elements.materialsSummary.innerHTML = html;

    state.slats = slats;
    state.config = config;
    state.bins = bins;
}

// ==========================================
// Export PDF
// ==========================================

async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const { config, slats, bins } = state;

    if (!slats.length) {
        alert('Veuillez d\'abord générer une simulation.');
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    // Titre
    pdf.setFontSize(20);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Wood Wall Designer', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, y);
    y += 15;

    // Configuration
    pdf.setFontSize(14);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Configuration', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(60);
    const configLines = [
        `Mur: ${config.wall.width} × ${config.wall.height} cm`,
        `Lames: ${config.slat.width} × ${config.slat.thickness} cm`,
        `Longueur disponible: ${config.slat.maxLength} cm`,
        `Écart entre lames: ${config.layout.gap} cm`,
        `Motif: ${config.layout.pattern}`,
        `Teinte: ${woodColors[config.appearance.woodColor].name}`
    ];
    configLines.forEach(line => {
        pdf.text(line, margin, y);
        y += 5;
    });
    y += 10;

    // Image du canvas
    const canvasData = elements.canvas.toDataURL('image/png');
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (elements.canvas.height / elements.canvas.width) * imgWidth;
    pdf.addImage(canvasData, 'PNG', margin, y, imgWidth, imgHeight);
    y += imgHeight + 15;

    // Résumé
    pdf.setFontSize(14);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Résumé', margin, y);
    y += 8;

    const totalLength = slats.reduce((sum, s) => sum + s.length, 0);
    const wasteLength = bins.reduce((sum, bin) => sum + bin.remaining, 0);

    pdf.setFontSize(10);
    pdf.setTextColor(60);
    const summaryLines = [
        `Nombre de lames à poser: ${slats.length}`,
        `Longueur totale: ${(totalLength / 100).toFixed(2)} m`,
        `Lames à acheter: ${bins.length} × ${config.slat.maxLength} cm`,
        `Chutes estimées: ${(wasteLength / 100).toFixed(2)} m`
    ];
    summaryLines.forEach(line => {
        pdf.text(line, margin, y);
        y += 5;
    });
    y += 10;

    // Nouvelle page pour les détails
    pdf.addPage();
    y = margin;

    // Découpes par longueur
    pdf.setFontSize(14);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Découpes par longueur', margin, y);
    y += 8;

    const lengthGroups = {};
    slats.forEach(s => {
        if (!lengthGroups[s.length]) lengthGroups[s.length] = 0;
        lengthGroups[s.length]++;
    });

    pdf.setFontSize(10);
    pdf.setTextColor(60);
    Object.keys(lengthGroups).sort((a, b) => b - a).forEach(length => {
        pdf.text(`${length} cm: ${lengthGroups[length]} pièce(s)`, margin, y);
        y += 5;
    });
    y += 10;

    // Plan de coupe
    pdf.setFontSize(14);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Plan de coupe optimisé', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(60);
    bins.forEach((bin, i) => {
        if (y > 270) {
            pdf.addPage();
            y = margin;
        }
        pdf.text(`Lame ${i + 1}: ${bin.cuts.join(' + ')} cm (chute: ${bin.remaining} cm)`, margin, y);
        y += 5;
    });
    y += 10;

    // Liste d'achats
    if (y > 250) {
        pdf.addPage();
        y = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(67, 48, 43);
    pdf.text('Liste d\'achats', margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(60);
    pdf.text(`• ${bins.length} lames de ${config.slat.width} × ${config.slat.thickness} × ${config.slat.maxLength} cm`, margin, y);
    y += 5;
    pdf.text(`• ${slats.length * 2} vis de fixation`, margin, y);
    y += 5;
    pdf.text(`• ${slats.length * 2} chevilles murales`, margin, y);

    // Générer le blob PDF
    const pdfBlob = pdf.output('blob');
    const fileName = `wood-wall-design-${Date.now()}.pdf`;

    // Vérifier si Web Share API est disponible (iOS Safari, Android)
    if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
        try {
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            await navigator.share({
                files: [file],
                title: 'Wood Wall Design',
                text: 'Mon plan de mur en lames de bois'
            });
        } catch (err) {
            // L'utilisateur a annulé le partage, ce n'est pas une erreur
            if (err.name !== 'AbortError') {
                console.error('Erreur partage:', err);
                fallbackDownload(pdfBlob, fileName);
            }
        }
    } else {
        // Fallback pour desktop et navigateurs sans Web Share
        fallbackDownload(pdfBlob, fileName);
    }
}

// Fonction de téléchargement fallback
function fallbackDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ==========================================
// Historique (LocalStorage)
// ==========================================

function loadHistory() {
    try {
        const saved = localStorage.getItem('woodWallHistory');
        state.history = saved ? JSON.parse(saved) : [];
    } catch (e) {
        state.history = [];
    }
    updateHistoryBadge();
}

function saveToHistory() {
    const { config, slats, bins } = state;

    if (!slats.length) {
        alert('Veuillez d\'abord générer une simulation.');
        return;
    }

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        config: config,
        slatsCount: slats.length,
        slatsToBuy: bins.length,
        thumbnail: elements.canvas.toDataURL('image/jpeg', 0.5)
    };

    state.history.unshift(entry);

    // Garder max 20 entrées
    if (state.history.length > 20) {
        state.history = state.history.slice(0, 20);
    }

    localStorage.setItem('woodWallHistory', JSON.stringify(state.history));
    updateHistoryBadge();
    renderHistoryList();

    // Feedback visuel
    elements.saveBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Sauvegardé !
    `;
    setTimeout(() => {
        elements.saveBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            Sauvegarder
        `;
    }, 2000);
}

function updateHistoryBadge() {
    const count = state.history.length;
    if (count > 0) {
        elements.historyBadge.textContent = count;
        elements.historyBadge.classList.remove('hidden');
        elements.historyBadge.classList.add('flex');
    } else {
        elements.historyBadge.classList.add('hidden');
        elements.historyBadge.classList.remove('flex');
    }
}

function renderHistoryList() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="text-center text-wood-400 py-8">
                Aucune simulation sauvegardée
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = state.history.map(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('fr-FR');
        const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="bg-wood-50 rounded-xl p-4 hover:bg-wood-100 transition-colors">
                <div class="flex gap-4">
                    <img src="${entry.thumbnail}" alt="Aperçu" class="w-20 h-16 object-cover rounded-lg">
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-wood-500">${dateStr} à ${timeStr}</div>
                        <div class="text-sm font-medium text-wood-900 mt-1">
                            ${entry.config.wall.width} × ${entry.config.wall.height} cm
                        </div>
                        <div class="text-xs text-wood-600 mt-1">
                            ${entry.slatsCount} lames • ${entry.slatsToBuy} à acheter
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 mt-3">
                    <button onclick="loadFromHistory(${entry.id})" class="flex-1 py-2 px-3 text-xs font-medium bg-wood-200 text-wood-800 rounded-lg hover:bg-wood-300 transition-colors">
                        Charger
                    </button>
                    <button onclick="deleteFromHistory(${entry.id})" class="py-2 px-3 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadFromHistory(id) {
    const entry = state.history.find(e => e.id === id);
    if (entry) {
        setConfig(entry.config);
        generate();
        closeHistoryModal();
    }
}

function deleteFromHistory(id) {
    state.history = state.history.filter(e => e.id !== id);
    localStorage.setItem('woodWallHistory', JSON.stringify(state.history));
    updateHistoryBadge();
    renderHistoryList();
}

// ==========================================
// Menu mobile
// ==========================================

function openMenu() {
    elements.configPanel.classList.remove('-translate-x-full');
    elements.configOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    elements.configPanel.classList.add('-translate-x-full');
    elements.configOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function openHistoryModal() {
    elements.historyModal.classList.remove('hidden');
    renderHistoryList();
    document.body.style.overflow = 'hidden';
}

function closeHistoryModal() {
    elements.historyModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ==========================================
// Génération principale
// ==========================================

function generate() {
    const config = getConfig();
    const slats = generateSlats(config);
    drawWall(config, slats);
    displayMaterialsSummary(config, slats);
}

// ==========================================
// Event Listeners
// ==========================================

// Génération
elements.generateBtn.addEventListener('click', () => {
    generate();
    if (window.innerWidth < 1024) closeMenu();
});

// Sauvegarde
elements.saveBtn.addEventListener('click', () => {
    saveToHistory();
    if (window.innerWidth < 1024) closeMenu();
});

// Export PDF
elements.exportPdfBtn.addEventListener('click', exportPDF);
elements.exportPdfBtnMobile.addEventListener('click', () => {
    exportPDF();
    closeMenu();
});

// Menu mobile
elements.menuToggle.addEventListener('click', openMenu);
elements.closePanel.addEventListener('click', closeMenu);
elements.configOverlay.addEventListener('click', closeMenu);

// Historique
elements.historyBtn.addEventListener('click', openHistoryModal);
elements.closeHistory.addEventListener('click', closeHistoryModal);
elements.historyOverlay.addEventListener('click', closeHistoryModal);

// Sync couleur mur
elements.wallColor.addEventListener('input', (e) => {
    elements.wallColorHex.value = e.target.value;
});
elements.wallColorHex.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        elements.wallColor.value = val;
    }
});

// Mise à jour en temps réel
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', generate);
});

// ==========================================
// Initialisation
// ==========================================

window.addEventListener('load', () => {
    loadHistory();
    generate();
});

// Exposer fonctions pour les boutons inline
window.loadFromHistory = loadFromHistory;
window.deleteFromHistory = deleteFromHistory;
