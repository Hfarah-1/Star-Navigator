# ⭐ Stellar Atlas

Star Navigator is an interactive 3D space-exploration tool built with **Three.js**. It lets users explore nearby stars in a realistic 3D environment, view detailed information, and smoothly navigate through space with intuitive controls.

---

## 🚀 Overview

Star Navigator visualizes stars using actual astronomical data (name, coordinates, distance, spectral class). Users can click a star to view information, fly toward it, and rotate around it in a smooth, immersive experience.

The project focuses on making astronomy more accessible and engaging, especially for younger learners and beginners who want to explore space interactively.

---

## ✨ Features

### 🌌 3D Star Rendering
- Stars rendered in 3D based on x, y, z coordinates  
- Colors determined by spectral class (O, B, A, F, G, K, M)  
- Realistic distance scaling for navigation  

### 🛰️ Interactive Star Selection
- Click any star to see:
  - Name  
  - Distance (light years)  
  - Spectral class  
  - RA / Dec coordinates  
- Camera flies smoothly toward the target star  
- “Settling” animation aligns the camera for a clean view  

### 🎮 Camera Controls
- Full **OrbitControls** support  
- Smooth zoom, rotate, and pan  
- Raycasting for precise star selection  

### 🖼️ Star Images
- Automatically displays an image based on spectral class  
- Fallback “image unavailable” icon if missing  

### 🧩 Modular Code Structure
- `index.html` sets up the UI  
- `main.js` handles 3D scene, navigation, and interaction  
- Star data loaded from `stars.json`  
- Easily expandable — add more stars or datasets anytime  

---
