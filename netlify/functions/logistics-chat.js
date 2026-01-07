// Netlify Function - Logistics Demo Chat API
// Converted from Vercel serverless function

const Anthropic = require('@anthropic-ai/sdk').default;

// Helper to fetch with timeout
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
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Demo-Token',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Validate demo token
    const providedToken = event.headers['x-demo-token'];
    const DEMO_TOKEN = process.env.DEMO_TOKEN || 'nexus-demo-2024';
    if (providedToken !== DEMO_TOKEN) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { message, conversationHistory = [] } = body;
        
        if (!message) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message required' }) };
        }

        // Parallel fetch all data sources
        const dataPromises = [];
        let liveDataContext = '\n=== LIVE DATA FEEDS (Real-Time) ===\n';

        // 1. NOAA Weather (Chicago)
        dataPromises.push(
            fetchWithTimeout('https://api.weather.gov/gridpoints/LOT/76,73/forecast')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.properties?.periods?.[0]) {
                        const current = data.properties.periods[0];
                        const next = data.properties.periods[1];
                        return `\n📡 NOAA WEATHER (Chicago Metro):\n- Current: ${current.temperature}°F, ${current.shortForecast}\n- Wind: ${current.windSpeed} ${current.windDirection}\n- Next Period: ${next?.name}: ${next?.temperature}°F, ${next?.shortForecast}\n- Detailed: ${current.detailedForecast}\n`;
                    }
                    return '\n📡 NOAA: Weather data temporarily unavailable. Use scenario baseline.\n';
                })
                .catch(() => '\n📡 NOAA: Weather data temporarily unavailable.\n')
        );

        // 2. NWS Alerts (Illinois, Indiana, Michigan - our corridor)
        dataPromises.push(
            fetchWithTimeout('https://api.weather.gov/alerts/active?area=IL,IN,MI')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.features?.length > 0) {
                        const alerts = data.features.slice(0, 5).map(a => 
                            `- ${a.properties.event}: ${a.properties.headline} (${a.properties.areaDesc})`
                        ).join('\n');
                        return `\n🚨 ACTIVE NWS ALERTS (Midwest Corridor):\n${alerts}\n`;
                    }
                    return '\n✅ No active weather alerts in the Midwest corridor.\n';
                })
                .catch(() => '')
        );

        // 3. USGS Earthquakes (continental US)
        dataPromises.push(
            fetchWithTimeout('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.features?.length > 0) {
                        const significant = data.features.filter(q => q.properties.mag >= 4.0);
                        if (significant.length > 0) {
                            const quakeList = significant.slice(0, 3).map(q => 
                                `- M${q.properties.mag.toFixed(1)} near ${q.properties.place}`
                            ).join('\n');
                            return `\n🌍 USGS SEISMIC (Significant Activity):\n${quakeList}\n`;
                        }
                    }
                    return '\n✅ No significant seismic activity affecting operations.\n';
                })
                .catch(() => '')
        );

        // 4. Open-Meteo Extended Forecast
        dataPromises.push(
            fetchWithTimeout('https://api.open-meteo.com/v1/forecast?latitude=41.88&longitude=-87.63&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7')
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.daily) {
                        const forecast = data.daily.temperature_2m_max.slice(0, 5).map((temp, i) => {
                            const precip = data.daily.precipitation_sum[i];
                            const wind = data.daily.wind_speed_10m_max[i];
                            return `Day ${i+1}: ${Math.round(temp)}°F, ${precip > 0 ? precip.toFixed(1) + 'mm precip' : 'dry'}, wind ${Math.round(wind)}mph`;
                        }).join(' | ');
                        return `\n📊 5-DAY FORECAST: ${forecast}\n`;
                    }
                    return '';
                })
                .catch(() => '')
        );

        // Wait for all data
        const results = await Promise.all(dataPromises);
        liveDataContext += results.filter(r => r).join('');
        liveDataContext += '\n=== END LIVE DATA ===\n';

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        // SCENARIO BASELINE
        const SCENARIO_BASELINE = {
            totalExposure: '$2.10M',
            routesAffected: 127,
            facilitiesAtRisk: 4,
            priorityCustomers: 23,
            carriersAvailable: 12,
            trucksTotal: 168,
            mitigationCost: '$45K',
            valueProtected: '$1.73M',
            residualRisk: '$370K',
            roi: '38:1',
            chicagoExposure: '$890K',
            supplierExposure: '$540K',
            slaExposure: '$420K',
            inventoryExposure: '$250K'
        };

        const systemPrompt = `You are NEXUS INTELLIGENCE: a decisive risk analyst embedded in a live operational command center.

=== HARD RULES (NON-NEGOTIABLE) ===

1) OUTPUT FORMAT:
   - Output MUST be valid, safe HTML using ONLY these tags: div, p, strong, br, ul, li, span
   - NO scripts, NO styles, NO links, NO images, NO iframes
   - NO inline event handlers (no onclick, etc.)

2) NUMBERS - USE ONLY THESE (NEVER INVENT NEW VALUES):
   - Total Exposure: ${SCENARIO_BASELINE.totalExposure}
   - Routes Affected: ${SCENARIO_BASELINE.routesAffected}
   - Facilities at Risk: ${SCENARIO_BASELINE.facilitiesAtRisk}
   - Priority Customers: ${SCENARIO_BASELINE.priorityCustomers}
   - Available Carriers: ${SCENARIO_BASELINE.carriersAvailable} (${SCENARIO_BASELINE.trucksTotal} trucks)
   - Mitigation Cost: ${SCENARIO_BASELINE.mitigationCost}
   - Value Protected: ${SCENARIO_BASELINE.valueProtected}
   - Residual Risk: ${SCENARIO_BASELINE.residualRisk}
   - ROI: ${SCENARIO_BASELINE.roi}
   - Chicago Hub: ${SCENARIO_BASELINE.chicagoExposure} (42%)
   - Supplier Deliveries: ${SCENARIO_BASELINE.supplierExposure} (26%)
   - Customer SLA: ${SCENARIO_BASELINE.slaExposure} (20%)
   - Inventory: ${SCENARIO_BASELINE.inventoryExposure} (12%)

3) VISUAL BLOCKS - EVERY substantive answer MUST include ONE of:
   - viz-roi-cards (for key metrics)
   - viz-risk-matrix (for breakdowns/lists)
   - viz-timeline (for sequences)

4) DEPTH REQUIREMENT - Every answer must open a branch for deeper exploration

${liveDataContext}

=== CURRENT SCENARIO ===

EVENT: Severe winter storm tracking toward Midwest corridor
TIMELINE: Impact within 48 hours
STATUS: Mitigation options ready, awaiting authorization

=== FACILITY DETAILS ===

CHICAGO HUB (Primary) - CRITICAL
- Direct storm path, 60% capacity reduction expected
- Exposure: ${SCENARIO_BASELINE.chicagoExposure}
- Staff: 145 FTEs
- Dependencies: I-90, I-94, I-55 corridors

DETROIT DC - HIGH RISK
- Secondary impact (depends on Chicago inbound)
- Exposure: $340K

MINNEAPOLIS DC - HIGH RISK  
- Storm edge, 30% capacity reduction
- Exposure: $280K

INDIANAPOLIS CROSS-DOCK - MEDIUM
- Timing disruption only
- Exposure: $250K

KANSAS CITY HUB - BACKUP (Operational)
- 40% available capacity
- Can absorb 70% of Chicago overflow
- Activation cost: $28K

=== VISUAL FORMATTING TEMPLATES ===

KEY METRICS (use 2-4 cards):
<div class="viz-roi-cards">
    <div class="roi-card"><div class="roi-label">Label</div><div class="roi-value">Value</div></div>
    <div class="roi-card positive"><div class="roi-label">Good</div><div class="roi-value green">Value</div></div>
</div>

BREAKDOWNS (use class for colors: red, amber, cyan, green):
<div class="viz-risk-matrix">
    <div class="risk-matrix-header">⚠️ Title</div>
    <div class="risk-item"><div class="risk-level critical"></div><div class="risk-info"><div class="risk-name">Name</div><div class="risk-detail">Detail</div></div><div class="risk-value red">$Value</div></div>
</div>

TIMELINES:
<div class="viz-timeline">
    <div class="timeline-item"><div class="timeline-marker red"></div><div class="timeline-content"><div class="timeline-time">Time</div><div class="timeline-title">Title</div><div class="timeline-desc">Description</div></div></div>
</div>

=== BEHAVIOR ===

1. Lead with the decision implication, then evidence
2. Use EXACT numbers from baseline - never round or estimate
3. Be concise and executive-ready
4. Stay in character: confident, analytical, no filler, no apologies
5. Correlate live weather data when relevant
6. Always suggest next exploration paths`;

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
