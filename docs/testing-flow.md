# VaultMaster AI Testing Flow

This document outlines a testing flow for the VaultMaster AI application, focusing on verifying the core functionalities after recent updates.

## **Setup**

1.  **Clone the repository:** `git clone [repo-url]`
2.  **Install dependencies:** `pnpm install`
3.  **Run the development server:** `pnpm dev`
4.  **Ensure a Web3 wallet is available:** MetaMask or similar browser extension. For testing, a testnet (e.g., Sepolia, Polygon Mumbai) is recommended.
5.  **Clear local storage/cookies:** Before each test run, clear `localStorage` and cookies related to `connectedWalletAddress` and `sidebar:state` to ensure a clean state.

---

## **Test Cases**

### **Test Case 1: Wallet Connection and Initial Dashboard Load**

**Objective:** Verify that the wallet connects successfully and the dashboard displays initial mock data correctly.

**Steps:**

1.  Navigate to the home page (`/`).
2.  Click the "Connect Wallet" button.
3.  Confirm the mock wallet connection (or connect a real wallet if configured).
4.  Verify that the page redirects to `/dashboard`.
5.  **Assertion:**
    *   The "Connect Wallet" button changes to display a truncated address.
    *   The dashboard loads without errors.
    *   The "Setup Progress" card shows "0% complete".
    *   The "Next Step Card" displays "Setup Strategy" with a "Continue" button.
    *   Portfolio cards show initial mock values (e.g., "$1,247.83 total", "0.0% APY", "0 actions", "$0.00 gas saved").
    *   Quick Action buttons (Strategy, Funds, Agent) are disabled.

### **Test Case 2: Navigation to Optimizations Page**

**Objective:** Verify that clicking "Continue" on the dashboard navigates to the Optimizations page and displays the configuration form.

**Steps:**

1.  Start from the dashboard (after completing Test Case 1).
2.  Click the "Continue" button on the "Next Step Card".
3.  **Assertion:**
    *   The URL changes to `/optimizations`.
    *   The "Autopilot Configuration" form is visible with default/mock values.
    *   The "Autopilot Status" card is visible.

### **Test Case 3: Updating Autopilot Configuration**

**Objective:** Verify that the autopilot configuration can be updated and a success toast is displayed.

**Steps:**

1.  Navigate to the Optimizations page (`/optimizations`).
2.  Change the "Strategy" to "Liquidity Provision".
3.  Change the "Risk Tolerance" to "High".
4.  Modify the "Managed Assets" input (e.g., change to "USDC, BTC").
5.  Modify the "Asset Allocation" JSON (e.g., `{"USDC": 0.5, "BTC": 0.5}`).
6.  Adjust the "Slippage Tolerance" slider.
7.  Click the "Save Configuration" button.
8.  **Assertion:**
    *   The "Save Configuration" button shows a loading spinner briefly.
    *   A success toast notification appears: "Configuration Saved! Your autopilot settings have been updated."
    *   The displayed values in the form reflect the newly saved configuration (after re-render/re-fetch).

### **Test Case 4: Triggering Manual Rebalance**

**Objective:** Verify that the manual rebalance can be triggered and status updates are shown.

**Steps:**

1.  Navigate to the Optimizations page (`/optimizations`).
2.  Click the "Trigger Rebalance Now" button.
3.  **Assertion:**
    *   The button text changes to "Rebalancing..." with a loading spinner.
    *   A toast notification appears: "Rebalance Initiated! Your portfolio rebalance is in progress."
    *   After a few seconds, the button text changes back, and a success toast appears: "Rebalance Successful! Your portfolio has been rebalanced according to your strategy." (or a failure toast if simulated).
    *   The "Autopilot Status" card's "Actions Executed" count increases.
    *   The "Last Rebalance" timestamp updates.

### **Test Case 5: Sidebar Functionality (if implemented)**

**Objective:** Verify that the sidebar (if present) toggles correctly and navigation links work.

**Steps:**

1.  Navigate to any page with a sidebar.
2.  Click the sidebar toggle button (if available).
3.  **Assertion:**
    *   The sidebar expands/collapses as expected.
    *   Clicking on navigation links within the sidebar correctly navigates to the respective pages.

### **Test Case 6: Responsiveness**

**Objective:** Verify that the application layout adapts to different screen sizes.

**Steps:**

1.  Open the application in a browser.
2.  Resize the browser window to simulate mobile, tablet, and desktop views.
3.  **Assertion:**
    *   Layout elements (cards, forms, navigation) adjust appropriately for each screen size.
    *   No horizontal scrollbars appear unnecessarily.
    *   Text remains readable.

---

## **Reporting Bugs**

If any test case fails:

*   Note the **Test Case Number** and **Assertion** that failed.
*   Provide **Steps to Reproduce** the bug.
*   Include **Expected Behavior** vs. **Actual Behavior**.
*   Attach **Screenshots** or **Console Logs** if relevant.
*   Specify the **Browser** and **Operating System** used.
\`\`\`
