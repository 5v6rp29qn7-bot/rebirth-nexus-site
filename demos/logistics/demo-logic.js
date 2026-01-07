// ============================================
// REBIRTH NEXUS DEMO - v13
// Three-panel layout + Intel Feed + Proactive Alerts
// ============================================

const DEMO_TOKEN = 'nexus-demo-2024';  // API authentication token

const NUMBERS = {
    totalExposure: '$2.10M',
    mitigationCost: '$45K',
    protected: '$1.73M',
    residual: '$370K',
    roi: '38:1',
    routesAtRisk: 127,
    facilitiesAtRisk: 4,
    carriersAvailable: 12,
    priorityCustomers: 23
};

// ============================================
// SYNTHETIC ASSET DATA (v13)
// ============================================

const SHIPMENTS = [
    { id: 'TRK-4521', customer: 'TechCorp', contents: 'Pharma', slaWindow: '4h 12m', exposure: '$180K', status: 'critical', route: 'CHI-DET', temp: '38°F' },
    { id: 'TRK-4523', customer: 'Retail Giant', contents: 'Electronics', slaWindow: '2h 45m', exposure: '$95K', status: 'critical', route: 'CHI-IND', temp: '41°F' },
    { id: 'TRK-4498', customer: 'AutoParts', contents: 'JIT Parts', slaWindow: '1h 30m', exposure: '$67K', status: 'critical', route: 'CHI-DET', temp: '39°F' },
    { id: 'TRK-4512', customer: 'TechCorp', contents: 'Medical', slaWindow: '5h 20m', exposure: '$145K', status: 'warning', route: 'CHI-MEM', temp: '36°F' },
    { id: 'TRK-4536', customer: 'Retail Giant', contents: 'Apparel', slaWindow: '8h 15m', exposure: '$42K', status: 'warning', route: 'KC-CHI', temp: '44°F' },
    { id: 'TRK-4541', customer: 'AutoParts', contents: 'Components', slaWindow: '3h 50m', exposure: '$78K', status: 'critical', route: 'DET-IND', temp: '40°F' },
    { id: 'TRK-4558', customer: 'MedSupply Co', contents: 'Vaccines', slaWindow: '2h 10m', exposure: '$210K', status: 'critical', route: 'CHI-MIN', temp: '34°F' },
    { id: 'TRK-4562', customer: 'FoodCorp', contents: 'Perishables', slaWindow: '6h 30m', exposure: '$55K', status: 'warning', route: 'STL-CHI', temp: '37°F' },
    { id: 'TRK-4577', customer: 'TechCorp', contents: 'Servers', slaWindow: '12h 00m', exposure: '$125K', status: 'ok', route: 'MEM-IND', temp: '42°F' },
    { id: 'TRK-4583', customer: 'Retail Giant', contents: 'Holiday Stock', slaWindow: '4h 45m', exposure: '$88K', status: 'warning', route: 'KC-DET', temp: '38°F' },
    { id: 'TRK-4591', customer: 'AutoParts', contents: 'Assembly', slaWindow: '7h 20m', exposure: '$62K', status: 'ok', route: 'COL-CHI', temp: '40°F' },
    { id: 'TRK-4599', customer: 'MedSupply Co', contents: 'Equipment', slaWindow: '9h 15m', exposure: '$98K', status: 'ok', route: 'MEM-STL', temp: '43°F' }
];

const INTEL_FEED_EVENTS = [
    { type: 'critical', title: 'Temperature Alert', detail: 'TRK-4558 cargo temp at 34°F — below threshold', asset: 'TRK-4558', time: 0, tags: ['Temp', 'Vaccines'], actions: ['View Shipment', 'Alert Driver'] },
    { type: 'critical', title: 'SLA Risk', detail: 'TRK-4498 has 1h 30m remaining, current delay +45min', asset: 'TRK-4498', time: 2, tags: ['SLA', 'JIT'], actions: ['Reroute', 'Notify Customer'] },
    { type: 'warning', title: 'Weather Impact', detail: 'Route CHI-DET entering storm zone in 2h 14m', asset: 'CHI-047', time: 5, tags: ['Weather', 'Route'], actions: ['View Route', 'Reroute Options'] },
    { type: 'warning', title: 'Carrier Alert', detail: 'FastFreight #47 brake wear at 87%, service in 340mi', asset: 'FF-47', time: 8, tags: ['Maintenance'], actions: ['Assign Backup', 'View Fleet'] },
    { type: 'info', title: 'Capacity Update', detail: 'Kansas City backup now at 45% utilization', asset: 'KC-HUB', time: 12, tags: ['Capacity'], actions: ['View Facility'] },
    { type: 'warning', title: 'Supplier Delay', detail: 'Midwest Components reporting 4hr delay', asset: 'SUP-MW', time: 15, tags: ['Supplier'], actions: ['Contact Supplier', 'Alt Sources'] },
    { type: 'critical', title: 'SLA Breach Risk', detail: 'TechCorp shipments (3) approaching penalty window', asset: 'CUST-TC', time: 18, tags: ['SLA', 'Customer'], actions: ['Contact Customer', 'View Shipments'] }
];

// Data provenance sources
const DATA_SOURCES = ['TMS/WMS', 'Esri GIS', 'NOAA Weather', 'Carrier API', 'Predictive Model'];

let conversationHistory = [];
let isProcessing = false;
let executionStarted = false;
let interactionCount = 0;
let proactiveAlertTimer = null;
let feedInitialized = false;

const initialChips = ["What's our biggest risk?", "Mitigation options", "Show cascade effects", "Who approves?"];

// ============================================
// CANNED RESPONSES - Used first for instant, perfect responses
// ============================================

const scriptedResponses = {
    initial: {
        content: `<p>Good morning. I've detected a developing situation that requires your attention.</p>
        <p><strong>Alert:</strong> A severe winter storm system is tracking toward your Midwest corridor. Based on current projections, this will significantly impact your logistics network within the next 48 hours.</p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Exposure at Risk</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div>
            <div class="roi-card"><div class="roi-label">Routes Affected</div><div class="roi-value amber">${NUMBERS.routesAtRisk}</div></div>
            <div class="roi-card"><div class="roi-label">Facilities at Risk</div><div class="roi-value amber">${NUMBERS.facilitiesAtRisk}</div></div>
            <div class="roi-card positive"><div class="roi-label">Mitigation Ready</div><div class="roi-value green">Yes</div></div>
        </div>
        <p>I've already identified mitigation options and pre-positioned resources. What would you like to explore first?</p>`,
        chips: initialChips
    },
    
    "what's our biggest risk": {
        content: `<p>The primary risk concentration is in your Chicago hub operations.</p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">⚠️ Risk Breakdown by Segment</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Chicago Hub Operations</div><div class="risk-detail">${NUMBERS.routesAtRisk} routes, 4 major customers</div></div><div class="risk-value red">$890K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Supplier Deliveries</div><div class="risk-detail">3 critical suppliers in storm path</div></div><div class="risk-value amber">$540K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Customer SLA Penalties</div><div class="risk-detail">${NUMBERS.priorityCustomers} priority accounts at risk</div></div><div class="risk-value amber">$420K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Inventory Delays</div><div class="risk-detail">Cross-dock timing disruption</div></div><div class="risk-value cyan">$250K</div></div>
        </div>
        <p><strong>Key Insight:</strong> 42% of your exposure is concentrated in the Chicago hub. This is also where we have the strongest mitigation options.</p>`,
        chips: ["Deep dive: Chicago hub", "Mitigation options", "Show cascade effects", "Return to overview"]
    },
    
    "deep dive: chicago hub": {
        content: `<p><strong>Chicago Hub - Critical Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Direct Exposure</div><div class="roi-value red">$890K</div></div>
            <div class="roi-card"><div class="roi-label">Daily Throughput</div><div class="roi-value">2,400</div></div>
            <div class="roi-card"><div class="roi-label">Staff Affected</div><div class="roi-value amber">145</div></div>
            <div class="roi-card"><div class="roi-label">Expected Reduction</div><div class="roi-value red">60%</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🏭 Hub Dependencies</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">I-90 Corridor</div><div class="risk-detail">Primary east-west route, snow accumulation expected</div></div><div class="risk-value red">Blocked</div></div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">I-94 Corridor</div><div class="risk-detail">Detroit/Milwaukee connections</div></div><div class="risk-value red">Blocked</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">I-55 Corridor</div><div class="risk-detail">Southern routes, partial access</div></div><div class="risk-value amber">Limited</div></div>
        </div>
        <p><strong>Cascade Risk:</strong> If Chicago goes offline, Detroit loses 70% of inbound within 12 hours, Minneapolis loses 45% within 18 hours.</p>`,
        chips: ["Activate Kansas City backup", "Staffing contingency", "Show cascade effects", "Return to overview"]
    },

    "deep dive: supplier deliveries": {
        content: `<p><strong>Supplier Risk - Detailed Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Total Supplier Exposure</div><div class="roi-value red">$540K</div></div>
            <div class="roi-card"><div class="roi-label">Suppliers at Risk</div><div class="roi-value amber">3</div></div>
            <div class="roi-card"><div class="roi-label">Alternatives Ready</div><div class="roi-value green">Yes</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📦 Supplier Status</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Midwest Components (Chicago)</div><div class="risk-detail">48-72hr delay expected • No production redundancy</div></div><div class="risk-value red">$280K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">PackRight Materials (Gary, IN)</div><div class="risk-detail">Road access uncertain • Packaging materials</div></div><div class="risk-value amber">$180K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">TechParts Inc (Milwaukee)</div><div class="risk-detail">Backup supplier already available</div></div><div class="risk-value cyan">$80K</div></div>
        </div>
        <p><strong>Mitigation:</strong> Alternative suppliers identified. Southern Components (Georgia) can cover 60% of Midwest Components volume at +8% cost, 72hr lead time.</p>`,
        chips: ["Activate alternatives", "Supplier scorecards", "Contact suppliers", "Return to overview"]
    },

    "deep dive: customer sla": {
        content: `<p><strong>Customer SLA Penalties - Detailed Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">SLA Exposure</div><div class="roi-value red">$420K</div></div>
            <div class="roi-card"><div class="roi-label">Accounts at Risk</div><div class="roi-value amber">${NUMBERS.priorityCustomers}</div></div>
            <div class="roi-card"><div class="roi-label">Churn Risk</div><div class="roi-value red">$8.4M</div></div>
            <div class="roi-card positive"><div class="roi-label">Proactive Outreach</div><div class="roi-value green">Ready</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🎯 Top Accounts by Penalty Risk</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">TechCorp Industries</div><div class="risk-detail">12 shipments • SLA penalty clause ACTIVE • Renewal talks Q1</div></div><div class="risk-value red">$180K</div></div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Retail Giant Inc</div><div class="risk-detail">8 shipments • Holiday inventory critical • $8.4M contract</div></div><div class="risk-value red">$145K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">AutoParts Direct</div><div class="risk-detail">15 shipments • JIT delivery • Production line impact</div></div><div class="risk-value amber">$95K</div></div>
        </div>
        <p><strong>Strategic Risk:</strong> TechCorp and Retail Giant have renewal discussions active. A major service failure now puts $8.4M in annual contracts at risk beyond the immediate SLA penalties.</p>`,
        chips: ["Draft customer messages", "Full account list", "Priority customers", "Return to overview"]
    },

    "deep dive: inventory": {
        content: `<p><strong>Inventory Delays - Detailed Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Inventory Exposure</div><div class="roi-value amber">$250K</div></div>
            <div class="roi-card"><div class="roi-label">Cross-Dock Impact</div><div class="roi-value amber">High</div></div>
            <div class="roi-card positive"><div class="roi-label">Pre-positioning</div><div class="roi-value green">Available</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📦 Inventory Flow Disruptions</div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Cross-Dock Timing</div><div class="risk-detail">Chicago sorting delays cascade to outbound</div></div><div class="risk-value amber">$120K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Safety Stock Depletion</div><div class="risk-detail">Detroit and Minneapolis DCs draw down buffers</div></div><div class="risk-value cyan">$85K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Inbound Staging</div><div class="risk-detail">Supplier shipments backed up</div></div><div class="risk-value cyan">$45K</div></div>
        </div>
        <p><strong>Mitigation:</strong> Pre-position 72-hour critical stock at Kansas City and Memphis. Cost: $12K. Eliminates $180K+ in stockout risk.</p>`,
        chips: ["Execute inventory transfer", "Inventory levels by DC", "Return to overview"]
    },
    
    "mitigation options": {
        content: `<p>I've prepared a 3-phase mitigation plan that can protect ${NUMBERS.protected} of your ${NUMBERS.totalExposure} exposure:</p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">✓ Recommended Actions</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Phase 1: Regional Bypass</div><div class="risk-detail">Reroute ${NUMBERS.routesAtRisk} shipments through Kansas City hub</div></div><div class="risk-value green">Saves $720K</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Phase 2: Customer Outreach</div><div class="risk-detail">Proactive notification to ${NUMBERS.priorityCustomers} accounts</div></div><div class="risk-value green">Saves $380K</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Phase 3: Inventory Transfer</div><div class="risk-detail">Pre-position critical stock at unaffected DCs</div></div><div class="risk-value green">Saves $630K</div></div>
        </div>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Total Cost</div><div class="roi-value">${NUMBERS.mitigationCost}</div></div>
            <div class="roi-card positive"><div class="roi-label">Value Protected</div><div class="roi-value green">${NUMBERS.protected}</div></div>
            <div class="roi-card positive"><div class="roi-label">Net ROI</div><div class="roi-value green">${NUMBERS.roi}</div></div>
            <div class="roi-card"><div class="roi-label">Residual Risk</div><div class="roi-value amber">${NUMBERS.residual}</div></div>
        </div>
        <p>All three phases can be executed in parallel. I've already verified carrier availability and facility capacity.</p>`,
        chips: ["Execute all phases", "Phase 1: Regional bypass", "Phase 2: Customer outreach", "Phase 3: Inventory transfer", "ROI breakdown"]
    },

    "phase 1: regional bypass": {
        content: `<p><strong>Phase 1: Regional Bypass - Details</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Cost</div><div class="roi-value">$28K</div></div>
            <div class="roi-card positive"><div class="roi-label">Value Protected</div><div class="roi-value green">$720K</div></div>
            <div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value green">26:1</div></div>
            <div class="roi-card"><div class="roi-label">Execution Time</div><div class="roi-value">2 hours</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🚚 Bypass Components</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Carrier Surge Rates</div><div class="risk-detail">FastFreight + Regional Express at contract rates</div></div><div class="risk-value">$22K</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Kansas City Activation</div><div class="risk-detail">Overtime and surge staffing</div></div><div class="risk-value">$6K</div></div>
        </div>
        <p><strong>How it works:</strong> 127 Chicago-routed shipments redirect through Kansas City. FastFreight (47 trucks) and Regional Express (32 trucks) confirmed at contract rates. 89 additional trucks on standby if needed.</p>`,
        chips: ["Execute Phase 1", "Available carriers", "Kansas City capacity", "Return to mitigation options"]
    },

    "phase 2: customer outreach": {
        content: `<p><strong>Phase 2: Customer Outreach - Details</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Cost</div><div class="roi-value">$5K</div></div>
            <div class="roi-card positive"><div class="roi-label">Value Protected</div><div class="roi-value green">$380K</div></div>
            <div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value green">76:1</div></div>
            <div class="roi-card"><div class="roi-label">Accounts</div><div class="roi-value">${NUMBERS.priorityCustomers}</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📧 Outreach Components</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Tier 1 Calls (Top 3)</div><div class="risk-detail">Personal calls from account managers</div></div><div class="risk-value">3 accounts</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Tier 2 Emails (Priority)</div><div class="risk-detail">Personalized emails with tracking links</div></div><div class="risk-value">8 accounts</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Tier 3 Notification</div><div class="risk-detail">Proactive status update</div></div><div class="risk-value">12 accounts</div></div>
        </div>
        <p><strong>Why it saves $380K:</strong> Proactive communication triggers SLA waiver clauses, prevents penalty escalation, and protects relationship equity. Templates already approved by Legal.</p>`,
        chips: ["Execute Phase 2", "Draft messages", "Priority customers", "Return to mitigation options"]
    },

    "phase 3: inventory transfer": {
        content: `<p><strong>Phase 3: Inventory Transfer - Details</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Cost</div><div class="roi-value">$12K</div></div>
            <div class="roi-card positive"><div class="roi-label">Value Protected</div><div class="roi-value green">$630K</div></div>
            <div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value green">53:1</div></div>
            <div class="roi-card"><div class="roi-label">SKUs Moved</div><div class="roi-value">847</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📦 Transfer Plan</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Chicago → Kansas City</div><div class="risk-detail">Critical SKUs, 48hr buffer stock</div></div><div class="risk-value">412 SKUs</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Detroit → Indianapolis</div><div class="risk-detail">Auto parts, JIT components</div></div><div class="risk-value">289 SKUs</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Minneapolis → Memphis</div><div class="risk-detail">Overflow and seasonal</div></div><div class="risk-value">146 SKUs</div></div>
        </div>
        <p><strong>Timing:</strong> Transfers can complete within 18 hours. Kansas City has confirmed 40% available capacity.</p>`,
        chips: ["Execute Phase 3", "SKU priority list", "DC capacity status", "Return to mitigation options"]
    },
    
    "show cascade effects": {
        content: `<p>Here's how the disruption cascades through your network over time:</p>
        <div class="viz-timeline">
            <div class="timeline-item"><div class="timeline-marker red"></div><div class="timeline-content"><div class="timeline-time">Hour 0-6</div><div class="timeline-title">Initial Impact</div><div class="timeline-desc">Chicago hub reduces capacity 60%. 47 outbound routes delayed.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker amber"></div><div class="timeline-content"><div class="timeline-time">Hour 6-12</div><div class="timeline-title">Secondary Effects</div><div class="timeline-desc">Detroit and Minneapolis DCs see incoming inventory gaps. Cross-dock timing breaks down.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker amber"></div><div class="timeline-content"><div class="timeline-time">Hour 12-24</div><div class="timeline-title">Customer Impact</div><div class="timeline-desc">${NUMBERS.priorityCustomers} priority customers miss SLA windows. Penalty clauses activate.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker red"></div><div class="timeline-content"><div class="timeline-time">Hour 24-48</div><div class="timeline-title">Full Cascade</div><div class="timeline-desc">Supplier backlog compounds. Recovery timeline extends to 5-7 days without intervention.</div></div></div>
        </div>
        <p><strong>Critical Window:</strong> We have approximately 6 hours before the cascade becomes significantly harder to contain.</p>`,
        chips: ["Mitigation options", "Deep dive: Chicago hub", "Which facilities?", "Return to overview"]
    },
    
    "who approves": {
        content: `<p>Based on your company's approval matrix:</p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📋 Approval Requirements</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Mitigation Cost: ${NUMBERS.mitigationCost}</div><div class="risk-detail">Within Operations Director authority ($50K limit)</div></div><div class="risk-value green">✓ READY</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Carrier Contracts</div><div class="risk-detail">Pre-approved surge capacity agreements</div></div><div class="risk-value cyan">✓ READY</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Customer Comms</div><div class="risk-detail">Template approved by Legal</div></div><div class="risk-value cyan">✓ READY</div></div>
        </div>
        <p><strong>Bottom Line:</strong> You can authorize all three phases immediately. No escalation required. VP notification recommended but not required for this spend level.</p>`,
        chips: ["Execute all phases", "Escalate to VP", "Document decision", "Return to overview"]
    },
    
    "execute all phases": {
        content: `<p><strong>✓ Execution Initiated</strong></p>
        <div class="viz-timeline">
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Phase 1 • IN PROGRESS</div><div class="timeline-title">Regional Bypass</div><div class="timeline-desc">Carrier dispatch initiated. 47/127 routes confirmed. ETA: 2 hours for full activation.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Phase 2 • IN PROGRESS</div><div class="timeline-title">Customer Outreach</div><div class="timeline-desc">Priority notifications queued. Account managers briefed. First calls starting now.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker amber"></div><div class="timeline-content"><div class="timeline-time">Phase 3 • PENDING</div><div class="timeline-title">Inventory Transfer</div><div class="timeline-desc">Awaiting Kansas City capacity confirmation. Expected: 30 minutes.</div></div></div>
        </div>
        <div class="viz-roi-cards">
            <div class="roi-card positive"><div class="roi-label">Protected Value</div><div class="roi-value green" id="dashProtected">${NUMBERS.protected}</div></div>
            <div class="roi-card positive"><div class="roi-label">Status</div><div class="roi-value green">ACTIVE</div></div>
        </div>
        <p>I'll continue monitoring and alert you to any exceptions. Next update in 30 minutes or immediately if issues arise.</p>`,
        chips: ["Monitor progress", "Priority customers", "Board summary", "Return to overview"],
        updateMetrics: true
    },
    
    "roi breakdown": {
        content: `<p><strong>💰 Detailed ROI Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Mitigation Investment</div><div class="roi-value">${NUMBERS.mitigationCost}</div></div>
            <div class="roi-card positive"><div class="roi-label">Value Protected</div><div class="roi-value green">${NUMBERS.protected}</div></div>
            <div class="roi-card positive"><div class="roi-label">Net Benefit</div><div class="roi-value green">$1.685M</div></div>
            <div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value green">${NUMBERS.roi}</div></div>
        </div>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📊 Cost Breakdown</div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Carrier Surge Rates</div><div class="risk-detail">Premium for expedited capacity</div></div><div class="risk-value">$28K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Overtime Labor</div><div class="risk-detail">Kansas City surge staffing</div></div><div class="risk-value">$12K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Transfer Logistics</div><div class="risk-detail">Inventory repositioning</div></div><div class="risk-value">$5K</div></div>
        </div>
        <p>This represents a <strong>3,800% return</strong> on your mitigation investment. Historical data shows similar events without intervention average $1.9M in losses.</p>`,
        chips: ["Execute all phases", "Compare to doing nothing", "Return to overview"]
    },
    
    "which facilities": {
        content: `<p><strong>🏭 Facility Impact Assessment</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">📍 ${NUMBERS.facilitiesAtRisk} Facilities at Risk</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Chicago Hub (Primary)</div><div class="risk-detail">Direct storm path • 60% capacity reduction expected</div></div><div class="risk-value red">CRITICAL</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Detroit DC</div><div class="risk-detail">Secondary impact • Dependent on Chicago inbound</div></div><div class="risk-value amber">HIGH</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Minneapolis DC</div><div class="risk-detail">Storm edge • 30% capacity reduction likely</div></div><div class="risk-value amber">HIGH</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Indianapolis Cross-Dock</div><div class="risk-detail">Timing disruption only • Staff available</div></div><div class="risk-value cyan">MEDIUM</div></div>
        </div>
        <p><strong>Backup Capacity:</strong> Kansas City hub is fully operational with 40% available capacity — sufficient to absorb Chicago overflow.</p>`,
        chips: ["Deep dive: Chicago hub", "Activate Kansas City backup", "Generator status", "Return to overview"]
    },
    
    "available carriers": {
        content: `<p><strong>🚚 Carrier Availability</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">✓ ${NUMBERS.carriersAvailable} Carriers Ready</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">FastFreight LLC</div><div class="risk-detail">47 trucks available • Contract rate: $1.20/mi</div></div><div class="risk-value green">CONFIRMED</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Regional Express</div><div class="risk-detail">32 trucks available • Contract rate: $1.35/mi</div></div><div class="risk-value green">CONFIRMED</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">10 Additional Carriers</div><div class="risk-detail">Combined 89 trucks • Spot rates $1.50-1.80/mi</div></div><div class="risk-value cyan">STANDBY</div></div>
        </div>
        <p>Total capacity: 168 trucks. Required for full mitigation: 127 trucks. <strong>We have 32% buffer capacity.</strong></p>`,
        chips: ["Book carriers", "Rate comparison", "Historical performance", "Return to overview"]
    },
    
    "supplier risks": {
        content: `<p><strong>📦 Supplier Risk Assessment</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">⚠️ 3 Critical Suppliers in Storm Path</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Midwest Components</div><div class="risk-detail">Chicago facility • 48-72hr delay expected</div></div><div class="risk-value red">$280K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">PackRight Materials</div><div class="risk-detail">Gary, IN • Road access uncertain</div></div><div class="risk-value amber">$180K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">TechParts Inc</div><div class="risk-detail">Milwaukee • Backup supplier available</div></div><div class="risk-value cyan">$80K</div></div>
        </div>
        <p><strong>Mitigation Status:</strong> Alternative suppliers identified for all three. Expedited orders can ship from unaffected regions within 24 hours at 12% premium.</p>`,
        chips: ["Deep dive: supplier deliveries", "Contact suppliers", "Alternative sources", "Return to overview"]
    },
    
    "priority customers": {
        content: `<p><strong>👥 ${NUMBERS.priorityCustomers} Priority Accounts at Risk</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🎯 Top Exposure by Customer</div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">TechCorp Industries</div><div class="risk-detail">12 shipments • SLA penalty clause active</div></div><div class="risk-value red">$180K</div></div>
            <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Retail Giant Inc</div><div class="risk-detail">8 shipments • Holiday inventory critical</div></div><div class="risk-value red">$145K</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">AutoParts Direct</div><div class="risk-detail">15 shipments • JIT delivery required</div></div><div class="risk-value amber">$95K</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">20 Additional Accounts</div><div class="risk-detail">Combined exposure</div></div><div class="risk-value cyan">$420K</div></div>
        </div>
        <p><strong>Proactive Outreach:</strong> I've drafted personalized notifications for each Tier 1 account. Ready to send on your approval.</p>`,
        chips: ["Deep dive: customer sla", "Draft customer messages", "Full account list", "Return to overview"]
    },

    "lessons learned": {
        content: `<p><strong>📚 Event Debrief & Improvements</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">✅ What Worked Well</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Early Detection</div><div class="risk-detail">6+ hours advance warning vs industry 2-3 hours</div></div><div class="risk-value green">STRONG</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Pre-positioned Capacity</div><div class="risk-detail">Contract carriers vs spot market scramble</div></div><div class="risk-value green">STRONG</div></div>
            <div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Supplier Diversification</div><div class="risk-detail">Single-source risk for 2 suppliers</div></div><div class="risk-value amber">IMPROVE</div></div>
        </div>
        <p><strong>Recommendation:</strong> Formalize this response as a playbook. Estimated annual value: $4-6M in avoided losses.</p>`,
        chips: ["Create playbook", "Industry comparison", "Technology gaps", "Return to overview"]
    },
    
    "monitor progress": {
        content: `<p><strong>📊 Execution Status Update</strong></p>
        <div class="viz-timeline">
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Phase 1 • 92% COMPLETE</div><div class="timeline-title">Regional Bypass</div><div class="timeline-desc">117/${NUMBERS.routesAtRisk} shipments rerouted. 10 pending final carrier confirmation.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Phase 2 • 100% COMPLETE</div><div class="timeline-title">Customer Outreach</div><div class="timeline-desc">All ${NUMBERS.priorityCustomers} priority accounts notified. 19 acknowledged.</div></div></div>
            <div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Phase 3 • 78% COMPLETE</div><div class="timeline-title">Inventory Transfer</div><div class="timeline-desc">14/18 transfers complete. Kansas City receiving.</div></div></div>
        </div>
        <div class="viz-roi-cards">
            <div class="roi-card positive"><div class="roi-label">Protected (Target)</div><div class="roi-value green">$1.68M</div></div>
            <div class="roi-card positive"><div class="roi-label">On Track</div><div class="roi-value green">96%</div></div>
        </div>
        <p>Two shipments flagged for manual review — both temperature-sensitive. Recommend expedited handling.</p>`,
        chips: ["Handle exceptions", "Customer responses", "Board summary", "Return to overview"]
    },
    
    "board summary": {
        content: `<p><strong>📋 Executive Summary</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Event</div><div class="roi-value">Winter Storm</div></div>
            <div class="roi-card"><div class="roi-label">Exposure</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div>
            <div class="roi-card positive"><div class="roi-label">Protected</div><div class="roi-value green">${NUMBERS.protected}</div></div>
            <div class="roi-card"><div class="roi-label">Investment</div><div class="roi-value">${NUMBERS.mitigationCost}</div></div>
        </div>
        <p><strong>Situation:</strong> Severe winter storm impacting Midwest logistics corridor. ${NUMBERS.routesAtRisk} routes and ${NUMBERS.facilitiesAtRisk} facilities at risk.</p>
        <p><strong>Action:</strong> Activated 3-phase mitigation plan within 2 hours of detection. All phases executing on schedule.</p>
        <p><strong>Outcome:</strong> ${NUMBERS.protected} in losses avoided. ${NUMBERS.roi} ROI on ${NUMBERS.mitigationCost} investment. Customer relationships protected through proactive communication.</p>`,
        chips: ["Share with board", "Export report", "Return to overview"]
    },
    
    "industry comparison": {
        content: `<p><strong>📊 Industry Benchmark Analysis</strong></p>
        <div class="viz-roi-cards">
            <div class="roi-card positive"><div class="roi-label">Your Response Time</div><div class="roi-value green">2 hours</div></div>
            <div class="roi-card"><div class="roi-label">Industry Average</div><div class="roi-value amber">8-12 hours</div></div>
            <div class="roi-card positive"><div class="roi-label">Your Loss Avoidance</div><div class="roi-value green">82%</div></div>
            <div class="roi-card"><div class="roi-label">Industry Average</div><div class="roi-value amber">45-53%</div></div>
        </div>
        <p><strong>Key Differentiators:</strong></p>
        <p>• <strong>Early detection:</strong> 6+ hour advance warning vs industry 2-3 hours<br>• <strong>Pre-positioned capacity:</strong> Contract carriers vs spot market scramble<br>• <strong>Proactive customer comms:</strong> 100% notification vs 30% industry average</p>`,
        chips: ["Best practices", "Lessons learned", "Return to overview"]
    },
    
    "what data is this based on": {
        content: `<p><strong>📊 Data Sources & Methodology</strong></p>
        <div class="viz-risk-matrix">
            <div class="risk-matrix-header">🔗 Connected Data Pillars</div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Operational Data</div><div class="risk-detail">TMS, WMS, fleet tracking • Real-time</div></div><div class="risk-value green">✓ Live</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Geospatial (Esri)</div><div class="risk-detail">Storm tracking, route analysis, facility mapping</div></div><div class="risk-value green">✓ Live</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Third-Party Intelligence</div><div class="risk-detail">NWS weather, traffic feeds, fuel prices</div></div><div class="risk-value green">✓ Live</div></div>
            <div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Partner Ecosystem</div><div class="risk-detail">Carrier capacity, supplier health scores</div></div><div class="risk-value green">✓ Live</div></div>
            <div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Predictive Models</div><div class="risk-detail">Historical patterns, ML forecasting</div></div><div class="risk-value cyan">Updated 6hr</div></div>
        </div>
        <p><strong>Confidence level:</strong> High (85%+) for 48hr window, Medium (70%) for 72hr projections.</p>`,
        chips: ["Confidence & assumptions", "Model accuracy", "Return to overview"]
    },
    
    "return to overview": {
        content: `<p>Here's the current situation summary:</p>
        <div class="viz-roi-cards">
            <div class="roi-card"><div class="roi-label">Exposure at Risk</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div>
            <div class="roi-card"><div class="roi-label">Routes Affected</div><div class="roi-value amber">${NUMBERS.routesAtRisk}</div></div>
            <div class="roi-card"><div class="roi-label">Facilities at Risk</div><div class="roi-value amber">${NUMBERS.facilitiesAtRisk}</div></div>
            <div class="roi-card positive"><div class="roi-label">Mitigation Ready</div><div class="roi-value green">Yes</div></div>
        </div>
        <p>What would you like to explore?</p>`,
        chips: initialChips
    }
};

// Additional template responses
const templateResponses = {
    "export report": { content: `<p><strong>📄 Executive Summary Report</strong></p><p>Report generated with current risk assessment and recommended actions.</p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Report Status</div><div class="roi-value green">Ready</div></div><div class="roi-card"><div class="roi-label">Format</div><div class="roi-value">PDF</div></div></div><p>Click <strong>"Download PDF"</strong> below to save the executive summary.</p>`, chips: ["Download PDF", "Board summary", "Return to overview"] },
    "draft customer messages": { content: `<p><strong>📧 Customer Communication Templates</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📝 Ready-to-Send Messages</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">TechCorp Industries</div><div class="risk-detail">"We're proactively reaching out regarding potential weather-related delays affecting 12 of your scheduled shipments..."</div></div><div class="risk-value green">Ready</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Retail Giant Inc</div><div class="risk-detail">"Given the importance of your holiday inventory, we've activated contingency routing..."</div></div><div class="risk-value green">Ready</div></div></div><p>All templates approved by Legal. Personalized with shipment details and new ETAs.</p>`, chips: ["Send all messages", "Priority customers", "Return to overview"] },
    "full account list": { content: `<p><strong>📋 All ${NUMBERS.priorityCustomers} Priority Accounts</strong></p><p>TechCorp ($180K), Retail Giant ($145K), AutoParts Direct ($95K), plus 20 additional accounts totaling $420K combined exposure.</p>`, chips: ["Priority customers", "Return to overview"] },
    "compare to doing nothing": { content: `<p><strong>Scenario Comparison</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Act Now</div><div class="roi-value green">${NUMBERS.residual} loss</div></div><div class="roi-card"><div class="roi-label">Do Nothing</div><div class="roi-value red">${NUMBERS.totalExposure} loss</div></div><div class="roi-card positive"><div class="roi-label">Savings</div><div class="roi-value green">${NUMBERS.protected}</div></div></div><p><strong>Do nothing scenario:</strong> Full $2.10M exposure realized. 5-7 day recovery. Customer relationships damaged. Potential $8.4M in contract churn.</p>`, chips: ["Execute all phases", "Return to overview"] },
    "activate kansas city backup": { content: `<p><strong>✓ Kansas City Surge Activated</strong></p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Available Capacity</div><div class="roi-value green">40%</div></div><div class="roi-card"><div class="roi-label">Activation Cost</div><div class="roi-value">$28K</div></div><div class="roi-card"><div class="roi-label">Dock Doors Opening</div><div class="roi-value">+12</div></div><div class="roi-card"><div class="roi-label">Temp Workers</div><div class="roi-value">+24</div></div></div><p>Full activation ETA: 2 hours. Kansas City can absorb 70% of Chicago volume within 48 hours.</p>`, chips: ["Monitor progress", "Return to overview"] },
    "staffing contingency": { content: `<p><strong>👥 Staffing Status</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Staff Availability</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Chicago Hub</div><div class="risk-detail">145 FTEs, expecting -47 due to weather/roads</div></div><div class="risk-value red">-32%</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Kansas City (Surge)</div><div class="risk-detail">+24 temp workers called in</div></div><div class="risk-value green">+24</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Detroit DC</div><div class="risk-detail">Secondary impact expected</div></div><div class="risk-value amber">-15</div></div></div>`, chips: ["Which facilities?", "Return to overview"] },
    "generator status": { content: `<p><strong>⚡ Backup Power Status</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">🔋 Generator Readiness</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Chicago Hub</div><div class="risk-detail">Last test: 12 days ago</div></div><div class="risk-value green">94% fuel</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Minneapolis DC</div><div class="risk-detail">Last test: 47 days ago - CHECK NEEDED</div></div><div class="risk-value amber">78% fuel</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Kansas City</div><div class="risk-detail">Last test: 8 days ago</div></div><div class="risk-value green">100% fuel</div></div></div>`, chips: ["Which facilities?", "Return to overview"] },
    "book carriers": { content: `<p><strong>🚚 Carriers Booked</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">FastFreight</div><div class="roi-value green">47 trucks</div></div><div class="roi-card positive"><div class="roi-label">Regional Express</div><div class="roi-value green">32 trucks</div></div><div class="roi-card positive"><div class="roi-label">Surge Carriers</div><div class="roi-value green">48 trucks</div></div><div class="roi-card positive"><div class="roi-label">Total Booked</div><div class="roi-value green">127 trucks</div></div></div><p>All 127 routes covered. Dispatch initiating now.</p>`, chips: ["Monitor progress", "Return to overview"] },
    "rate comparison": { content: `<p><strong>💰 Rate Analysis</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Cost Comparison</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Contract Carriers (FastFreight, Regional)</div><div class="risk-detail">Pre-negotiated surge rates</div></div><div class="risk-value">$1.20-1.35/mi</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Spot Market (Current)</div><div class="risk-detail">Emergency capacity</div></div><div class="risk-value">$1.80/mi</div></div></div><p><strong>Savings:</strong> Using contract carriers saves 33% vs spot market. Total savings: ~$18K on this event.</p>`, chips: ["Book carriers", "Return to overview"] },
    "historical performance": { content: `<p><strong>📈 Carrier Performance History</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">🚚 Last 12 Months</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">FastFreight LLC</div><div class="risk-detail">1,847 shipments</div></div><div class="risk-value green">98% on-time</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Regional Express</div><div class="risk-detail">1,203 shipments</div></div><div class="risk-value green">94% on-time</div></div></div><p>Damage rates: FastFreight 0.2%, Regional Express 0.4%. Both well below industry average of 1.1%.</p>`, chips: ["Book carriers", "Return to overview"] },
    "contact suppliers": { content: `<p><strong>📞 Supplier Outreach Complete</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">✓ Contact Status</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Midwest Components</div><div class="risk-detail">Spoke with ops manager, confirmed 48-72hr delay</div></div><div class="risk-value green">Contacted</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">PackRight Materials</div><div class="risk-detail">Assessing road conditions, will update by noon</div></div><div class="risk-value green">Contacted</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">TechParts Inc</div><div class="risk-detail">Backup supplier already engaged</div></div><div class="risk-value green">Contacted</div></div></div>`, chips: ["Alternative sources", "Supplier risks", "Return to overview"] },
    "alternative sources": { content: `<p><strong>🔄 Alternative Suppliers Identified</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📦 Backup Sources</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Southern Components (Georgia)</div><div class="risk-detail">Can cover 60% of Midwest Components volume</div></div><div class="risk-value">72hr lead, +8%</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Texas Packaging Co</div><div class="risk-detail">Full replacement for PackRight</div></div><div class="risk-value">48hr lead, +5%</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">TechParts Backup (existing)</div><div class="risk-detail">Already qualified secondary source</div></div><div class="risk-value">24hr lead, same cost</div></div></div>`, chips: ["Activate alternatives", "Supplier risks", "Return to overview"] },
    "supplier scorecards": { content: `<p><strong>📊 Supplier Risk Scores</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">🎯 Resilience Assessment</div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Midwest Components</div><div class="risk-detail">Single location, no production redundancy</div></div><div class="risk-value amber">C+</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">PackRight Materials</div><div class="risk-detail">Single location, limited backup inventory</div></div><div class="risk-value amber">C</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">TechParts Inc</div><div class="risk-detail">Dual-sourced, qualified backup</div></div><div class="risk-value green">A-</div></div></div><p><strong>Recommendation:</strong> Post-event, conduct supplier diversification review for C-rated vendors.</p>`, chips: ["Supplier risks", "Lessons learned", "Return to overview"] },
    "handle exceptions": { content: `<p><strong>⚠️ Exception Queue</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">🚨 Items Requiring Attention</div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Shipment #TMP-4521</div><div class="risk-detail">Temperature-sensitive pharmaceuticals, needs climate truck</div></div><div class="risk-value amber">Routing...</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Shipment #TMP-4523</div><div class="risk-detail">Frozen goods for Retail Giant, 4hr window</div></div><div class="risk-value amber">Routing...</div></div></div><p>Specialized dispatch engaged. Climate-controlled trucks from Memphis being redirected. ETA confirmation: 15 minutes.</p>`, chips: ["Monitor progress", "Return to overview"] },
    "document decision": { content: `<p><strong>📋 Decision Documented</strong></p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Decision</div><div class="roi-value">Authorized</div></div><div class="roi-card"><div class="roi-label">Amount</div><div class="roi-value">${NUMBERS.mitigationCost}</div></div><div class="roi-card"><div class="roi-label">Authority</div><div class="roi-value">Ops Director</div></div><div class="roi-card positive"><div class="roi-label">Audit Trail</div><div class="roi-value green">Created</div></div></div><p>Mitigation authorized under Operations Director authority ($50K limit). Full audit trail created with timestamp, rationale, and expected ROI documentation.</p>`, chips: ["Board summary", "Return to overview"] },
    "create playbook": { content: `<p><strong>📖 Playbook Created</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Playbook</div><div class="roi-value green">Created</div></div><div class="roi-card positive"><div class="roi-label">Est. Annual Value</div><div class="roi-value green">$4-6M</div></div></div><p>Weather event response procedure documented based on this response. Includes decision trees, contact lists, carrier agreements, and customer communication templates. Available for future events.</p>`, chips: ["Lessons learned", "Return to overview"] },
    "technology gaps": { content: `<p><strong>🔧 Technology Improvement Opportunities</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">💡 Identified Investments</div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Customer Portal</div><div class="risk-detail">Self-service tracking and notifications</div></div><div class="risk-value">$80K / $200K saved</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Generator IoT</div><div class="risk-detail">Real-time fuel and status monitoring</div></div><div class="risk-value">$25K / $50K saved</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Carrier API Integration</div><div class="risk-detail">Automated dispatch and tracking</div></div><div class="risk-value">$75K / $150K saved</div></div></div><p>Total investment: $180K. Projected annual savings: $400K+. Payback: 5-6 months.</p>`, chips: ["Lessons learned", "Return to overview"] },
    "best practices": { content: `<p><strong>✅ Industry Best Practices Comparison</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Your Performance</div><div class="roi-value green">Top 5%</div></div><div class="roi-card positive"><div class="roi-label">Response Time</div><div class="roi-value green">2 hours</div></div><div class="roi-card positive"><div class="roi-label">Loss Avoidance</div><div class="roi-value green">82%</div></div></div><p><strong>Where you excel:</strong> Early detection, pre-positioned capacity, proactive communications.<br><strong>Opportunity:</strong> Supplier diversification — your main gap vs top performers.</p>`, chips: ["Industry comparison", "Return to overview"] },
    "share with board": { content: `<p><strong>📤 Board Update Sent</strong></p><p>Executive summary shared with leadership team via secure channel. Includes situation overview, actions taken, value protected, and lessons learned.</p>`, chips: ["Board summary", "Return to overview"] },
    "customer responses": { content: `<p><strong>📬 Customer Feedback Summary</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Acknowledged</div><div class="roi-value green">19 of 23</div></div><div class="roi-card positive"><div class="roi-label">Sentiment</div><div class="roi-value green">Very Positive</div></div></div><div class="viz-risk-matrix"><div class="risk-matrix-header">💬 Key Responses</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">TechCorp Industries</div><div class="risk-detail">"Appreciate the heads up. This is exactly the partnership we value."</div></div><div class="risk-value green">👍</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Retail Giant Inc</div><div class="risk-detail">"Thanks for proactive communication. Please keep us updated."</div></div><div class="risk-value green">👍</div></div></div>`, chips: ["Priority customers", "Return to overview"] },
    "escalate to vp": { content: `<p><strong>📤 VP Escalation Sent</strong></p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Escalated To</div><div class="roi-value">VP Operations</div></div><div class="roi-card positive"><div class="roi-label">Response</div><div class="roi-value green">Acknowledged</div></div></div><p>VP response: "Thanks for the visibility. Good call on proactive mitigation. Proceed as planned. Keep me posted on customer reactions."</p><p><strong>Note:</strong> Escalation was optional for this spend level but demonstrates good judgment on high-visibility events.</p>`, chips: ["Execute all phases", "Return to overview"] },
    "confidence & assumptions": { content: `<p><strong>🎯 Model Confidence & Assumptions</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Confidence Levels</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Storm Track</div><div class="risk-detail">NWS data, satellite confirmation</div></div><div class="risk-value green">92%</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Facility Impact</div><div class="risk-detail">Historical correlation + current conditions</div></div><div class="risk-value green">88%</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Financial Estimates</div><div class="risk-detail">Based on historical losses, current contracts</div></div><div class="risk-value cyan">±15%</div></div></div><p><strong>Key Assumption:</strong> Road closures follow historical patterns for this storm intensity.</p>`, chips: ["What data is this based on?", "Return to overview"] },
    "model accuracy": { content: `<p><strong>📊 Historical Model Performance</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Events Predicted</div><div class="roi-value green">8 of 8</div></div><div class="roi-card positive"><div class="roi-label">Accuracy</div><div class="roi-value green">95%</div></div><div class="roi-card positive"><div class="roi-label">Financial Variance</div><div class="roi-value green">±12%</div></div></div><p>Last 8 weather events: 95% prediction accuracy on impact timing and affected facilities. Financial estimates within ±12% of actual outcomes. Model continuously improves with each event.</p>`, chips: ["What data is this based on?", "Return to overview"] },
    "revenue impact": { content: `<p><strong>💰 Revenue Implications</strong></p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Direct Loss Risk</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div><div class="roi-card"><div class="roi-label">Customer Churn Risk</div><div class="roi-value red">$8.4M</div></div><div class="roi-card"><div class="roi-label">Total Risk Exposure</div><div class="roi-value red">$10.5M</div></div></div><p><strong>Strategic Risk:</strong> Beyond immediate losses, TechCorp and Retail Giant have renewal discussions in Q1. A major service failure now puts $8.4M in annual contracts at risk.</p>`, chips: ["Mitigation options", "Priority customers", "Return to overview"] },
    "activate alternatives": { content: `<p><strong>✓ Alternative Suppliers Activated</strong></p><div class="viz-timeline"><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Southern Components</div><div class="timeline-title">Order Placed</div><div class="timeline-desc">60% coverage for Midwest Components. Ships in 24hr from Georgia.</div></div></div><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">Texas Packaging</div><div class="timeline-title">Order Placed</div><div class="timeline-desc">Full PackRight replacement. Ships tomorrow.</div></div></div><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">TechParts Backup</div><div class="timeline-title">Activated</div><div class="timeline-desc">Already qualified. Same-day ship available.</div></div></div></div><p>Premium costs total ~$18K but avoid $540K in supplier-related exposure.</p>`, chips: ["Monitor progress", "Supplier risks", "Return to overview"] },
    "send all messages": { content: `<p><strong>✓ Customer Messages Sent</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Tier 1 Calls</div><div class="roi-value green">Complete</div></div><div class="roi-card positive"><div class="roi-label">Tier 2 Emails</div><div class="roi-value green">Sent</div></div><div class="roi-card positive"><div class="roi-label">Tier 3 Notices</div><div class="roi-value green">Sent</div></div></div><p>All ${NUMBERS.priorityCustomers} priority accounts notified. Account managers standing by for follow-up calls. Tracking notifications will auto-send as shipments reroute.</p>`, chips: ["Customer responses", "Monitor progress", "Return to overview"] },
    "execute phase 1": { content: `<p><strong>✓ Phase 1 Initiated: Regional Bypass</strong></p><div class="viz-timeline"><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">NOW</div><div class="timeline-title">Carrier Dispatch</div><div class="timeline-desc">FastFreight and Regional Express notified. Trucks mobilizing.</div></div></div><div class="timeline-item"><div class="timeline-marker amber"></div><div class="timeline-content"><div class="timeline-time">+30 min</div><div class="timeline-title">Route Confirmation</div><div class="timeline-desc">All 127 routes will have confirmed truck assignments.</div></div></div><div class="timeline-item"><div class="timeline-marker cyan"></div><div class="timeline-content"><div class="timeline-time">+2 hours</div><div class="timeline-title">Full Activation</div><div class="timeline-desc">Kansas City bypass fully operational.</div></div></div></div>`, chips: ["Monitor progress", "Phase 2: Customer outreach", "Return to mitigation options"], updateMetrics: true },
    "execute phase 2": { content: `<p><strong>✓ Phase 2 Initiated: Customer Outreach</strong></p><div class="viz-timeline"><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">NOW</div><div class="timeline-title">Tier 1 Calls Starting</div><div class="timeline-desc">Account managers calling TechCorp, Retail Giant, AutoParts.</div></div></div><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">+15 min</div><div class="timeline-title">Tier 2 Emails</div><div class="timeline-desc">Personalized emails to 8 priority accounts.</div></div></div><div class="timeline-item"><div class="timeline-marker cyan"></div><div class="timeline-content"><div class="timeline-time">+30 min</div><div class="timeline-title">Tier 3 Notifications</div><div class="timeline-desc">Proactive status updates to remaining 12 accounts.</div></div></div></div>`, chips: ["Monitor progress", "Customer responses", "Return to mitigation options"] },
    "execute phase 3": { content: `<p><strong>✓ Phase 3 Initiated: Inventory Transfer</strong></p><div class="viz-timeline"><div class="timeline-item"><div class="timeline-marker green"></div><div class="timeline-content"><div class="timeline-time">NOW</div><div class="timeline-title">Transfer Orders Created</div><div class="timeline-desc">847 SKUs flagged for movement across 3 transfer lanes.</div></div></div><div class="timeline-item"><div class="timeline-marker amber"></div><div class="timeline-content"><div class="timeline-time">+4 hours</div><div class="timeline-title">First Transfers Complete</div><div class="timeline-desc">Chicago → Kansas City critical SKUs arrive.</div></div></div><div class="timeline-item"><div class="timeline-marker cyan"></div><div class="timeline-content"><div class="timeline-time">+18 hours</div><div class="timeline-title">All Transfers Complete</div><div class="timeline-desc">Full inventory pre-positioning achieved.</div></div></div></div>`, chips: ["Monitor progress", "Return to mitigation options"] },
    "execute inventory transfer": { content: `<p><strong>✓ Inventory Transfer Initiated</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Status</div><div class="roi-value green">In Progress</div></div><div class="roi-card"><div class="roi-label">SKUs Moving</div><div class="roi-value">847</div></div><div class="roi-card"><div class="roi-label">ETA Complete</div><div class="roi-value">18 hours</div></div></div>`, chips: ["Monitor progress", "Return to overview"] },
    "kansas city capacity": { content: `<p><strong>📊 Kansas City Hub Status</strong></p><div class="viz-roi-cards"><div class="roi-card positive"><div class="roi-label">Available Capacity</div><div class="roi-value green">40%</div></div><div class="roi-card"><div class="roi-label">Current Staff</div><div class="roi-value">89</div></div><div class="roi-card positive"><div class="roi-label">Surge Ready</div><div class="roi-value green">+24</div></div><div class="roi-card positive"><div class="roi-label">Dock Doors</div><div class="roi-value green">+12 opening</div></div></div><p>Kansas City can absorb 70% of Chicago volume within 48 hours. Full surge activation in 2 hours.</p>`, chips: ["Activate Kansas City backup", "Return to overview"] },
    "inventory levels by dc": { content: `<p><strong>📦 Inventory Levels by DC</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Current Stock Status</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Chicago Hub</div><div class="risk-detail">Critical SKUs at risk of inaccessibility</div></div><div class="risk-value red">Transfer needed</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Detroit DC</div><div class="risk-detail">Safety stock being drawn down</div></div><div class="risk-value amber">72hr buffer</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Kansas City</div><div class="risk-detail">Ready to receive transfers</div></div><div class="risk-value green">40% capacity</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Memphis</div><div class="risk-detail">Unaffected, overflow ready</div></div><div class="risk-value green">Available</div></div></div>`, chips: ["Execute inventory transfer", "Return to overview"] },
    "sku priority list": { content: `<p><strong>📋 SKU Transfer Priority</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">🎯 Critical SKUs for Transfer</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Tier 1: Customer-Critical</div><div class="risk-detail">TechCorp, Retail Giant specific SKUs</div></div><div class="risk-value">124 SKUs</div></div><div class="risk-item"><div class="risk-level high"></div><div class="risk-info"><div class="risk-name">Tier 2: High-Velocity</div><div class="risk-detail">Top 20% by daily movement</div></div><div class="risk-value">288 SKUs</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Tier 3: Buffer Stock</div><div class="risk-detail">Safety stock replenishment</div></div><div class="risk-value">435 SKUs</div></div></div><p>Total: 847 SKUs flagged for transfer. Tier 1 moves first.</p>`, chips: ["Execute inventory transfer", "Return to overview"] },
    "dc capacity status": { content: `<p><strong>🏭 DC Capacity Overview</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Receiving Capacity</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Kansas City</div><div class="risk-detail">Primary overflow destination</div></div><div class="risk-value green">40% available</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Memphis</div><div class="risk-detail">Secondary overflow</div></div><div class="risk-value green">25% available</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Indianapolis</div><div class="risk-detail">Auto parts overflow</div></div><div class="risk-value cyan">15% available</div></div></div>`, chips: ["Execute inventory transfer", "Return to overview"] },
    
    // Map explanation responses
    "what do the lines represent": { content: `<p><strong>🗺️ Map Legend</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">Route & Network Visualization</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Dashed Lines</div><div class="risk-detail">Routes currently at risk due to weather impact</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Blue Dashed Lines</div><div class="risk-detail">Active routes that are currently operational</div></div><div class="risk-value cyan">Active</div></div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Markers</div><div class="risk-detail">Facilities in the storm path or at risk</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Green Markers</div><div class="risk-detail">Backup facilities with available capacity</div></div><div class="risk-value green">Backup</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Red Shaded Area</div><div class="risk-detail">Projected storm impact zone</div></div><div class="risk-value amber">Weather Zone</div></div></div><p>The map synthesizes <strong>Esri geospatial data</strong>, <strong>NOAA weather feeds</strong>, and our <strong>TMS/WMS</strong> to show real-time network status.</p>`, chips: ["Which facilities?", "Show cascade effects", "Return to overview"] },
    "explain the map": { content: `<p><strong>🗺️ Map Legend</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">Route & Network Visualization</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Dashed Lines</div><div class="risk-detail">Routes currently at risk due to weather impact</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Blue Dashed Lines</div><div class="risk-detail">Active routes that are currently operational</div></div><div class="risk-value cyan">Active</div></div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Markers</div><div class="risk-detail">Facilities in the storm path or at risk</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Green Markers</div><div class="risk-detail">Backup facilities with available capacity</div></div><div class="risk-value green">Backup</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Red Shaded Area</div><div class="risk-detail">Projected storm impact zone</div></div><div class="risk-value amber">Weather Zone</div></div></div><p>The map synthesizes <strong>Esri geospatial data</strong>, <strong>NOAA weather feeds</strong>, and our <strong>TMS/WMS</strong> to show real-time network status.</p>`, chips: ["Which facilities?", "Show cascade effects", "Return to overview"] },
    "map legend": { content: `<p><strong>🗺️ Map Legend</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">Route & Network Visualization</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Dashed Lines</div><div class="risk-detail">Routes currently at risk due to weather impact</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level medium"></div><div class="risk-info"><div class="risk-name">Blue Dashed Lines</div><div class="risk-detail">Active routes that are currently operational</div></div><div class="risk-value cyan">Active</div></div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Red Markers</div><div class="risk-detail">Facilities in the storm path or at risk</div></div><div class="risk-value red">At Risk</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Green Markers</div><div class="risk-detail">Backup facilities with available capacity</div></div><div class="risk-value green">Backup</div></div></div>`, chips: ["Which facilities?", "Show cascade effects", "Return to overview"] },
    
    // General freeform questions
    "how does this work": { content: `<p><strong>🧠 How Nexus Works</strong></p><p>Nexus continuously monitors and correlates data from <strong>five pillars</strong>:</p><div class="viz-risk-matrix"><div class="risk-matrix-header">📊 Data Synthesis</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Operational Data</div><div class="risk-detail">TMS, WMS, carrier APIs, inventory systems</div></div><div class="risk-value">Real-time</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Geospatial Intelligence</div><div class="risk-detail">Esri ArcGIS, route optimization, facility mapping</div></div><div class="risk-value">Real-time</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Third-Party Intel</div><div class="risk-detail">NOAA weather, traffic, supplier health</div></div><div class="risk-value">15-min</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Partner Ecosystem</div><div class="risk-detail">Carrier capacity, customer SLAs, contracts</div></div><div class="risk-value">Hourly</div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Predictive Models</div><div class="risk-detail">Cascade effects, exposure modeling, ROI calculation</div></div><div class="risk-value">Continuous</div></div></div><p>The intelligence layer correlates these sources to detect risks <strong>before they impact operations</strong>, quantify exposure, and recommend actions with clear ROI.</p>`, chips: ["What's our biggest risk?", "Show cascade effects", "Return to overview"] },
    "what can you do": { content: `<p><strong>🎯 Nexus Capabilities</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">What I Can Help With</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Risk Detection</div><div class="risk-detail">Identify emerging threats before they impact operations</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Impact Quantification</div><div class="risk-detail">Calculate exposure in dollars, not just alerts</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Mitigation Planning</div><div class="risk-detail">Recommend actions with cost-benefit analysis</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Cascade Modeling</div><div class="risk-detail">Show how one disruption affects entire network</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Decision Support</div><div class="risk-detail">Approval workflows, audit trails, documentation</div></div></div></div><p>Try asking about risks, mitigation options, specific facilities, or customers.</p>`, chips: ["What's our biggest risk?", "Mitigation options", "Return to overview"] },
    "tell me about this scenario": { content: `<p><strong>📋 Current Scenario Overview</strong></p><p>A <strong>severe winter storm</strong> is tracking toward the Midwest corridor, threatening your Chicago hub and surrounding logistics network.</p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Total Exposure</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div><div class="roi-card"><div class="roi-label">Routes Affected</div><div class="roi-value amber">${NUMBERS.routesAtRisk}</div></div><div class="roi-card"><div class="roi-label">Facilities at Risk</div><div class="roi-value amber">${NUMBERS.facilitiesAtRisk}</div></div><div class="roi-card positive"><div class="roi-label">Can Protect</div><div class="roi-value green">${NUMBERS.protected}</div></div></div><p>Nexus has already analyzed the situation by correlating weather data, shipment positions, customer SLAs, and carrier capacity. Mitigation options are ready.</p>`, chips: ["What's our biggest risk?", "Mitigation options", "Who approves?"] },
    "summarize the situation": { content: `<p><strong>📋 Situation Summary</strong></p><p>A winter storm will impact your Midwest operations within 48 hours.</p><div class="viz-roi-cards"><div class="roi-card"><div class="roi-label">Exposure</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div><div class="roi-card"><div class="roi-label">Mitigation Cost</div><div class="roi-value">${NUMBERS.mitigationCost}</div></div><div class="roi-card positive"><div class="roi-label">Can Protect</div><div class="roi-value green">${NUMBERS.protected}</div></div><div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value gold">${NUMBERS.roi}</div></div></div><p><strong>Bottom line:</strong> Spend $45K now to protect $1.73M. Decision is within Operations Director authority.</p>`, chips: ["Execute all phases", "Who approves?", "Return to overview"] },
    "what should i know": { content: `<p><strong>🎯 Key Facts</strong></p><div class="viz-risk-matrix"><div class="risk-matrix-header">Critical Information</div><div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Time Sensitivity</div><div class="risk-detail">Storm impact in ~48 hours, decisions needed now</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">ROI is Clear</div><div class="risk-detail">$45K spend protects $1.73M (38:1 return)</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Authority Exists</div><div class="risk-detail">Operations Director can approve without escalation</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">Resources Ready</div><div class="risk-detail">Kansas City backup, carriers, customer templates prepared</div></div></div></div><p>Nexus has pre-positioned everything. The only decision is whether to execute.</p>`, chips: ["Execute all phases", "Mitigation options", "Return to overview"] },
    "help": { content: `<p><strong>💡 How Can I Help?</strong></p><p>I'm Nexus, your supply chain intelligence assistant. Here are some things you can ask:</p><div class="viz-risk-matrix"><div class="risk-matrix-header">Try These Questions</div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">"What's our biggest risk?"</div><div class="risk-detail">See risk breakdown by category</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">"Mitigation options"</div><div class="risk-detail">View recommended actions with ROI</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">"Show cascade effects"</div><div class="risk-detail">See how disruptions spread</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">"Who approves?"</div><div class="risk-detail">Understand authority levels</div></div></div><div class="risk-item"><div class="risk-level low"></div><div class="risk-info"><div class="risk-name">"Priority customers"</div><div class="risk-detail">Focus on highest-value accounts</div></div></div></div>`, chips: ["What's our biggest risk?", "Mitigation options", "Show cascade effects"] }
};

// Merge template responses
Object.assign(scriptedResponses, templateResponses);


// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeChipText(text) {
    return text.toLowerCase().trim().replace(/[?!.,]/g, '').replace(/['']/g, "'").replace(/\s+/g, ' ');
}

function findResponse(input) {
    const normalized = normalizeChipText(input);
    
    // 1. Check for exact match
    if (scriptedResponses[normalized]) return scriptedResponses[normalized];
    
    // 2. Check keyword mappings
    const mappings = {
        // Core navigation
        "biggest risk": "what's our biggest risk", "top risk": "what's our biggest risk", "main risk": "what's our biggest risk", "primary risk": "what's our biggest risk", "risk": "what's our biggest risk",
        "mitigate": "mitigation options", "mitigation": "mitigation options", "reduce": "mitigation options", "options": "mitigation options", "what can we do": "mitigation options", "protect": "mitigation options",
        "cascade": "show cascade effects", "cascades": "show cascade effects", "ripple": "show cascade effects", "domino": "show cascade effects", "timeline": "show cascade effects",
        "approve": "who approves", "approval": "who approves", "authorize": "who approves", "authority": "who approves", "sign off": "who approves",
        "execute": "execute all phases", "go": "execute all phases", "proceed": "execute all phases", "do it": "execute all phases", "start": "execute all phases", "activate": "execute all phases",
        "overview": "return to overview", "back": "return to overview", "home": "return to overview", "summary": "return to overview", "reset": "return to overview",
        
        // Deep dives
        "chicago": "deep dive: chicago hub", "hub": "deep dive: chicago hub",
        "supplier": "deep dive: supplier deliveries", "suppliers": "deep dive: supplier deliveries", "vendor": "deep dive: supplier deliveries",
        "sla": "deep dive: customer sla", "penalty": "deep dive: customer sla", "penalties": "deep dive: customer sla",
        "inventory": "deep dive: inventory", "stock": "deep dive: inventory",
        
        // Facilities
        "facilities": "which facilities", "facility": "which facilities", "warehouse": "which facilities", "dc": "which facilities", "distribution": "which facilities",
        "kansas": "activate kansas city backup", "kc": "activate kansas city backup", "backup": "activate kansas city backup",
        "generator": "generator status", "power": "generator status",
        "staff": "staffing contingency", "staffing": "staffing contingency", "workers": "staffing contingency",
        
        // Carriers
        "carrier": "available carriers", "carriers": "available carriers", "truck": "available carriers", "trucks": "available carriers", "freight": "available carriers",
        "book carriers": "book carriers", "dispatch": "book carriers",
        "rate comparison": "rate comparison", "carrier rates": "rate comparison", "shipping rates": "rate comparison",
        "carrier performance": "historical performance", "carrier history": "historical performance",
        
        // Customers
        "customer": "priority customers", "customers": "priority customers", "account": "priority customers", "accounts": "priority customers", "client": "priority customers",
        "techcorp": "priority customers", "retail giant": "priority customers", "autoparts": "priority customers",
        "message": "draft customer messages", "email": "draft customer messages", "notify": "draft customer messages", "communication": "draft customer messages",
        "response": "customer responses", "feedback": "customer responses",
        
        // Financial
        "roi": "roi breakdown", "roi breakdown": "roi breakdown", "investment return": "roi breakdown", "money": "roi breakdown", "financial": "roi breakdown",
        "revenue": "revenue impact", "loss": "revenue impact", "losses": "revenue impact",
        "compare": "compare to doing nothing", "do nothing": "compare to doing nothing",
        
        // Progress & monitoring
        "progress": "monitor progress", "execution status": "monitor progress", "monitor": "monitor progress",
        "exception": "handle exceptions", "exceptions": "handle exceptions",
        
        // Board & reporting
        "board": "board summary", "executive": "board summary", "report": "board summary",
        "export": "export report", "pdf": "export report", "download": "export report",
        "share": "share with board",
        
        // Learning & improvement
        "lesson": "lessons learned", "lessons": "lessons learned", "learn": "lessons learned", "improve": "lessons learned", "debrief": "lessons learned",
        "benchmark": "industry comparison", "industry": "industry comparison", "comparison": "industry comparison",
        "technology": "technology gaps", "tech": "technology gaps", "gap": "technology gaps", "gaps": "technology gaps",
        "best practice": "best practices", "practices": "best practices",
        "playbook": "create playbook",
        
        // Data & confidence
        "data": "what data is this based on", "source": "what data is this based on", "sources": "what data is this based on", "methodology": "what data is this based on",
        "confidence": "confidence & assumptions", "assumption": "confidence & assumptions", "assumptions": "confidence & assumptions",
        "accuracy": "model accuracy", "accurate": "model accuracy",
        
        // Phases
        "phase 1": "phase 1: regional bypass", "bypass": "phase 1: regional bypass", "reroute": "phase 1: regional bypass",
        "phase 2": "phase 2: customer outreach", "outreach": "phase 2: customer outreach",
        "phase 3": "phase 3: inventory transfer", "transfer": "phase 3: inventory transfer",
        
        // VP escalation
        "escalate": "escalate to vp", "vp": "escalate to vp",
        
        // Document
        "document": "document decision", "audit": "document decision", "log": "document decision",
        
        // Ambiguous chip mappings (Issue 3 fix) - now with clearer names
        "irreversible": "revenue impact", "what losses": "revenue impact", "long-term revenue": "revenue impact",
        "biggest cascade": "deep dive: chicago hub", "which location": "deep dive: chicago hub", "primary cascade": "deep dive: chicago hub",
        "second-order": "show cascade effects", "second order": "show cascade effects", "downstream": "show cascade effects"
    };
    
    for (const [key, value] of Object.entries(mappings)) {
        if (normalized.includes(key)) return scriptedResponses[value];
    }
    
    return null;
}

function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
}

function updateMetrics() {
    executionStarted = true;
    
    // Update KPI strip in chat panel
    const dashEl = document.getElementById('dashProtected');
    if (dashEl) dashEl.textContent = NUMBERS.protected;
    
    // Update analytics view
    const analyticsEl = document.getElementById('analyticsProtected');
    if (analyticsEl) analyticsEl.textContent = NUMBERS.protected;
}

function addMessage(content, isUser = false, includeProvenance = true) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    // Add provenance to substantive assistant responses
    let finalContent = content;
    if (!isUser && includeProvenance && typeof addProvenanceToResponse === 'function') {
        finalContent = addProvenanceToResponse(content);
    }
    
    // Sanitize HTML to prevent XSS - strict allowlist matching server rules
    const sanitizedContent = typeof DOMPurify !== 'undefined' 
        ? DOMPurify.sanitize(finalContent, {
            ALLOWED_TAGS: ['div', 'p', 'strong', 'b', 'br', 'ul', 'li', 'span'],
            ALLOWED_ATTR: ['class', 'id']
          })
        : finalContent;
    
    msg.innerHTML = `<div class="message-content">${sanitizedContent}</div>`;
    container.appendChild(msg);
    scrollToBottom();
    
    // Increment interaction count for proactive alert timing
    if (isUser) interactionCount++;
    
    return msg;
}

function showTyping() {
    // Remove any existing typing indicator first to prevent duplicates
    hideTyping();
    
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'message assistant';
    typing.id = 'typingIndicator';
    typing.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    container.appendChild(typing);
    scrollToBottom();
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

function updateChips(chips) {
    const grid = document.getElementById('chipsGrid');
    grid.innerHTML = '';
    chips.forEach(chip => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        if (normalizeChipText(chip) === 'return to overview') btn.className += ' overview';
        btn.textContent = chip;
        btn.onclick = () => handleChipClick(chip);
        grid.appendChild(btn);
    });
}


// ============================================
// MAIN HANDLER - Canned first, Claude fallback
// ============================================

async function handleChipClick(chipText) {
    // Handle PDF download chip separately (no message needed)
    if (normalizeChipText(chipText) === 'download pdf') {
        if (typeof window.generatePDF === 'function') {
            window.generatePDF();
        }
        return;
    }
    
    if (isProcessing) return;
    isProcessing = true;
    
    addMessage(chipText, true);
    conversationHistory.push({ role: 'user', content: chipText });
    showTyping();
    
    // Simulate brief delay for natural feel
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    
    // Try to find canned response first
    const response = findResponse(chipText);
    
    if (response) {
        // Found canned response - use it
        hideTyping();
        addMessage(response.content);
        if (response.updateMetrics) updateMetrics();
        updateChips(response.chips || initialChips);
        conversationHistory.push({ role: 'assistant', content: response.content });
        checkAndFlyToLocation(normalizeChipText(chipText));
    } else {
        // No canned response - call Claude API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
            const apiResponse = await fetch('/.netlify/functions/logistics-chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Demo-Token': DEMO_TOKEN
                },
                body: JSON.stringify({
                    message: chipText,
                    conversationHistory: conversationHistory.slice(-10).map(msg => ({
                        role: msg.role,
                        content: msg.content.replace(/<[^>]*>/g, '') // Strip HTML for API
                    }))
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!apiResponse.ok) throw new Error('API request failed');
            
            const data = await apiResponse.json();
            hideTyping();
            
            // Process Claude's response
            let claudeResponse = data.response;
            
            // Wrap plain text in paragraph tags if not already HTML
            if (!claudeResponse.includes('<div') && !claudeResponse.includes('<p>')) {
                claudeResponse = claudeResponse.split('\n\n').map(p => `<p>${p}</p>`).join('');
            }
            
            addMessage(claudeResponse);
            conversationHistory.push({ role: 'assistant', content: claudeResponse });
            
            // Generate contextual follow-up chips based on what was discussed
            const contextualChips = generateContextualChips(chipText, claudeResponse);
            updateChips(contextualChips);
            
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Claude API error:', error);
            hideTyping();
            
            // Graceful fallback - show helpful response with main options
            const fallback = `<p>Let me help you with the key information for this situation.</p>
            <div class="viz-roi-cards">
                <div class="roi-card"><div class="roi-label">Exposure at Risk</div><div class="roi-value red">${NUMBERS.totalExposure}</div></div>
                <div class="roi-card positive"><div class="roi-label">Can Protect</div><div class="roi-value green">${NUMBERS.protected}</div></div>
                <div class="roi-card positive"><div class="roi-label">ROI</div><div class="roi-value green">${NUMBERS.roi}</div></div>
            </div>`;
            addMessage(fallback);
            updateChips(initialChips);
        }
    }
    
    isProcessing = false;
}

// ============================================
// TAXONOMY-DRIVEN CHIP ENGINE (DEPTH-AWARE)
// ============================================

// Engine state - tracks depth and prevents loops
const chipEngineState = {
    used: new Set(),
    lastTopics: [],
    depth: 0
};

// Topic keywords for extraction
const TOPIC_KEYWORDS = {
    geo: ["chicago", "detroit", "minneapolis", "hub", "facility", "site", "region", "corridor", "kansas", "memphis", "indianapolis"],
    cascade: ["cascade", "cascading", "second-order", "knock-on", "downstream", "upstream", "ripple", "domino", "chain"],
    finance: ["cash", "liquidity", "ebitda", "margin", "roi", "loss", "cost", "insurance", "reserve", "revenue", "budget", "investment"],
    ops: ["execute", "dispatch", "carrier", "truck", "route", "reroute", "capacity", "sla", "inventory", "mitigation", "phase"],
    suppliers: ["supplier", "vendor", "tier 1", "tier 2", "procurement", "midwest components", "packright", "techparts"],
    customers: ["customer", "priority", "commitment", "sla", "service level", "techcorp", "retail giant", "autoparts"],
    compliance: ["regulatory", "compliance", "audit", "safety", "policy", "incident", "approval", "authority"],
    confidence: ["confidence", "assumption", "uncertain", "estimate", "data", "model", "accuracy", "source", "methodology"]
};

// Chip catalog organized by topic and minimum depth
const CHIP_CATALOG = [
    // OVERVIEW (Depth 0)
    { text: "What's our biggest risk?", topics: ["overview"], minDepth: 0 },
    { text: "Which facilities?", topics: ["geo", "overview"], minDepth: 0 },
    { text: "Show cascade effects", topics: ["cascade", "overview"], minDepth: 0 },
    { text: "Priority customers", topics: ["customers", "overview"], minDepth: 0 },
    { text: "Mitigation options", topics: ["ops", "overview"], minDepth: 0 },

    // GEO (Depth 1-3)
    { text: "Deep dive: Chicago hub", topics: ["geo"], minDepth: 1 },
    { text: "Deep dive: supplier deliveries", topics: ["suppliers", "ops"], minDepth: 1 },
    { text: "Activate Kansas City backup", topics: ["geo", "ops"], minDepth: 1 },
    { text: "Show upstream vs downstream exposure", topics: ["geo", "cascade"], minDepth: 2 },
    { text: "Primary cascade source", topics: ["geo", "cascade"], minDepth: 2 },

    // CASCADES (Depth 1-4)
    { text: "What fails after transportation?", topics: ["cascade"], minDepth: 1 },
    { text: "Downstream impacts", topics: ["cascade"], minDepth: 2 },
    { text: "Worst-case next 72 hours", topics: ["cascade", "ops"], minDepth: 3 },
    { text: "What if mitigation fails?", topics: ["cascade", "ops"], minDepth: 4 },

    // FINANCE (Depth 2-5)
    { text: "ROI breakdown", topics: ["finance"], minDepth: 2 },
    { text: "Revenue impact", topics: ["finance"], minDepth: 2 },
    { text: "Compare to doing nothing", topics: ["finance"], minDepth: 3 },
    { text: "Long-term revenue impact", topics: ["finance"], minDepth: 4 },

    // OPS (Depth 1-5)
    { text: "Available carriers", topics: ["ops"], minDepth: 1 },
    { text: "Execute all phases", topics: ["ops"], minDepth: 2 },
    { text: "Monitor progress", topics: ["ops"], minDepth: 2 },
    { text: "Phase 1: Regional bypass", topics: ["ops"], minDepth: 3 },
    { text: "Phase 2: Customer outreach", topics: ["ops"], minDepth: 3 },
    { text: "Phase 3: Inventory transfer", topics: ["ops"], minDepth: 3 },

    // SUPPLIERS / CUSTOMERS (Depth 2-4)
    { text: "Supplier risks", topics: ["suppliers"], minDepth: 2 },
    { text: "Contact suppliers", topics: ["suppliers"], minDepth: 3 },
    { text: "Alternative sources", topics: ["suppliers"], minDepth: 3 },
    { text: "Customer SLA exposure", topics: ["customers", "compliance"], minDepth: 3 },
    { text: "Draft customer messages", topics: ["customers", "ops"], minDepth: 3 },

    // GOVERNANCE / TRUST (Depth 1-5)
    { text: "Who approves?", topics: ["compliance"], minDepth: 1 },
    { text: "What assumptions are you making?", topics: ["confidence"], minDepth: 1 },
    { text: "Where are you least confident?", topics: ["confidence"], minDepth: 2 },
    { text: "What data is this based on?", topics: ["confidence"], minDepth: 2 },
    { text: "Board summary", topics: ["compliance", "finance"], minDepth: 4 },
    { text: "Lessons learned", topics: ["confidence", "ops"], minDepth: 4 }
];

// Extract topics from text
function extractTopics(text) {
    const t = (text || "").toLowerCase();
    const topics = new Set();
    for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
        if (words.some(w => t.includes(w))) topics.add(topic);
    }
    return topics;
}

// Only increase depth when entering NEW analytic territory
function maybeIncreaseDepth(activeTopics) {
    const dominated = ["geo", "cascade", "finance", "ops", "suppliers", "customers", "confidence", "compliance"];
    const newTerritory = dominated.filter(t => 
        activeTopics.has(t) && !chipEngineState.lastTopics.includes(t)
    );
    if (newTerritory.length >= 1) {
        chipEngineState.depth = Math.min(5, chipEngineState.depth + 1);
    }
}

// Score chip relevance
function scoreChip(chip, activeTopics) {
    let score = 0;
    if (chip.topics.some(tp => activeTopics.has(tp))) score += 5;
    score += Math.min(3, chip.minDepth);
    if (chip.topics.includes("confidence")) score += 2; // Trust-building boost
    return score;
}

// Generate deep follow-up chips (replaces old keyword matcher)
function generateContextualChips(query, response) {
    const normalizedQuery = normalizeChipText(query);
    const activeTopics = new Set([
        ...extractTopics(query),
        ...extractTopics(response)
    ]);

    // Update depth based on topic movement (not per-turn)
    maybeIncreaseDepth(activeTopics);

    // Track topics for sustained thread
    chipEngineState.lastTopics = [
        ...chipEngineState.lastTopics.slice(-6),
        ...Array.from(activeTopics)
    ];

    const sustainedTopics = new Set([
        ...activeTopics,
        ...chipEngineState.lastTopics
    ]);

    // Filter candidates by depth and unused
    const candidates = CHIP_CATALOG
        .filter(c => c.minDepth <= chipEngineState.depth)
        .filter(c => normalizeChipText(c.text) !== normalizedQuery)
        .filter(c => !chipEngineState.used.has(normalizeChipText(c.text)))
        .map(c => ({ ...c, score: scoreChip(c, sustainedTopics) }))
        .sort((a, b) => b.score - a.score);

    const chips = [];

    // 1) Force a depth-move chip (geo/cascade/finance/ops)
    const depthMove = candidates.find(c =>
        c.topics.some(t => ["geo", "cascade", "finance", "ops", "suppliers", "customers"].includes(t))
    );
    if (depthMove && !chips.includes(depthMove.text)) chips.push(depthMove.text);

    // 2) Force a trust/confidence chip (unless already in confidence territory)
    if (!sustainedTopics.has("confidence")) {
        const trust = candidates.find(c => c.topics.includes("confidence"));
        if (trust && !chips.includes(trust.text)) chips.push(trust.text);
    }

    // 3) Force an action chip if in risk/cascade territory
    if (sustainedTopics.has("cascade") || sustainedTopics.has("ops") || normalizedQuery.includes("risk")) {
        const actionChip = candidates.find(c =>
            normalizeChipText(c.text).includes("execute") ||
            normalizeChipText(c.text).includes("mitigation") ||
            normalizeChipText(c.text).includes("activate")
        );
        if (actionChip && !chips.includes(actionChip.text)) chips.push(actionChip.text);
    }

    // 4) Fill remaining with best-scoring (diversify topics)
    for (const c of candidates) {
        if (chips.length >= 5) break;
        if (chips.includes(c.text)) continue;
        chips.push(c.text);
    }

    // Always include navigation
    if (!chips.includes("Return to overview")) chips.push("Return to overview");

    // Mark as used
    chips.forEach(ch => chipEngineState.used.add(normalizeChipText(ch)));

    return chips.slice(0, 6);
}

// Reset chip engine (called on restart)
function resetChipEngine() {
    chipEngineState.used = new Set();
    chipEngineState.lastTopics = [];
    chipEngineState.depth = 0;
}


// ============================================
// INPUT HANDLERS
// ============================================

async function handleSend() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || isProcessing) return;
    input.value = '';
    await handleChipClick(text);
}

function handleTickerClick(metric) {
    const queries = {
        exposure: "What's our biggest risk?",
        protected: executionStarted ? "Monitor progress" : "Mitigation options",
        facilities: "Which facilities?",
        routes: "Show cascade effects",
        sla: "Priority customers"
    };
    handleChipClick(queries[metric] || "What's our biggest risk?");
}


// ============================================
// PANEL & MODAL HANDLERS
// ============================================

function togglePanel(panel) {
    const el = document.getElementById(`${panel}Panel`);
    const chat = document.getElementById('chatContainer');
    const btn = document.querySelector(`[data-panel="${panel}"]`);
    
    if (!el) return; // Guard against missing elements
    
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        if (chat) chat.classList.remove('panel-left-open');
        if (btn) btn.classList.remove('active');
    } else {
        el.classList.add('active');
        if (chat) chat.classList.add('panel-left-open');
        if (btn) btn.classList.add('active');
    }
}

function closePanel(panel) {
    const el = document.getElementById(`${panel}Panel`);
    const chat = document.getElementById('chatContainer');
    const btn = document.querySelector(`[data-panel="${panel}"]`);
    
    if (el) el.classList.remove('active');
    if (chat) chat.classList.remove('panel-left-open');
    if (btn) btn.classList.remove('active');
}

function showPDFModal() { document.getElementById('pdfModal').classList.add('active'); }
function closePDFModal() { document.getElementById('pdfModal').classList.remove('active'); }

function openMapModal() {
    document.getElementById('mapModal').classList.add('active');
    document.getElementById('mapIframe').src = 'https://www.arcgis.com/apps/instant/basic/index.html?appid=e5af7e78679a4185a0f1b5c7e4e8c22e';
}
function closeMapModal() {
    document.getElementById('mapModal').classList.remove('active');
    document.getElementById('mapIframe').src = 'about:blank';
}

function restartConversation() {
    conversationHistory = [];
    executionStarted = false;
    resetChipEngine(); // Reset the depth-aware chip engine
    document.getElementById('chatMessages').innerHTML = '';
    const dashEl = document.getElementById('dashProtected');
    if (dashEl) dashEl.textContent = '$0';
    
    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage(scriptedResponses.initial.content);
            updateChips(initialChips);
        }, 1000);
    }, 300);
}


// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendBtn').addEventListener('click', handleSend);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                if (overlay.id === 'mapModal') document.getElementById('mapIframe').src = 'about:blank';
            }
        });
    });
    
    // Start with initial message
    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            addMessage(scriptedResponses.initial.content);
            updateChips(initialChips);
        }, 1200);
    }, 500);
});


// ============================================
// MAP INTEGRATION
// ============================================

const locationTriggers = {
    "chicago": { name: "Chicago", lat: 41.8781, lng: -87.6298, zoom: 10 },
    "detroit": { name: "Detroit", lat: 42.3314, lng: -83.0458, zoom: 10 },
    "kansas city": { name: "Kansas City", lat: 39.0997, lng: -94.5786, zoom: 10 },
    "minneapolis": { name: "Minneapolis", lat: 44.9778, lng: -93.2650, zoom: 10 },
    "indianapolis": { name: "Indianapolis", lat: 39.7684, lng: -86.1581, zoom: 10 },
    "memphis": { name: "Memphis", lat: 35.1495, lng: -90.0490, zoom: 10 },
    "st louis": { name: "St. Louis", lat: 38.6270, lng: -90.1994, zoom: 10 }
};

function checkAndFlyToLocation(text) {
    // Check if text contains a location trigger
    for (const [key, loc] of Object.entries(locationTriggers)) {
        if (text.includes(key)) {
            if (window.flyToLocation) {
                window.flyToLocation(loc.name);
            }
            return;
        }
    }
    
    // If "overview" or "return" - zoom out to full view
    if (text.includes('overview') || text.includes('return')) {
        if (window.flyToOverview) {
            window.flyToOverview();
        }
    }
}


// ============================================
// PDF EXPORT
// ============================================

window.generatePDF = function() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        alert('PDF generation is loading. Please try again in a moment.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const title = 'Rebirth Nexus — Risk Impact Brief';
    const timestamp = new Date().toLocaleString();
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${timestamp}`, 20, 33);
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 38, 190, 38);
    
    let y = 50;
    
    // Executive Summary Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Executive Summary', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    const summaryText = 'Severe winter storm system approaching Midwest corridor. Immediate action required to protect logistics network and customer commitments.';
    const summaryLines = doc.splitTextToSize(summaryText, 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 6 + 10;
    
    // Key Metrics Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Key Metrics', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const metrics = [
        ['Exposure at Risk:', NUMBERS.totalExposure],
        ['Routes Affected:', NUMBERS.routesAtRisk.toString()],
        ['Facilities at Risk:', NUMBERS.facilitiesAtRisk.toString()],
        ['Mitigation Cost:', NUMBERS.mitigationCost],
        ['Value Protected:', NUMBERS.protected],
        ['ROI:', NUMBERS.roi]
    ];
    
    metrics.forEach(([label, value]) => {
        doc.setTextColor(80, 80, 80);
        doc.text(label, 25, y);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 80, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
    });
    
    y += 10;
    
    // Mitigation Plan Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Recommended Mitigation Plan', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const phases = [
        'Phase 1: Regional Bypass — Reroute shipments through Kansas City ($28K, saves $720K)',
        'Phase 2: Customer Outreach — Proactive notification to priority accounts ($5K, saves $380K)',
        'Phase 3: Inventory Transfer — Pre-position critical stock at unaffected DCs ($12K, saves $630K)'
    ];
    
    phases.forEach((phase, i) => {
        const phaseLines = doc.splitTextToSize(`${i + 1}. ${phase}`, 165);
        doc.text(phaseLines, 25, y);
        y += phaseLines.length * 5 + 3;
    });
    
    y += 10;
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Confidential — Rebirth Nexus Intelligence Platform', 20, 280);
    doc.text('www.rebirthnexus.ai', 160, 280);
    
    // Save the PDF
    doc.save('Rebirth_Nexus_Risk_Report.pdf');
};


// ============================================
// V13 FEATURES - INTEL FEED
// ============================================

function initIntelFeed() {
    if (feedInitialized) return;
    feedInitialized = true;
    
    const feedContainer = document.getElementById('feedItems');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = '';
    
    INTEL_FEED_EVENTS.forEach((event, index) => {
        setTimeout(() => {
            addFeedItem(event);
        }, event.time * 100); // Stagger appearance
    });
}

function addFeedItem(event) {
    const feedContainer = document.getElementById('feedItems');
    if (!feedContainer) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const item = document.createElement('div');
    item.className = `feed-item ${event.type}`;
    item.innerHTML = `
        <div class="feed-item-time">${timeStr}</div>
        <div class="feed-item-title">${event.title}</div>
        <div class="feed-item-detail">${event.detail}</div>
        <div class="feed-item-meta">
            ${event.tags.map(tag => `<span class="feed-tag ${event.type === 'critical' ? 'red' : event.type === 'warning' ? 'amber' : ''}">${tag}</span>`).join('')}
        </div>
        <div class="feed-actions">
            ${event.actions.map(action => `<button class="feed-action" data-action="${action}" data-asset="${event.asset}">${action}</button>`).join('')}
        </div>
    `;
    
    // Wire up action buttons
    item.querySelectorAll('.feed-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const asset = btn.dataset.asset;
            handleFeedAction(action, asset);
        });
    });
    
    // Click on item to discuss in chat
    item.addEventListener('click', () => {
        handleChipClick(`Tell me about ${event.asset}`);
    });
    
    feedContainer.insertBefore(item, feedContainer.firstChild);
}

function handleFeedAction(action, asset) {
    const actionMap = {
        'View Shipment': `Show details for ${asset}`,
        'Alert Driver': 'Priority customers',
        'Reroute': 'Mitigation options',
        'Notify Customer': 'Draft customer messages',
        'View Route': 'Show cascade effects',
        'Reroute Options': 'Mitigation options',
        'Assign Backup': 'Available carriers',
        'View Fleet': 'Available carriers',
        'View Facility': 'Which facilities?',
        'Contact Supplier': 'Supplier risks',
        'Alt Sources': 'Supplier risks',
        'Contact Customer': 'Priority customers',
        'View Shipments': 'Priority customers',
        'View Details': "What's our biggest risk?"
    };
    
    const chipText = actionMap[action] || action;
    handleChipClick(chipText);
}


// ============================================
// V13 FEATURES - SHIPMENT TABLE
// ============================================

function populateShipmentTable() {
    const tbody = document.getElementById('shipmentTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = SHIPMENTS.map(s => `
        <tr data-shipment="${s.id}">
            <td><strong>${s.id}</strong></td>
            <td>${s.customer}</td>
            <td>${s.contents}</td>
            <td>${s.slaWindow}</td>
            <td>${s.exposure}</td>
            <td><span class="status-badge ${s.status}">${s.status.toUpperCase()}</span></td>
        </tr>
    `).join('');
}

window.handleShipmentClick = function(shipmentId) {
    handleChipClick(`Show details for shipment ${shipmentId}`);
};


// ============================================
// V13 FEATURES - PROACTIVE ALERTS
// ============================================

function startProactiveAlerts() {
    // Random interval between 45-75 seconds
    const scheduleNext = () => {
        const delay = 45000 + Math.random() * 30000;
        proactiveAlertTimer = setTimeout(() => {
            triggerProactiveAlert();
            scheduleNext();
        }, delay);
    };
    scheduleNext();
}

function triggerProactiveAlert() {
    // Don't interrupt if user is typing or processing
    if (isProcessing) return;
    
    // Gate by interaction count AND either execution started or sufficient depth
    if (interactionCount < 2) return;
    if (!executionStarted && chipEngineState.depth < 2) return;
    
    const alerts = [
        {
            message: `<p><strong>🔔 Nexus detected a developing situation:</strong></p>
                <p>Shipment TRK-4558 cargo temperature has dropped to 34°F — approaching critical threshold for vaccine storage.</p>
                <p>Recommend immediate driver contact or reroute to nearest climate-controlled facility.</p>`,
            chips: ['Show details for TRK-4558', 'Mitigation options', 'Priority customers'],
            type: 'weather',
            requiresExecution: false
        },
        {
            message: `<p><strong>🔔 SLA Alert:</strong></p>
                <p>3 TechCorp shipments are now within 2 hours of penalty window. Combined exposure: $180K.</p>
                <p>Customer contact recommended to negotiate SLA waiver or expedite delivery.</p>`,
            chips: ['Draft customer messages', 'Priority customers', 'ROI breakdown'],
            type: 'sla',
            requiresExecution: false
        },
        {
            message: `<p><strong>🔔 Route Update:</strong></p>
                <p>Weather front advancing faster than projected. Chicago Hub impact now estimated at 4 hours (was 6 hours).</p>
                <p>Recommend accelerating Phase 1 rerouting through Kansas City.</p>`,
            chips: ['Phase 1: Regional bypass', 'Deep dive: Chicago hub', 'Which facilities?'],
            type: 'weather',
            isAcceleration: true,
            requiresExecution: false
        },
        {
            message: `<p><strong>🔔 Capacity Alert:</strong></p>
                <p>Kansas City backup facility now at 45% utilization after accepting first wave of diverted shipments.</p>
                <p>Remaining capacity sufficient for projected volume, but monitoring closely.</p>`,
            chips: ['Monitor progress', 'Which facilities?', 'Return to overview'],
            type: 'capacity',
            requiresExecution: true
        }
    ];
    
    // Filter alerts based on execution state to avoid contradictions
    const filteredAlerts = alerts.filter(alert => {
        // Don't show acceleration alerts if mitigation already started
        if (executionStarted && alert.isAcceleration) return false;
        // Don't show capacity status if execution hasn't started
        if (!executionStarted && alert.requiresExecution) return false;
        return true;
    });
    
    // If no valid alerts, skip this cycle
    if (filteredAlerts.length === 0) return;
    
    // Pick a random alert from filtered list
    const alert = filteredAlerts[Math.floor(Math.random() * filteredAlerts.length)];
    
    // Add proactive message to chat with appropriate provenance type
    addProactiveMessage(alert.message + createProvenanceHTML(alert.type || 'general'));
    updateChips(alert.chips);
    
    // Also add to feed
    addFeedItem({
        type: 'warning',
        title: 'Nexus Alert',
        detail: 'New intelligence detected — see chat for details',
        asset: 'NEXUS',
        tags: ['Auto-detected'],
        actions: ['View Details']
    });
}

function addProactiveMessage(content) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'message assistant proactive';
    
    const sanitizedContent = typeof DOMPurify !== 'undefined' 
        ? DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['div', 'p', 'strong', 'b', 'br', 'ul', 'li', 'span'],
            ALLOWED_ATTR: ['class', 'id']
          })
        : content;
    
    msg.innerHTML = `<div class="message-content">${sanitizedContent}</div>`;
    container.appendChild(msg);
    scrollToBottom();
}


// ============================================
// V13 FEATURES - DATA PROVENANCE
// ============================================

function createProvenanceHTML(messageType = 'general') {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Deterministic confidence based on data type (not random)
    const confidenceByType = {
        weather: 92,
        sla: 88,
        supplier: 85,
        capacity: 90,
        financial: 87,
        general: 88
    };
    const confidence = confidenceByType[messageType] || confidenceByType.general;
    
    return `
        <div class="provenance">
            <div class="provenance-label">Data Sources</div>
            <div class="provenance-sources">
                ${DATA_SOURCES.map(src => `<span class="provenance-tag">${src}</span>`).join('')}
            </div>
            <div class="confidence-row">
                <span>Confidence: ${confidence}%</span>
                <span>Updated: ${timeStr}</span>
            </div>
        </div>
    `;
}

// Add provenance to scripted responses that don't have it
function addProvenanceToResponse(content) {
    // Only add provenance to substantive responses (those with viz elements)
    if (content.includes('viz-roi-cards') || content.includes('viz-risk-matrix') || content.includes('viz-timeline')) {
        return content + createProvenanceHTML();
    }
    return content;
}


// ============================================
// V13 INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize v13 features
    setTimeout(() => {
        initIntelFeed();
        populateShipmentTable();
        startProactiveAlerts();
    }, 1000);
});
