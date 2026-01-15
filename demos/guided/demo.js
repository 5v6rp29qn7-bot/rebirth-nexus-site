// ============================================
// NEXUS GUIDED DEMO - PRODUCTION BUILD
// Mobile-Optimized, Enterprise-Grade
// ============================================

// === CHIP SYSTEM (Explicit routing - no dead ends) ===
const CHIP_DEFINITIONS = {
    'risk': { label: "What's our biggest risk?", actionKey: 'risk' },
    'cascade': { label: "Show cascade effects", actionKey: 'cascade' },
    'actions': { label: "What actions should we take?", actionKey: 'actions' },
    'deep-dive-great-lakes': { label: "Deep dive: Great Lakes", actionKey: 'deep-dive-great-lakes' },
    'approvals': { label: "Who approves spending?", actionKey: 'approvals' },
    'execute': { label: "Execute all phases", actionKey: 'execute' },
    'competitor': { label: "Show competitor opportunity", actionKey: 'competitor' },
    'simulate-strike': { label: "Simulate labor strike", actionKey: 'simulate-strike' },
    'analyze-competitor': { label: "Analyze competitor footprint", actionKey: 'analyze-competitor' },
    'export-report': { label: "Export report", actionKey: 'export-report' }
};

// Validate chip coverage on load (for debugging)
if (typeof console !== 'undefined') {
    Object.keys(CHIP_DEFINITIONS).forEach(key => {
        if (!CHAT_RESPONSES || !CHAT_RESPONSES[key]) {
            // Will be checked after CHAT_RESPONSES is defined
        }
    });
}

// === STATE ===
let currentTourStep = 0;
let mapView = null;
let tourActive = true;
const RESPONSE_DELAY = 800;

// === DEVICE DETECTION ===
const isMobile = () => window.innerWidth <= 768;
const isSmallScreen = () => window.innerWidth <= 1024;

// === INTEL FEED DATA ===
const INTEL_FEED = [
    {
        id: 'storm', type: 'critical', badge: 'risk', time: '2 minutes ago',
        title: 'Winter Storm Alert — Midwest',
        detail: 'Severe winter storm tracking toward Chicago metro. 12 stores and 3 distribution centers in projected impact zone.',
        exposure: '$4.2M', exposureClass: 'red'
    },
    {
        id: 'competitor', type: 'opportunity', badge: 'opportunity', time: '4 hours ago',
        title: 'Competitor Closure — Oakbrook',
        detail: 'ValueMart announcing closure of Oakbrook location. 47,000 households within 15-min drive of your stores.',
        exposure: '$1.8M', exposureClass: 'green'
    }
];

// === TOUR STEPS (10 steps, mobile-aware) ===
const TOUR_STEPS = [
    {
        id: 'welcome', subtitle: 'Welcome to Nexus', title: 'Predictive Intelligence Platform',
        content: `<p>You're about to experience <strong>Nexus</strong> — the conversational intelligence platform that turns scattered signals into decisions you can defend.</p>
            <p>In this guided demo, you'll see how Nexus detected a winter storm <span class="highlight">48 hours before impact</span>, calculated $4.2M in exposure, and prepared mitigation options with a <span class="highlight">60:1 ROI</span>.</p>
            <div class="tour-highlight-box">
                <div class="pillar"><span class="pillar-icon">📊</span><span class="pillar-name">Operational Data</span><span class="pillar-desc">Your TMS, WMS, ERP</span></div>
                <div class="pillar"><span class="pillar-icon">🗺️</span><span class="pillar-name">Geospatial</span><span class="pillar-desc">Esri ArcGIS</span></div>
                <div class="pillar"><span class="pillar-icon">🌐</span><span class="pillar-name">Third-Party Intel</span><span class="pillar-desc">NOAA, Allianz Trade</span></div>
                <div class="pillar"><span class="pillar-icon">🤝</span><span class="pillar-name">Partner Ecosystem</span><span class="pillar-desc">Rebirth Analytics</span></div>
                <div class="pillar"><span class="pillar-icon">🔮</span><span class="pillar-name">Predictive Engine</span><span class="pillar-desc">Cascade simulation</span></div>
            </div>`,
        buttons: [{ text: 'Begin Tour →', primary: true, action: 'next' }],
        spotlight: null, pillarActivation: null, skipOnMobile: false
    },
    {
        id: 'intel-feed', subtitle: 'Step 1 of 10', title: 'The Intel Feed',
        content: `<p>The <strong>Intel Feed</strong> shows a real-time stream of events affecting your operations.</p>
            <p>Two alerts are already waiting:</p>
            <p>🔴 <strong>Winter Storm Alert</strong> — A risk cascade threatening 12 stores<br>
            🟢 <strong>Competitor Closure</strong> — An opportunity to capture market share</p>
            <p>Nexus monitors <span class="highlight">risk AND opportunity</span> — both sides of the intelligence equation.</p>`,
        buttons: [{ text: 'Continue →', primary: true, action: 'next' }],
        spotlight: 'intelFeed', pillarActivation: null, skipOnMobile: true,
        mobileContent: `<p>Nexus monitors <span class="highlight">risk AND opportunity</span> simultaneously.</p>
            <p>Right now, two situations need attention:</p>
            <p>🔴 <strong>Winter Storm</strong> — $4.2M exposure across 12 stores<br>
            🟢 <strong>Competitor Closure</strong> — $1.8M revenue opportunity</p>`
    },
    {
        id: 'weather-intel', subtitle: 'Step 2 of 10', title: 'Third-Party Intelligence',
        content: `<p>The weather overlay shows <strong>live NOAA data</strong> integrated into the platform.</p>
            <p>Notice the timestamps and confidence scores — this is how Nexus makes "48 hours early" <span class="highlight">defensible</span>:</p>
            <p>• <strong>Advisory updated:</strong> Real-time NOAA feed<br>
            • <strong>Forecast confidence:</strong> Model certainty score<br>
            • <strong>Next refresh:</strong> Continuous monitoring</p>`,
        buttons: [{ text: 'Continue →', primary: true, action: 'next' }],
        spotlight: 'weatherOverlay', pillarActivation: 'thirdparty', skipOnMobile: true,
        mobileSpotlight: 'mobileWeatherBanner',
        mobileContent: `<p>The weather alert above shows <strong>live NOAA data</strong> — real-time, not cached.</p>
            <p>Nexus integrates timestamps and confidence scores so "48 hours early" isn't a claim — it's <span class="highlight">verifiable intelligence</span>.</p>`
    },
    {
        id: 'center-panel', subtitle: 'Step 3 of 10', title: 'Map & Analytics Views',
        content: `<p>The center panel shows two views:</p>
            <p><strong>🗺️ Map View</strong> — Geospatial intelligence powered by <span class="highlight">Esri ArcGIS</span>.</p>
            <p><strong>📊 Analytics View</strong> — Tabular data for operations teams.</p>
            <div class="tour-instruction">Click the <strong>Analytics</strong> tab to see the operational view</div>`,
        buttons: [], spotlight: 'viewToggle', waitFor: 'analyticsClick', pillarActivation: 'geospatial', skipOnMobile: false
    },
    {
        id: 'analytics-view', subtitle: 'Step 4 of 10', title: 'Operational Exposure',
        content: `<p>The Analytics view shows your operational exposure in detail.</p>
            <p>Notice the highlighted <strong>$4.2M exposure</strong> card and the <strong>Supplier Risk Assessment</strong> table integrating:</p>
            <p>• <span class="highlight">Rebirth Analytics</span> — Financial health scores<br>
            • <span class="highlight">Allianz Trade</span> — Credit risk & default probability</p>
            <div class="tour-instruction">Click the <strong>Map</strong> tab to return</div>`,
        buttons: [], spotlight: 'viewToggle', waitFor: 'mapClick', pillarActivation: 'operational', skipOnMobile: false
    },
    {
        id: 'chat-panel', subtitle: 'Step 5 of 10', title: 'Conversational Intelligence',
        content: `<p>This is where you interact with Nexus using <strong>plain English</strong>.</p>
            <p>No training required. No complex queries. Just ask questions the way you would ask a colleague.</p>
            <p>The <strong>KPI strip</strong> shows real-time metrics that update as the situation evolves.</p>`,
        buttons: [{ text: 'Continue →', primary: true, action: 'next' }],
        spotlight: 'chatPanel', pillarActivation: null, skipOnMobile: false,
        mobileSpotlight: 'kpiStrip'
    },
    {
        id: 'explore-risk', subtitle: 'Step 6 of 10', title: 'Exploring the Risk',
        content: `<p>Let's dig into what's actually at risk. Nexus will cross-reference your data with <span class="highlight">Rebirth Analytics</span> supplier health and <span class="highlight">Allianz Trade</span> credit risk.</p>
            <div class="tour-instruction">Click <strong>"What's our biggest risk?"</strong></div>`,
        buttons: [], spotlight: 'chipsSection', waitFor: 'chip-risk', pillarActivation: 'partner', skipOnMobile: false
    },
    {
        id: 'cascade-effects', subtitle: 'Step 7 of 10', title: 'The Cascade Effect',
        content: `<p>Now let's see what happens if we do <strong>nothing</strong>.</p>
            <p>This is <span class="highlight">cascade analysis</span> — second-order and third-order impact simulation. It's what separates intelligence from dashboards.</p>
            <div class="tour-instruction">Click <strong>"Show cascade effects"</strong></div>`,
        buttons: [], spotlight: 'chipsSection', waitFor: 'chip-cascade', pillarActivation: 'predictive', skipOnMobile: false
    },
    {
        id: 'mitigation-plan', subtitle: 'Step 8 of 10', title: 'The Mitigation Plan',
        content: `<p>Nexus doesn't just show problems — it shows <strong>exactly what to do</strong> and quantifies the return.</p>
            <div class="tour-instruction">Click <strong>"What actions should we take?"</strong></div>`,
        buttons: [], spotlight: 'chipsSection', waitFor: 'chip-actions', pillarActivation: null, skipOnMobile: false
    },
    {
        id: 'opportunity', subtitle: 'Step 9 of 10', title: 'Not Just Risk — Opportunity',
        content: `<p><strong>Most risk systems stop here.</strong> Nexus goes further.</p>
            <p>While identifying risks, the engine simultaneously scans for market gaps. A competitor is closing their Oakbrook store — Nexus has already identified:</p>
            <p>• <strong>47,000 households</strong> now underserved<br>
            • <strong>3 of your stores</strong> within capture range<br>
            • <strong>$1.8M</strong> revenue opportunity</p>
            <p>The same platform that protects you from downside helps you <span class="highlight">capture upside</span>.</p>`,
        buttons: [{ text: 'Continue →', primary: true, action: 'next' }],
        spotlight: null, pillarActivation: null, skipOnMobile: false
    },
    {
        id: 'close', subtitle: 'Tour Complete', title: 'What You Just Saw',
        content: `<p>Nexus detected a disruption <strong>48 hours before impact</strong>. It quantified <strong>$4.2M in exposure</strong>. It identified a mitigation plan with a <strong>60:1 ROI</strong>.</p>
            <div class="tour-highlight-box">
                <div class="pillar"><span class="pillar-icon">💬</span><span class="pillar-name">The One-Liner</span></div>
                <p style="margin-top: 10px; font-style: italic; color: var(--accent-gold);">"Nexus turns scattered signals into a decision you can defend — before the crisis hits."</p>
            </div>`,
        buttons: [
            { text: 'Explore Freely', primary: false, action: 'explore' },
            { text: 'Request a Pilot →', primary: true, action: 'contact' }
        ],
        spotlight: null, pillarActivation: null, skipOnMobile: false
    }
];
="risk-value" style="color: var(--accent-amber);">L3</div></div>
        </div>
        <p><strong>Fast-track available:</strong> Given the 48-hour window, I can prepare a consolidated approval package for CFO emergency authorization.</p>`,
        provenance: ['Org Structure', 'Procurement Policy', 'Authorization Matrix'],
        confidence: 0.95, responseTime: '0.9s', chips: ['execute', 'actions']
    },
    'execute': {
        content: `<p>Initiating <strong>mitigation execution</strong>:</p>
        <div class="viz-timeline">
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">✓ Complete</div><div class="timeline-title">Carrier Rerouting Confirmed</div><div class="timeline-desc">Indianapolis DC notified. XPO Logistics confirming capacity.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker cyan"></div><div class="timeline-content"><div class="timeline-time">⏳ Pending</div><div class="timeline-title">Inventory Transfer Orders</div><div class="timeline-desc">Draft orders generated. Awaiting Regional VP approval.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker cyan"></div><div class="timeline-content"><div class="timeline-time">⏳ Pending</div><div class="timeline-title">Supplier Transition</div><div class="timeline-desc">Midwest Fixtures contacted. Procurement review at 2pm.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">✓ Complete</div><div class="timeline-title">Store Manager Alerts</div><div class="timeline-desc">All 12 managers notified. Contingency protocols activated.</div></div></div>
        </div>
        <p><strong>Status:</strong> 2 of 4 phases complete. I'll alert you when approvals are needed.</p>`,
        provenance: ['Carrier APIs', 'WMS', 'HR System', 'Notification Service'],
        confidence: 0.98, responseTime: '2.1s', chips: ['competitor', 'approvals']
    },
    'competitor': {
        content: `<p><strong>Opportunity analysis</strong> for ValueMart Oakbrook closure:</p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Underserved Households</div><div class="roi-value gold">47,000</div></div>
            <div class="roi-card"><div class="roi-label">Your Stores in Range</div><div class="roi-value cyan">3</div></div>
            <div class="roi-card"><div class="roi-label">Est. Capturable Revenue</div><div class="roi-value green">$1.8M</div></div>
            <div class="roi-card"><div class="roi-label">Competitor Exit Date</div><div class="roi-value amber">45 days</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🎯 Recommended Capture Actions</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Targeted Direct Mail Campaign</div><div class="risk-detail">47,000 households • "Welcome" offer</div></div><div class="risk-value" style="color: var(--accent-emerald);">$12K</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Extend Store Hours (3 locations)</div><div class="risk-detail">Match ValueMart's hours during transition</div></div><div class="risk-value" style="color: var(--accent-emerald);">$8K/mo</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Stock ValueMart's Top 50 SKUs</div><div class="risk-detail">Analysis of competitor's highest-velocity items</div></div><div class="risk-value" style="color: var(--accent-emerald);">$15K</div></div>
        </div>
        <p><strong>Projected ROI:</strong> $35K → $1.8M = <span style="color: var(--accent-gold); font-weight: 700;">51:1 return</span>.</p>`,
        provenance: ['Esri Demographics', 'Competitor Intel', 'Store Operations'],
        confidence: 0.84, responseTime: '1.3s', chips: ['actions', 'execute']
    },
    'simulate-strike': {
        content: `<p>Running <strong>labor strike simulation</strong>:</p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Scenario</div><div class="roi-value cyan">Port Strike</div></div>
            <div class="roi-card"><div class="roi-label">Duration Modeled</div><div class="roi-value amber">14 days</div></div>
            <div class="roi-card"><div class="roi-label">Exposure</div><div class="roi-value red">$6.8M</div></div>
            <div class="roi-card"><div class="roi-label">Suppliers Affected</div><div class="roi-value amber">23</div></div>
        </div>
        <p>This models a 14-day West Coast port strike. Highest exposure in imported electronics and seasonal inventory.</p>
        <p>Would you like me to identify alternative suppliers with domestic manufacturing?</p>`,
        provenance: ['Predictive Engine', 'Port Data', 'Supplier Network'],
        confidence: 0.79, responseTime: '2.4s', chips: ['actions', 'risk']
    },
    'analyze-competitor': {
        content: `<p><strong>Competitive footprint analysis</strong>:</p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🏪 Competitor Density (15-min drive)</div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Target</div><div class="risk-detail">8 locations overlapping your coverage</div></div><div class="risk-value" style="color: var(--accent-amber);">High</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Walmart</div><div class="risk-detail">5 locations, primarily suburban</div></div><div class="risk-value" style="color: var(--accent-cyan);">Medium</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Costco</div><div class="risk-detail">2 locations, different segment</div></div><div class="risk-value" style="color: var(--accent-emerald);">Low</div></div>
        </div>
        <p>Strongest position in Oak Park and Evanston corridors. Target planning new Schaumburg location — may impact your Aurora store.</p>`,
        provenance: ['Esri GIS', 'Competitor Intel', 'Real Estate Filings'],
        confidence: 0.86, responseTime: '1.5s', chips: ['competitor', 'risk']
    },
    'export-report': {
        content: `<p><strong>Executive summary report</strong> prepared:</p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📄 Report Contents</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Executive Summary</div><div class="risk-detail">1-page overview with key metrics</div></div><div class="risk-value" style="color: var(--accent-emerald);">✓</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Risk Assessment Detail</div><div class="risk-detail">Full supplier analysis with Rebirth/Allianz data</div></div><div class="risk-value" style="color: var(--accent-emerald);">✓</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Mitigation Plan</div><div class="risk-detail">Action items with costs, owners, timelines</div></div><div class="risk-value" style="color: var(--accent-emerald);">✓</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Data Provenance</div><div class="risk-detail">Full audit trail for compliance</div></div><div class="risk-value" style="color: var(--accent-emerald);">✓</div></div>
        </div>
        <p>Available: <strong>PDF</strong> (board-ready), <strong>Excel</strong>, <strong>PowerPoint</strong>.</p>
        <p style="margin-top: 12px;"><span style="color: var(--accent-gold);">📥 Generating PDF...</span></p>`,
        provenance: ['Report Generator', 'All Previous Sources'],
        confidence: 0.99, responseTime: '0.6s', chips: ['actions', 'risk']
    }
};

// Validate chip coverage
Object.keys(CHIP_DEFINITIONS).forEach(key => {
    if (!CHAT_RESPONSES[key]) {
        console.warn('No response defined for chip:', key);
    }
});

// === ANALYTICS HTML ===
const ANALYTICS_HTML = `
    <div class="analytics-grid">
        <div class="analytics-card" id="exposure-card">
            <div class="analytics-label">Total Exposure</div>
            <div class="analytics-value red">$4.2M</div>
            <div class="analytics-trend">↑ 12% from initial assessment</div>
        </div>
        <div class="analytics-card">
            <div class="analytics-label">Stores at Risk</div>
            <div class="analytics-value amber">12</div>
            <div class="analytics-trend">of 47 regional stores</div>
        </div>
        <div class="analytics-card">
            <div class="analytics-label">Suppliers Affected</div>
            <div class="analytics-value amber">8</div>
            <div class="analytics-trend">2 with elevated default risk</div>
        </div>
        <div class="analytics-card">
            <div class="analytics-label">Time to Impact</div>
            <div class="analytics-value gold">48 hrs</div>
            <div class="analytics-trend">Storm landfall projection</div>
        </div>
    </div>
    <div class="analytics-card full">
        <div class="analytics-section-title">📦 Critical Stores</div>
        <div class="table-scroll-wrapper">
        <table class="shipment-table">
            <thead><tr><th>Store</th><th>Location</th><th>Exposure</th><th>Inventory</th><th>Risk</th></tr></thead>
            <tbody>
                <tr class="highlight-row"><td><strong>Chicago Loop</strong></td><td>Chicago, IL</td><td>$420K</td><td>2.1 days</td><td><span class="status-badge critical">Critical</span></td></tr>
                <tr><td><strong>Des Plaines</strong></td><td>Des Plaines, IL</td><td>$380K</td><td>1.8 days</td><td><span class="status-badge critical">Critical</span></td></tr>
                <tr><td><strong>Oak Park</strong></td><td>Oak Park, IL</td><td>$350K</td><td>2.4 days</td><td><span class="status-badge critical">Critical</span></td></tr>
                <tr><td><strong>Evanston</strong></td><td>Evanston, IL</td><td>$290K</td><td>3.2 days</td><td><span class="status-badge warning">Warning</span></td></tr>
                <tr><td><strong>Joliet</strong></td><td>Joliet, IL</td><td>$265K</td><td>2.9 days</td><td><span class="status-badge warning">Warning</span></td></tr>
            </tbody>
        </table>
        </div>
    </div>
    <div class="analytics-card full">
        <div class="analytics-section-title">🏭 Supplier Risk (Rebirth + Allianz)</div>
        <div class="table-scroll-wrapper">
        <table class="shipment-table">
            <thead><tr><th>Supplier</th><th>Health</th><th>Credit</th><th>Default Risk</th><th>Status</th></tr></thead>
            <tbody>
                <tr class="highlight-row"><td><strong>Great Lakes</strong></td><td style="color: var(--accent-red);">2/5</td><td>68</td><td style="color: var(--accent-red);">12.3%</td><td><span class="status-badge critical">At Risk</span></td></tr>
                <tr><td><strong>Dajcor</strong></td><td style="color: var(--accent-amber);">3/5</td><td>86</td><td>4.2%</td><td><span class="status-badge warning">Monitor</span></td></tr>
                <tr><td><strong>Midwest Fixtures</strong></td><td style="color: var(--accent-emerald);">4/5</td><td>91</td><td>2.1%</td><td><span class="status-badge ok">Healthy</span></td></tr>
            </tbody>
        </table>
        </div>
    </div>
`;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initializeIntelFeed();
    initializeMap();
    initializeAnalytics();
    initializePillarsStrip();
    initializeChat();
    initializeTour();
    setupEventListeners();
    setupKeyboardNavigation();
    setupResizeHandler();
    setupTouchHandlers();
});

function initializeIntelFeed() {
    const feedItems = document.getElementById('feedItems');
    if (!feedItems) return;
    feedItems.innerHTML = INTEL_FEED.map(item => `
        <div class="feed-item ${item.type}" data-id="${item.id}">
            <span class="feed-item-badge ${item.badge}">${item.badge}</span>
            <div class="feed-item-time">${item.time}</div>
            <div class="feed-item-title">${item.title}</div>
            <div class="feed-item-detail">${item.detail}</div>
            <div class="feed-item-exposure">
                <span class="label">${item.badge === 'risk' ? 'Exposure' : 'Opportunity'}</span>
                <span class="value ${item.exposureClass}">${item.exposure}</span>
            </div>
        </div>
    `).join('');
}

function initializeMap() {
    require(["esri/Map", "esri/views/MapView", "esri/Graphic", "esri/layers/GraphicsLayer"], function(Map, MapView, Graphic, GraphicsLayer) {
        const map = new Map({ basemap: "dark-gray-vector" });
        mapView = new MapView({ 
            container: "mapView", 
            map: map, 
            center: [-87.8, 41.5], 
            zoom: isMobile() ? 5 : 6,
            ui: { components: [] } // Hide all UI
        });
        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        
        // Storm zone
        graphicsLayer.add(new Graphic({
            geometry: { type: "polygon", rings: [[[-89.5, 43.0], [-86.0, 43.0], [-85.5, 41.0], [-86.5, 39.5], [-89.0, 39.5], [-90.0, 41.5], [-89.5, 43.0]]] },
            symbol: { type: "simple-fill", color: [239, 68, 68, 0.2], outline: { color: [239, 68, 68, 0.8], width: 2 } }
        }));
        
        // Stores
        const stores = [
            { lat: 41.8781, lon: -87.6298, status: 'critical' }, { lat: 41.9742, lon: -87.9073, status: 'critical' },
            { lat: 41.8819, lon: -87.7232, status: 'critical' }, { lat: 42.0451, lon: -87.6877, status: 'warning' },
            { lat: 41.5250, lon: -88.0817, status: 'warning' }, { lat: 41.8500, lon: -88.3200, status: 'ok' },
            { lat: 42.2711, lon: -89.0940, status: 'ok' }, { lat: 39.7684, lon: -86.1581, status: 'ok' }
        ];
        stores.forEach(s => {
            const color = s.status === 'critical' ? [239, 68, 68] : s.status === 'warning' ? [245, 158, 11] : [16, 185, 129];
            graphicsLayer.add(new Graphic({
                geometry: { type: "point", longitude: s.lon, latitude: s.lat },
                symbol: { type: "simple-marker", size: isMobile() ? 10 : 14, color: color, outline: { color: [255, 255, 255], width: 2 } }
            }));
        });
        
        // DCs
        const dcs = [{ lat: 41.8781, lon: -87.9298, status: 'critical' }, { lat: 39.7684, lon: -86.1581, status: 'ok' }];
        dcs.forEach(dc => {
            const color = dc.status === 'critical' ? [239, 68, 68] : [34, 211, 238];
            graphicsLayer.add(new Graphic({
                geometry: { type: "point", longitude: dc.lon, latitude: dc.lat },
                symbol: { type: "simple-marker", size: isMobile() ? 14 : 20, color: color, outline: { color: [255, 255, 255], width: 3 }, style: "square" }
            }));
        });
    });
}

function initializeAnalytics() { 
    const el = document.getElementById('analyticsView');
    if (el) el.innerHTML = ANALYTICS_HTML; 
}

function initializePillarsStrip() {
    const strip = document.getElementById('pillarsStrip');
    if (strip) {
        strip.innerHTML = `
            <div class="pillar-indicator" data-pillar="operational"><span class="icon">📊</span><span>Operational</span></div>
            <div class="pillar-indicator" data-pillar="geospatial"><span class="icon">🗺️</span><span>Geospatial</span></div>
            <div class="pillar-indicator" data-pillar="thirdparty"><span class="icon">🌐</span><span>Third-Party</span></div>
            <div class="pillar-indicator" data-pillar="partner"><span class="icon">🤝</span><span>Partner</span></div>
            <div class="pillar-indicator" data-pillar="predictive"><span class="icon">🔮</span><span>Predictive</span></div>
        `;
    }
}

function activatePillar(id) {
    if (!id) return;
    const el = document.querySelector(`[data-pillar="${id}"]`);
    if (el) el.classList.add('active');
}

function initializeChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    const r = CHAT_RESPONSES.initial;
    chatMessages.innerHTML = `
        <div class="message assistant">
            <div class="message-content">
                ${r.content}
                <div class="response-meta">
                    <span class="response-time">Response: ${r.responseTime}</span>
                    <span class="response-confidence"><span class="confidence-dot"></span> Confidence: ${(r.confidence * 100).toFixed(0)}%</span>
                </div>
                <div class="provenance">
                    <div class="provenance-label">Data Sources</div>
                    <div class="provenance-sources">${r.provenance.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                </div>
            </div>
        </div>
    `;
    updateChips(r.chips);
}

function updateChips(chipKeys) {
    const grid = document.getElementById('chipsGrid');
    if (!grid) return;
    grid.innerHTML = chipKeys.map(key => {
        const c = CHIP_DEFINITIONS[key];
        return c ? `<button class="chip" data-action="${c.actionKey}" aria-label="${c.label}">${c.label}</button>` : '';
    }).join('');
}

// === TOUR FUNCTIONS ===
function initializeTour() { showTourStep(0); }

function getEffectiveStep(step) {
    // Return mobile-adjusted content if on mobile
    if (isMobile() && step.mobileContent) {
        return { ...step, content: step.mobileContent };
    }
    return step;
}

function shouldSkipStep(step) {
    // Skip steps that target hidden elements on mobile
    if (isMobile() && step.skipOnMobile) {
        // Check if there's a mobile alternative
        if (step.mobileSpotlight || step.mobileContent) {
            return false; // Don't skip, use mobile version
        }
        return true; // Skip entirely
    }
    return false;
}

function showTourStep(stepIndex) {
    // Skip steps if needed
    while (stepIndex < TOUR_STEPS.length && shouldSkipStep(TOUR_STEPS[stepIndex]) && !TOUR_STEPS[stepIndex].mobileContent) {
        stepIndex++;
    }
    
    if (stepIndex >= TOUR_STEPS.length) {
        endTour();
        return;
    }
    
    currentTourStep = stepIndex;
    const rawStep = TOUR_STEPS[stepIndex];
    const step = getEffectiveStep(rawStep);
    const overlay = document.getElementById('tourOverlay');
    const spotlight = document.getElementById('tourSpotlight');
    
    // Update indicators
    const indicator = document.getElementById('tourStepIndicator');
    if (indicator) {
        indicator.innerHTML = TOUR_STEPS.map((_, i) => {
            const state = i < stepIndex ? 'completed' : i === stepIndex ? 'active' : '';
            return `<div class="tour-step-dot ${state}"></div>`;
        }).join('');
    }
    
    // Update content
    const subtitleEl = document.getElementById('tourSubtitle');
    const titleEl = document.getElementById('tourTitle');
    const contentEl = document.getElementById('tourContent');
    if (subtitleEl) subtitleEl.textContent = step.subtitle;
    if (titleEl) titleEl.textContent = step.title;
    if (contentEl) contentEl.innerHTML = step.content;
    
    // Update buttons
    const buttonsEl = document.getElementById('tourButtons');
    if (buttonsEl) {
        buttonsEl.innerHTML = step.buttons.map(btn => 
            `<button class="tour-btn ${btn.primary ? 'primary' : 'secondary'}" data-action="${btn.action}">${btn.text}</button>`
        ).join('');
    }
    
    // Activate pillar
    if (step.pillarActivation) activatePillar(step.pillarActivation);
    
    // Handle spotlight - with mobile awareness
    const spotlightTarget = isMobile() && rawStep.mobileSpotlight ? rawStep.mobileSpotlight : step.spotlight;
    
    if (spotlightTarget) {
        const target = document.getElementById(spotlightTarget);
        // Check if element is visible
        if (target && target.offsetParent !== null) {
            positionSpotlight(target);
            overlay.classList.remove('active');
        } else {
            // Element hidden or not found - show overlay instead
            spotlight.style.display = 'none';
            overlay.classList.add('active');
        }
    } else {
        spotlight.style.display = 'none';
        overlay.classList.add('active');
    }
    
    if (step.waitFor) setupWaitFor(step.waitFor);
}

function positionSpotlight(target) {
    const spotlight = document.getElementById('tourSpotlight');
    if (!spotlight || !target) return;
    
    const rect = target.getBoundingClientRect();
    const padding = isMobile() ? 4 : 8;
    
    spotlight.style.display = 'block';
    spotlight.style.top = (rect.top - padding) + 'px';
    spotlight.style.left = (rect.left - padding) + 'px';
    spotlight.style.width = (rect.width + padding * 2) + 'px';
    spotlight.style.height = (rect.height + padding * 2) + 'px';
}

function setupResizeHandler() {
    let timeout;
    window.addEventListener('resize', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (tourActive && TOUR_STEPS[currentTourStep]) {
                const step = TOUR_STEPS[currentTourStep];
                const spotlightTarget = isMobile() && step.mobileSpotlight ? step.mobileSpotlight : step.spotlight;
                if (spotlightTarget) {
                    const target = document.getElementById(spotlightTarget);
                    if (target && target.offsetParent !== null) {
                        positionSpotlight(target);
                    }
                }
            }
        }, 100);
    });
}

function setupTouchHandlers() {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
        if (e.target.closest('.chat-messages, .feed-items, .analytics-view, .tour-card')) {
            // Allow scrolling in these containers
            return;
        }
        if (tourActive) {
            e.preventDefault();
        }
    }, { passive: false });
}

function setupWaitFor(waitFor) {
    if (waitFor === 'analyticsClick') {
        const btn = document.getElementById('analyticsBtn');
        if (!btn) return;
        btn.classList.add('highlight');
        const handler = () => {
            btn.classList.remove('highlight');
            switchView('analytics');
            setTimeout(() => {
                const card = document.getElementById('exposure-card');
                if (card) card.classList.add('highlight-pulse');
            }, 300);
            btn.removeEventListener('click', handler);
            showTourStep(currentTourStep + 1);
        };
        btn.addEventListener('click', handler);
    } else if (waitFor === 'mapClick') {
        const btn = document.getElementById('mapBtn');
        if (!btn) return;
        btn.classList.add('highlight');
        const handler = () => {
            btn.classList.remove('highlight');
            switchView('map');
            btn.removeEventListener('click', handler);
            showTourStep(currentTourStep + 1);
        };
        btn.addEventListener('click', handler);
    } else if (waitFor.startsWith('chip-')) {
        highlightChip(waitFor.replace('chip-', ''));
    }
}

function highlightChip(actionKey) {
    document.querySelectorAll('.chip').forEach(chip => {
        if (chip.dataset.action === actionKey) {
            chip.classList.add('highlight');
            const handler = () => {
                chip.classList.remove('highlight');
                handleChipClick(actionKey);
                chip.removeEventListener('click', handler);
            };
            chip.addEventListener('click', handler);
        }
    });
}

function handleChipClick(actionKey) {
    const chatMessages = document.getElementById('chatMessages');
    const chipDef = CHIP_DEFINITIONS[actionKey];
    if (!chipDef || !chatMessages) return;
    
    // User message
    chatMessages.innerHTML += `<div class="message user"><div class="message-content">${chipDef.label}</div></div>`;
    
    // Typing indicator
    chatMessages.innerHTML += `<div class="message assistant" id="typingMsg"><div class="message-content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
        const typing = document.getElementById('typingMsg');
        if (typing) typing.remove();
        
        const r = CHAT_RESPONSES[actionKey];
        if (r) {
            chatMessages.innerHTML += `
                <div class="message assistant">
                    <div class="message-content">
                        ${r.content}
                        <div class="response-meta">
                            <span class="response-time">Response: ${r.responseTime}</span>
                            <span class="response-confidence"><span class="confidence-dot"></span> Confidence: ${(r.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div class="provenance">
                            <div class="provenance-label">Data Sources</div>
                            <div class="provenance-sources">${r.provenance.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                        </div>
                    </div>
                </div>
            `;
            updateChips(r.chips);
            
            if (actionKey === 'actions') {
                const protectedEl = document.getElementById('kpi-protected');
                const roiEl = document.getElementById('kpi-roi');
                if (protectedEl) {
                    protectedEl.textContent = '$3.1M';
                    protectedEl.className = 'kpi-mini-value green';
                }
                if (roiEl) roiEl.textContent = '60:1';
            }
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (tourActive) setTimeout(() => showTourStep(currentTourStep + 1), 500);
    }, RESPONSE_DELAY);
}

function switchView(view) {
    const mapContainer = document.getElementById('mapContainer');
    const analyticsView = document.getElementById('analyticsView');
    const mapBtn = document.getElementById('mapBtn');
    const analyticsBtn = document.getElementById('analyticsBtn');
    
    if (view === 'analytics') {
        if (mapContainer) mapContainer.classList.add('hidden');
        if (analyticsView) analyticsView.classList.add('active');
        if (mapBtn) { mapBtn.classList.remove('active'); mapBtn.setAttribute('aria-selected', 'false'); }
        if (analyticsBtn) { analyticsBtn.classList.add('active'); analyticsBtn.setAttribute('aria-selected', 'true'); }
    } else {
        if (mapContainer) mapContainer.classList.remove('hidden');
        if (analyticsView) analyticsView.classList.remove('active');
        if (mapBtn) { mapBtn.classList.add('active'); mapBtn.setAttribute('aria-selected', 'true'); }
        if (analyticsBtn) { analyticsBtn.classList.remove('active'); analyticsBtn.setAttribute('aria-selected', 'false'); }
    }
}

function setupEventListeners() {
    // Tour buttons
    const tourButtons = document.getElementById('tourButtons');
    if (tourButtons) {
        tourButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('tour-btn')) {
                const action = e.target.dataset.action;
                if (action === 'next') showTourStep(currentTourStep + 1);
                else if (action === 'explore') endTour();
                else if (action === 'contact') showPocModal();
            }
        });
    }
    
    // Chips (event delegation)
    const chipsGrid = document.getElementById('chipsGrid');
    if (chipsGrid) {
        chipsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip') && !tourActive) {
                const action = e.target.dataset.action;
                if (action && CHAT_RESPONSES[action]) handleChipClickFree(action);
            }
        });
    }
    
    // POC modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('poc-close')) hidePocModal();
        if (e.target.classList.contains('poc-option')) {
            // Would normally submit - just close for demo
            hidePocModal();
            alert('Thank you! Our team will reach out within 24 hours.');
        }
    });
    
    // POC options keyboard
    document.querySelectorAll('.poc-option').forEach(opt => {
        opt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                opt.click();
            }
        });
    });
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && tourActive) {
            const step = TOUR_STEPS[currentTourStep];
            if (step && step.buttons.length > 0 && !step.waitFor) {
                const primary = step.buttons.find(b => b.primary);
                if (primary) {
                    if (primary.action === 'next') showTourStep(currentTourStep + 1);
                    else if (primary.action === 'explore') endTour();
                    else if (primary.action === 'contact') showPocModal();
                }
            }
        }
        if (e.key === 'Escape') {
            const modal = document.getElementById('pocModal');
            if (modal && modal.classList.contains('active')) hidePocModal();
        }
    });
}

function endTour() {
    tourActive = false;
    const overlay = document.getElementById('tourOverlay');
    const spotlight = document.getElementById('tourSpotlight');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (overlay) overlay.classList.remove('active');
    if (spotlight) spotlight.style.display = 'none';
    if (chatInput) { chatInput.disabled = false; chatInput.removeAttribute('aria-disabled'); }
    if (sendBtn) { sendBtn.disabled = false; sendBtn.removeAttribute('aria-disabled'); }
    
    // Activate all pillars to show unified system
    ['operational', 'geospatial', 'thirdparty', 'partner', 'predictive'].forEach(activatePillar);
    
    updateChips(['simulate-strike', 'analyze-competitor', 'export-report']);
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML += `
            <div class="message assistant">
                <div class="message-content">
                    <p>You're now in <strong>free exploration mode</strong>. Try asking about:</p>
                    <p>• Different disruption scenarios (labor strikes, port closures)<br>
                    • Competitor analysis and market opportunities<br>
                    • Exporting reports for your team</p>
                    <p>Or type any question in plain English below.</p>
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function handleChipClickFree(actionKey) {
    const chatMessages = document.getElementById('chatMessages');
    const chipDef = CHIP_DEFINITIONS[actionKey];
    const r = CHAT_RESPONSES[actionKey];
    if (!chipDef || !r || !chatMessages) return;
    
    chatMessages.innerHTML += `<div class="message user"><div class="message-content">${chipDef.label}</div></div>`;
    chatMessages.innerHTML += `<div class="message assistant" id="typingMsgFree"><div class="message-content"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
        const typing = document.getElementById('typingMsgFree');
        if (typing) typing.remove();
        chatMessages.innerHTML += `
            <div class="message assistant">
                <div class="message-content">
                    ${r.content}
                    <div class="response-meta">
                        <span class="response-time">Response: ${r.responseTime}</span>
                        <span class="response-confidence"><span class="confidence-dot"></span> Confidence: ${(r.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div class="provenance">
                        <div class="provenance-label">Data Sources</div>
                        <div class="provenance-sources">${r.provenance.map(s => `<span class="provenance-tag">${s}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
        `;
        updateChips(r.chips);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, RESPONSE_DELAY);
}

function showPocModal() {
    const modal = document.getElementById('pocModal');
    if (modal) modal.classList.add('active');
}

function hidePocModal() {
    const modal = document.getElementById('pocModal');
    if (modal) modal.classList.remove('active');
}
