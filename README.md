# 🚘 Hyundai Car Show Room

<p align="center">

<img src="https://img.shields.io/badge/Automotive-Showroom-E4002B?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Modern-UI%2FUX-111827?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Responsive-Design-2563EB?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Car-Comparison-7C3AED?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Test%20Drive-Booking-059669?style=for-the-badge"/>
<img src="https://img.shields.io/badge/2026-Premium-0F172A?style=for-the-badge"/>

</p>

<h2 align="center">
🚘 A Modern Hyundai Car Buying Experience
</h2>

<p align="center">
A modern and responsive Hyundai Car Showroom website designed to deliver a premium digital car-buying experience — from discovering vehicles and comparing specifications to checking pricing, booking test drives, and submitting enquiries.
</p>

<p align="center">
<b>Explore • Compare • Configure • Book • Experience</b>
</p>

---

## 📖 Overview

**Hyundai Car Show Room** is a premium automotive web experience focused on making vehicle discovery and customer interaction simple, modern, and engaging.

Users can explore Hyundai models, view detailed vehicle specifications, compare cars, check pricing information, book test drives, and submit enquiries through a responsive interface with smooth animations and modern UI/UX.

The project is structured as a complete showroom experience rather than a simple car-listing page.

---

# ✨ Key Features

## 🚗 Vehicle Discovery

Explore available Hyundai vehicles through a dedicated showroom experience.

* 🚘 Vehicle model showcase
* 🖼️ Premium vehicle visuals
* 📋 Detailed specifications
* 💰 Pricing information
* 🔎 Vehicle exploration

---

## ⚖️ Car Comparison

Compare vehicles and make better purchase decisions.

### Comparison Experience

* 🚘 Compare multiple models
* ⚙️ Compare specifications
* 💰 Compare pricing
* 📊 Review important vehicle details
* 🎯 Simplify vehicle selection

---

## 📝 Vehicle Details

Each vehicle experience is designed to provide useful information before making a purchase decision.

* Engine / performance information
* Vehicle specifications
* Features
* Pricing
* Visual presentation
* Model-specific information

---

# 🏁 Test Drive Booking

Experience the vehicle before making a decision.

The project includes a dedicated test-drive workflow where users can submit their details and request a test-drive appointment.

### Test Drive Flow

```text
Choose Vehicle
      ↓
View Vehicle Details
      ↓
Request Test Drive
      ↓
Enter Customer Details
      ↓
Submit Booking
      ↓
Test Drive Request
```

Test-drive booking data is represented in the project's `.test_drives.json` data file.

---

# 📩 Customer Enquiries

Users can also submit enquiries related to their vehicle interests.

```text
Customer
   │
   ▼
Select Vehicle
   │
   ▼
Submit Enquiry
   │
   ▼
Customer Request
```

This creates a more complete customer interaction flow beyond simple vehicle browsing.

---

# 🎨 Premium UI / UX

The showroom focuses heavily on visual presentation and user experience.

### Design Highlights

* ✨ Modern interface
* 🎞️ Smooth animations
* 📱 Responsive layouts
* 🧭 Clear navigation
* 🖼️ Automotive-focused visuals
* 🎯 User-friendly interactions
* 💎 Premium showroom experience

---

# 📱 Responsive Experience

Designed to provide a consistent experience across different screen sizes.

| Device      | Experience                |
| ----------- | ------------------------- |
| 🖥️ Desktop | Full showroom experience  |
| 💻 Laptop   | Responsive layout         |
| 📱 Mobile   | Mobile-friendly interface |
| 📟 Tablet   | Adaptive UI               |

---

# 🧩 Project Architecture

The repository is organized into application, styling, JavaScript, image, package, and configuration resources. It also contains dedicated JSON data files for categories, service bookings, and test-drive information.

```text
Hyundai-Car-Show-Room/
│
├── apps/
│
├── css/
│
├── images/
│
├── js/
│
├── packages/
│
├── .categories.json
├── .service_bookings.json
├── .test_drives.json
│
├── Caddyfile
├── docker-compose.yml
├── index.html
│
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
│
├── README.md
└── TODO.md
```

---

# 🛠️ Project Technologies

The repository includes a modern JavaScript/package-management setup with:

* 🟨 JavaScript
* 📦 Package-based project structure
* ⚡ Modern workspace configuration
* 🔄 PNPM lockfile
* 🏗️ Turbo workspace configuration
* 🐳 Docker Compose configuration
* 🌐 Caddy configuration
* 🎨 CSS
* 🖼️ Image assets

The repository contains `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `docker-compose.yml`, and `Caddyfile`, confirming the project's modern tooling and deployment-oriented structure.

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/J-egathis/Hyundai-Car-Show-Room.git
```

## 2️⃣ Navigate to the Project

```bash
cd Hyundai-Car-Show-Room
```

## 3️⃣ Install Dependencies

Because the repository includes a PNPM lockfile and workspace configuration, use PNPM for dependency installation:

```bash
pnpm install
```

## 4️⃣ Start the Project

Use the project's configured development script:

```bash
pnpm dev
```

> If your current `package.json` uses a different script name, run `pnpm run` to view the available commands.

---

# 🖥️ Showroom Experience

```text
┌─────────────────────────────────────┐
│        🚘 HYUNDAI SHOWROOM          │
├─────────────────────────────────────┤
│                                     │
│  🏠 Home                            │
│  🚗 Explore Cars                    │
│  ⚖️ Compare                         │
│  💰 Pricing                         │
│  🏁 Test Drive                      │
│  📩 Enquiry                         │
│                                     │
└─────────────────────────────────────┘
```

---

# 📸 Screenshots

> Add your actual project screenshots here.

### 🏠 Homepage

```text
[ Add Homepage Screenshot ]
```

### 🚘 Vehicle Showcase

```text
[ Add Vehicle Screenshot ]
```

### ⚖️ Comparison

```text
[ Add Comparison Screenshot ]
```

### 🏁 Test Drive

```text
[ Add Test Drive Screenshot ]
```

---

# 🌟 Project Highlights

* 🚘 Premium automotive showroom experience
* ⚖️ Vehicle comparison workflow
* 📋 Detailed vehicle information
* 💰 Pricing presentation
* 🏁 Test-drive booking
* 📩 Customer enquiry workflow
* 🎨 Modern UI/UX
* ✨ Smooth animations
* 📱 Responsive experience
* 🧩 Structured project architecture
* 🐳 Docker configuration
* 🌐 Caddy configuration

---

# 🔮 Future Roadmap

## 🚗 Vehicle Experience

* [ ] 360° Vehicle Viewer
* [ ] Vehicle Configurator
* [ ] Color Customization
* [ ] Variant Selection
* [ ] Advanced Specification Comparison

## 📍 Customer Experience

* [ ] Dealer Locator
* [ ] Live Test Drive Availability
* [ ] Service Appointment Booking
* [ ] Customer Login
* [ ] Booking History

## 💳 Purchase Experience

* [ ] EMI Calculator
* [ ] Online Booking
* [ ] Secure Payment Integration
* [ ] Finance Options
* [ ] Trade-In / Exchange Calculator

## 🤖 AI Experience

* [ ] AI Car Recommendation
* [ ] AI Vehicle Comparison
* [ ] AI Customer Assistant
* [ ] Personalized Vehicle Suggestions

---

# 🏗️ Deployment

The repository includes both **Docker Compose** and **Caddy** configuration files, making the project suitable for extending toward containerized and production-oriented deployment workflows.

Potential deployment architecture:

```text
                🌐 User
                  │
                  ▼
            ┌───────────┐
            │   Caddy   │
            │ Web Server │
            └─────┬─────┘
                  │
                  ▼
          🚘 Hyundai Showroom
                  │
          ┌───────┴────────┐
          ▼                ▼
    Vehicle Data       Booking Data
          │                │
          ▼                ▼
    🚗 Vehicles       🏁 Test Drives
                         📩 Enquiries
```

---

# 🔐 Security Considerations

For production deployment:

* 🔒 Protect customer information
* 🔑 Store secrets in environment variables
* 🚫 Never commit private credentials
* 🛡️ Validate booking inputs
* 🔐 Secure enquiry endpoints
* 📋 Implement proper access controls
* 🌐 Enable HTTPS in production

---

# 🤝 Contributing

Contributions are welcome.

```text
Fork Repository
      ↓
Create Feature Branch
      ↓
Make Changes
      ↓
Test
      ↓
Commit
      ↓
Push
      ↓
Create Pull Request
```

---

# 📜 License

This project is created for **educational, portfolio, and demonstration purposes**.

© 2026 **Jegathis M**

---

# 👨‍💻 Developer

## Jegathis M

🎓 B.Sc Computer Science
💻 Full Stack Developer
🎨 Frontend Developer
🤖 AI Enthusiast

### GitHub

https://github.com/J-egathis

---

<div align="center">

# 🚘 HYUNDAI CAR SHOW ROOM

### Explore. Compare. Experience.

**A Modern Digital Automotive Experience**

<br>

⭐ **If you like this project, consider giving the repository a Star!**

<br>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:111827,50:1F2937,75:991B1B,100:E4002B&height=170&section=footer"/>

</div>
````

Bro, **இந்த version un actual repo structure-ku match aagura maari** வைத்திருக்கேன் — especially `apps`, `packages`, `pnpm`, `Turbo`, `Docker`, `Caddy`, `.test_drives.json`, `.service_bookings.json` போன்றவை repo-la visible-a irukku.
