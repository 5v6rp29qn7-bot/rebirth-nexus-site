/*
  Nexus Guided Demo (Option B: linear tour)
  - IDs synced to index.html
  - Tour progresses via Next/Back buttons only (no click-through gating)
  - Narrative upgrades: Aha (standard vs connected), hidden connections, defendable decision, top interventions, reset
  - No partner names; generic data sources
*/

(() => {
  'use strict';

  // -----------------------------
  // Utilities
  // -----------------------------
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const formatUSD = (n) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    } catch {
      return `$${Math.round(n).toLocaleString('en-US')}`;
    }
  };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // -----------------------------
  // DOM
  // -----------------------------
  const dom = {
    // left
    feedItems: $('feedItems'),
    intelFeed: $('intelFeed'),

    // center
    mapBtn: $('mapBtn'),
    analyticsBtn: $('analyticsBtn'),
    mapContainer: $('mapContainer'),
    analyticsView: $('analyticsView'),
    pillarsStrip: $('pillarsStrip'),
    weatherOverlay: $('weatherOverlay'),
    mobileWeatherBanner: $('mobileWeatherBanner'),

    // right
    chatMessages: $('chatMessages'),
    chipsGrid: $('chipsGrid'),
    kpiExposure: $('kpi-exposure'),
    kpiStores: $('kpi-stores'),
    kpiProtected: $('kpi-protected'),
    kpiRoi: $('kpi-roi'),

    // tour
    tourOverlay: $('tourOverlay'),
    tourCard: $('tourCard'),
    tourStepIndicator: $('tourStepIndicator'),
    tourSubtitle: $('tourSubtitle'),
    tourTitle: $('tourTitle'),
    tourContent: $('tourContent'),
    tourButtons: $('tourButtons'),
    tourSpotlight: $('tourSpotlight'),

    // modal
    pocModal: $('pocModal'),
  };

  // -----------------------------
  // Guard: if critical DOM missing, fail gracefully
  // -----------------------------
  const required = [
    'feedItems','mapBtn','analyticsBtn','mapContainer','analyticsView','chatMessages','chipsGrid',
    'tourOverlay','tourCard','tourTitle','tourContent','tourButtons','tourSpotlight'
  ];
  for (const key of required) {
    if (!dom[key]) {
      console.warn(`[demo] Missing DOM node: ${key}`);
    }
  }

  // -----------------------------
  // Data
  // -----------------------------
  const BASELINE_IMPACT = 800_000;   // what a standard dashboard would show
  const CONNECTED_EXPOSURE = 4_200_000; // what Nexus finds via network connections
  const STORES_AT_RISK = 12;

  const INTEL_ITEMS = [
    {
      id: 'storm',
      type: 'risk',
      time: '2 minutes ago',
      title: 'Winter Storm Alert — Chicago Metro',
      detail: 'Severe winter storm tracking toward Chicago. 12 stores and 3 DC touchpoints in projected impact zone.',
      exposure: formatUSD(CONNECTED_EXPOSURE),
      exposureClass: 'red'
    },
    {
      id: 'competitor',
      type: 'opportunity',
      time: '4 hours ago',
      title: 'Competitor Closure — Oakbrook',
      detail: 'A major competitor is closing a nearby location. 47,000 households fall into your 15‑minute drive-time.',
      exposure: formatUSD(1_800_000),
      exposureClass: 'green'
    }
  ];

  const PILLARS = [
    { icon: '🧾', name: 'Operations', desc: 'Inventory, orders, capacity' },
    { icon: '🗺️', name: 'Geospatial', desc: 'Locations, routes, exposure' },
    { icon: '🌐', name: 'External Intel', desc: 'Weather, alerts, public signals' },
    { icon: '🧠', name: 'Connected Risk', desc: 'Network effects & cascades' },
    { icon: '✅', name: 'Decision Briefs', desc: 'Auditable recommendations' },
  ];

  // -----------------------------
  // State
  // -----------------------------
  let activeView = 'map';
  let tourActive = true;
  let tourStep = 0;

  // used by tour highlighting (no gating)
  let lastHighlightedChipKey = null;

  // -----------------------------
  // Rendering helpers
  // -----------------------------
  function renderPillars() {
    if (!dom.pillarsStrip) return;
    dom.pillarsStrip.innerHTML = PILLARS.map(p => (
      `<div class="pillar">
        <div class="pillar-icon" aria-hidden="true">${p.icon}</div>
        <div class="pillar-text">
          <div class="pillar-name">${p.name}</div>
          <div class="pillar-desc">${p.desc}</div>
        </div>
      </div>`
    )).join('');
  }

  function renderIntelFeed() {
    if (!dom.feedItems) return;
    dom.feedItems.innerHTML = INTEL_ITEMS.map(item => {
      // CSS expects .feed-item.critical/.warning/.opportunity and badge classes risk/opportunity
      const severityClass = item.type === 'risk' ? 'critical' : 'opportunity';
      return `
        <div class="feed-item ${severityClass}" data-intel-id="${item.id}" role="button" tabindex="0" aria-label="${item.title}">
          <div class="feed-item-header">
            <div class="feed-item-badge ${item.type}">${item.type === 'risk' ? 'RISK' : 'OPPORTUNITY'}</div>
            <div class="feed-item-time">${item.time}</div>
          </div>
          <div class="feed-item-title">${item.title}</div>
          <div class="feed-item-detail">${item.detail}</div>
          <div class="feed-item-impact">
            <div class="feed-impact-label">Estimated impact</div>
            <div class="feed-impact-value ${item.exposureClass}">${item.exposure}</div>
          </div>
        </div>
      `;
    }).join('');

    // click + keyboard
    dom.feedItems.querySelectorAll('[data-intel-id]')?.forEach(el => {
      const fire = () => {
        const id = el.getAttribute('data-intel-id');
        if (id === 'storm') {
          runHandler('what_is_happening');
        } else {
          runHandler('competitor_opportunity');
        }
      };
      el.addEventListener('click', fire);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fire();
        }
      });
    });
  }

  function setKPIs({ exposure, stores, protectedValue, roi }) {
    if (dom.kpiExposure && exposure != null) dom.kpiExposure.textContent = exposure;
    if (dom.kpiStores && stores != null) dom.kpiStores.textContent = String(stores);
    if (dom.kpiProtected && protectedValue != null) dom.kpiProtected.textContent = protectedValue;
    if (dom.kpiRoi && roi != null) dom.kpiRoi.textContent = roi;
  }

  function addMessage(role, html, meta = null) {
    if (!dom.chatMessages) return;
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role === 'user' ? 'user' : 'assistant'}`;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = html;
    wrapper.appendChild(content);

    if (meta?.sources?.length) {
      const prov = document.createElement('div');
      prov.className = 'provenance';
      prov.innerHTML = `
        <div class="provenance-label">Data Sources</div>
        <div class="provenance-sources">
          ${meta.sources.map(s => `<span class="provenance-tag">${s}</span>`).join('')}
        </div>
      `;
      content.appendChild(prov);
    }

    if (meta?.trustLine) {
      const trust = document.createElement('div');
      trust.className = 'response-meta';
      trust.innerHTML = `
        <span class="response-time">${meta.time ?? 'Now'}</span>
        <span class="response-confidence">
          <span class="confidence-dot" aria-hidden="true"></span>
          ${meta.trustLine}
        </span>
      `;
      content.appendChild(trust);
    }

    dom.chatMessages.appendChild(wrapper);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
  }

  function renderChips(chips) {
    if (!dom.chipsGrid) return;
    dom.chipsGrid.innerHTML = '';

    chips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.type = 'button';
      btn.textContent = chip.label;
      btn.setAttribute('data-chip-key', chip.key);
      btn.id = `chip-${chip.key}`; // for tour spotlight
      btn.addEventListener('click', () => {
        addMessage('user', `<p>${chip.userText ?? chip.label}</p>`);
        runHandler(chip.key);
      });
      dom.chipsGrid.appendChild(btn);
    });

    // highlight chip if tour step asks for it (non-blocking)
    if (lastHighlightedChipKey) {
      const el = $(`chip-${lastHighlightedChipKey}`);
      if (el) el.classList.add('highlight');
    }
  }

  function clearChipHighlight() {
    dom.chipsGrid?.querySelectorAll('.chip.highlight')?.forEach(el => el.classList.remove('highlight'));
    lastHighlightedChipKey = null;
  }

  function setView(view) {
    activeView = view;
    if (dom.mapBtn && dom.analyticsBtn && dom.mapContainer && dom.analyticsView) {
      const isMap = view === 'map';
      dom.mapBtn.classList.toggle('active', isMap);
      dom.analyticsBtn.classList.toggle('active', !isMap);
      dom.mapBtn.setAttribute('aria-selected', String(isMap));
      dom.analyticsBtn.setAttribute('aria-selected', String(!isMap));
      dom.mapContainer.style.display = isMap ? 'block' : 'none';
      dom.analyticsView.style.display = isMap ? 'none' : 'block';
    }
  }

  // -----------------------------
  // Analytics view
  // -----------------------------
  function renderAnalytics() {
    if (!dom.analyticsView) return;

    dom.analyticsView.innerHTML = `
      <div class="analytics-cards">
        <div class="analytics-card">
          <div class="analytics-card-label">Standard Dashboard Exposure</div>
          <div class="analytics-card-value">${formatUSD(BASELINE_IMPACT)}</div>
          <div class="analytics-card-sub">Weather overlay + historical averages</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-label">Connected Exposure (Nexus)</div>
          <div class="analytics-card-value" style="color: var(--accent-red)">${formatUSD(CONNECTED_EXPOSURE)}</div>
          <div class="analytics-card-sub">Weather → Carrier → Supplier → Stores</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-label">Cascade Depth</div>
          <div class="analytics-card-value">4 levels</div>
          <div class="analytics-card-sub">Network effects quantified</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-card-label">Best Intervention ROI</div>
          <div class="analytics-card-value" style="color: var(--accent-gold)">60:1</div>
          <div class="analytics-card-sub">Verified capacity + costs</div>
        </div>
      </div>

      <div class="analytics-table-wrap">
        <div class="analytics-table-title">Critical Nodes & Cascades</div>
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Node</th>
              <th>Risk</th>
              <th>Cascades To</th>
              <th>Exposure</th>
              <th>Best Backup</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chicago DC</td>
              <td><span class="pill pill-red">Critical</span></td>
              <td>12 Stores</td>
              <td>${formatUSD(1_800_000)}</td>
              <td>Indianapolis DC (Available)</td>
            </tr>
            <tr>
              <td>Regional Carrier A</td>
              <td><span class="pill pill-amber">High</span></td>
              <td>Chicago DC → Stores</td>
              <td>${formatUSD(890_000)}</td>
              <td>Carrier B (Health 4/5)</td>
            </tr>
            <tr>
              <td>Supplier: Packaging</td>
              <td><span class="pill pill-amber">High</span></td>
              <td>DC → 8 Stores</td>
              <td>${formatUSD(650_000)}</td>
              <td>Supplier Alternate (In stock)</td>
            </tr>
            <tr>
              <td>Store-level Stockouts</td>
              <td><span class="pill pill-gold">Medium</span></td>
              <td>Revenue loss</td>
              <td>${formatUSD(420_000)}</td>
              <td>Pre-position SKUs</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // -----------------------------
  // Chat handlers (chips)
  // -----------------------------
  const CHIPSETS = {
    start: [
      { key: 'what_is_happening', label: "What's happening?", userText: "What's happening?" },
      { key: 'whats_really_at_risk', label: "What's really at risk?", userText: "What's really at risk?" },
      { key: 'what_am_i_missing', label: "What am I missing?", userText: "What am I missing?" },
      { key: 'actions', label: 'What actions should we take?', userText: 'What actions should we take?' },
    ],
    after_aha: [
      { key: 'what_am_i_missing', label: 'What am I missing?', userText: 'What am I missing?' },
      { key: 'actions', label: 'Show mitigation options', userText: 'Show mitigation options' },
      { key: 'defend_decision', label: 'Can I defend this decision?', userText: 'Can I defend this decision?' },
      { key: 'top_interventions', label: 'Top 3 interventions', userText: 'Show the top 3 interventions' },
      { key: 'reset', label: 'Reset scenario', userText: 'Reset scenario' },
    ],
    after_actions: [
      { key: 'defend_decision', label: 'Board-ready brief', userText: 'Give me a board-ready brief' },
      { key: 'top_interventions', label: 'Top 3 interventions', userText: 'Show the top 3 interventions' },
      { key: 'request_pilot', label: 'Request a pilot', userText: 'Request a pilot' },
      { key: 'reset', label: 'Reset scenario', userText: 'Reset scenario' },
    ]
  };

  const HANDLERS = {
    async what_is_happening() {
      setKPIs({ exposure: formatUSD(CONNECTED_EXPOSURE), stores: STORES_AT_RISK, protectedValue: formatUSD(0), roi: '—' });
      addMessage('assistant', `
        <p>Good morning. I’ve detected <strong>two situations</strong> that need attention.</p>
        <p>🔴 <strong>Winter Storm:</strong> NOAA is projecting severe conditions in the Chicago metro within <strong>48 hours</strong>. Your network has <strong>${STORES_AT_RISK} stores</strong> and <strong>3 DC touchpoints</strong> in the impact corridor.</p>
        <p>🟢 <strong>Competitor event:</strong> A nearby competitor closure creates a short‑term demand capture opportunity.</p>
        <div class="viz-roi-cards">
          <div class="roi-card"><div class="roi-label">Standard view</div><div class="roi-value amber">${formatUSD(BASELINE_IMPACT)}</div></div>
          <div class="roi-card"><div class="roi-label">Connected exposure</div><div class="roi-value red">${formatUSD(CONNECTED_EXPOSURE)}</div></div>
          <div class="roi-card"><div class="roi-label">Warning time</div><div class="roi-value gold">48h</div></div>
          <div class="roi-card"><div class="roi-label">Stores at risk</div><div class="roi-value amber">${STORES_AT_RISK}</div></div>
        </div>
        <p>I’ve already mapped the likely cascade and prepared mitigation options. Where should we start?</p>
      `, {
        sources: ['NOAA Weather', 'Store Operations', 'Carrier Performance', 'Financial Health Scoring'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.',
        time: 'Now'
      });

      renderChips(CHIPSETS.start);
    },

    async whats_really_at_risk() {
      // The “Aha” moment: 5x higher due to connected risks
      addMessage('assistant', `
        <p>Here’s the difference between a <strong>standard dashboard</strong> and <strong>connected intelligence</strong>.</p>
        <div class="viz-risk-matrix">
          <div class="risk-row">
            <div class="risk-label">Standard (weather-only)</div>
            <div class="risk-bar"><div class="risk-fill amber" style="width: ${clamp((BASELINE_IMPACT/CONNECTED_EXPOSURE)*100, 10, 60)}%"></div></div>
            <div class="risk-value amber">${formatUSD(BASELINE_IMPACT)}</div>
          </div>
          <div class="risk-row">
            <div class="risk-label">Connected (Nexus)</div>
            <div class="risk-bar"><div class="risk-fill red" style="width: 100%"></div></div>
            <div class="risk-value red">${formatUSD(CONNECTED_EXPOSURE)}</div>
          </div>
        </div>
        <p><strong>The storm alone</strong> is roughly ${formatUSD(BASELINE_IMPACT)}. But I’ve identified why the real number is <strong>~5× higher</strong>:</p>
        <ul>
          <li><strong>Carrier fragility</strong> in the primary lane servicing Chicago DC</li>
          <li><strong>Supplier exposure</strong> on time‑sensitive SKUs (packaging + fixtures)</li>
          <li><strong>Store‑level stockout cascade</strong> across 8 high‑velocity locations</li>
        </ul>
        <p>If we act at <strong>T‑48h</strong>, we protect most of the downside and avoid war‑room escalation.</p>
      `, {
        sources: ['NOAA Weather', 'Carrier Performance', 'Inventory System', 'Trade Credit Intelligence'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      // Encourage viewing analytics
      renderAnalytics();
      setView('analytics');
      if (dom.analyticsBtn) dom.analyticsBtn.focus?.();

      renderChips(CHIPSETS.after_aha);
    },

    async what_am_i_missing() {
      addMessage('assistant', `
        <p>You’re missing the <strong>early‑warning signals</strong> that don’t live in any single system.</p>
        <p>For the primary carrier lane into Chicago DC, I’ve flagged:</p>
        <ul>
          <li><strong>Delayed payments</strong> trend (trade credit behavior shift)</li>
          <li><strong>Insurance coverage reduction</strong> (risk posture change)</li>
          <li><strong>Key dispatcher resignation</strong> (operational continuity risk)</li>
        </ul>
        <p>None of these alone causes a failure. Together, they explain why disruption probability spikes during the storm window.</p>
      `, {
        sources: ['Trade Credit Intelligence', 'Public Filings', 'Employment Signals', 'Carrier Performance'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips(CHIPSETS.after_aha);
    },

    async actions() {
      // Mitigation plan + ROI
      const mitigationCost = 52_000;
      const valueProtected = 3_100_000;
      const roi = Math.round(valueProtected / mitigationCost);
      setKPIs({ protectedValue: formatUSD(valueProtected), roi: `${roi}:1` });

      addMessage('assistant', `
        <p>Here are <strong>prioritized actions</strong> with verified availability.</p>
        <div class="viz-timeline">
          <div class="timeline-item">
            <div class="timeline-marker red"></div>
            <div class="timeline-content">
              <div class="timeline-time">T‑48h (Now)</div>
              <div class="timeline-title">Act before congestion starts</div>
              <div class="timeline-desc">Standard response: “monitor.” Nexus response: re-route + pre-position while capacity is still available.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker amber"></div>
            <div class="timeline-content">
              <div class="timeline-time">T‑36h</div>
              <div class="timeline-title">Reroute through Indianapolis DC</div>
              <div class="timeline-desc">Bypass Chicago hub. Capacity confirmed. +8h transit, avoids outage risk.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker amber"></div>
            <div class="timeline-content">
              <div class="timeline-time">T‑24h</div>
              <div class="timeline-title">Pre-position high-velocity SKUs</div>
              <div class="timeline-desc">Move inventory to unaffected stores to prevent 8 critical stockouts.</div>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker green"></div>
            <div class="timeline-content">
              <div class="timeline-time">T‑12h</div>
              <div class="timeline-title">Switch to backup carrier</div>
              <div class="timeline-desc">Backup lane health 4/5. Locks service levels through storm window.</div>
            </div>
          </div>
        </div>

        <div class="viz-roi-cards">
          <div class="roi-card"><div class="roi-label">Mitigation cost</div><div class="roi-value amber">${formatUSD(mitigationCost)}</div></div>
          <div class="roi-card"><div class="roi-label">Value protected</div><div class="roi-value green">${formatUSD(valueProtected)}</div></div>
          <div class="roi-card"><div class="roi-label">ROI</div><div class="roi-value gold">${roi}:1</div></div>
          <div class="roi-card"><div class="roi-label">Residual risk</div><div class="roi-value">${formatUSD(340_000)}</div></div>
        </div>

        <p><strong>Bottom line:</strong> spend ${formatUSD(mitigationCost)} to protect ${formatUSD(valueProtected)}.</p>
      `, {
        sources: ['Carrier Availability', 'Inventory System', 'Route Network', 'Cost Model'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips(CHIPSETS.after_actions);
    },

    async defend_decision() {
      addMessage('assistant', `
        <p><strong>Decision Brief (Board-Ready)</strong></p>
        <p><strong>Situation</strong><br>
        Verified NOAA storm trajectory indicates high disruption probability for Chicago DC lanes within 48h. Connected analysis identifies likely amplification via carrier fragility + supplier exposure.</p>

        <p><strong>Response</strong><br>
        1) Re-route critical shipments via Indianapolis DC<br>
        2) Pre-position top 30 high-velocity SKUs<br>
        3) Secure backup carrier capacity for storm window</p>

        <p><strong>Expected Outcome</strong><br>
        Protect ~${formatUSD(3_100_000)} with a ${Math.round(3_100_000/52_000)}:1 ROI. Confidence interval: <strong>70–85%</strong> based on analogous events + current capacity signals.</p>

        <p><em>Auditability:</em> Every input is source-stamped and replayable. You can export this brief as a decision log for governance.</p>
      `, {
        sources: ['NOAA Weather', 'Carrier Performance', 'Trade Credit Intelligence', 'Inventory System'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips(CHIPSETS.after_actions);
    },

    async top_interventions() {
      addMessage('assistant', `
        <p><strong>Top 3 Interventions (Ranked)</strong></p>
        <ol>
          <li><strong>Reroute via Indianapolis DC</strong> — protects ~${formatUSD(1_400_000)}; feasibility: high; time-to-execute: today.</li>
          <li><strong>Pre-position high-velocity SKUs</strong> — protects ~${formatUSD(780_000)}; feasibility: high; prevents 8 stockouts.</li>
          <li><strong>Lock backup carrier capacity</strong> — reduces failure probability; feasibility: medium; stabilizes service levels.</li>
        </ol>
        <p>If you want, I can generate an execution checklist by team (Ops / Logistics / Stores) in one click.</p>
      `, {
        sources: ['Route Network', 'Inventory System', 'Carrier Availability', 'Cost Model'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips(CHIPSETS.after_actions);
    },

    async competitor_opportunity() {
      addMessage('assistant', `
        <p>I’m seeing a short-term demand capture opportunity.</p>
        <p>A competitor’s Oakbrook location is closing. Within a 15‑minute drive-time, there are <strong>47,000 households</strong> likely to shift shopping behavior.</p>
        <p>Recommended action: target 3 nearby stores with inventory rebalancing + localized promos for two weeks.</p>
      `, {
        sources: ['Public Signals', 'Drive-time Model', 'Store Operations'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips([
        { key: 'top_interventions', label: 'Top 3 interventions', userText: 'Top interventions' },
        { key: 'request_pilot', label: 'Request a pilot', userText: 'Request a pilot' },
        { key: 'reset', label: 'Reset scenario', userText: 'Reset scenario' },
      ]);
    },

    async request_pilot() {
      if (dom.pocModal) {
        dom.pocModal.style.display = 'flex';
        dom.pocModal.setAttribute('aria-hidden', 'false');
      }
      addMessage('assistant', `<p>I can run this exact scenario on your network. Choose an option in the pilot modal, and we’ll respond within 24 hours.</p>`, {
        sources: ['Pilot Workflow'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });
    },

    async reset() {
      // reset UI
      tourActive = false;
      clearChipHighlight();
      setView('map');
      renderAnalytics();
      if (dom.chatMessages) dom.chatMessages.innerHTML = '';
      setKPIs({ exposure: formatUSD(CONNECTED_EXPOSURE), stores: STORES_AT_RISK, protectedValue: formatUSD(0), roi: '—' });

      addMessage('assistant', `
        <p>Reset complete. Back to the start state.</p>
        <p>If you want the guided tour again, refresh the page.</p>
      `, {
        sources: ['Demo State'],
        trustLine: 'Every claim is source‑stamped; every recommendation is replayable.'
      });

      renderChips(CHIPSETS.start);
    },
  };

  async function runHandler(key) {
    clearChipHighlight();
    const fn = HANDLERS[key];
    if (!fn) {
      addMessage('assistant', `<p>I don't have a response wired for that yet.</p>`);
      return;
    }
    await fn();
  }

  // -----------------------------
  // Tour (Option B: linear)
  // -----------------------------
  const TOUR = [
    {
      subtitle: 'See what others miss',
      title: 'Connected intelligence, delivered in plain English',
      content: `
        <p>This is a guided walk-through. You’ll see how a storm that looks like <strong>${formatUSD(BASELINE_IMPACT)}</strong> becomes <strong>${formatUSD(CONNECTED_EXPOSURE)}</strong> once you account for connected risks.</p>
        <p>At the end, you’ll have a decision brief you can defend.</p>
      `,
      target: null,
      buttons: ['next']
    },
    {
      subtitle: 'Step 1',
      title: 'Live intelligence feed',
      content: `<p>On the left, Nexus streams events that can cascade into your operations. Click any card later to drive the conversation.</p>`,
      target: 'intelFeed',
      buttons: ['back','next']
    },
    {
      subtitle: 'Step 2',
      title: 'External intel is timestamped and defensible',
      content: `<p>The weather overlay includes timestamps and confidence so the “48 hours early” claim is auditable.</p>`,
      target: 'weatherOverlay',
      buttons: ['back','next']
    },
    {
      subtitle: 'Step 3',
      title: 'Map vs Analytics',
      content: `<p>Switch between <strong>Map</strong> and <strong>Analytics</strong>. The demo will work even if you don’t click during the tour.</p>`,
      target: 'viewToggle',
      buttons: ['back','next']
    },
    {
      subtitle: 'Step 4',
      title: 'Conversation is the interface',
      content: `<p>On the right, ask questions like a colleague. Use the quick-action chips to move fast during meetings.</p>`,
      target: 'chatPanel',
      buttons: ['back','next']
    },
    {
      subtitle: 'Step 5',
      title: 'The “Aha” moment',
      content: `<p>When you click <strong>“What’s really at risk?”</strong>, Nexus shows the standard view vs the connected exposure — and why it’s ~5× higher.</p>`,
      target: 'chipsSection',
      buttons: ['back','next'],
      highlightChip: 'whats_really_at_risk'
    },
    {
      subtitle: 'Step 6',
      title: 'Defendable decisions',
      content: `<p>The goal isn’t more dashboards — it’s decisions you can defend. You’ll get a board-ready brief with sources.</p>`,
      target: 'kpiStrip',
      buttons: ['back','finish']
    }
  ];

  function hideSpotlight() {
    if (!dom.tourSpotlight) return;
    dom.tourSpotlight.style.display = 'none';
  }

  function showSpotlightFor(targetId) {
    if (!dom.tourSpotlight) return;
    if (!targetId) return hideSpotlight();

    const target = $(targetId);
    if (!target) return hideSpotlight();

    const rect = target.getBoundingClientRect();
    // If element is effectively hidden, don't spotlight
    if (rect.width < 8 || rect.height < 8) return hideSpotlight();

    const pad = 10;
    const left = rect.left - pad;
    const top = rect.top - pad;
    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;

    dom.tourSpotlight.style.display = 'block';
    dom.tourSpotlight.style.left = `${Math.max(8, left)}px`;
    dom.tourSpotlight.style.top = `${Math.max(8, top)}px`;
    dom.tourSpotlight.style.width = `${Math.min(window.innerWidth - 16, width)}px`;
    dom.tourSpotlight.style.height = `${Math.min(window.innerHeight - 16, height)}px`;
  }

  function renderTour() {
    if (!dom.tourOverlay || !dom.tourTitle || !dom.tourContent || !dom.tourButtons || !dom.tourSubtitle || !dom.tourStepIndicator) return;

    const step = TOUR[tourStep];
    dom.tourOverlay.style.display = tourActive ? 'flex' : 'none';
    if (!tourActive) {
      hideSpotlight();
      return;
    }

    dom.tourSubtitle.textContent = step.subtitle;
    dom.tourTitle.textContent = step.title;
    dom.tourContent.innerHTML = step.content;

    dom.tourStepIndicator.innerHTML = TOUR.map((_, i) => (
      `<span class="tour-dot ${i === tourStep ? 'active' : ''}" aria-hidden="true"></span>`
    )).join('');

    dom.tourButtons.innerHTML = '';

    const mkBtn = (label, kind) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `tour-btn ${kind === 'primary' ? 'primary' : ''}`;
      b.textContent = label;
      return b;
    };

    if (step.buttons.includes('back')) {
      const back = mkBtn('← Back', 'secondary');
      back.addEventListener('click', () => {
        tourStep = Math.max(0, tourStep - 1);
        renderTour();
      });
      dom.tourButtons.appendChild(back);
    }

    if (step.buttons.includes('next')) {
      const next = mkBtn('Next →', 'primary');
      next.addEventListener('click', () => {
        tourStep = Math.min(TOUR.length - 1, tourStep + 1);
        renderTour();
      });
      dom.tourButtons.appendChild(next);
    }

    if (step.buttons.includes('finish')) {
      const done = mkBtn('Start Demo →', 'primary');
      done.addEventListener('click', () => {
        tourActive = false;
        dom.tourOverlay.style.display = 'none';
        hideSpotlight();
        // kick off the demo state
        runHandler('what_is_happening');
      });
      dom.tourButtons.appendChild(done);
    }

    showSpotlightFor(step.target);

    // Optional chip highlight (non-blocking)
    clearChipHighlight();
    if (step.highlightChip) {
      lastHighlightedChipKey = step.highlightChip;
      // If chips not rendered yet, render the start chips to show the highlight.
      if (!dom.chipsGrid?.children?.length) {
        renderChips(CHIPSETS.start);
      }
      const el = $(`chip-${step.highlightChip}`);
      if (el) el.classList.add('highlight');
    }
  }

  function bindTourResize() {
    window.addEventListener('resize', () => {
      if (tourActive) renderTour();
    });
    window.addEventListener('scroll', () => {
      if (tourActive) renderTour();
    }, { passive: true });
  }

  // -----------------------------
  // Tabs
  // -----------------------------
  function bindTabs() {
    dom.mapBtn?.addEventListener('click', () => setView('map'));
    dom.analyticsBtn?.addEventListener('click', () => {
      renderAnalytics();
      setView('analytics');
    });
  }

  // -----------------------------
  // POC modal close
  // -----------------------------
  function bindModal() {
    if (!dom.pocModal) return;
    const close = dom.pocModal.querySelector('.poc-close');
    close?.addEventListener('click', () => {
      dom.pocModal.style.display = 'none';
      dom.pocModal.setAttribute('aria-hidden', 'true');
    });

    dom.pocModal.addEventListener('click', (e) => {
      if (e.target === dom.pocModal) {
        dom.pocModal.style.display = 'none';
        dom.pocModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // -----------------------------
  // ArcGIS map (best effort)
  // -----------------------------
  function initMapBestEffort() {
    const container = document.getElementById('mapView');
    if (!container) return;

    const hasArcGIS = typeof window.require === 'function';
    if (!hasArcGIS) {
      console.warn('[demo] ArcGIS require() not found; map will remain empty.');
      return;
    }

    try {
      window.require([
        'esri/Map',
        'esri/views/MapView',
        'esri/Graphic',
        'esri/layers/GraphicsLayer'
      ], (Map, MapView, Graphic, GraphicsLayer) => {
        const graphics = new GraphicsLayer();
        const map = new Map({ basemap: 'dark-gray-vector', layers: [graphics] });

        const view = new MapView({
          container: 'mapView',
          map,
          center: [-87.6298, 41.8781],
          zoom: 6
        });

        // Points: Chicago DC + stores
        const points = [
          { name: 'Chicago DC', coords: [-87.6398, 41.8781], color: [255, 77, 79, 0.9], size: 12 },
          { name: 'Store A', coords: [-88.0400, 41.7600], color: [255, 191, 36, 0.9], size: 8 },
          { name: 'Store B', coords: [-87.8000, 41.9500], color: [255, 191, 36, 0.9], size: 8 },
          { name: 'Indianapolis DC', coords: [-86.1581, 39.7684], color: [51, 201, 130, 0.9], size: 10 },
        ];

        points.forEach(p => {
          graphics.add(new Graphic({
            geometry: { type: 'point', longitude: p.coords[0], latitude: p.coords[1] },
            symbol: { type: 'simple-marker', color: p.color, size: p.size, outline: { color: [255,255,255,0.2], width: 1 } },
            popupTemplate: { title: p.name, content: 'Demo node' }
          }));
        });

        // store view for later
        view.when(() => {
          // nothing else
        });
      });
    } catch (e) {
      console.warn('[demo] Map init failed:', e);
    }
  }

  // -----------------------------
  // Init
  // -----------------------------
  async function init() {
    // base UI state
    setView('map');
    renderPillars();
    renderIntelFeed();
    renderAnalytics();
    setKPIs({ exposure: formatUSD(CONNECTED_EXPOSURE), stores: STORES_AT_RISK, protectedValue: formatUSD(0), roi: '—' });

    // initial chips (so tour can highlight)
    renderChips(CHIPSETS.start);

    // bindings
    bindTabs();
    bindModal();
    bindTourResize();

    // start tour
    tourActive = true;
    tourStep = 0;
    renderTour();

    // best-effort map
    initMapBestEffort();

    // subtle: if user is on mobile, shrink spotlight risk by re-render after a tick
    await sleep(50);
    if (tourActive) renderTour();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
