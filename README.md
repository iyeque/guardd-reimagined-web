# DigitalGuard: Family Digital Wellness Reimagined

**DigitalGuard** is a next-generation platform designed to help modern families navigate the digital world safely. It combines high-fidelity interactive elements, educational gaming, and expert-vetted resources into a unified, immersive experience.

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
*   **Admin Dashboard:** Centralized `/admin` interface for managing community data and inquiries.

### 4. Visual Academy
*   **On-Demand Learning:** A curated library of step-by-step tutorials, expert talks, and webinar recordings.
*   **Interactive Player:** High-fidelity video modal system for distraction-free learning.

### 5. Family Utility Tools
*   **Agreement Builder:** Interactive workshop to create and "sign" custom family digital contracts.
*   **Screen Time Management:** Comprehensive strategies and visualization tools for balanced tech usage.

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Vercel Analytics.
*   **State & Logic**: Framer Motion (Animations), React Query (Data Fetching), Context API (Theme & Mode management).
*   **UI Foundation**: Radix UI, shadcn/ui, Lucide Icons.
*   **Backend & Data**: Node.js (Express), PostgreSQL (Neon), Drizzle ORM, Automated background data synchronization.

## 📦 Getting Started

1.  **Installation:**
    ```bash
    npm install
    ```

2.  **Database Setup:**
    - Provision a Postgres database (e.g., via Neon.tech).
    - Create a `.env` file with `DATABASE_URL=your_connection_string`.
    - Push the schema: `npm run db:push`.

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📅 Maintenance & Automation

The project uses a database-backed storage system (Neon Postgres). Community data is automatically synchronized using a multi-source engine:
*   **RSS Feeds:** Real-time news from Wired, The Verge, and digital safety organizations.
*   **SerpApi:** Automated discovery of global events via Google Events.
*   **Lazy-Sync:** A non-blocking mechanism optimized for Vercel Serverless Functions that ensures fresh data without performance bottlenecks.

## ⚖️ Legal & Compliance

Legal documents (Terms of Service, Privacy Policy) are integrated via a robust **Modal Architecture**, ensuring instant availability without triggering SPA routing issues in production environments.

---
*Created with focus on Family, Safety, and Balance.*
