// ==========================================================================
// UK U-TURN TRACKER v2 - Main Application
// Seamless auto-updating - no user setup required
// ==========================================================================

let uturnsData = null;
const GOVERNMENT_START = new Date('2024-07-05');

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
    
    // Scan buttons - now just show info modal (no API key needed)
    document.getElementById('scanNowBtn').addEventListener('click', showScanInfo);
    document.getElementById('footerScanNews').addEventListener('click', (e) => {
        e.preventDefault();
        showScanInfo();
    });
    
    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeScanModal);
}

// Update last checked timestamp
function updateLastChecked() {
    const el = document.getElementById('lastChecked');
    if (uturnsData && uturnsData.meta.lastUpdated) {
        const lastUpdate = new Date(uturnsData.meta.lastUpdated);
        const now = new Date();
        const diffHours = Math.floor((now - lastUpdate) / 3600000);
        
        if (diffHours < 1) {
            el.textContent = 'Less than 1 hour ago';
        } else if (diffHours < 24) {
            el.textContent = diffHours + ' hours ago';
        } else {
            el.textContent = lastUpdate.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } else {
        el.textContent = 'Daily at 9am UK';
    }
}

// Update statistics
function updateStats() {
    if (!uturnsData) return;
    
    const today = new Date();
    const daysInPower = Math.floor((today - GOVERNMENT_START) / (1000 * 60 * 60 * 24));
    const monthsInPower = daysInPower / 30.44;
    const uturnsPerMonth = (uturnsData.meta.totalCount / monthsInPower).toFixed(1);
    
    const fastestUturn = Math.min(...uturnsData.uturns.map(u => u.daysToUturn));
    
    document.getElementById('totalCount').textContent = uturnsData.meta.totalCount;
    document.getElementById('daysInPower').textContent = daysInPower;
    document.getElementById('uturnsPerMonth').textContent = uturnsPerMonth;
    document.getElementById('fastestUturn').textContent = fastestUturn;
    
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
            <div class="leader-rank">${index === 0 ? 'ð¥' : index === 1 ? 'ð¥' : index === 2 ? 'ð¥' : index + 1}</div>
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
    
    if (filter === 'major') {
        uturns = uturns.filter(u => u.severity === 'major');
    } else if (filter !== 'all') {
        uturns = uturns.filter(u => u.category === filter);
    }
    
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
                        <p class="policy-reversal">â© ${uturn.reversal}</p>
                    </div>
                    <p class="card-summary">"${uturn.summary}"</p>
                </div>
                <div class="card-footer">
                    <span class="card-minister">ðÌ ${uturn.minister}</span>
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
    
    const medals = ['ð¥', 'ð¥', 'ð¥', '4ï¸â£', '5ï¸â£'];
    
    container.innerHTML = fastest.map((uturn, index) => `
        <div class="speed-card">
            <div class="speed-medal">${medals[index]}</div>
            <div class="speed-days">
                ${uturn.daysToUturn}
                <span>days</span>
            </div>
            <div class="speed-info">
                <div class="speed-title">${uturn.title}</div>
                <div class="speed-detail">${formatDate(uturn.dateAnnounced)} â ${formatDate(uturn.dateReversed)}</div>
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
// SCAN INFO MODAL - No API key required!
// ==========================================================================

function showScanInfo() {
    const modal = document.getElementById('scanModal');
    const statusEl = document.getElementById('scanStatus');
    const resultsEl = document.getElementById('scanResults');
    const barEl = document.getElementById('scanBar');
    
    modal.classList.add('active');
    barEl.style.width = '100%';
    
    const lastUpdate = uturnsData ? new Date(uturnsData.meta.lastUpdated) : null;
    const lastUpdateStr = lastUpdate ? lastUpdate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Unknown';
    
    statusEl.textContent = 'â Auto-scanning enabled';
    
    resultsEl.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
                <strong>ð¤ This site updates automatically!</strong>
            </p>
            <p style="margin-bottom: 1rem;">
                Our AI scans UK news sources <strong>every day at 9am</strong> for new government U-turns.
            </p>
            <p style="margin-bottom: 1rem; padding: 0.75rem; background: var(--paper); border: 2px solid var(--ink);">
                ð <strong>Last scan:</strong><br>
                ${lastUpdateStr}
            </p>
            <p style="margin-bottom: 1rem;">
                <strong>Current count: ${uturnsData ? uturnsData.meta.totalCount : '?'} U-turns</strong>
            </p>
            <hr style="margin: 1.5rem 0; border: none; border-top: 2px dashed var(--ink);">
            <p style="font-size: 0.9rem; color: var(--ink-light);">
                ð¢ Want to be notified of new U-turns?
            </p>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                <a href="https://twitter.com/search?q=uk%20government%20u-turn" target="_blank" 
                   style="padding: 0.5rem 1rem; background: var(--ink); color: white; text-decoration: none; font-family: var(--font-mono); font-size: 0.8rem;">
                    Search on X
                </a>
                <a href="https://github.com/matthewdavidrussell/uk-uturn-tracker" target="_blank"
                   style="padding: 0.5rem 1rem; background: var(--ink); color: white; text-decoration: none; font-family: var(--font-mono); font-size: 0.8rem;">
                    Watch on GitHub
                </a>
            </div>
        </div>
    `;
}

function closeScanModal() {
    document.getElementById('scanModal').classList.remove('active');
}
