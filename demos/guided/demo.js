// ============================================
// NEXUS GUIDED DEMO - v2
// Positioned tour card, arrows, no tint
// ============================================

// === STATE ===
let currentStep = 0;
let tourStarted = false;
let mapView = null;

// === TOUR STEPS ===
const STEPS = [
    {
        id: 'welcome',
        label: 'Welcome to Rebirth Nexus',
        title: 'Predictive Intelligence Platform',
        content: `
            <p>You're about to experience <strong>Rebirth Nexus</strong> — the conversational intelligence platform that turns scattered signals into decisions you can defend.</p>
            <p>In this guided demo, you'll see how Nexus detected a winter storm <span class="highlight">48 hours before impact</span>, calculated $4.2M in exposure, and prepared mitigation options with a <span class="highlight">60:1 ROI</span>.</p>
            <div class="tour-pillars">
                <div class="tour-pillar"><span class="tour-pillar-icon">📊</span><span class="tour-pillar-name">Operational Data</span><span class="tour-pillar-desc">ERP, CRM, IoT & more</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🗺️</span><span class="tour-pillar-name">Geospatial</span><span class="tour-pillar-desc">Location, routes, assets</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🌐</span><span class="tour-pillar-name">Third-Party Intel</span><span class="tour-pillar-desc">News, weather, markets</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🤝</span><span class="tour-pillar-name">Partner Ecosystem</span><span class="tour-pillar-desc">Vendors, suppliers, APIs</span></div>
                <div class="tour-pillar"><span class="tour-pillar-icon">🔮</span><span class="tour-pillar-name">Predictive Engine</span><span class="tour-pillar-desc">Scenarios & forecasts</span></div>
            </div>
        `,
        buttons: [{ text: 'Begin Tour →', action: 'next', primary: true }],
        position: 'center'
    },
    {
        id: 'intel-feed',
        label: 'Step 1 of 8',
        title: 'The Intel Feed',
        content: `
            <p>The <strong>Intel Feed</strong> shows a real-time stream of events affecting your operations.</p>
            <p>Two alerts are waiting:</p>
            <p>🔴 <strong>Winter Storm Alert</strong> — A risk cascade threatening 12 stores<br>
            🟢 <strong>Competitor Closure</strong> — An opportunity to capture market share</p>
        `,
        buttons: [{ text: 'Continue →', action: 'next', primary: true }],
        position: 'right',
        arrowTo: 'intelFeed'
    },
    {
        id: 'weather',
        label: 'Step 2 of 8',
        title: 'Third-Party Intelligence',
        content: `
            <p>The weather card shows <strong>live NOAA data</strong> integrated into the platform.</p>
            <p>Notice the timestamps and confidence scores — this is how Nexus makes "48 hours early" <span class="highlight">defensible</span>.</p>
        `,
        buttons: [{ text: 'Continue →', action: 'next', primary: true }],
        position: 'left',
        arrowTo: 'weatherCard'
    },
    {
        id: 'analytics-intro',
        label: 'Step 3 of 8',
        title: 'Map & Analytics Views',
        content: `
            <p>The center panel shows two views:</p>
            <p><strong>🗺️ Map View</strong> — Geospatial intelligence showing store locations and risk zones.</p>
            <p><strong>📊 Analytics View</strong> — Tabular data for operations teams.</p>
            <div class="tour-instruction">👆 Click the glowing <strong>Analytics</strong> tab above</div>
        `,
        position: 'bottom-left',
        highlight: 'analyticsTab',
        arrowTo: 'analyticsTab',
        waitFor: 'analyticsClick'
    },
    {
        id: 'analytics-view',
        label: 'Step 4 of 8',
        title: 'Operational Exposure',
        content: `
            <p>The Analytics view shows your operational exposure in detail.</p>
            <p>Notice the <strong>$4.2M exposure</strong> card and the <strong>Critical Stores</strong> table.</p>
            <div class="tour-instruction">👆 Click the glowing <strong>Map</strong> tab to return</div>
        `,
        position: 'bottom-left',
        highlight: 'mapTab',
        arrowTo: 'mapTab',
        waitFor: 'mapClick'
    },
    {
        id: 'chat',
        label: 'Step 5 of 8',
        title: 'Conversational Intelligence',
        content: `
            <p>The right panel is where you interact with Nexus using <strong>plain English</strong>.</p>
            <p>No training required. No complex queries. Just ask questions like you would ask a colleague.</p>
        `,
        buttons: [{ text: 'Continue →', action: 'next', primary: true }],
        position: 'bottom-left',
        arrowTo: 'chatPanel'
    },
    {
        id: 'risk',
        label: 'Step 6 of 8',
        title: 'Exploring the Risk',
        content: `
            <p>Let's dig into what's actually at risk.</p>
            <div class="tour-instruction">👆 Click the glowing chip in the chat panel →</div>
        `,
        position: 'bottom-left',
        highlight: 'chip-risk',
        arrowTo: 'chip-risk',
        waitFor: 'chip-risk'
    },
    {
        id: 'actions',
        label: 'Step 7 of 8',
        title: 'The Mitigation Plan',
        content: `
            <p>Nexus doesn't just show problems — it shows <strong>exactly what to do</strong>.</p>
            <div class="tour-instruction">👆 Click the glowing chip below →</div>
        `,
        position: 'bottom-left',
        highlight: 'chip-actions',
        arrowTo: 'chip-actions',
        waitFor: 'chip-actions'
    },
    {
        id: 'complete',
        label: 'Tour Complete',
        title: 'What You Just Saw',
        content: `
            <p>Nexus detected a disruption <strong>48 hours before impact</strong>. It quantified <strong>$4.2M in exposure</strong>. It identified a mitigation plan with a <strong>60:1 ROI</strong>.</p>
            <div class="tour-pillars">
                <div class="tour-pillar"><span class="tour-pillar-icon">💬</span><span class="tour-pillar-name">The One-Liner</span></div>
                <p style="margin-top: 10px; font-style: italic; color: var(--gold);">"Nexus turns scattered signals into a decision you can defend — before the crisis hits."</p>
            </div>
        `,
        buttons: [
            { text: 'Explore Freely', action: 'end', primary: false },
            { text: 'Request a Pilot →', action: 'contact', primary: true }
        ],
        position: 'center'
    }
];

// === CHAT RESPONSES ===
const RESPONSES = {
    initial: {
        content: `
            <p>Good morning. I've detected <strong>two situations</strong> that need your attention.</p>
            <p>🔴 <strong>Winter Storm Alert:</strong> A severe storm is tracking toward your Midwest operations. 12 stores and 3 distribution centers are in the projected impact zone.</p>
            <div class="viz-cards">
                <div class="viz-card"><div class="label">Total Exposure</div><div class="value red">$4.2M</div></div>
                <div class="viz-card"><div class="label">Stores at Risk</div><div class="value amber">12</div></div>
                <div class="viz-card"><div class="label">DCs Affected</div><div class="value amber">3</div></div>
                <div class="viz-card"><div class="label">Warning Time</div><div class="value gold">48 hrs</div></div>
            </div>
            <p>I've already analyzed your supplier network and prepared mitigation options. What would you like to explore first?</p>
        `,
        sources: ['NOAA Weather', 'Store Operations', 'Esri GIS', 'Rebirth Analytics'],
        chips: ['risk', 'cascade', 'actions']
    },
    risk: {
        content: `
            <p>I've cross-referenced your store network with <strong>Rebirth Analytics</strong> supplier health data and <strong>Allianz Trade</strong> credit risk intelligence.</p>
            <div class="viz-list">
                <div class="viz-list-title">📊 Risk Concentration Analysis</div>
                <div class="viz-list-item"><div class="viz-status critical"></div><div class="viz-info"><div class="viz-name">Chicago Distribution Hub</div><div class="viz-detail">Primary DC for 12 stores • Storm landfall in 36 hrs</div></div><div class="viz-value" style="color: var(--red)">$1.8M</div></div>
                <div class="viz-list-item"><div class="viz-status high"></div><div class="viz-info"><div class="viz-name">Great Lakes Logistics</div><div class="viz-detail">Financial Health: 2/5 • Allianz Default Risk: 12.3%</div></div><div class="viz-value" style="color: var(--amber)">$890K</div></div>
                <div class="viz-list-item"><div class="viz-status high"></div><div class="viz-info"><div class="viz-name">Dajcor Aluminum (Supplier)</div><div class="viz-detail">Credit Score: 86/100 • Health: 3/5 • In storm path</div></div><div class="viz-value" style="color: var(--amber)">$650K</div></div>
                <div class="viz-list-item"><div class="viz-status medium"></div><div class="viz-info"><div class="viz-name">Store-Level Stockouts</div><div class="viz-detail">8 stores at risk of critical SKU depletion</div></div><div class="viz-value" style="color: var(--gold)">$420K</div></div>
            </div>
            <p><strong>Key Insight:</strong> 43% of exposure is concentrated in Chicago operations.</p>
        `,
        sources: ['Rebirth Analytics', 'Allianz Trade', 'Store Operations', 'WMS'],
        chips: ['cascade', 'actions']
    },
    cascade: {
        content: `
            <p>Here's how the disruption cascades if unmitigated:</p>
            <div class="viz-timeline">
                <div class="timeline-item"><div class="timeline-marker red"></div><div><div class="timeline-time">T+0 → T+24h</div><div class="timeline-title">Storm Hits Chicago DC</div><div class="timeline-desc">Primary distribution hub goes offline. 40% of regional inventory inaccessible.</div></div></div>
                <div class="timeline-item"><div class="timeline-marker amber"></div><div><div class="timeline-time">T+24 → T+36h</div><div class="timeline-title">Supplier Delivery Failures</div><div class="timeline-desc">Great Lakes Logistics misses commitments. Confidence: High (0.78).</div></div></div>
                <div class="timeline-item"><div class="timeline-marker amber"></div><div><div class="timeline-time">T+36 → T+48h</div><div class="timeline-title">Stockouts Begin</div><div class="timeline-desc">8 stores deplete high-velocity SKUs. Competitor stores capture demand.</div></div></div>
                <div class="timeline-item"><div class="timeline-marker red"></div><div><div class="timeline-time">T+48 → T+72h</div><div class="timeline-title">Revenue Impact Peaks</div><div class="timeline-desc">Estimated $2.8M in lost sales. Additional $400K in expedited shipping.</div></div></div>
            </div>
            <p><strong>Total unmitigated impact:</strong> <span style="color: var(--red); font-weight: 700;">$3.2M+</span></p>
        `,
        sources: ['Rebirth Analytics', 'Predictive Engine', 'Allianz Trade'],
        chips: ['actions']
    },
    actions: {
        content: `
            <p>Here are <strong>prioritized actions</strong> with verified availability:</p>
            <div class="viz-list">
                <div class="viz-list-title">✅ Recommended Mitigation Plan</div>
                <div class="viz-list-item"><div class="viz-status low"></div><div class="viz-info"><div class="viz-name">Reroute through Indianapolis DC</div><div class="viz-detail">Bypass Chicago hub • Carrier capacity confirmed • +8hr transit</div></div><div class="viz-value" style="color: var(--green)">+$1.4M</div></div>
                <div class="viz-list-item"><div class="viz-status low"></div><div class="viz-info"><div class="viz-name">Pre-position high-velocity SKUs</div><div class="viz-detail">Move inventory to unaffected stores before storm hits</div></div><div class="viz-value" style="color: var(--green)">+$780K</div></div>
                <div class="viz-list-item"><div class="viz-status low"></div><div class="viz-info"><div class="viz-name">Switch to Midwest Fixtures (4/5 health)</div><div class="viz-detail">Replace Great Lakes shipments • Higher resilience score</div></div><div class="viz-value" style="color: var(--green)">Risk ↓</div></div>
                <div class="viz-list-item"><div class="viz-status low"></div><div class="viz-info"><div class="viz-name">Notify store managers</div><div class="viz-detail">Activate contingency protocols at 12 affected locations</div></div><div class="viz-value" style="color: var(--green)">Ops ready</div></div>
            </div>
            <div class="viz-cards">
                <div class="viz-card"><div class="label">Mitigation Cost</div><div class="value amber">$52K</div></div>
                <div class="viz-card"><div class="label">Value Protected</div><div class="value green">$3.1M</div></div>
                <div class="viz-card"><div class="label">ROI</div><div class="value gold">60:1</div></div>
                <div class="viz-card"><div class="label">Residual Risk</div><div class="value">$340K</div></div>
            </div>
            <p><strong>Bottom line:</strong> Spend $52,000 to protect $3.1 million. <span style="color: var(--gold); font-weight: 700;">60-to-1 return</span>.</p>
        `,
        sources: ['Carrier APIs', 'Rebirth Analytics', 'Inventory System'],
        chips: ['execute', 'competitor']
    }
};

// === INTEL FEED DATA ===
const INTEL_ITEMS = [
    {
        type: 'risk',
        time: '2 minutes ago',
        title: 'Winter Storm Alert — Midwest',
        detail: 'Severe winter storm tracking toward Chicago metro. 12 stores and 3 distribution centers in projected impact zone.',
        exposure: '$4.2M',
        exposureClass: 'red'
    },
    {
        type: 'opportunity',
        time: '4 hours ago',
        title: 'Competitor Closure — Oakbrook',
        detail: 'ValueMart announcing closure of Oakbrook location. 47,000 households within 15-min drive of your stores.',
        exposure: '$1.8M',
        exposureClass: 'green'
    }
];

// === CHIP LABELS ===
const CHIP_LABELS = {
    risk: "What's our biggest risk?",
    cascade: "Show cascade effects",
    actions: "What actions should we take?",
    execute: "Execute all phases",
    competitor: "Show competitor opportunity"
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initIntelFeed();
    initMap();
    initChat();
    initTabs();
    showTourStep(0);
});

function initIntelFeed() {
    const container = document.getElementById('feedItems');
    container.innerHTML = INTEL_ITEMS.map(item => `
        <div class="feed-item ${item.type}">
            <span class="feed-item-badge ${item.type}">${item.type}</span>
            <div class="feed-item-time">${item.time}</div>
            <div class="feed-item-title">${item.title}</div>
            <div class="feed-item-detail">${item.detail}</div>
            <div class="feed-item-exposure">
                <span>${item.type === 'risk' ? 'Exposure' : 'Opportunity'}</span>
                <span class="value ${item.exposureClass}">${item.exposure}</span>
            </div>
        </div>
    `).join('');
}

function initMap() {
    require(["esri/Map", "esri/views/MapView", "esri/Graphic", "esri/layers/GraphicsLayer"], 
    (Map, MapView, Graphic, GraphicsLayer) => {
        const map = new Map({ basemap: "dark-gray-vector" });
        
        mapView = new MapView({
            container: "mapView",
            map: map,
            center: [-87.8, 41.5],
            zoom: 6,
            ui: { components: [] }
        });
        
        const graphics = new GraphicsLayer();
        map.add(graphics);
        
        // Storm zone polygon
        graphics.add(new Graphic({
            geometry: {
                type: "polygon",
                rings: [[[-89.5, 43], [-86, 43], [-85.5, 41], [-86.5, 39.5], [-89, 39.5], [-90, 41.5], [-89.5, 43]]]
            },
            symbol: {
                type: "simple-fill",
                color: [239, 68, 68, 0.2],
                outline: { color: [239, 68, 68, 0.8], width: 2 }
            }
        }));
        
        // Store markers
        const stores = [
            { lat: 41.8781, lon: -87.6298, status: 'critical' },
            { lat: 41.9742, lon: -87.9073, status: 'critical' },
            { lat: 41.8819, lon: -87.7232, status: 'critical' },
            { lat: 42.0451, lon: -87.6877, status: 'warning' },
            { lat: 41.5250, lon: -88.0817, status: 'warning' },
            { lat: 39.7684, lon: -86.1581, status: 'ok' }
        ];
        
        stores.forEach(s => {
            const color = s.status === 'critical' ? [239, 68, 68] : 
                          s.status === 'warning' ? [245, 158, 11] : [16, 185, 129];
            graphics.add(new Graphic({
                geometry: { type: "point", longitude: s.lon, latitude: s.lat },
                symbol: { type: "simple-marker", size: 14, color, outline: { color: [255,255,255], width: 2 } }
            }));
        });
        
        // DC markers
        graphics.add(new Graphic({
            geometry: { type: "point", longitude: -87.9298, latitude: 41.8781 },
            symbol: { type: "simple-marker", size: 20, color: [239, 68, 68], style: "square", outline: { color: [255,255,255], width: 3 } }
        }));
        graphics.add(new Graphic({
            geometry: { type: "point", longitude: -86.1581, latitude: 39.7684 },
            symbol: { type: "simple-marker", size: 20, color: [34, 211, 238], style: "square", outline: { color: [255,255,255], width: 3 } }
        }));
    });
}

function initChat() {
    renderChat('initial');
}

function renderChat(responseKey) {
    const r = RESPONSES[responseKey];
    if (!r) return;
    
    const messages = document.getElementById('chatMessages');
    messages.innerHTML = `
        <div class="message assistant">
            <div class="bubble">
                ${r.content}
                <div class="response-meta">
                    <span>Response: 0.8s</span>
                    <span>Confidence: 94%</span>
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
    const container = document.getElementById('chatChips');
    container.innerHTML = chipKeys.map(key => 
        `<button class="chip" data-chip="${key}" id="chip-${key}">${CHIP_LABELS[key] || key}</button>`
    ).join('');
    
    // Attach click handlers
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => handleChipClick(chip.dataset.chip));
    });
    
    // Re-apply highlight if needed
    if (tourStarted) {
        const step = STEPS[currentStep];
        if (step && step.highlight && step.highlight.startsWith('chip-')) {
            const chipEl = document.getElementById(step.highlight);
            if (chipEl) chipEl.classList.add('highlight');
        }
    }
}

function handleChipClick(chipKey) {
    // Remove highlight
    document.querySelectorAll('.chip.highlight').forEach(c => c.classList.remove('highlight'));
    
    // Show user message
    const messages = document.getElementById('chatMessages');
    messages.innerHTML += `
        <div class="message user">
            <div class="bubble">${CHIP_LABELS[chipKey]}</div>
        </div>
    `;
    
    // Show typing indicator
    messages.innerHTML += `
        <div class="message assistant" id="typing">
            <div class="bubble">...</div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;
    
    // After delay, show response
    setTimeout(() => {
        document.getElementById('typing')?.remove();
        
        const r = RESPONSES[chipKey];
        if (r) {
            messages.innerHTML += `
                <div class="message assistant">
                    <div class="bubble">
                        ${r.content}
                        <div class="response-meta">
                            <span>Response: 1.2s</span>
                            <span>Confidence: 89%</span>
                        </div>
                        <div class="provenance">
                            <div class="provenance-label">Data Sources</div>
                            <div class="provenance-tags">${r.sources.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                        </div>
                    </div>
                </div>
            `;
            renderChips(r.chips);
            
            // Update KPI if actions
            if (chipKey === 'actions') {
                document.getElementById('kpiProtected').textContent = '$3.1M';
                document.getElementById('kpiProtected').classList.add('green');
            }
        }
        messages.scrollTop = messages.scrollHeight;
        
        // Advance tour if waiting for this chip
        if (tourStarted) {
            const step = STEPS[currentStep];
            if (step && step.waitFor === `chip-${chipKey}`) {
                hideArrow();
                setTimeout(() => showTourStep(currentStep + 1), 500);
            }
        }
    }, 800);
}

function initTabs() {
    document.getElementById('mapTab').addEventListener('click', () => {
        switchView('map');
        // Advance tour if waiting
        if (tourStarted) {
            const step = STEPS[currentStep];
            if (step && step.waitFor === 'mapClick') {
                document.getElementById('mapTab').classList.remove('highlight');
                hideArrow();
                setTimeout(() => showTourStep(currentStep + 1), 300);
            }
        }
    });
    
    document.getElementById('analyticsTab').addEventListener('click', () => {
        switchView('analytics');
        // Advance tour if waiting
        if (tourStarted) {
            const step = STEPS[currentStep];
            if (step && step.waitFor === 'analyticsClick') {
                document.getElementById('analyticsTab').classList.remove('highlight');
                hideArrow();
                setTimeout(() => showTourStep(currentStep + 1), 300);
            }
        }
    });
}

function switchView(view) {
    const mapTab = document.getElementById('mapTab');
    const analyticsTab = document.getElementById('analyticsTab');
    const mapContainer = document.getElementById('mapContainer');
    const analyticsContainer = document.getElementById('analyticsContainer');
    
    if (view === 'analytics') {
        mapTab.classList.remove('active');
        analyticsTab.classList.add('active');
        mapContainer.classList.add('hidden');
        analyticsContainer.classList.add('active');
    } else {
        mapTab.classList.add('active');
        analyticsTab.classList.remove('active');
        mapContainer.classList.remove('hidden');
        analyticsContainer.classList.remove('active');
    }
}

// === TOUR FUNCTIONS ===

function showTourStep(index) {
    currentStep = index;
    const step = STEPS[index];
    
    if (!step) {
        endTour();
        return;
    }
    
    const card = document.getElementById('tourCard');
    const arrow = document.getElementById('tourArrow');
    
    // Update progress dots
    document.getElementById('tourProgress').innerHTML = STEPS.map((_, i) => {
        const cls = i < index ? 'tour-dot done' : i === index ? 'tour-dot active' : 'tour-dot';
        return `<div class="${cls}"></div>`;
    }).join('');
    
    // Update content
    document.getElementById('tourStepLabel').textContent = step.label;
    document.getElementById('tourTitle').textContent = step.title;
    document.getElementById('tourContent').innerHTML = step.content;
    
    // Update buttons
    const actionsEl = document.getElementById('tourActions');
    if (step.buttons) {
        actionsEl.innerHTML = step.buttons.map(btn => 
            `<button class="tour-btn ${btn.primary ? 'primary' : 'secondary'}" data-action="${btn.action}">${btn.text}</button>`
        ).join('');
        
        // Attach handlers
        actionsEl.querySelectorAll('.tour-btn').forEach(btn => {
            btn.addEventListener('click', () => handleTourAction(btn.dataset.action));
        });
    } else {
        actionsEl.innerHTML = '';
    }
    
    // Position card
    card.className = 'tour-card active pos-' + (step.position || 'center');
    
    // Clear old highlights
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    
    // Apply highlight
    if (step.highlight) {
        const highlightEl = document.getElementById(step.highlight);
        if (highlightEl) {
            highlightEl.classList.add('highlight');
        }
    }
    
    // Position arrow
    if (step.arrowTo) {
        positionArrow(step.arrowTo);
    } else {
        hideArrow();
    }
}

function positionArrow(targetId) {
    const target = document.getElementById(targetId);
    const arrow = document.getElementById('tourArrow');
    
    if (!target) {
        hideArrow();
        return;
    }
    
    const rect = target.getBoundingClientRect();
    
    // Position arrow to point at target (arrow points to top-right)
    arrow.style.left = (rect.left - 60) + 'px';
    arrow.style.top = (rect.top - 60) + 'px';
    arrow.classList.add('active');
}

function hideArrow() {
    document.getElementById('tourArrow').classList.remove('active');
}

function handleTourAction(action) {
    if (action === 'next') {
        if (currentStep === 0) {
            tourStarted = true;
        }
        showTourStep(currentStep + 1);
    } else if (action === 'end') {
        endTour();
    } else if (action === 'contact') {
        endTour();
        alert('Thank you! Our team will reach out within 24 hours to schedule your pilot.');
    }
}

function endTour() {
    tourStarted = false;
    document.getElementById('tourCard').classList.remove('active');
    hideArrow();
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    document.getElementById('chatInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    // Show free exploration message
    const messages = document.getElementById('chatMessages');
    messages.innerHTML += `
        <div class="message assistant">
            <div class="bubble">
                <p>You're now in <strong>free exploration mode</strong>. Try clicking any of the chips below, or type your own questions!</p>
            </div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;
}
