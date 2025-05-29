
# NutriTrack AI

NutriTrack AI is your intelligent assistant for tracking food safety, analyzing ingredients, managing expiry dates, and understanding FSSAI guidelines. This application is built with Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for AI features.

## Running the Project Locally

Follow these steps to run the NutriTrack AI project on your local machine.

### 1. Prerequisites

*   **Node.js:** Ensure you have a recent LTS (Long Term Support) version of Node.js installed. You can download it from [nodejs.org](https://nodejs.org/). npm (Node Package Manager) is included with Node.js.
*   **Code Editor:** A code editor such as VS Code, WebStorm, etc.

### 2. Get the Project Code

*   Download or clone the project files to your local machine.

### 3. Navigate to the Project Directory

*   Open your terminal or command prompt.
*   Use the `cd` command to navigate into the root directory of the project (the folder that contains `package.json`).
    ```bash
    cd path/to/your/NutriTrackAI-project
    ```

### 4. Install Dependencies

*   Once inside the project directory, run the following command to install all the necessary packages defined in `package.json`:
    ```bash
    npm install
    ```
    (If you prefer using Yarn, you can use `yarn install` if Yarn is installed.)

### 5. Set Up Environment Variables (Crucial for AI Features)

*   The project uses Genkit, which requires an API key for the AI provider (Google Gemini in this case).
*   Create a new file named `.env` in the root of your project directory (at the same level as `package.json`).
*   Open the `.env` file and add your Google Gemini API Key:
    ```env
    GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
*   **Where to get the API Key:** You can obtain a Gemini API key from Google AI Studio (formerly MakerSuite) by creating a new project or using an existing one there.
*   **Important:** Do not commit your `.env` file to public Git repositories. It should ideally be listed in a `.gitignore` file.

### 6. Run the Next.js Application (Frontend and Server Components)

*   In your terminal (still in the project root directory), run:
    ```bash
    npm run dev
    ```
*   This command starts the Next.js development server. Based on the `package.json`, it will likely run on `http://localhost:9002`. Check your terminal output for the exact URL.

### 7. Run the Genkit Development Server (for AI Flows)

*   The AI-powered features (Ingredient Analyzer, Product Analyzer, FSSAI Chatbot) rely on Genkit flows. To make these work locally, you need to run the Genkit development server.
*   **Open a *new, separate* terminal window or tab.**
*   Navigate to the project root directory again in this new terminal.
*   Run the Genkit development server:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, you can use `npm run genkit:watch` if you want Genkit to automatically restart when you make changes to your AI flow files (e.g., files in `src/ai/flows/`).
*   This will typically start the Genkit server on `http://localhost:3400` (the default Genkit port). This server hosts your AI flows and makes them callable by your Next.js application.

### 8. Access the Application

*   Open your web browser.
*   Go to the URL provided by the Next.js development server (e.g., `http://localhost:9002`).
*   You should see your NutriTrack AI application. The AI features will communicate with the Genkit server running on its port (e.g., `http://localhost:3400`).

### Summary of Running Servers

You'll need **two** development servers running simultaneously in separate terminal windows:

1.  **Next.js server** (for the main app): `npm run dev` (e.g., on port 9002)
2.  **Genkit server** (for AI flows): `npm run genkit:dev` (e.g., on port 3400)

### Important Notes

*   **`barcodes.json`:** For the "Food Management" barcode lookup feature to work with sample data, ensure the `public/data/barcodes.json` file is present in your project and contains sample barcode data.
*   **Stopping the Servers:** To stop the servers, go to their respective terminal windows and press `Ctrl+C`.

## Project Structure

*   `src/app/`: Contains the Next.js pages and layouts (App Router).
*   `src/components/`: Contains reusable UI components (global and specific).
*   `src/ai/`: Contains Genkit AI flows and configuration.
    *   `src/ai/flows/`: Specific Genkit flows for different AI features.
*   `src/lib/`: Contains utility functions, type definitions, and server actions.
*   `public/`: Static assets, including the `data/barcodes.json` for sample data.

## Key Technologies

*   **Next.js:** React framework for building the frontend and backend.
*   **React:** JavaScript library for building user interfaces.
*   **ShadCN UI:** UI components built with Radix UI and Tailwind CSS.
*   **Tailwind CSS:** Utility-first CSS framework for styling.
*   **Genkit (Firebase):** Toolkit for building AI-powered features, integrated with Google Gemini.
*   **TypeScript:** Superset of JavaScript for static typing.
