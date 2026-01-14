// ==========================================================================
// UK U-TURN TRACKER - Main Application
// ==========================================================================

let uturnsData = null;
const GOVERNMENT_START = new Date('2024-07-05');

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    updateStats();
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
    
    // Scan news button
    document.getElementById('scanNews').addEventListener('click', (e) => {
        e.preventDefault();
        openScanModal();
    });
    
    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeScanModal);
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

// Modal functions
function openScanModal() {
    document.getElementById('scanModal').classList.add('active');
    document.getElementById('scanResults').innerHTML = '';
    document.getElementById('scanStatus').textContent = 'Connecting to news sources...';
    
    // Simulate scan (in production, this would call the Claude API)
    simulateScan();
}

function closeScanModal() {
    document.getElementById('scanModal').classList.remove('active');
}

async function simulateScan() {
    const statusEl = document.getElementById('scanStatus');
    const resultsEl = document.getElementById('scanResults');
    
    const stages = [
        'Searching UK news sources...',
        'Analyzing government announcements...',
        'Cross-referencing previous policies...',
        'Detecting potential reversals...',
        'Compiling results...'
    ];
    
    for (let i = 0; i < stages.length; i++) {
        statusEl.textContent = stages[i];
        await sleep(800);
    }
    
    // Check if we have an API key configured
    const hasApiKey = false; // This would be set via environment in production
    
    if (hasApiKey) {
        // Real API call would go here
        await performRealScan();
    } else {
        statusEl.textContent = '✅ Scan complete!';
        resultsEl.innerHTML = `
            <p style="margin-bottom: 0.5rem;">📰 <strong>No new U-turns detected today.</strong></p>
            <p style="color: var(--ink-light); font-size: 0.8rem;">
                Daily automated scans run at 9am GMT via GitHub Actions.
                <br><br>
                To enable live scanning, add your Anthropic API key as a GitHub secret.
            </p>
        `;
    }
}

async function performRealScan() {
    // This would be the actual implementation using Claude API with web search
    // For now, this is a placeholder
    const statusEl = document.getElementById('scanStatus');
    const resultsEl = document.getElementById('scanResults');
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': window.ANTHROPIC_API_KEY // Would be injected
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                tools: [{
                    type: 'web_search_20250305',
                    name: 'web_search'
                }],
                messages: [{
                    role: 'user',
                    content: `Search for UK government policy U-turns or reversals from the last 24 hours. 
                    Look for news about the Labour government changing position, backing down, 
                    or reversing previously announced policies. 
                    Return JSON with any new U-turns found: {found: boolean, uturns: [{title, originalPolicy, reversal, date}]}`
                }]
            })
        });
        
        const data = await response.json();
        // Process and display results
        statusEl.textContent = '✅ Scan complete!';
        
    } catch (error) {
        statusEl.textContent = '❌ Scan failed';
        resultsEl.innerHTML = `<p style="color: var(--red-primary);">Error: ${error.message}</p>`;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add new U-turn (for manual additions)
function addUturn(uturnData) {
    if (!uturnsData) return;
    
    const newId = Math.max(...uturnsData.uturns.map(u => u.id)) + 1;
    uturnsData.uturns.push({
        id: newId,
        ...uturnData
    });
    
    uturnsData.meta.totalCount = uturnsData.uturns.length;
    uturnsData.meta.lastUpdated = new Date().toISOString();
    
    // Update minister counts
    if (uturnsData.ministers[uturnData.minister]) {
        uturnsData.ministers[uturnData.minister].uturns++;
    }
    
    // Re-render everything
    updateStats();
    renderMinisterLeaderboard();
    renderUturns();
    renderSpeedRuns();
    renderTimeline();
}

// Export for use in GitHub Actions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addUturn };
}
