# 🔄 UK Government U-Turn Tracker

A satirical, auto-updating tracker of UK government policy reversals. Because someone has to keep count.

**Live at: [uturn.to](https://uturn.to)**

![U-Turn Counter](https://img.shields.io/badge/U--Turns-13-red?style=for-the-badge)
![Days in Power](https://img.shields.io/badge/Days%20in%20Power-559-blue?style=for-the-badge)
![Auto-Updated](https://img.shields.io/badge/Updates-Daily%20at%209am-green?style=for-the-badge)

---

## ✨ Features

- **🔢 Live Counter** - Total U-turns since July 2024
- **🏆 Minister Leaderboard** - Who's responsible for the most reversals
- **⚡ Speed Run Hall of Fame** - Fastest policy reversals
- **📅 Timeline View** - The full chronological horror show
- **🔍 AI News Scanning** - Daily automated updates via Claude API
- **📱 Fully Responsive** - Works on all devices

---

## 🚀 Quick Setup

### 1. Fork this repository

Click the **Fork** button at the top right.

### 2. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. Click **Save**

Your site will be live at: `https://yourusername.github.io/uk-uturn-tracker`

### 3. Set up custom domain (optional)

To use a custom domain like `uturn.to`:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add these DNS records at your registrar:

```
Type  | Name | Value
------|------|------
A     | @    | 185.199.108.153
A     | @    | 185.199.109.153
A     | @    | 185.199.110.153
A     | @    | 185.199.111.153
CNAME | www  | yourusername.github.io
```

4. Create a `CNAME` file in the repo root containing just your domain:
```
uturn.to
```

### 4. Enable automatic daily updates

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key (starts with `sk-ant-`)
5. Click **Add secret**

The GitHub Action will now run daily at 9am UK time, scanning news for new U-turns and automatically updating the site.

---

## 📁 Project Structure

```
uk-uturn-tracker/
├── index.html              # Main page
├── style.css               # Satirical tabloid styling
├── app.js                  # Interactive functionality
├── data/
│   └── uturns.json         # The U-turn database
├── .github/
│   └── workflows/
│       └── daily-scan.yml  # Automated news scanner
└── README.md
```

---

## 📊 Data Format

Each U-turn in `data/uturns.json`:

```json
{
  "id": 1,
  "title": "Winter Fuel Payment",
  "originalPolicy": "Universal payment to all pensioners",
  "reversal": "Means-tested to Pension Credit recipients only",
  "secondReversal": "Expanded to all pensioners earning under £35,000",
  "category": "welfare",
  "minister": "Rachel Reeves",
  "dateAnnounced": "2024-07-29",
  "dateReversed": "2025-06-09",
  "daysToUturn": 315,
  "severity": "major",
  "tags": ["pensioners", "cost-of-living"],
  "summary": "Cut payments to 10 million pensioners, then partially restored after massive backlash."
}
```

---

## 🤖 How Auto-Updates Work

1. **Daily at 9am UK time**, a GitHub Action runs
2. It calls the **Claude API with web search** to scan UK news
3. Claude searches for terms like "UK government U-turn", "Labour reversal", "policy climbdown"
4. If new U-turns are found, they're added to `uturns.json`
5. Changes are auto-committed and the site updates

You can also trigger a manual scan:
- Go to **Actions** → **Daily U-Turn Scan** → **Run workflow**

---

## 🎨 Customization

### Change the styling
Edit `style.css` - it's using CSS custom properties for easy theming:

```css
:root {
    --red-primary: #c41e3a;
    --yellow-accent: #ffd700;
    --ink: #1a1a1a;
    /* etc */
}
```

### Add a U-turn manually
Edit `data/uturns.json` and add a new entry. Make sure to:
- Increment the `id`
- Update `meta.totalCount`
- Update the relevant minister's count in `ministers`

---

## 📝 Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| welfare | 💷 | Benefits, welfare state |
| taxation | 💰 | Tax policy |
| immigration | 🛂 | Immigration, borders |
| justice | ⚖️ | Justice, policing |
| pensions | 👴 | Pension policy |
| business | 🏪 | Business, commerce |
| employment | 👷 | Workers' rights, jobs |
| economy | 📊 | Economic policy |
| equality | 🏳️‍🌈 | Equality, rights |

---

## 📜 License

MIT License - do whatever you want with it, just like the government does with its manifesto.

---

## 🙏 Credits

- Built with pure HTML, CSS, and JavaScript
- Daily updates powered by [Claude API](https://anthropic.com)
- Hosted on [GitHub Pages](https://pages.github.com)
- Inspired by the tireless work of UK political journalists

---

<p align="center">
  <em>"We're not flip-flopping, we're being responsive to changing circumstances"</em>
  <br>
  <sub>— Every government ever</sub>
</p>
