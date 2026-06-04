# ArbaLabs Mission Control Interface

An immersive, cinematic, NASA-inspired aerospace orbital mission web application designed for public-facing activation campaigns, mission presentations, and live demonstration purposes. This platform replicates the look and feel of professional satellite operations dashboards and mission control systems using rich frontend mock data.

**Project Status:** `FRONTEND DEMO MOCK DATA ONLY`  
**Version:** `v1.0`  
**Date:** `May 31, 2026`

---

## 1. Project Overview

The ArbaLabs Mission Control Interface simulates a real satellite orbital mission via a modular, high-fidelity frontend dashboard. The platform is structured into three distinct pages, each serving a critical operational role in the mission lifecycle: introducing the mission, monitoring real-time telemetry, and managing payload operations with data integrity ledger controls.

### Design Language & System Aesthetic
* **Theme:** Immersive full dark theme with high visual contrast.
* **Background Color:** Near-black `#080808`.
* **Primary Text:** White for critical values and headers.
* **Labels:** Dim gray for structural and informational metadata.
* **Status Accent:** Bright Green `#00E676` for nominal indicators and successful states.
* **Telemetry Highlight:** Cyan `#00D4FF` for secondary telemetry data streams and active links.
* **Typography:** Strict monospaced fonts to enforce a technical, aerospace, and terminal-like aesthetic.

---

## 2. Global Navigation & Structure

Every page across the platform implements a unified top navigation layout for fluid transition between views during live demonstrations:

* **ArbaLabs Logo (Top Left):** Serves as the core brand identifier. Clicking this logo returns the user to the Launchpad from any section of the application.
* **Context-Sensitive Action Button (Top Right):** 
  * Displays **"Open Terminal"** when on the Launchpad page, routing the user directly to the operational dashboard (Monitoring view).
  * Displays **"Open Launchpad"** when inside the Terminal views, routing the user back to the splash page.
* **System Time / Satellite ID (Top Right):** Shows the current live UTC timestamp alongside the active satellite identifier (e.g., `ARBA-EDGE`).

### Terminal Interface Elements
When entering the operational terminal, two sub-navigation components become active:
1. **Tab Row:** Toggles the view seamlessly between the **Monitoring** and **Management** dashboards.
2. **System Status Bar:** A full-width persistent strip running below the tabs summarizing live system health:
   * **AI Verification:** `NOMINAL` (Green dot)
   * **Telemetry Stream:** `STREAMING` (Cyan dot)
   * **Uplink Status:** `ACTIVE` (Cyan dot)
   * **Orbit Range:** `530 / 786 km` (Amber dot for dynamic tracking)

---

## 3. Interface Architecture & Features

### Page 01: Launchpad (Mission Entry)
The Launchpad page serves as the immersive landing screen and introductory experience of the application. It utilizes a three-zone horizontal layout:

* **Center Zone: 3D Earth Globe Visualization**
  * A photorealistic 3D rendering of planet Earth rotating in a deep matte black space background.
  * Features two active orbital ring animations: a solid ring tilted at `72 degrees` representing the Sun-Synchronous Orbit (SSO), and a dashed orbit ring offset at `45 degrees`.
  * Two glowing green marker dots track the satellite's position in real time.
  * **Countdown Timer:** Located directly under the globe, displaying live real-time counting for `DAYS`, `HOURS`, `MINUTES`, and `SECONDS` until the launch target date.
* **Left Panel: Mission Specifications**
  * **Orbit Class:** `LEO (Low Earth Orbit)`
  * **Altitude:** `791 km`
  * **Velocity:** `26,856 km/h`
  * **Inclination:** `98.6 degrees SSO`
  * **TLE Position:** A status feed reading `TLE POSITION ACTIVE` with a green indicator.
* **Right Panel: Launch Readiness Checklist**
  * **Propulsion Array:** `NOMINAL` (Green)
  * **Avionics Check:** `READY` (Green)
  * **Communication Link:** `LOCK` (Cyan - stable ground uplink lock achieved)
  * **AI Model Integrity:** `VERIFIED` (Green)
  * **GO FOR LAUNCH:** A prominent, glowing green call-to-action system readiness signal at the bottom of the checklist.

---

### Page 02: Monitoring (Operational Terminal)
The operational heart of the system, arranged in a dense 2x2 grid dashboard to present live streaming telemetry data:

1. **Orbital Tracking (Top Left Panel):** Includes a mini Earth globe tracking current coordinates. Features a floating telemetry tooltip updating live values: Altitude (`792 km`), Velocity (`26,857 km/h`), and Orbit Range (`530/786 km`).
2. **ArbaEdge v4 Orbit Monitor (Top Right Panel):** Dedicated to showcasing edge-computing infrastructure running natively on the satellite.
   * **Inference Status:** `INFERENCE ACTIVE` (Green badge).
   * **Model Card:** Identifies the deployment module as `ARBAEDGE-CORE-LEO-01` with active processing captions.
   * **Gauges:** Circular progress indicators for Compute Utilization (`76%`) and Memory Usage (`42%`).
   * **Inference Metrics:** Displays a processing speed of `16 FPS` utilizing the `ResNet50-ArbaEdge` onboard model over `14 Active Grid Targets`.
3. **Satellite Systems Telemetry (Bottom Left Panel):** Visualizes performance over time using interactive historical filters (`1H`, `6H`, `24H`, `7D`) via gradient-filled line charts:
   * **Radiation Density:** Real-time line chart reading `8.19 mSv/h` (Cyan fill).
   * **Structure Temperature:** Frame thermal telemetry reading `23.5 °C` (Green fill).
   * **Main Power Bus:** Flat line checking power system stability at `99%` (Green line).
4. **Mission Event Feed (Bottom Right Panel):** A live scrolling console logs system notifications filterable by severity (`ALL`, `INFO`, `ERRORS`, `CRITICAL`). Logged events include Copernicus `WS TELEMETRY BLOCK SYNCED` frames, onboard AI inference score reports, package hash matching, and amber-colored minor telemetry drift warning alerts.

---

### Page 03: Management (Payload & Security Control)
Organized into a dual-column layout to equip operators with data governance, simulation controls, and payload uploading features:

* **Left Column:**
  * **Provenance Ledger (SHA-256 Integrity):** Confirms security and file verification. Compares the asset hash calculated locally against the actual onboard hash computed on the satellite to display a `VERIFIED` status.
  * **Inject Anomaly Button:** A red-bordered test button used to simulate a data breach during live demonstrations. Clicking it triggers immediate integrity system warnings and data mismatches for demonstration purposes.
  * **Data Provenance Chain:** A 4-stage processing map tracking the journey of data: `Raw Ingest` $\rightarrow$ `ArbaEdge GPU` $\rightarrow$ `SHA-256 Signing` $\rightarrow$ `Ledger Audit`.
  * **Payload Uploader:** A drag-and-drop zone welcoming `.bin`, `.json`, or hex files. Displays an active queue documenting filename, file size, and status indicators like `CONFIRMED` (validated) or `TRANSMITTED` (sent to satellite).
* **Right Column:**
  * **Operator Controls Panel:** Interactive parameter fields updating the interface system behavior. Includes editable input controls for Telemetry Sync Rate (Default: `5s`), Max Bandwidth Throttle (Default: `10 Mbps`), and a dropdown selector for Telemetry Uplink Channels (e.g., `S-Band-Ch4`).
  * **System Log:** Real-time scrolling diagnostic output with color-coded severity levels (`INFO`, `WARN`, `OK`, `ERROR`).
  * **Action Triggers:** Houses a dangerous red-bordered `SYS COLD RESET` button for emergency recovery simulations, alongside a `RE-RUN STATE AUDIT` button to force a new hash verification pass.

---

## 4. Demonstration Runbook & Navigation Flow

To present this website effectively to clients or audiences, follow this structured 10-step sequence mapped out in the demonstration guidelines:

| Step | Action | From | How | To |
|---|---|---|---|---|
| **01** | Enter Terminal | Launchpad | Click **OPEN TERMINAL** button on top right | Monitoring Page |
| **02** | View Live Orbit | Monitoring | Focus on **Orbital Tracking** panel (top-left) | Track current coordinates |
| **03** | Check AI Status | Monitoring | Focus on **ArbaEdge V4** panel (top-right) | Evaluate computing efficiency |
| **04** | View Telemetry | Monitoring | Scroll to **Satellite Systems Telemetry** (bottom-left) | Read historical charts |
| **05** | Filter Events | Monitoring | Click filter tabs (`INFO`/`ERRORS`) in Event Feed | Observe log severity states |
| **06** | Switch View | Monitoring | Click **MANAGEMENT** tab in navigation row | Management Page |
| **07** | Verify Integrity | Management | Review SHA-256 hash checking in Ledger panel | Observe `VERIFIED` state |
| **08** | Upload Payload | Management | Drag file or click "Select File" in Uploader | Watch file enter the queue |
| **09** | Configure System | Management | Adjust values in the right Operator Controls panel | Modify sync rates and limits |
| **10** | Reset / Return | Terminal | Click **OPEN LAUNCHPAD** on top right navigation | Launchpad Page |

---

## 5. Architectural Scalability Note

This platform operates **exclusively on mock and demo data** for its current iteration. However, the foundational system architecture is engineered to be modular and scalable. This design guarantees that production-grade integrations, secure backend infrastructure, and live satellite telemetry data feeds (such as Copernicus streams) can be wired directly into the existing UI components in later development stages without requiring a structural rewrite of the frontend layer.
