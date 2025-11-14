# 🌌 Stellar Atlas  
An interactive 3D star-navigation experience built with **Three.js**.

Stellar Atlas allows users to explore a realistic 3D map of nearby stars, click on any star to view detailed astrophysical information, and smoothly fly through space using cinematic camera motion. The project features a polished UI, search tools, star portraits, glowing effects, and real star data.

---

## ✨ Features

### ⭐ Interactive 3D Starfield
- Fully 3D star environment rendered using **Three.js**
- Background stars for depth and immersion
- Stars positioned using scaled XYZ coordinates from real astrophysical data
- Color, size, and glow automatically determined by spectral class (O, B, A, F, G, K, M, White Dwarfs)

### 🧭 Cinematic Navigation
- Click any star to initiate an animation that:
  - Curves the camera along a **Catmull–Rom spline**
  - Slows down using an ease-out motion curve
  - Stops at a fixed orbiting distance from the star
  - Auto-rotates and settles viewpoint onto the target  
- Glow intensity changes dynamically based on camera distance

### 🔍 Search System
- Type `/` anywhere to instantly focus the search bar  
- Live-filter star search with ranked results  
- Select star results to instantly fly to that star  
- Search box auto-hides when not in use  

### 📄 Detailed Star Information Panel
The info panel displays:
- Star name  
- Portrait image based on spectral class  
- Spectral type  
- Distance (light years)  
- Temperature (K)  
- Radius (in solar radii)  
- Luminosity (in solar luminosities)  
- Mass (in solar masses)  
- Exoplanet list (if present)  
- Description text (if included in dataset)

Portraits are loaded from `star_images/`, with graceful fallback behavior if an image is missing.

### 🎨 Clean Modern UI
- Title screen with fade-out animation  
- Glassmorphism-style search bar and info panel  
- Smooth hover interactions and transitions  
- Blurred backgrounds and subtle shadows  

### 📁 Modular Codebase
- `index.html` — UI, layout, and all styling  
- `main.js` — 3D scene, star logic, camera animation, search system  
- `stars.json` — star dataset  
- `star_images/` — portrait images for each spectral class  

---

## 🧬 How It Works

### 1. **Star Loading**
The app fetches `stars.json`, then:
- Converts each star's (x, y, z) to 3D coordinates  
- Calculates size using spectral class  
- Chooses color & glow intensity  
- Creates a glow sprite behind every star  
- Adds the star to:
  - The scene  
  - A searchable index  
  - A clickable list for raycasting  

### 2. **Interaction System**
The Raycaster tracks mouse clicks:
- Click → detect star → trigger `flyToStar()`

### 3. **Camera Flight Path**
`flyToStar()`:
- Disables OrbitControls  
- Computes the flight curve  
- Animates the camera along the curve  
- Begins a “settling rotation” phase  
- Shows the info panel  

### 4. **Search**
- As the user types, results are filtered and rendered  
- Selecting a suggestion calls `goToStar()`  
- ESC closes the menu  

---

## 📁 Project Structure
