// ============================================
// NEXUS GUIDED DEMO - v3 (FIXED)
// Aligns JS with index.html + styles.css
// ============================================

// === STATE ===
let currentStep = 0;
let tourActive = false;
let freeChatInitialized = false;
let mapView = null;

// ============================================
// CONTENT DATA
// ============================================

const DATA_PILLARS = [
  { icon: '📊', name: 'Operational Data' },
  { icon: '🗺️', name: 'Geospatial' },
  { icon: '🌐', name: 'Third-Party Intel' },
  { icon: '🤝', name: 'Partner Ecosystem' },
  { icon: '🔮', name: 'Predictive Engine' }
];

// Intel feed items
const INTEL_ITEMS = [
  {
    type: 'risk',
    severityClass: 'critical',
    time: '2 minutes ago',
    title: 'Winter Storm Alert — Midwest',
    detail: 'Severe winter storm tracking toward Chicago metro. 12 stores and 3 distribution centers in projected impact zone.',
    exposureLabel: 'Exposure',
    exposure: '$4.2M',
    exposureClass: 'red'
  },
  {
    type: 'opportunity',
    severityClass: 'opportunity',
    time: '4 hours ago',
    title: 'Competitor Closure — Oakbrook',
    detail: 'ValueMart announcing closure of Oakbrook location. 47,000 households within 15-min drive of your stores.',
    exposureLabel: 'Opportunity',
    exposure: '$1.8M',
    exposureClass: 'green'
  }
];

// Chip labels
const CHIP_LABELS = {
  risk: "What's our biggest risk?",
  cascade: 'Show cascade effects',
  actions: 'What actions should we take?',
  execute: 'Execute all phases',
  competitor: 'Show competitor opportunity'
};

// Chat responses (HTML kept compatible with existing CSS viz classes)
const RESPONSES = {
  initial: {
    content: `
      <p>Good morning. I've detected <strong>two situations</strong> that need your attention.</p>
      <p>🔴 <strong>Winter Storm Alert:</strong> A severe storm is tracking toward your Midwest operations. 12 stores and 3 distribution centers are in the projected impact zone.</p>
      <div class="viz-roi-cards">
        <div class="roi-card"><div class="roi-label">Total Exposure</div><div class="roi-value red">$4.2M</div></div>
        <div class="roi-card"><div class="roi-label">Stores at Risk</div><div class="roi-value amber">12</div></div>
        <div class="roi-card"><div class="roi-label">DCs Affected</div><div class="roi-value amber">3</div></div>
        <div class="roi-card"><div class="roi-label">Warning Time</div><div class="roi-value gold">48 hrs</div></div>
      </div>
      <p>I've already analyzed your supplier network and prepared mitigation options. What would you like to explore first?</p>
    `,
    sources: ['NOAA Weather', 'Store Operations', 'Esri GIS', 'Rebirth Analytics'],
    chips: ['risk', 'cascade', 'actions'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$0', roi: '—' }
  },
  risk: {
    content: `
      <p>I've cross-referenced your store network with <strong>Rebirth Analytics</strong> supplier health data and <strong>Allianz Trade</strong> credit risk intelligence.</p>
      <div class="viz-risk-matrix">
        <div class="risk-matrix-header">📊 Risk Concentration Analysis</div>
        <div class="risk-item">
          <div class="risk-level critical"></div>
          <div class="risk-info"><div class="risk-name">Chicago Distribution Hub</div><div class="risk-detail">Primary DC for 12 stores • Storm landfall in 36 hrs</div></div>
          <div class="risk-value" style="color: var(--accent-red)">$1.8M</div>
        </div>
        <div class="risk-item">
          <div class="risk-level high"></div>
          <div class="risk-info"><div class="risk-name">Great Lakes Logistics</div><div class="risk-detail">Financial Health: 2/5 • Allianz Default Risk: 12.3%</div></div>
          <div class="risk-value" style="color: var(--accent-amber)">$890K</div>
        </div>
        <div class="risk-item">
          <div class="risk-level high"></div>
          <div class="risk-info"><div class="risk-name">Dajcor Aluminum (Supplier)</div><div class="risk-detail">Credit Score: 86/100 • Health: 3/5 • In storm path</div></div>
          <div class="risk-value" style="color: var(--accent-amber)">$650K</div>
        </div>
        <div class="risk-item">
          <div class="risk-level medium"></div>
          <div class="risk-info"><div class="risk-name">Store-Level Stockouts</div><div class="risk-detail">8 stores at risk of critical SKU depletion</div></div>
          <div class="risk-value" style="color: var(--accent-gold)">$420K</div>
        </div>
      </div>
      <p><strong>Key Insight:</strong> 43% of exposure is concentrated in Chicago operations.</p>
    `,
    sources: ['Rebirth Analytics', 'Allianz Trade', 'Store Operations', 'WMS'],
    chips: ['cascade', 'actions'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$0', roi: '—' }
  },
  cascade: {
    content: `
      <p>Here's how the disruption cascades if unmitigated:</p>
      <div class="viz-timeline">
        <div class="timeline-item">
          <div class="timeline-marker red"></div>
          <div class="timeline-content">
            <div class="timeline-time">T+0 → T+24h</div>
            <div class="timeline-title">Storm Hits Chicago DC</div>
            <div class="timeline-desc">Primary distribution hub goes offline. 40% of regional inventory inaccessible.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker amber"></div>
          <div class="timeline-content">
            <div class="timeline-time">T+24 → T+36h</div>
            <div class="timeline-title">Supplier Delivery Failures</div>
            <div class="timeline-desc">Great Lakes Logistics misses commitments. Confidence: High (0.78).</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker amber"></div>
          <div class="timeline-content">
            <div class="timeline-time">T+36 → T+48h</div>
            <div class="timeline-title">Stockouts Begin</div>
            <div class="timeline-desc">8 stores deplete high-velocity SKUs. Competitor stores capture demand.</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker red"></div>
          <div class="timeline-content">
            <div class="timeline-time">T+48 → T+72h</div>
            <div class="timeline-title">Revenue Impact Peaks</div>
            <div class="timeline-desc">Estimated $2.8M in lost sales. Additional $400K in expedited shipping.</div>
          </div>
        </div>
      </div>
      <p><strong>Total unmitigated impact:</strong> <span style="color: var(--accent-red); font-weight: 700;">$3.2M+</span></p>
    `,
    sources: ['Rebirth Analytics', 'Predictive Engine', 'Allianz Trade'],
    chips: ['actions'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$0', roi: '—' }
  },
  actions: {
    content: `
      <p>Here are <strong>prioritized actions</strong> with verified availability:</p>
      <div class="viz-risk-matrix">
        <div class="risk-matrix-header">✅ Recommended Mitigation Plan</div>
        <div class="risk-item">
          <div class="risk-level low"></div>
          <div class="risk-info"><div class="risk-name">Reroute through Indianapolis DC</div><div class="risk-detail">Bypass Chicago hub • Carrier capacity confirmed • +8hr transit</div></div>
          <div class="risk-value" style="color: var(--accent-emerald)">+$1.4M</div>
        </div>
        <div class="risk-item">
          <div class="risk-level low"></div>
          <div class="risk-info"><div class="risk-name">Pre-position high-velocity SKUs</div><div class="risk-detail">Move inventory to unaffected stores before storm hits</div></div>
          <div class="risk-value" style="color: var(--accent-emerald)">+$780K</div>
        </div>
        <div class="risk-item">
          <div class="risk-level low"></div>
          <div class="risk-info"><div class="risk-name">Switch to Midwest Fixtures (4/5 health)</div><div class="risk-detail">Replace Great Lakes shipments • Higher resilience score</div></div>
          <div class="risk-value" style="color: var(--accent-emerald)">Risk ↓</div>
        </div>
        <div class="risk-item">
          <div class="risk-level low"></div>
          <div class="risk-info"><div class="risk-name">Notify store managers</div><div class="risk-detail">Activate contingency protocols at 12 affected locations</div></div>
          <div class="risk-value" style="color: var(--accent-emerald)">Ops ready</div>
        </div>
      </div>
      <div class="viz-roi-cards">
        <div class="roi-card"><div class="roi-label">Mitigation Cost</div><div class="roi-value amber">$52K</div></div>
        <div class="roi-card"><div class="roi-label">Value Protected</div><div class="roi-value green">$3.1M</div></div>
        <div class="roi-card"><div class="roi-label">ROI</div><div class="roi-value gold">60:1</div></div>
        <div class="roi-card"><div class="roi-label">Residual Risk</div><div class="roi-value">$340K</div></div>
      </div>
      <p><strong>Bottom line:</strong> Spend $52,000 to protect $3.1 million. <span style="color: var(--accent-gold); font-weight: 700;">60-to-1 return</span>.</p>
    `,
    sources: ['Carrier APIs', 'Rebirth Analytics', 'Inventory System'],
    chips: ['execute', 'competitor'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$3.1M', roi: '60:1' }
  },
  execute: {
    content: `
      <p>✅ Execution plan staged across <strong>12 stores</strong> and <strong>3 DCs</strong>.</p>
      <p><strong>Status:</strong> inventory moves queued, carrier reroutes reserved, store managers notified.</p>
      <p>Want to see the post-mitigation residual risk, or the competitor opportunity analysis?</p>
    `,
    sources: ['TMS', 'Carrier APIs', 'Store Ops'],
    chips: ['cascade', 'competitor'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$3.1M', roi: '60:1' }
  },
  competitor: {
    content: `
      <p>🟢 <strong>Opportunity detected:</strong> ValueMart's Oakbrook closure creates a demand gap within 15 minutes of 3 of your stores.</p>
      <div class="viz-roi-cards">
        <div class="roi-card"><div class="roi-label">Households</div><div class="roi-value">47,000</div></div>
        <div class="roi-card"><div class="roi-label">Estimated Lift</div><div class="roi-value green">+$1.8M</div></div>
        <div class="roi-card"><div class="roi-label">Time to Act</div><div class="roi-value amber">14 days</div></div>
        <div class="roi-card"><div class="roi-label">Confidence</div><div class="roi-value cyan">0.81</div></div>
      </div>
      <p>Recommended: localized promos + inventory shift to capture displaced demand.</p>
    `,
    sources: ['Competitor News', 'Trade Area Model', 'POS Forecast'],
    chips: ['actions', 'risk'],
    kpi: { exposure: '$4.2M', stores: '12', protected: '$3.1M', roi: '60:1' }
  }
};

// ============================================
// TOUR STEPS
// ============================================

const TOUR_STEPS = [
  {
    id: 'welcome',
    label: 'Welcome to Rebirth Nexus',
    title: 'Predictive Intelligence Platform',
    content: `
      <p>You're about to experience <strong>Rebirth Nexus</strong> — the conversational intelligence platform that turns scattered signals into decisions you can defend.</p>
      <p>In this guided demo, you'll see how Nexus detected a winter storm <span class="highlight">48 hours before impact</span>, calculated $4.2M in exposure, and prepared mitigation options with a <span class="highlight">60:1 ROI</span>.</p>
      <div class="tour-highlight-box">
        ${DATA_PILLARS.map(p => `
          <div class="pillar">
            <span class="pillar-icon">${p.icon}</span>
            <span class="pillar-name">${p.name}</span>
          </div>
        `).join('')}
      </div>
    `,
    buttons: [{ text: 'Begin Tour →', action: 'next', primary: true }],
    target: null
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
    target: 'intelFeed'
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
    target: 'weatherOverlay'
  },
  {
    id: 'analytics-intro',
    label: 'Step 3 of 8',
    title: 'Map & Analytics Views',
    content: `
      <p>The center panel shows two views:</p>
      <p><strong>🗺️ Map View</strong> — Geospatial intelligence showing store locations and risk zones.</p>
      <p><strong>📊 Analytics View</strong> — Tabular exposure and operational detail.</p>
      <div class="tour-instruction">Click the highlighted <strong>Analytics</strong> tab</div>
    `,
    target: 'analyticsBtn',
    waitFor: { type: 'tab', value: 'analytics' }
  },
  {
    id: 'analytics-view',
    label: 'Step 4 of 8',
    title: 'Operational Exposure',
    content: `
      <p>The Analytics view summarizes operational exposure and the highest-risk nodes.</p>
      <div class="tour-instruction">Click the highlighted <strong>Map</strong> tab to return</div>
    `,
    target: 'mapBtn',
    waitFor: { type: 'tab', value: 'map' }
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
    target: 'chatPanel'
  },
  {
    id: 'risk',
    label: 'Step 6 of 8',
    title: 'Exploring the Risk',
    content: `
      <p>Let's dig into what's actually at risk.</p>
      <div class="tour-instruction">Click the highlighted chip: <strong>"What's our biggest risk?"</strong></div>
    `,
    target: 'chip-risk',
    waitFor: { type: 'chip', value: 'risk' }
  },
  {
    id: 'actions',
    label: 'Step 7 of 8',
    title: 'The Mitigation Plan',
    content: `
      <p>Nexus doesn't just show problems — it shows <strong>exactly what to do</strong>.</p>
      <div class="tour-instruction">Click the highlighted chip: <strong>"What actions should we take?"</strong></div>
    `,
    target: 'chip-actions',
    waitFor: { type: 'chip', value: 'actions' }
  },
  {
    id: 'complete',
    label: 'Tour Complete',
    title: 'What You Just Saw',
    content: `
      <p>Nexus detected a disruption <strong>48 hours before impact</strong>. It quantified <strong>$4.2M in exposure</strong>. It identified a mitigation plan with a <strong>60:1 ROI</strong>.</p>
      <div class="tour-highlight-box">
        <div class="pillar"><span class="pillar-icon">💬</span><span class="pillar-name">The One-Liner</span></div>
        <p style="margin-top: 10px; font-style: italic; color: var(--accent-gold);">"Nexus turns scattered signals into a decision you can defend — before the crisis hits."</p>
      </div>
    `,
    buttons: [
      { text: 'Explore Freely', action: 'end', primary: false },
      { text: 'Request a Pilot →', action: 'contact', primary: true }
    ],
    target: null
  }
];

// ============================================
// UTIL
// ============================================

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scrollChatToBottom() {
  const messages = $('chatMessages');
  if (!messages) return;
  messages.scrollTop = messages.scrollHeight;
}

// ============================================
// PILLARS STRIP
// ============================================

function initPillarsStrip() {
  const strip = $('pillarsStrip');
  if (!strip) return;
  strip.innerHTML = DATA_PILLARS.map(p => (
    `<div class="pillar-indicator active"><span class="icon">${p.icon}</span><span>${p.name}</span></div>`
  )).join('');
}

// ============================================
// INTEL FEED
// ============================================

function initIntelFeed() {
  const container = $('feedItems');
  if (!container) return;

  container.innerHTML = INTEL_ITEMS.map(item => `
    <div class="feed-item ${item.severityClass}" role="button" tabindex="0" data-intel-type="${item.type}" aria-label="Open intel: ${escapeHtml(item.title)}">
      <span class="feed-item-badge ${item.type}">${item.type}</span>
      <div class="feed-item-time">${item.time}</div>
      <div class="feed-item-title">${item.title}</div>
      <div class="feed-item-detail">${item.detail}</div>
      <div class="feed-item-exposure">
        <span class="label">${item.exposureLabel}</span>
        <span class="value ${item.exposureClass}">${item.exposure}</span>
      </div>
    </div>
  `).join('');

  // Clicking an intel card should drive the conversation (and feels "real" in demos).
  // Map to existing handlers so there are no dead ends.
  function openIntel(type) {
    // risk -> biggest risk analysis, opportunity -> competitor opportunity
    const key = type === 'opportunity' ? 'competitor' : 'risk';
    handleChipClick(key);
  }

  container.querySelectorAll('.feed-item').forEach(el => {
    const type = el.getAttribute('data-intel-type') || 'risk';
    el.addEventListener('click', () => openIntel(type));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openIntel(type);
      }
    });
  });
}

// ============================================
// MAP (ArcGIS)
// ============================================

function initMap() {
  if (typeof require !== 'function') {
    // ArcGIS script not loaded yet
    return;
  }

  require(
    ['esri/Map', 'esri/views/MapView', 'esri/Graphic', 'esri/layers/GraphicsLayer'],
    (Map, MapView, Graphic, GraphicsLayer) => {
      const map = new Map({ basemap: 'dark-gray-vector' });

      mapView = new MapView({
        container: 'mapView',
        map,
        center: [-87.8, 41.5],
        zoom: 6,
        ui: { components: [] }
      });

      const graphics = new GraphicsLayer();
      map.add(graphics);

      // Storm zone polygon
      graphics.add(
        new Graphic({
          geometry: {
            type: 'polygon',
            rings: [
              [
                [-89.5, 43],
                [-86, 43],
                [-85.5, 41],
                [-86.5, 39.5],
                [-89, 39.5],
                [-90, 41.5],
                [-89.5, 43]
              ]
            ]
          },
          symbol: {
            type: 'simple-fill',
            color: [239, 68, 68, 0.2],
            outline: { color: [239, 68, 68, 0.8], width: 2 }
          }
        })
      );

      // Store markers
      const stores = [
        { lat: 41.8781, lon: -87.6298, status: 'critical' },
        { lat: 41.9742, lon: -87.9073, status: 'critical' },
        { lat: 41.8819, lon: -87.7232, status: 'critical' },
        { lat: 42.0451, lon: -87.6877, status: 'warning' },
        { lat: 41.525, lon: -88.0817, status: 'warning' },
        { lat: 39.7684, lon: -86.1581, status: 'ok' }
      ];

      stores.forEach(s => {
        const color =
          s.status === 'critical'
            ? [239, 68, 68]
            : s.status === 'warning'
              ? [245, 158, 11]
              : [16, 185, 129];

        graphics.add(
          new Graphic({
            geometry: { type: 'point', longitude: s.lon, latitude: s.lat },
            symbol: {
              type: 'simple-marker',
              size: 14,
              color,
              outline: { color: [255, 255, 255], width: 2 }
            }
          })
        );
      });

      // DC markers
      graphics.add(
        new Graphic({
          geometry: { type: 'point', longitude: -87.9298, latitude: 41.8781 },
          symbol: {
            type: 'simple-marker',
            size: 20,
            color: [239, 68, 68],
            style: 'square',
            outline: { color: [255, 255, 255], width: 3 }
          }
        })
      );
      graphics.add(
        new Graphic({
          geometry: { type: 'point', longitude: -86.1581, latitude: 39.7684 },
          symbol: {
            type: 'simple-marker',
            size: 20,
            color: [34, 211, 238],
            style: 'square',
            outline: { color: [255, 255, 255], width: 3 }
          }
        })
      );
    }
  );
}

// ============================================
// ANALYTICS VIEW
// ============================================

function renderAnalyticsView() {
  const el = $('analyticsView');
  if (!el) return;

  el.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-card highlight-pulse">
        <div class="analytics-label">Total Exposure</div>
        <div class="analytics-value red">$4.2M</div>
        <div class="analytics-trend">12 stores • 3 DCs • 48 hours lead time</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-label">Value Protected</div>
        <div class="analytics-value green">$3.1M</div>
        <div class="analytics-trend">After mitigation plan execution</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-label">Mitigation Cost</div>
        <div class="analytics-value amber">$52K</div>
        <div class="analytics-trend">Carrier + inventory moves</div>
      </div>
      <div class="analytics-card">
        <div class="analytics-label">ROI</div>
        <div class="analytics-value gold">60:1</div>
        <div class="analytics-trend">Defensible decision economics</div>
      </div>

      <div class="analytics-card full">
        <div class="analytics-section-title">🚨 Critical Stores</div>
        <div class="table-scroll-wrapper">
          <table class="shipment-table" aria-label="Critical stores table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Status</th>
                <th>Exposure</th>
                <th>Lead Time</th>
              </tr>
            </thead>
            <tbody>
              <tr class="highlight-row">
                <td>Chicago — West Loop</td>
                <td><span class="status-badge critical">Critical</span></td>
                <td>$520K</td>
                <td>36 hrs</td>
              </tr>
              <tr>
                <td>Chicago — O'Hare</td>
                <td><span class="status-badge critical">Critical</span></td>
                <td>$410K</td>
                <td>36 hrs</td>
              </tr>
              <tr>
                <td>Evanston</td>
                <td><span class="status-badge warning">Warning</span></td>
                <td>$220K</td>
                <td>44 hrs</td>
              </tr>
              <tr>
                <td>Joliet</td>
                <td><span class="status-badge warning">Warning</span></td>
                <td>$190K</td>
                <td>44 hrs</td>
              </tr>
              <tr>
                <td>Indianapolis</td>
                <td><span class="status-badge ok">OK</span></td>
                <td>$0</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// TABS
// ============================================

function setTabActive(view) {
  const mapBtn = $('mapBtn');
  const analyticsBtn = $('analyticsBtn');
  const mapContainer = $('mapContainer');
  const analyticsView = $('analyticsView');

  if (!mapBtn || !analyticsBtn || !mapContainer || !analyticsView) return;

  if (view === 'analytics') {
    mapBtn.classList.remove('active');
    analyticsBtn.classList.add('active');
    mapBtn.setAttribute('aria-selected', 'false');
    analyticsBtn.setAttribute('aria-selected', 'true');
    mapContainer.classList.add('hidden');
    analyticsView.classList.add('active');
  } else {
    mapBtn.classList.add('active');
    analyticsBtn.classList.remove('active');
    mapBtn.setAttribute('aria-selected', 'true');
    analyticsBtn.setAttribute('aria-selected', 'false');
    mapContainer.classList.remove('hidden');
    analyticsView.classList.remove('active');
  }
}

function initTabs() {
  const mapBtn = $('mapBtn');
  const analyticsBtn = $('analyticsBtn');
  if (!mapBtn || !analyticsBtn) return;

  mapBtn.addEventListener('click', () => {
    if (tourActive && !isInteractionAllowed('tab', 'map')) return;
    clearTabHighlights();
    setTabActive('map');
    checkTourAdvance('tab', 'map');
  });

  analyticsBtn.addEventListener('click', () => {
    if (tourActive && !isInteractionAllowed('tab', 'analytics')) return;
    clearTabHighlights();
    renderAnalyticsView();
    setTabActive('analytics');
    checkTourAdvance('tab', 'analytics');
  });
}

function clearTabHighlights() {
  $('mapBtn')?.classList.remove('highlight');
  $('analyticsBtn')?.classList.remove('highlight');
}

// ============================================
// TOUR
// ============================================

function clearSpotlight() {
  const spot = $('tourSpotlight');
  if (!spot) return;
  spot.style.display = 'none';
}

function positionSpotlight(targetEl) {
  const spot = $('tourSpotlight');
  if (!spot || !targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  // If target is not visible (e.g., hidden due to responsive layout), don't show spotlight.
  if (!rect.width || !rect.height) {
    spot.style.display = 'none';
    return;
  }
  const padding = 10;

  spot.style.display = 'block';
  spot.style.top = `${Math.max(0, rect.top - padding)}px`;
  spot.style.left = `${Math.max(0, rect.left - padding)}px`;
  spot.style.width = `${rect.width + padding * 2}px`;
  spot.style.height = `${rect.height + padding * 2}px`;
}

function highlightTarget(step) {
  clearSpotlight();
  clearTabHighlights();
  document.querySelectorAll('.chip.highlight').forEach(el => el.classList.remove('highlight'));

  if (!step?.target) return;

  // Chip highlight (chips are rendered dynamically)
  if (step.target.startsWith('chip-')) {
    const chipEl = $(step.target);
    if (chipEl) {
      chipEl.classList.add('highlight');
      positionSpotlight(chipEl);
    }
    return;
  }

  const targetEl = $(step.target);
  if (targetEl) {
    // If the target is a view button, add button pulse highlight
    if (targetEl.classList.contains('view-btn')) {
      targetEl.classList.add('highlight');
    }
    positionSpotlight(targetEl);
  }
}

function showStep(index) {
  currentStep = index;
  const step = TOUR_STEPS[index];
  if (!step) {
    endTour();
    return;
  }

  const overlay = $('tourOverlay');
  const indicator = $('tourStepIndicator');
  const subtitle = $('tourSubtitle');
  const title = $('tourTitle');
  const content = $('tourContent');
  const buttons = $('tourButtons');

  if (!overlay || !indicator || !subtitle || !title || !content || !buttons) return;

  overlay.classList.add('active');

  // progress dots
  indicator.innerHTML = TOUR_STEPS.map((_, i) => {
    const cls = i < index ? 'tour-step-dot completed' : i === index ? 'tour-step-dot active' : 'tour-step-dot';
    return `<div class="${cls}"></div>`;
  }).join('');

  subtitle.textContent = step.label;
  title.textContent = step.title;
  content.innerHTML = step.content;

  if (step.buttons && step.buttons.length) {
    buttons.innerHTML = step.buttons
      .map(
        b =>
          `<button class="tour-btn ${b.primary ? 'primary' : 'secondary'}" data-action="${b.action}">${b.text}</button>`
      )
      .join('');

    buttons.querySelectorAll('.tour-btn').forEach(btn => {
      btn.addEventListener('click', () => handleTourAction(btn.dataset.action));
    });
  } else {
    buttons.innerHTML = '';
  }

  // If it's a step that waits for an interaction, activate tour lock
  if (index > 0) tourActive = true;

  // Highlight
  requestAnimationFrame(() => highlightTarget(step));
}

function handleTourAction(action) {
  if (action === 'next') {
    tourActive = true;
    showStep(currentStep + 1);
  } else if (action === 'end') {
    endTour();
  } else if (action === 'contact') {
    endTour();
    openPocModal();
  }
}

function advanceTour() {
  setTimeout(() => showStep(currentStep + 1), 250);
}

function endTour() {
  tourActive = false;
  $('tourOverlay')?.classList.remove('active');
  clearSpotlight();
  clearTabHighlights();
  document.querySelectorAll('.chip.highlight').forEach(el => el.classList.remove('highlight'));

  // Enable free chat
  const input = $('chatInput');
  const send = $('sendBtn');
  if (input && send) {
    input.disabled = false;
    input.setAttribute('aria-disabled', 'false');
    send.disabled = false;
    send.setAttribute('aria-disabled', 'false');
    initFreeChatInput();
  }

  appendAssistantMessage(
    `<p>You're now in <strong>free exploration mode</strong>. Try clicking any of the chips below, or type your own questions (e.g., <strong>risk</strong>, <strong>cascade</strong>, <strong>actions</strong>).</p>`,
    ['Demo Environment']
  );
}

function checkTourAdvance(type, value) {
  if (!tourActive) return false;
  const step = TOUR_STEPS[currentStep];
  if (!step?.waitFor) return false;

  if (step.waitFor.type === type && step.waitFor.value === value) {
    advanceTour();
    return true;
  }
  return false;
}

function isInteractionAllowed(type, value) {
  if (!tourActive) return true;
  const step = TOUR_STEPS[currentStep];
  if (!step?.waitFor) return true;
  return step.waitFor.type === type && step.waitFor.value === value;
}

// ============================================
// POC MODAL
// ============================================

function openPocModal() {
  const modal = $('pocModal');
  if (!modal) return;
  modal.classList.add('active');
}

function initPocModal() {
  const modal = $('pocModal');
  if (!modal) return;

  const close = modal.querySelector('.poc-close');
  close?.addEventListener('click', () => modal.classList.remove('active'));

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
}

// ============================================
// CHAT
// ============================================

function updateKpis(kpi) {
  if (!kpi) return;
  const exposure = $('kpi-exposure');
  const stores = $('kpi-stores');
  const protectedEl = $('kpi-protected');
  const roi = $('kpi-roi');

  if (exposure && kpi.exposure) exposure.textContent = kpi.exposure;
  if (stores && kpi.stores) stores.textContent = kpi.stores;
  if (protectedEl && kpi.protected) protectedEl.textContent = kpi.protected;
  if (roi && kpi.roi) roi.textContent = kpi.roi;
}

function renderChips(chipKeys) {
  const container = $('chipsGrid');
  if (!container) return;

  container.innerHTML = chipKeys
    .map(key => `<button class="chip" data-chip="${key}" id="chip-${key}">${CHIP_LABELS[key] || key}</button>`)
    .join('');

  container.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => handleChipClick(btn.dataset.chip));
  });

  // If the tour is waiting on a chip, re-apply highlight now that chips exist
  if (tourActive) {
    const step = TOUR_STEPS[currentStep];
    if (step?.target?.startsWith('chip-')) {
      setTimeout(() => highlightTarget(step), 50);
    }
  }
}

function appendUserMessage(text) {
  const messages = $('chatMessages');
  if (!messages) return;

  const div = document.createElement('div');
  div.className = 'message user';
  div.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  messages.appendChild(div);
  scrollChatToBottom();
}

function appendAssistantMessage(html, sources = [], meta = { time: '0.8s', confidence: '94%' }) {
  const messages = $('chatMessages');
  if (!messages) return;

  const div = document.createElement('div');
  div.className = 'message assistant';
  div.innerHTML = `
    <div class="message-content">
      ${html}
      <div class="response-meta">
        <span class="response-time">Response: ${meta.time}</span>
        <span class="response-confidence"><span class="confidence-dot"></span>Confidence: ${meta.confidence}</span>
      </div>
      <div class="provenance">
        <div class="provenance-label">Data Sources</div>
        <div class="provenance-sources">${sources.map(s => `<span class="provenance-tag">${escapeHtml(s)}</span>`).join('')}</div>
      </div>
    </div>
  `;
  messages.appendChild(div);
  scrollChatToBottom();
}

function showTyping() {
  const messages = $('chatMessages');
  if (!messages) return;

  const div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'typing';
  div.innerHTML = `
    <div class="message-content">
      <div class="typing-indicator" aria-label="Nexus is typing">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
    </div>
  `;
  messages.appendChild(div);
  scrollChatToBottom();
}

function clearTyping() {
  $('typing')?.remove();
}

function initChat() {
  const r = RESPONSES.initial;
  $('chatMessages').innerHTML = '';
  appendAssistantMessage(r.content, r.sources, { time: '0.8s', confidence: '94%' });
  renderChips(r.chips);
  updateKpis(r.kpi);
}

function handleChipClick(chipKey) {
  if (tourActive && !isInteractionAllowed('chip', chipKey)) return;

  const label = CHIP_LABELS[chipKey] || chipKey;
  appendUserMessage(label);

  showTyping();

  setTimeout(() => {
    clearTyping();
    const r = RESPONSES[chipKey];
    if (!r) {
      appendAssistantMessage(
        `<p>This is a guided demo environment. Try: <strong>risk</strong>, <strong>cascade</strong>, or <strong>actions</strong>.</p>`,
        ['Demo Environment'],
        { time: '0.4s', confidence: '—' }
      );
      return;
    }

    appendAssistantMessage(r.content, r.sources, { time: '1.2s', confidence: '89%' });
    renderChips(r.chips);
    updateKpis(r.kpi);

    checkTourAdvance('chip', chipKey);
  }, 700);
}

// ============================================
// FREE TEXT CHAT (enabled after tour ends)
// ============================================

function initFreeChatInput() {
  if (freeChatInitialized) return;
  freeChatInitialized = true;

  const input = $('chatInput');
  const send = $('sendBtn');
  if (!input || !send) return;

  function submit() {
    const text = (input.value || '').trim();
    if (!text) return;
    input.value = '';

    appendUserMessage(text);

    const t = text.toLowerCase();
    const key = t.includes('risk') ? 'risk' : t.includes('cascade') ? 'cascade' : t.includes('action') ? 'actions' : null;

    showTyping();
    setTimeout(() => {
      clearTyping();
      if (key && RESPONSES[key]) {
        const r = RESPONSES[key];
        appendAssistantMessage(r.content, r.sources, { time: '1.0s', confidence: '87%' });
        renderChips(r.chips);
        updateKpis(r.kpi);
      } else {
        appendAssistantMessage(
          `<p>This demo supports guided questions. Try asking about <strong>risk</strong>, <strong>cascade</strong>, or <strong>actions</strong>, or use the chips below.</p>`,
          ['Demo Environment'],
          { time: '0.5s', confidence: '—' }
        );
      }
    }, 600);
  }

  send.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') submit();
  });
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initPillarsStrip();
  initIntelFeed();
  initMap();
  initChat();
  initTabs();
  initPocModal();

  // Start tour
  showStep(0);
});
