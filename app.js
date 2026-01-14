// ==========================================================================
// UK U-TURN TRACKER v2 - Main Application
// Now with Live AI-Powered Scanning
// ==========================================================================

let uturnsData = null;
const GOVERNMENT_START = new Date('2024-07-05');
const API_KEY_STORAGE = 'uturn_api_key';
const LAST_SCAN_STORAGE = 'uturn_last_scan';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    updateStats();
    updateLastChecked();
    renderMinisterLeaderboard();
    renderUturns();
    renderSpeedRuns();
    renderTimeline();
});

// Load U-turn data
async function loadData() {
    try {
        const response = await fetch('data/uturns.json');
        uturnsData = await response.json();
        document.getElementById('lastUpdate').textContent = 
            new Date(uturnsData.meta.lastUpdated).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    } catch (error) {
        console.error('Failed to load U-turn data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderUturns(e.target.dataset.filter);
        });
    });
    
    // Sort select
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        renderUturns(activeFilter, e.target.value);
    });
    
    // Scan buttons (header and footer)
    document.getElementById('scanNowBtn').addEventListener('click', startScan);
    document.getElementById('footerScanNews').addEventListener('click', (e) => {
        e.preventDefault();
        startScan();
    });
    
    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeScanModal);
    
    // API key modal
    document.getElementById('saveApiKey').addEventListener('click', saveApiKey);
    document.getElementById('cancelApiKey').addEventListener('click', () => {
        document.getElementById('apiKeyModal').classList.remove('active');
    });
}

// Update last checked timestamp
function updateLastChecked() {
    const lastScan = localStorage.getItem(LAST_SCAN_STORAGE);
    const el = document.getElementById('lastChecked');
    
    if (lastScan) {
        const date = new Date(lastScan);
        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);
        
        if (diffMins < 1) {
            el.textContent = 'Just now';
        } else if (diffMins < 60) {
            el.textContent = `${diffMins} mins ago`;
        } else if (diffMins < 1440) {
            el.textContent = `${Math.floor(diffMins / 60)} hours ago`;
        } else {
            el.textContent = date.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } else {
        el.textContent = 'Never';
    }
}

// Update statistics
function updateStats() {
    if (!uturnsData) return;
    
    const today = new Date();
    const daysInPower = Math.floor((today - GOVERNMENT_START) / (1000 * 60 * 60 * 24));
    const monthsInPower = daysInPower / 30.44;
    const uturnsPerMonth = (uturnsData.meta.totalCount / monthsInPower).toFixed(1);
    
    // Find fastest U-turn
    const fastestUturn = Math.min(...uturnsData.uturns.map(u => u.daysToUturn));
    
    document.getElementById('totalCount').textContent = uturnsData.meta.totalCount;
    document.getElementById('daysInPower').textContent = daysInPower;
    document.getElementById('uturnsPerMonth').textContent = uturnsPerMonth;
    document.getElementById('fastestUturn').textContent = fastestUturn;
    
    // Animate counter
    animateCounter('totalCount', uturnsData.meta.totalCount);
}

// Animate counter number
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Render minister leaderboard
function renderMinisterLeaderboard() {
    if (!uturnsData) return;
    
    const container = document.getElementById('ministerLeaderboard');
    const ministers = Object.entries(uturnsData.ministers)
        .sort((a, b) => b[1].uturns - a[1].uturns);
    
    container.innerHTML = ministers.map(([name, data], index) => `
        <div class="leader-card">
            <div class="leader-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</div>
            <div class="leader-info">
                <div class="leader-name">${name}</div>
                <div class="leader-role">${data.role}</div>
            </div>
            <div class="leader-count">
                ${data.uturns}
                <span class="leader-count-label">U-turns</span>
            </div>
        </div>
    `).join('');
}

// Render U-turn cards
function renderUturns(filter = 'all', sort = 'recent') {
    if (!uturnsData) return;
    
    let uturns = [...uturnsData.uturns];
    
    // Apply filter
    if (filter === 'major') {
        uturns = uturns.filter(u => u.severity === 'major');
    } else if (filter !== 'all') {
        uturns = uturns.filter(u => u.category === filter);
    }
    
    // Apply sort
    switch (sort) {
        case 'recent':
            uturns.sort((a, b) => new Date(b.dateReversed) - new Date(a.dateReversed));
            break;
        case 'fastest':
            uturns.sort((a, b) => a.daysToUturn - b.daysToUturn);
            break;
        case 'slowest':
            uturns.sort((a, b) => b.daysToUturn - a.daysToUturn);
            break;
    }
    
    const container = document.getElementById('uturnsGrid');
    container.innerHTML = uturns.map(uturn => {
        const category = uturnsData.categories[uturn.category];
        return `
            <article class="uturn-card ${uturn.severity}">
                <div class="card-header">
                    <span class="card-category">${category.emoji} ${category.name}</span>
                    <span class="card-days">${uturn.daysToUturn} days</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${uturn.title}</h3>
                    <div class="card-policy">
                        <span class="policy-label">Original Position</span>
                        <p class="policy-original">${uturn.originalPolicy}</p>
                        <span class="policy-label">U-Turn</span>
                        <p class="policy-reversal">↩ ${uturn.reversal}</p>
                        ${uturn.secondReversal ? `
                            <span class="policy-label">Double U-Turn</span>
                            <p class="policy-reversal">↩↩ ${uturn.secondReversal}</p>
                        ` : ''}
                    </div>
                    <p class="card-summary">"${uturn.summary}"</p>
                </div>
                <div class="card-footer">
                    <span class="card-minister">📌 ${uturn.minister}</span>
                    <span class="card-date">${formatDate(uturn.dateReversed)}</span>
                </div>
            </article>
        `;
    }).join('');
}

// Render speed run hall of fame
function renderSpeedRuns() {
    if (!uturnsData) return;
    
    const container = document.getElementById('speedRuns');
    const fastest = [...uturnsData.uturns]
        .sort((a, b) => a.daysToUturn - b.daysToUturn)
        .slice(0, 5);
    
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    
    container.innerHTML = fastest.map((uturn, index) => `
        <div class="speed-card">
            <div class="speed-medal">${medals[index]}</div>
            <div class="speed-days">
                ${uturn.daysToUturn}
                <span>days</span>
            </div>
            <div class="speed-info">
                <div class="speed-title">${uturn.title}</div>
                <div class="speed-detail">${formatDate(uturn.dateAnnounced)} → ${formatDate(uturn.dateReversed)}</div>
            </div>
        </div>
    `).join('');
}

// Render timeline
function renderTimeline() {
    if (!uturnsData) return;
    
    const container = document.getElementById('timeline');
    const sorted = [...uturnsData.uturns]
        .sort((a, b) => new Date(a.dateReversed) - new Date(b.dateReversed));
    
    container.innerHTML = sorted.map(uturn => `
        <div class="timeline-item">
            <div class="timeline-date">${formatDate(uturn.dateReversed)}</div>
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-title">${uturn.title}</div>
            </div>
        </div>
    `).join('');
}

// Format date helper
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// ==========================================================================
// LIVE SCANNING FUNCTIONALITY
// ==========================================================================

function startScan() {
    const apiKey = localStorage.getItem(API_KEY_STORAGE);
    
    if (!apiKey) {
        // Show API key setup modal
        document.getElementById('apiKeyModal').classList.add('active');
        return;
    }
    
    // Open scan modal and begin
    openScanModal();
    performLiveScan(apiKey);
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    
    if (key && key.startsWith('sk-ant-')) {
        localStorage.setItem(API_KEY_STORAGE, key);
        document.getElementById('apiKeyModal').classList.remove('active');
        input.value = '';
        
        // Now start the scan
        openScanModal();
        performLiveScan(key);
    } else {
        alert('Please enter a valid Anthropic API key (starts with sk-ant-)');
    }
}

function openScanModal() {
    document.getElementById('scanModal').classList.add('active');
    document.getElementById('scanResults').innerHTML = '';
    document.getElementById('scanBar').style.width = '0%';
    document.getElementById('scanStatus').textContent = 'Initializing...';
    document.getElementById('scanNowBtn').classList.add('scanning');
}

function closeScanModal() {
    document.getElementById('scanModal').classList.remove('active');
    document.getElementById('scanNowBtn').classList.remove('scanning');
}

async function performLiveScan(apiKey) {
    const statusEl = document.getElementById('scanStatus');
    const resultsEl = document.getElementById('scanResults');
    const barEl = document.getElementById('scanBar');
    
    try {
        // Update progress
        barEl.style.width = '20%';
        statusEl.textContent = 'Connecting to Claude API...';
        await sleep(500);
        
        barEl.style.width = '40%';
        statusEl.textContent = 'Searching UK news sources...';
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                tools: [{
                    type: 'web_search_20250305',
                    name: 'web_search'
                }],
                messages: [{
                    role: 'user',
                    content: `You are tracking UK government policy U-turns. Search for any NEW policy reversals, climbdowns, or U-turns announced by the UK Labour government in the last 48 hours.

Search for: "UK government U-turn" OR "Labour reversal" OR "Starmer backs down" OR "policy climbdown"

After searching, analyze if there are any GENUINE new U-turns (not ones already known like: Winter Fuel Payment, Two-Child Cap, Farm Tax, PIP cuts, Digital ID, Grooming Gangs inquiry, WASPI, NI freeze, Pub rates, Employment rights, Fiscal rules, Trans definition, Employer NI).

Respond with ONLY valid JSON:
{
  "found": true/false,
  "scanTime": "${new Date().toISOString()}",
  "uturns": [
    {
      "title": "Short title",
      "originalPolicy": "What they said before",
      "reversal": "What they changed to",
      "category": "welfare|taxation|immigration|justice|pensions|business|employment|economy|equality",
      "minister": "Name of minister",
      "dateReversed": "YYYY-MM-DD",
      "summary": "One witty sentence",
      "source": "URL"
    }
  ],
  "recentNews": "Brief summary of any relevant political news even if not a U-turn"
}`
                }]
            })
        });
        
        barEl.style.width = '70%';
        statusEl.textContent = 'Analyzing search results...';
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        barEl.style.width = '90%';
        statusEl.textContent = 'Processing findings...';
        
        // Extract text from response
        let resultText = '';
        for (const block of data.content) {
            if (block.type === 'text') {
                resultText += block.text;
            }
        }
        
        // Try to parse JSON from response
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        
        barEl.style.width = '100%';
        
        if (jsonMatch) {
            try {
                const results = JSON.parse(jsonMatch[0]);
                
                // Update last scan time
                localStorage.setItem(LAST_SCAN_STORAGE, new Date().toISOString());
                updateLastChecked();
                
                if (results.found && results.uturns && results.uturns.length > 0) {
                    statusEl.textContent = `🚨 Found ${results.uturns.length} potential new U-turn(s)!`;
                    resultsEl.innerHTML = results.uturns.map(u => `
                        <div class="found-uturn">
                            <strong>📰 ${u.title}</strong><br>
                            <small>${u.summary}</small><br>
                            ${u.source ? `<a href="${u.source}" target="_blank">Read more →</a>` : ''}
                        </div>
                    `).join('');
                    
                    if (results.recentNews) {
                        resultsEl.innerHTML += `<p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc;"><strong>📋 Other news:</strong> ${results.recentNews}</p>`;
                    }
                } else {
                    statusEl.textContent = '✅ No new U-turns detected!';
                    resultsEl.innerHTML = `
                        <p class="no-uturn">All quiet on the policy front... for now.</p>
                        ${results.recentNews ? `<p style="margin-top: 1rem;"><strong>📋 Recent political news:</strong> ${results.recentNews}</p>` : ''}
                    `;
                }
            } catch (parseErr) {
                statusEl.textContent = '✅ Scan complete';
                resultsEl.innerHTML = `<p>Analysis complete. No structured results available.</p><p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">${resultText.substring(0, 500)}...</p>`;
            }
        } else {
            statusEl.textContent = '✅ Scan complete';
            resultsEl.innerHTML = `<p>${resultText.substring(0, 500)}...</p>`;
        }
        
    } catch (error) {
        barEl.style.width = '100%';
        statusEl.textContent = '❌ Scan failed';
        
        if (error.message.includes('401') || error.message.includes('403')) {
            resultsEl.innerHTML = `
                <p style="color: var(--red-primary);">API key invalid or expired.</p>
                <button onclick="localStorage.removeItem('${API_KEY_STORAGE}'); location.reload();" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
                    Reset API Key
                </button>
            `;
        } else {
            resultsEl.innerHTML = `<p style="color: var(--red-primary);">Error: ${error.message}</p>`;
        }
    }
    
    document.getElementById('scanNowBtn').classList.remove('scanning');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Refresh last checked every minute
setInterval(updateLastChecked, 60000);
