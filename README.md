# Kitchen Hub – AI Powered Recipe Management System  

## About the Project  
Kitchen Hub is an **AI-powered recipe management system** that makes it easier to save, edit, and organize your favorite recipes all in one place. On top of the usual recipe manager features, it comes with an **AI Recipe Assistant** that can generate completely new recipes from your own ideas or prompts.  

Think of it as your personal cooking companion, whether you want to store grandma’s classics, try out a new dish, or let AI whip up something based on what’s in your fridge.  

---

## Features  

- **Organize Recipes** - Add, edit, delete, and manage recipes in one place.  
- **Recipe View Page** - See full details of each recipe (ingredients, steps, tags, time).  
- **Search & Filter** - Quickly look up recipes by name.  
- **AI Recipe Assistant** – Takes your prompt, searches online for related recipes, and combines the results with its reasoning to generate personalized outputs.  
- **Categories & Tags** - Group and classify recipes for easy browsing.  
- **Cooking Time Display** - Show how long a recipe takes.  
- **Responsive UI** - Works smoothly on desktop and mobile.  

---

## Screenshots  

- **Login** - Login your account.
![Login Page](/screenshots/login.png)

- **Homepage** - Browse your recipe collection.  
![Home Page](/screenshots/homepage.png)

- **Recipe View Page** - Read a recipe with all the details.  
![View Recipe Page](/screenshots/recipepage.png)

- **Add Recipe Page** - Form to add a new recipe.  
![Add and Edit Page](/screenshots/addeditpage.png)

- **AI Recipe Assistant** - Prompt the AI to create a fresh recipe for you.  
![Generate Recipe using AI](/screenshots/aigenerate.png)

---

## 🛠️ Tech Stack  

Kitchen Hub is built with a mix of frontend, backend, and AI tools:  

- **Frontend:** React + Tailwind CSS  
- **Backend:** Node.js + Express 
- **Database:** MongoDB  
- **AI Integration:** Python + LangChain  
- **API Layer:** FastAPI (connects AI to the main app)  
- **LLM Model:** LM Studio (for running the language model locally)  

---

## Installation & Setup  

### 1. Clone the repository  
```bash
git clone https://github.com/zzzillo/Kitchen-Hub-AI-Powered-Recipe-Management-System.git
cd Kitchen-Hub-AI-Powered-Recipe-Management-System
```

### 2. Set up LMStudio
- Download and install LMStudio from their official website
- Open LMStudio application
- Browse and download your preferred Large Language Model (LLM)
- Navigate to Developer Mode in the interface
- Load your selected model into the runtime
- Configure the model settings by setting the context length to 10,000 tokens
- Note the LMStudio API endpoint URL displayed at the top of the loaded model interface


### 2. Set up environment variables

#### Root .env
```bash
PORT=                   # Backend server port number (3001)
MONGO_URI=              # MongoDB connection string
JWT_SECRET=             # JWT secret key for authentication
FRONTEND_URL=           # Frontend application URL (http://localhost:5173)
LMSTUDIO_BASE_URL=      # LMStudio API base URL (found at top of loaded model interface) (http://127.0.0.1:1234/v1)
LMSTUDIO_API_KEY=       # LMStudio API key for authentication
TOP_K_PAGES=3
MAX_CONTEXT_CHARS=10000
MODEL_NAME=meta-llama-3.1-8b-instruct  # Model name (update with your chosen model)
```

#### Frontend .env
```bash
VITE_API_URL=           # Vite development server API URL (http://localhost:8000)
VITE_BACKEND_URL=       # Backend server URL with port number (http://localhost:3001)
```

### 3. Install dependencies
#### Frontend (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```

#### Backend (Node.js)
```bash
cd frontend
npm install
node server.js
```

#### AI (FastAPI + LangChain)
```bash
cd api-chatbot
#MacOS
python3 -m venv .venv
source venv/bin/activate
#Windows
py -m venv .venv
.\.venv\Scripts\activate

pip install -r requirements.txt
uvicorn api:app --reload --host LMSTUDIO_BASE_URL --port PORT #(uvicorn api:app --reload --host 127.0.0.1 --port 8000)

```

