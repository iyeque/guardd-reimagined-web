# GUARDD: Family Digital Wellness Reimagined

**GUARDD** is a next-generation platform designed to help modern families navigate the digital world safely. It combines high-fidelity interactive elements, educational gaming, and expert-vetted resources into a unified, immersive experience.

## 🚀 Key Features

### 1. Predictive Hero & Search
*   **Intelligent Topic Mapping:** Interactive cluster-based search for digital safety topics.
*   **Expert Summaries:** Instant, scrollable definitions for complex terms like "Online Trolling", "Data Privacy", and "Cyberbullying".
*   **Adaptive UX:** The experience shifts based on whether you are in **Parent**, **Child**, or **Family** mode.

### 2. Educational Game Hub
*   **Digital Wellness Pop:** A high-performance reflex game designed to teach children to prioritize "Focus" over "Alerts". Features a combo system, dynamic difficulty, and stress-tracking visuals.
*   **Cyber-Safe Quiz:** A tiered achievement system that tests and validates cybersecurity knowledge across multiple levels.

### 3. Community Pulse (Hub)
*   **Live Activity Sync:** Real-time tracking of active families and online experts.
*   **Global Event Calendar:** Deep-indexed 2026/27 schedule of international safety conferences and local workshops.
*   **Elite Mentor Circle:** Direct access to certified digital wellness experts via a professional application system.

### 4. Visual Academy
*   **On-Demand Learning:** A curated library of step-by-step tutorials, expert talks, and webinar recordings.
*   **Interactive Player:** High-fidelity video modal system for distraction-free learning.

### 5. Family Utility Tools
*   **Agreement Builder:** Interactive workshop to create and "sign" custom family digital contracts.
*   **Screen Time Management:** Comprehensive strategies and visualization tools for balanced tech usage.

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
*   **State & Logic**: Framer Motion (Animations), React Query (Data Fetching), Context API (Theme & Mode management).
*   **UI Foundation**: Radix UI, shadcn/ui, Lucide Icons.
*   **Backend & Data**: Express (Node.js), PostgreSQL (Drizzle ORM), Dynamic JSON data syncing for community features.

## 📦 Getting Started

1.  **Installation:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Update Community Data (Manual Refresh):**
    ```bash
    npm run update-data
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📅 Maintenance & Automation

The project includes a specialized script (`scripts/update-community-data.ts`) that pulls the latest 2026/27 safety events. This script is intended to be run via a daily cron job or GitHub Action to keep the Community Hub fresh.

---
*Created with focus on Family, Safety, and Balance.*
