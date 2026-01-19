// ============================================
// NEXUS WIS DEMO - Contested Logistics
// Guided tour with canned responses only
// For Warfighting Innovation Summit
// ============================================

// === SCENARIO NUMBERS (Single source of truth) ===
const NUMBERS = {
    totalExposure: '$127M',
    nodesAtRisk: 7,
    mitigationCost: '$3.35M',
    protected: '$118M',
    residual: '$9M',
    roi: '35:1',
    decisionWindow: '48h',
    subicExposure: '$42M',
    guamExposure: '$38M',
    yokosukaExposure: '$22M',
    vessels: 3
};

// === CANNED RESPONSES ===
const RESPONSES = {
    initial: {
        content: `<p>Good afternoon. I've detected a developing situation requiring command attention.</p>
            <p><strong>⚠️ Port Interdiction Warning:</strong> Credible intelligence indicates potential access denial at Subic Bay within 48-72 hours. Three supply vessels are currently en route with critical cargo.</p>
            <div class="viz-cards">
                <div class="viz-card"><div class="label">Total Exposure</div><div class="value red">${NUMBERS.totalExposure}</div></div>
                <div class="viz-card"><div class="label">Nodes at Risk</div><div class="value amber">${NUMBERS.nodesAtRisk}</div></div>
                <div class="viz-card"><div class="label">Vessels En Route</div><div class="value amber">${NUMBERS.vessels}</div></div>
                <div class="viz-card"><div class="label">Decision Window</div><div class="value gold">${NUMBERS.decisionWindow}</div></div>
            </div>
            <p>I've analyzed the logistics network and prepared contingency options. What would you like to explore first?</p>`,
        sources: ['DIA (representative)', 'INDOPACOM J2 (representative)', 'TRANSCOM (representative)', 'Esri GIS', 'Rebirth Analytics'],
        chips: ['risk', 'cascade', 'actions']
    },
    
    risk: {
        content: `<p>Here's the risk concentration analysis across your Pacific logistics network:</p>
            <div class="viz-list">
                <div class="viz-list-title">📊 Risk Breakdown by Node</div>
                <div class="viz-list-item"><div class="viz-status critical"></div><div class="viz-info"><div class="viz-name">Subic Bay Port</div><div class="viz-detail">Primary naval logistics • 3 vessels en route • Interdiction probable</div></div><div class="viz-value" style="color: var(--red)">${NUMBERS.subicExposure}</div></div>
                <div class="viz-list-item"><div class="viz-status critical"></div><div class="viz-info"><div class="viz-name">Guam Fuel Depot</div><div class="viz-detail">62% capacity • 4.2 days supply • Resupply delayed</div></div><div class="viz-value" style="color: var(--red)">${NUMBERS.guamExposure}</div></div>
                <div class="viz-list-item"><div class="viz-status high"></div><div class="viz-info"><div class="viz-name">Yokosuka Ship Repair</div><div class="viz-detail">2 vessels in maintenance • Parts supply chain exposed</div></div><div class="viz-value" style="color: var(--amber)">${NUMBERS.yokosukaExposure}</div></div>
                <div class="viz-list-item"><div class="viz-status medium"></div><div class="viz-info"><div class="viz-name">Secondary Nodes (4)</div><div class="viz-detail">Darwin, Changi, Sasebo, Okinawa — cascading risk</div></div><div class="viz-value" style="color: var(--gold)">$25M</div></div>
            </div>
            <p><strong>Key Insight:</strong> 63% of exposure is concentrated in two nodes (Subic + Guam). Both have viable alternatives if activated within 24 hours.</p>`,
        sources: ['Rebirth Analytics', 'TRANSCOM (representative)', 'Fleet Logistics (synthetic)', 'Allied Port Capacity (synthetic)'],
        chips: ['cascade', 'actions']
    },
    
    cascade: {
        content: `<p>Here's how the disruption cascades if Subic Bay access is denied:</p>
            <div class="viz-timeline">
                <div class="timeline-item"><div class="timeline-marker red"></div><div><div class="timeline-time">T+0 → T+12h</div><div class="timeline-title">Port Access Denied</div><div class="timeline-desc">3 vessels diverted. $42M cargo in limbo. Guam receives no scheduled resupply.</div></div></div>
                <div class="timeline-item"><div class="timeline-marker red"></div><div><div class="timeline-time">T+12 → T+36h</div><div class="timeline-title">Fuel Criticality</div><div class="timeline-desc">Guam drops below 50% capacity. Operational tempo restrictions begin. Confidence: 0.89.</div></div></div>
                <div class="timeline-item"><div class="timeline-marker amber"></div><div><div class="timeline-time">T+36 → T+72h</div><div class="timeline-title">Maintenance Backlog</div><div class="timeline-desc">Yokosuka parts shortage. 2 vessels delayed returning to operational status.</div></div></div>
                <div class="timeline-item"><div class="timeline-marker amber"></div><div><div class="timeline-time">T+72 → T+120h</div><div class="timeline-title">Allied Impact</div><div class="timeline-desc">Darwin and Changi absorb overflow. Partner capacity strained. Regional readiness degraded.</div></div></div>
            </div>
            <p><strong>Bottom Line:</strong> Without mitigation, this cascades from a single-port issue to theater-wide logistics degradation in 5 days.</p>`,
        sources: ['Predictive Model', 'TRANSCOM', 'Allied Logistics', 'Historical Analysis'],
        chips: ['actions', 'risk']
    },
    
    actions: {
        content: `<p>I've identified three mitigation pathways. Here's the recommended course of action:</p>
            <div class="viz-list">
                <div class="viz-list-title">✅ Recommended Actions</div>
                <div class="viz-list-item"><div class="viz-status ok"></div><div class="viz-info"><div class="viz-name">Reroute to Changi (Singapore)</div><div class="viz-detail">Allied port • 18hr diversion • Full capacity available • Execute within 12h</div></div><div class="viz-value" style="color: var(--green)">$2.1M</div></div>
                <div class="viz-list-item"><div class="viz-status ok"></div><div class="viz-info"><div class="viz-name">Accelerate Guam Resupply</div><div class="viz-detail">Redirect USNS Pecos • ETA 48h vs 96h • Fuel criticality averted</div></div><div class="viz-value" style="color: var(--green)">$800K</div></div>
                <div class="viz-list-item"><div class="viz-status ok"></div><div class="viz-info"><div class="viz-name">Pre-position Parts at Yokosuka</div><div class="viz-detail">Air freight critical components • 36h delivery • Maintenance timeline preserved</div></div><div class="viz-value" style="color: var(--green)">$450K</div></div>
            </div>
            <div class="viz-cards" style="margin-top: 16px;">
                <div class="viz-card"><div class="label">Mitigation Cost</div><div class="value amber">${NUMBERS.mitigationCost}</div></div>
                <div class="viz-card"><div class="label">Value Protected</div><div class="value green">${NUMBERS.protected}</div></div>
                <div class="viz-card"><div class="label">ROI</div><div class="value gold">${NUMBERS.roi}</div></div>
                <div class="viz-card"><div class="label">Residual Risk</div><div class="value green">${NUMBERS.residual}</div></div>
            </div>
            <p><strong>Decision Required:</strong> Approve rerouting authority and expedited resupply. Recommendation: Execute immediately.</p>`,
        sources: ['Fleet Logistics (synthetic)', 'TRANSCOM (representative)', 'Allied Command (representative)', 'Cost Models (synthetic)', 'Rebirth Analytics'],
        chips: ['risk', 'cascade']
    }
};

const CHIP_LABELS = {
    risk: "What's our biggest risk?",
    cascade: "Show cascade effects",
    actions: "What actions should we take?"
};

// === TOUR CONFIGURATION ===
const TOUR_STEPS = [
    {
        id: 'welcome',
        label: 'Welcome to Rebirth Nexus',
        title: 'Contested Logistics Intelligence',
        content: `
            <p>You're about to experience <strong>Rebirth Nexus</strong> — the conversational intelligence platform that transforms scattered signals into defensible decisions.</p>
            <p>In this scenario, Nexus has detected a developing threat to Pacific logistics operations <span class="highlight">48 hours before impact</span>, calculated <span class="highlight">$127M in exposure</span>, and prepared mitigation pathways with <span class="highlight">35:1 ROI</span>.</p>
            <div class="tour-pillars">
                <div class="tour-pillar"><span class="tour-pillar-icon">📊</span><span class="tour-pillar-name">Operational</span><span class="tour-pillar-desc">Fleet & inventory</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🗺️</span><span class="tour-pillar-name">Geospatial</span><span class="tour-pillar-desc">Routes & bases</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🌐</span><span class="tour-pillar-name">Intel Feeds</span><span class="tour-pillar-desc">Threat reports</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🤝</span><span class="tour-pillar-name">Allied Network</span><span class="tour-pillar-desc">Partners & MOUs</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🔮</span><span class="tour-pillar-name">Predictive</span><span class="tour-pillar-desc">Cascades</span></div>
            </div>
        `,
        target: null,
        buttons: [{ text: 'Begin Tour →', action: 'next', primary: true }]
    },
    {
        id: 'intel-feed',
        label: 'Step 1 of 6',
        title: 'Threat Intelligence Feed',
        content: `
            <p>The <strong>Intel Feed</strong> aggregates threat data from multiple sources — DIA, INDOPACOM J2, TRANSCOM, and allied feeds.</p>
            <p>🔴 <strong>Port Interdiction Warning</strong> — Credible intelligence on Subic Bay access denial</p>
            <p>🟠 <strong>Fuel Constraint</strong> — Guam depot at 62% capacity</p>
            <p>Nexus correlates these signals to identify <span class="highlight">cascading risks</span> before they compound.</p>
        `,
        target: 'intelFeed',
        buttons: [{ text: 'Continue →', action: 'next', primary: true }]
    },
    {
        id: 'map',
        label: 'Step 2 of 6',
        title: 'Geospatial Intelligence',
        content: `
            <p>The map displays your <strong>logistics network</strong> powered by Esri ArcGIS — ports, airfields, depots, and supply routes across the Pacific theater.</p>
            <p>The <strong>Threat Assessment</strong> card shows synthesized intelligence with confidence scores. Notice: <span class="highlight">Confidence: 0.87</span> — Nexus shows its work so decisions are defensible.</p>
            <div class="tour-instruction">👆 Click the <strong>Analytics</strong> tab to see operational data</div>
        `,
        target: 'analyticsTab',
        waitFor: { type: 'tab', value: 'analytics' }
    },
    {
        id: 'analytics',
        label: 'Step 3 of 6',
        title: 'Operational Analytics',
        content: `
            <p>The Analytics view shows <strong>exposure by asset</strong> — which nodes carry the most risk and why.</p>
            <p>$127M total exposure across 7 nodes. Subic Bay alone represents $42M.</p>
            <div class="tour-instruction">👆 Click the <strong>Map</strong> tab to return</div>
        `,
        target: 'mapTab',
        waitFor: { type: 'tab', value: 'map' }
    },
    {
        id: 'chat',
        label: 'Step 4 of 6',
        title: 'Conversational Interface',
        content: `
            <p>This is where commanders interact with Nexus using <strong>plain language</strong>.</p>
            <p>No specialized queries. No training required. Ask questions like you would ask a J4 analyst.</p>
            <p>Responses synthesize data from <span class="highlight">all five pillars</span> with full data provenance.</p>
        `,
        target: 'chatPanel',
        buttons: [{ text: 'Continue →', action: 'next', primary: true }]
    },
    {
        id: 'risk-query',
        label: 'Step 5 of 6',
        title: 'Exploring the Risk',
        content: `
            <p>Let's ask Nexus to break down the threat across the network.</p>
            <div class="tour-instruction">👆 Click: <strong>"What's our biggest risk?"</strong></div>
        `,
        target: 'chip-risk',
        waitFor: { type: 'chip', value: 'risk' }
    },
    {
        id: 'actions-query',
        label: 'Step 6 of 6',
        title: 'Mitigation Options',
        content: `
            <p>Nexus doesn't just identify problems — it provides <strong>actionable recommendations</strong> with ROI calculations and approval pathways.</p>
            <div class="tour-instruction">👆 Click: <strong>"What actions should we take?"</strong></div>
        `,
        target: 'chip-actions',
        waitFor: { type: 'chip', value: 'actions' }
    },
    {
        id: 'complete',
        label: 'Tour Complete',
        title: 'What You Just Saw',
        content: `
            <p>Nexus detected a threat <strong>48 hours before impact</strong>. It quantified <strong>$127M in exposure</strong>. It identified mitigation pathways with <strong>35:1 ROI</strong>.</p>
            <p>This is <span class="highlight">contested logistics intelligence</span> — turning scattered signals into decisions you can defend.</p>
            <div class="tour-pillars" style="grid-template-columns: 1fr; margin-top: 20px;">
                <div class="tour-pillar" style="padding: 20px;">
                    <span class="tour-pillar-name" style="font-size: 14px; color: var(--gold);">"Nexus turns scattered signals into a decision you can defend — before the crisis hits."</span>
                </div>
            </div>
        `,
        target: null,
        buttons: [
            { text: 'Explore Freely', action: 'end', primary: false },
            { text: 'Request Demo →', action: 'contact', primary: true }
        ]
    }
];

// === STATE ===
let currentStep = 0;
let tourActive = false;
let tourWaitingFor = null;
let mapView = null;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChat();
    initTabs();
    initTourControls();
    initFreeTextInput();
    
    // Start tour after short delay
    setTimeout(() => startTour(), 1200);
});

// Keep spotlight aligned on resize/orientation changes
window.addEventListener('resize', () => {
    if (!tourActive) return;
    const step = TOUR_STEPS[currentStep];
    if (step) updateSpotlight(step.target);
});

// === MAP ===
function initMap() {
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/layers/GraphicsLayer"
    ], function(Map, MapView, Graphic, GraphicsLayer) {
        const map = new Map({ basemap: "dark-gray-vector" });
        
        mapView = new MapView({
            container: "mapView",
            map: map,
            center: [130, 15],
            zoom: 4,
            ui: { components: [] }
        });
        
        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        
        const assets = [
            { name: "Subic Bay", coords: [120.28, 14.82], status: "critical" },
            { name: "Guam", coords: [144.79, 13.44], status: "warning" },
            { name: "Yokosuka", coords: [139.65, 35.28], status: "ok" },
            { name: "Darwin", coords: [130.84, -12.46], status: "ok" },
            { name: "Changi", coords: [103.98, 1.35], status: "allied" },
            { name: "Sasebo", coords: [129.72, 33.16], status: "ok" },
            { name: "Okinawa", coords: [127.68, 26.21], status: "warning" }
        ];
        
        const colors = {
            critical: [239, 68, 68],
            warning: [245, 158, 11],
            ok: [16, 185, 129],
            allied: [34, 211, 238]
        };
        
        assets.forEach(asset => {
            const graphic = new Graphic({
                geometry: { type: "point", longitude: asset.coords[0], latitude: asset.coords[1] },
                symbol: {
                    type: "simple-marker",
                    color: colors[asset.status],
                    size: asset.status === "critical" ? 16 : 12,
                    outline: { color: [255, 255, 255, 0.8], width: 2 }
                }
            });
            graphicsLayer.add(graphic);
        });
        
        // Supply routes
        const routes = [
            [[103.98, 1.35], [120.28, 14.82]],
            [[120.28, 14.82], [144.79, 13.44]],
            [[144.79, 13.44], [139.65, 35.28]]
        ];
        
        routes.forEach((coords, i) => {
            graphicsLayer.add(new Graphic({
                geometry: { type: "polyline", paths: [coords] },
                symbol: {
                    type: "simple-line",
                    color: i === 0 ? [239, 68, 68, 0.6] : [100, 100, 120, 0.4],
                    width: i === 0 ? 3 : 2,
                    style: i === 0 ? "short-dash" : "solid"
                }
            }));
        });
    });
}

// === CHAT ===
function initChat() {
    showInitialMessage();
}

function showInitialMessage() {
    const messages = document.getElementById('chatMessages');
    const r = RESPONSES.initial;
    
    messages.innerHTML = `
        <div class="message assistant">
            <div class="bubble">
                ${r.content}
                <div class="response-meta">
                    <span>Response: 0.8s</span>
                    <span>Confidence: 0.91</span>
                </div>
                <div class="provenance">
                    <div class="provenance-label">Data Sources</div>
                    <div class="provenance-tags">${r.sources.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                </div>
            </div>
        </div>
    `;
    
    renderChips(r.chips);
}

function renderChips(chipKeys) {
    const grid = document.getElementById('chipsGrid');
    grid.innerHTML = chipKeys.map(key => 
        `<div class="chip" id="chip-${key}" onclick="handleChipClick('${key}')">${CHIP_LABELS[key]}</div>`
    ).join('');
    
    // Re-highlight if tour is waiting
    if (tourActive && tourWaitingFor && tourWaitingFor.type === 'chip') {
        setTimeout(() => highlightChip(tourWaitingFor.value), 100);
    }
}

function handleChipClick(key) {
    // If tour is waiting for a different chip, ignore
    if (tourActive && tourWaitingFor) {
        if (tourWaitingFor.type === 'chip' && tourWaitingFor.value !== key) {
            return;
        }
    }
    
    // Clear highlight
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('tour-highlight'));
    
    const messages = document.getElementById('chatMessages');
    
    // User message
    messages.innerHTML += `
        <div class="message user">
            <div class="bubble">${CHIP_LABELS[key]}</div>
        </div>
    `;
    
    // Typing indicator
    messages.innerHTML += `<div class="message assistant" id="typing"><div class="bubble">Analyzing...</div></div>`;
    messages.scrollTop = messages.scrollHeight;
    
    setTimeout(() => {
        document.getElementById('typing')?.remove();
        
        const r = RESPONSES[key];
        if (r) {
            messages.innerHTML += `
                <div class="message assistant">
                    <div class="bubble">
                        ${r.content}
                        <div class="response-meta">
                            <span>Response: 1.1s</span>
                            <span>Confidence: 0.89</span>
                        </div>
                        <div class="provenance">
                            <div class="provenance-label">Data Sources</div>
                            <div class="provenance-tags">${r.sources.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                        </div>
                    </div>
                </div>
            `;
            renderChips(r.chips);
            
            // Update KPIs for actions
            if (key === 'actions') {
                document.getElementById('kpiProtected').textContent = NUMBERS.protected;
                document.getElementById('kpiProtected').classList.add('green');
                document.getElementById('kpiROI').textContent = NUMBERS.roi;
                document.getElementById('kpiROI').classList.add('gold');
            }
        }
        
        messages.scrollTop = messages.scrollHeight;
        
        // Advance tour if waiting
        if (tourActive && tourWaitingFor && tourWaitingFor.type === 'chip' && tourWaitingFor.value === key) {
            tourWaitingFor = null;
            setTimeout(() => advanceTour(), 400);
        }
    }, 800);
}

// === TABS ===
function initTabs() {
    document.getElementById('mapTab').addEventListener('click', () => handleTabClick('map'));
    document.getElementById('analyticsTab').addEventListener('click', () => handleTabClick('analytics'));
}

function handleTabClick(view) {
    // If tour is waiting for a different tab, ignore
    if (tourActive && tourWaitingFor) {
        if (tourWaitingFor.type === 'tab' && tourWaitingFor.value !== view) {
            return;
        }
    }
    
    switchView(view);
    
    // Advance tour if waiting
    if (tourActive && tourWaitingFor && tourWaitingFor.type === 'tab' && tourWaitingFor.value === view) {
        tourWaitingFor = null;
        setTimeout(() => advanceTour(), 300);
    }
}

function switchView(view) {
    const mapTab = document.getElementById('mapTab');
    const analyticsTab = document.getElementById('analyticsTab');
    const mapContainer = document.getElementById('mapContainer');
    const analyticsView = document.getElementById('analyticsView');
    
    // Clear highlights
    mapTab.classList.remove('tour-highlight');
    analyticsTab.classList.remove('tour-highlight');
    
    if (view === 'analytics') {
        mapTab.classList.remove('active');
        analyticsTab.classList.add('active');
        mapContainer.classList.add('hidden');
        analyticsView.classList.add('active');
    } else {
        mapTab.classList.add('active');
        analyticsTab.classList.remove('active');
        mapContainer.classList.remove('hidden');
        analyticsView.classList.remove('active');
    }
}

// === TOUR ===
function initTourControls() {
    document.getElementById('tourRestart').addEventListener('click', () => {
        resetDemo();
        startTour();
    });
}

function startTour() {
    tourActive = true;
    currentStep = 0;
    tourWaitingFor = null;
    document.getElementById('tourOverlay').classList.add('active');
    renderTourStep();
}

function renderTourStep() {
    const step = TOUR_STEPS[currentStep];
    
    // Update step indicator
    document.getElementById('tourSteps').innerHTML = TOUR_STEPS.map((_, i) => {
        let cls = 'tour-dot';
        if (i < currentStep) cls += ' completed';
        if (i === currentStep) cls += ' active';
        return `<div class="${cls}"></div>`;
    }).join('');
    
    document.getElementById('tourLabel').textContent = step.label;
    document.getElementById('tourTitle').textContent = step.title;
    document.getElementById('tourContent').innerHTML = step.content;
    
    // Buttons
    const buttonsContainer = document.getElementById('tourButtons');
    if (step.buttons) {
        buttonsContainer.innerHTML = step.buttons.map(btn => 
            `<button class="tour-btn ${btn.primary ? 'primary' : 'secondary'}" onclick="handleTourButton('${btn.action}')">${btn.text}</button>`
        ).join('');
    } else {
        buttonsContainer.innerHTML = '';
    }
    
    // Clear previous highlights
    clearHighlights();
    
    // Set up waiting state and highlights
    if (step.waitFor) {
        tourWaitingFor = step.waitFor;
        
        if (step.waitFor.type === 'tab') {
            document.getElementById(step.target).classList.add('tour-highlight');
        } else if (step.waitFor.type === 'chip') {
            setTimeout(() => highlightChip(step.waitFor.value), 100);
        }
    } else {
        tourWaitingFor = null;
    }
    
    // Spotlight
    updateSpotlight(step.target);
}

function highlightChip(chipKey) {
    const chip = document.getElementById(`chip-${chipKey}`);
    if (chip) {
        chip.classList.add('tour-highlight');
    }
}

function clearHighlights() {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    document.getElementById('tourSpotlight').style.display = 'none';
    document.getElementById('tourOverlay').classList.remove('spotlight-mode');
}

function updateSpotlight(targetId) {
    const spotlight = document.getElementById('tourSpotlight');
    const overlay = document.getElementById('tourOverlay');
    
    if (!targetId) {
        spotlight.style.display = 'none';
        overlay.classList.remove('spotlight-mode');
        return;
    }
    
    const el = document.getElementById(targetId);
    if (el) {
        overlay.classList.add('spotlight-mode');
        const rect = el.getBoundingClientRect();
        spotlight.style.display = 'block';
        spotlight.style.top = (rect.top - 6) + 'px';
        spotlight.style.left = (rect.left - 6) + 'px';
        spotlight.style.width = (rect.width + 12) + 'px';
        spotlight.style.height = (rect.height + 12) + 'px';
    } else {
        spotlight.style.display = 'none';
        overlay.classList.remove('spotlight-mode');
    }
}

function handleTourButton(action) {
    if (action === 'next') {
        advanceTour();
    } else if (action === 'end') {
        endTour();
    } else if (action === 'contact') {
        endTour();
        document.getElementById('pocModal').classList.add('active');
    }
}

function advanceTour() {
    if (currentStep < TOUR_STEPS.length - 1) {
        currentStep++;
        renderTourStep();
    } else {
        endTour();
    }
}

function endTour() {
    tourActive = false;
    tourWaitingFor = null;
    clearHighlights();
    document.getElementById('tourOverlay').classList.remove('active');
    document.getElementById('chatInputArea').classList.add('active');
}

function resetDemo() {
    // Reset KPIs
    document.getElementById('kpiProtected').textContent = '$0';
    document.getElementById('kpiProtected').classList.remove('green');
    document.getElementById('kpiROI').textContent = '—';
    document.getElementById('kpiROI').classList.remove('gold');
    
    // Reset chat
    showInitialMessage();
    
    // Reset view to map
    switchView('map');
}

function closePocModal() {
    document.getElementById('pocModal').classList.remove('active');
}

// === FREE TEXT INPUT HANDLING ===
function initFreeTextInput() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        
        const messages = document.getElementById('chatMessages');
        
        // User message
        messages.innerHTML += `
            <div class="message user">
                <div class="bubble">${escapeHtml(text)}</div>
            </div>
        `;
        input.value = '';
        
        // Typing indicator
        messages.innerHTML += `<div class="message assistant" id="typing"><div class="bubble">Analyzing...</div></div>`;
        messages.scrollTop = messages.scrollHeight;
        
        setTimeout(() => {
            document.getElementById('typing')?.remove();
            
            // Canned fallback response for free text
            messages.innerHTML += `
                <div class="message assistant">
                    <div class="bubble">
                        <p>This guided demo uses pre-defined scenarios to showcase Nexus capabilities. For custom queries on your specific operational context, <strong>request a live demonstration</strong> where we can connect your data sources.</p>
                        <p>Try the suggested queries below, or click <strong>ℹ️ Tour</strong> to restart the guided experience.</p>
                        <div class="response-meta">
                            <span>Demo Mode</span>
                        </div>
                    </div>
                </div>
            `;
            messages.scrollTop = messages.scrollHeight;
        }, 600);
    };
    
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose for onclick handlers
window.handleChipClick = handleChipClick;
window.handleTourButton = handleTourButton;
window.closePocModal = closePocModal;
