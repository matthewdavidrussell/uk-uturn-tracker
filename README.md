# 🔄 UK Government U-Turn Tracker v2

A satirical, auto-updating tracker of UK government policy reversals. Now with live scanning, press coverage, and social feeds.

**Live at: [uturn.to](https://uturn.to)**

![U-Turn Counter](https://img.shields.io/badge/U--Turns-13-red?style=for-the-badge)
![Auto-Updated](https://img.shields.io/badge/Updates-Daily%20at%209am-green?style=for-the-badge)
![Live Scan](https://img.shields.io/badge/Live%20Scan-Enabled-blue?style=for-the-badge)

---

## ✨ Features

### Core Tracker
- **🔢 Live Counter** - Total U-turns since July 2024
- **🏆 Minister Leaderboard** - Who's responsible for the most reversals  
- **⚡ Speed Run Hall of Fame** - Fastest policy reversals
- **📅 Timeline View** - The full chronological horror show
- **🔍 Filter & Sort** - By category, severity, speed

### v2 Additions
- **📰 Press Coverage** - Links to articles covering each U-turn
- **🐦 Political Pulse** - Twitter/X feed of UK political commentary
- **🔍 Live U-Turn Scanner** - Check for new U-turns with one click
- **🤖 Daily Auto-Scan** - GitHub Action runs at 9am UK time
- **📊 Full SEO** - Meta tags, Open Graph, structured data, sitemap

---

## 🔍 Live Scanning

Click **"Check for New U-Turns"** to scan UK news in real-time.

**First time setup:**
1. Click the scan button
2. Enter your Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))
3. Key is stored locally in your browser only

The scanner uses Claude with web search to find policy reversals in the last 48 hours.

---

## 🚀 Quick Setup

### 1. Fork & Clone
```bash
git clone https://github.com/matthewdavidrussell/uk-uturn-tracker.git
cd uk-uturn-tracker
```

### 2. Enable GitHub Pages
- Settings → Pages → Deploy from branch → main / root

### 3. Custom Domain (optional)
Add DNS records pointing to GitHub Pages:
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   yourusername.github.io
```

### 4. Enable Daily Auto-Scan
- Settings → Secrets → Actions → New secret
- Name: `ANTHROPIC_API_KEY`
- Value: Your API key

---

## 📁 Project Structure

```
uk-uturn-tracker/
├── index.html              # Main page with SEO tags
├── style.css               # Tabloid styling
├── app.js                  # Interactive + live scanner
├── data/
│   └── uturns.json         # The U-turn database
├── .github/
│   └── workflows/
│       └── daily-scan.yml  # Daily auto-update
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine config
├── CNAME                   # Custom domain
└── README.md
```

---

## 📊 SEO Features

- **Meta tags** - Title, description, keywords
- **Open Graph** - Facebook/LinkedIn sharing
- **Twitter Cards** - Twitter sharing previews
- **Geo tags** - UK location data
- **Structured data** - Schema.org Dataset + WebSite
- **Sitemap** - For search engines
- **Canonical URL** - Prevents duplicate content

---

## 🐦 Twitter Integration

The tracker embeds:
- Live search for "government u-turn" tweets
- Links to top UK political journalists:
  - Pippa Crerar (Guardian)
  - Beth Rigby (Sky News)
  - Robert Peston (ITV)
  - Steven Swinford (Times)
  - And more...

---

## 📝 Adding U-Turns Manually

Edit `data/uturns.json`:

```json
{
  "id": 14,
  "title": "New Policy Name",
  "originalPolicy": "What they originally said",
  "reversal": "What they changed to",
  "category": "welfare",
  "minister": "Minister Name",
  "dateAnnounced": "2026-01-01",
  "dateReversed": "2026-02-01",
  "daysToUturn": 31,
  "severity": "major",
  "tags": ["tag1", "tag2"],
  "summary": "Witty one-liner about the reversal"
}
```

Don't forget to update `meta.totalCount` and the minister's count in `ministers`.

---

## 📜 License

MIT License - do whatever you want with it, just like the government does with its manifesto.

---

<p align="center">
  <em>"We're not flip-flopping, we're being responsive to changing circumstances"</em>
  <br>
  <sub>— Every government ever</sub>
</p>
