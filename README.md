# Speed Clicker 🎮
An arcade-style reaction mobile game where players tap glowing shapes to build combos and beat their high scores. Built as a full-stack application with a mobile frontend and a Python backend.

## 🚀 Tech Stack
* **Frontend:** React Native (Expo), TypeScript
* **Backend:** Python, FastAPI, Uvicorn
* **Database:** MongoDB (via Motor)

---

## 🛠️ Getting Started

### 1. Backend Setup
1. Open a new terminal and navigate to the backend folder:
   ```bash
   cd app/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
	.\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```  
4. Start the server and leave the server active:
   ```bash
   python server.py
   ```
   
### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd app/frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Configure your local network IP in the "\app\frontend\.env" file:
   ```bash
   EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000
   ```
4. Start the Expo development server:
   ```bash
   npx expo start -c
   ```   
   
### 3. 📱 How to Test
1. Download the Expo Go app on your iOS or Android device.
2. Ensure your phone and computer are on the same Wi-Fi network.
3. Scan the QR code generated in your frontend terminal.