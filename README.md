# Expense Splitter

A full-stack Splitwise-style app for four predefined members: Ajay, Akshay, Kumar, and Kinnu. It opens directly to the dashboard, saves expenses in MongoDB, calculates participant-based splits, creates optimized settlements, and exports PDF/Excel reports.

## Folder Structure

```text
expense-splitter/
  backend/
    .env
    src/
      config/
      models/
      routes/
      scripts/
  frontend/
    .env
    src/
      components/
      pages/
      services/
      utils/
```

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, jsPDF, html2canvas
- Backend: Node.js, Express, MongoDB, Mongoose

## Setup

1. Install dependencies:

```bash
npm install
```

2. Update `backend/.env` with your MongoDB URI:

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense-splitter
CLIENT_URL=http://localhost:5173
```

3. Update `frontend/.env` if your API URL changes:

```text
VITE_API_URL=http://localhost:5000
```

4. Load sample data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Sample Data

Run `npm run seed` to load sample expenses into MongoDB. The app does not require login.

## Core Split Rule

Each expense is split only among the selected participants for that expense.

Example:

```text
Amount: 1000
Participants: Ajay, Kumar
Ajay share: 500
Kumar share: 500
```

The app never divides the total group expense equally among all users.

## API Endpoints

```text
GET    /expenses
POST   /expenses
PUT    /expenses/:id
PATCH  /expenses/:id/hide
```

## Export Features

The Summary page includes:

- `Download PDF`: exports `expense-summary.pdf` using jsPDF and html2canvas.
- `Export Excel`: exports `expense-summary.xls` with report, summary, and settlement tables.
