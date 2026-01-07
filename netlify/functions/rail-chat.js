// Netlify Function - Rail Demo Chat API
const Anthropic = require('@anthropic-ai/sdk').default;

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

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
    const DEMO_TOKEN = process.env.DEMO_TOKEN || 'nexus-rail-2025';
    if (providedToken !== DEMO_TOKEN) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { message, conversationHistory = [] } = body;
        
        if (!message) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message required' }) };
        }

        // Fetch live weather data for rail corridors
        const dataPromises = [];
        let liveDataContext = '\n=== LIVE DATA FEEDS ===\n';

        // Weather for Chicago (major rail hub)
        dataPromises.push(
            fetchWithTimeout('https://api.weather.gov/gridpoints/LOT/76,73/forecast')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.properties?.periods?.[0]) {
                        const current = data.properties.periods[0];
                        return `\n🌡️ CHICAGO HUB WEATHER: ${current.temperature}°F, ${current.shortForecast}, Wind: ${current.windSpeed}\n`;
                    }
                    return '';
                })
                .catch(() => '')
        );

        // NWS Alerts for rail corridors
        dataPromises.push(
            fetchWithTimeout('https://api.weather.gov/alerts/active?area=IL,IN,OH,PA,NY')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.features?.length > 0) {
                        const alerts = data.features.slice(0, 3).map(a => 
                            `- ${a.properties.event}: ${a.properties.headline}`
                        ).join('\n');
                        return `\n🚨 RAIL CORRIDOR ALERTS:\n${alerts}\n`;
                    }
                    return '\n✅ No active weather alerts on main corridors.\n';
                })
                .catch(() => '')
        );

        const results = await Promise.all(dataPromises);
        liveDataContext += results.filter(r => r).join('');
        liveDataContext += '\n=== END LIVE DATA ===\n';

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        // Rail-specific scenario baseline
        const BASELINE = {
            totalAssets: '12,847 railcars',
            activeAlerts: 23,
            maintenanceScheduled: 156,
            onTimePerformance: '94.2%',
            weatherImpactedRoutes: 7,
            derailmentRisk: '0.003%',
            // Chicago Hub
            chicagoYardCapacity: '87%',
            chicagoDwellTime: '18.4 hours',
            // Network
            totalMileage: '4,200 miles',
            interchangePartners: 6,
            avgTransitTime: '4.2 days',
            // Maintenance
            wheelDefects: 34,
            bearingAlerts: 12,
            brakeIssues: 8,
            structuralConcerns: 5
        };

        const systemPrompt = `You are NEXUS RAIL INTELLIGENCE, a predictive analytics advisor for Class I Railroad operations.

=== HARD RULES ===

1) OUTPUT FORMAT:
   - Output MUST be valid, safe HTML using ONLY: div, p, strong, br, ul, li, span
   - NO scripts, styles, links, images, or event handlers

2) NUMBERS - USE ONLY THESE BASELINE VALUES:
   Fleet: ${BASELINE.totalAssets}
   Active Alerts: ${BASELINE.activeAlerts}
   Maintenance Scheduled: ${BASELINE.maintenanceScheduled}
   On-Time Performance: ${BASELINE.onTimePerformance}
   Weather-Impacted Routes: ${BASELINE.weatherImpactedRoutes}
   
   Chicago Hub:
   - Yard Capacity: ${BASELINE.chicagoYardCapacity}
   - Average Dwell Time: ${BASELINE.chicagoDwellTime}
   
   Network:
   - Total Network: ${BASELINE.totalMileage}
   - Interchange Partners: ${BASELINE.interchangePartners}
   - Avg Transit Time: ${BASELINE.avgTransitTime}
   
   Maintenance Queue:
   - Wheel Defects: ${BASELINE.wheelDefects}
   - Bearing Alerts: ${BASELINE.bearingAlerts}
   - Brake Issues: ${BASELINE.brakeIssues}
   - Structural: ${BASELINE.structuralConcerns}

3) VISUAL BLOCKS:

KEY METRICS:
<div class="viz-roi-cards">
    <div class="roi-card"><div class="roi-label">Label</div><div class="roi-value">Value</div></div>
</div>

RISK MATRIX:
<div class="viz-risk-matrix">
    <div class="risk-matrix-header">Title</div>
    <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Name</div><div class="risk-detail">Detail</div></div><div class="risk-value red">Value</div></div>
</div>

${liveDataContext}

=== RAIL CONTEXT ===

Key Corridors: Chicago-NY, Chicago-LA, Chicago-Houston, Chicago-Seattle
Major Yards: Chicago (Clearing), Kansas City, Memphis, Atlanta
Commodities: Intermodal (42%), Coal (18%), Chemicals (15%), Grain (12%), Auto (8%)

FRA Safety Requirements: Wheel impact load detectors, hot bearing detectors, dragging equipment detectors
Positive Train Control (PTC): 100% implemented on required routes
Crew Hours of Service: 12-hour maximum, 10-hour rest required

=== BEHAVIOR ===

1. Lead with operational impact, then evidence
2. Use EXACT numbers from baseline
3. Be concise - operations managers need quick answers
4. Stay in character: authoritative, precise, safety-conscious
5. Correlate weather data when relevant to track conditions
6. Always suggest follow-up actions`;

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
                dataSources: results.filter(r => r).length,
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
