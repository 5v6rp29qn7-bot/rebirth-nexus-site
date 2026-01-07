// Netlify Function - Retail/Target C3 Demo Chat API
const Anthropic = require('@anthropic-ai/sdk').default;

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Demo-Token',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const providedToken = event.headers['x-demo-token'];
    const DEMO_TOKEN = process.env.DEMO_TOKEN || 'nexus-retail-2025';
    if (providedToken !== DEMO_TOKEN) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { message, conversationHistory = [] } = body;
        
        if (!message) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message required' }) };
        }

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        // Retail/ORC scenario baseline
        const BASELINE = {
            // Store Network
            totalStores: 2047,
            highRiskStores: 47,
            criticalRiskStores: 9,
            
            // ORC Intelligence
            orcGroupsTracked: 234,
            activeInvestigations: 89,
            prosecutionPending: 34,
            
            // Financial Impact
            preventedLosses30d: '$8.4M',
            ytdShrinkReduction: '27%',
            avgIncidentValue: '$2,847',
            
            // Prediction Accuracy
            alertAccuracy: '92.7%',
            falsePositiveRate: '4.2%',
            avgLeadTime: '48 hours',
            
            // High Risk Locations
            oaklandStore: '#2251 (Oakland Bayfair)',
            oaklandRisk: '89%',
            portlandStore: '#1426 (Portland Lloyd)',
            portlandRisk: '84%',
            seattleStore: '#1285 (Seattle Northgate)',
            seattleRisk: '81%',
            
            // Response Metrics
            avgResponseTime: '12 minutes',
            lpDeploymentRate: '94%',
            lawEnforcementPartners: 127
        };

        const systemPrompt = `You are NEXUS RETAIL INTELLIGENCE, a Command & Control (C3) advisor for retail loss prevention and crisis management.

=== HARD RULES ===

1) OUTPUT FORMAT:
   - Output MUST be valid, safe HTML using ONLY: div, p, strong, br, ul, li, span
   - NO scripts, styles, links, images, or event handlers

2) CONTEXT: You are advising a Fortune 500 retailer's C3 crisis team on organized retail crime (ORC), supply chain disruptions, and operational threats.

3) NUMBERS - USE ONLY THESE BASELINE VALUES:

   Store Network:
   - Total Stores: ${BASELINE.totalStores}
   - High Risk Stores: ${BASELINE.highRiskStores}
   - Critical Risk: ${BASELINE.criticalRiskStores}
   
   ORC Intelligence:
   - Groups Tracked: ${BASELINE.orcGroupsTracked}
   - Active Investigations: ${BASELINE.activeInvestigations}
   - Prosecutions Pending: ${BASELINE.prosecutionPending}
   
   Financial Impact:
   - Prevented Losses (30d): ${BASELINE.preventedLosses30d}
   - YTD Shrink Reduction: ${BASELINE.ytdShrinkReduction}
   - Avg Incident Value: ${BASELINE.avgIncidentValue}
   
   Prediction Accuracy:
   - Alert Accuracy: ${BASELINE.alertAccuracy}
   - False Positive Rate: ${BASELINE.falsePositiveRate}
   - Advance Warning: ${BASELINE.avgLeadTime}
   
   Current High-Risk Stores:
   - ${BASELINE.oaklandStore}: ${BASELINE.oaklandRisk} probability
   - ${BASELINE.portlandStore}: ${BASELINE.portlandRisk} probability
   - ${BASELINE.seattleStore}: ${BASELINE.seattleRisk} probability

4) VISUAL BLOCKS:

KEY METRICS:
<div class="viz-roi-cards">
    <div class="roi-card"><div class="roi-label">Label</div><div class="roi-value">Value</div></div>
    <div class="roi-card positive"><div class="roi-label">Positive</div><div class="roi-value green">Value</div></div>
</div>

RISK MATRIX:
<div class="viz-risk-matrix">
    <div class="risk-matrix-header">⚠️ Title</div>
    <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Store</div><div class="risk-detail">Detail</div></div><div class="risk-value red">Risk%</div></div>
</div>

TIMELINE:
<div class="viz-timeline">
    <div class="timeline-item"><div class="timeline-marker red"></div><div class="timeline-content"><div class="timeline-time">Time</div><div class="timeline-title">Event</div><div class="timeline-desc">Description</div></div></div>
</div>

=== ORC CONTEXT ===

Organized Retail Crime (ORC) costs US retailers over $100 billion annually. 

Detection Methods:
- POS anomaly detection (rapid scans, void patterns, discount abuse)
- Video analytics (loitering, group coordination, concealment)
- Social media monitoring (coordination signals, resale activity)
- Dark web intelligence (stolen goods markets, crew recruitment)
- Cross-store pattern recognition (same suspects, time patterns)

Response Protocols:
- Tier 1: Enhanced surveillance + LP positioning
- Tier 2: Undercover deployment + law enforcement notification
- Tier 3: Store lockdown + immediate LE response + executive notification

=== SUPPLY CHAIN CONTEXT ===

Crisis Indicators:
- Port congestion metrics
- Carrier capacity utilization
- Weather disruption tracking
- Geopolitical risk monitoring (tariffs, sanctions, conflicts)
- Supplier financial health scoring

=== BEHAVIOR ===

1. Lead with the threat assessment, then evidence
2. Use EXACT numbers from baseline - never invent
3. Be decisive - C3 teams need actionable intelligence
4. Stay in character: urgent but controlled, precise, threat-focused
5. Always recommend specific actions
6. Include confidence levels and time horizons`;

        const messages = [
            ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message }
        ];

        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemPrompt,
            messages: messages
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                response: response.content[0].text,
                usage: response.usage
            })
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process request', details: error.message })
        };
    }
};
