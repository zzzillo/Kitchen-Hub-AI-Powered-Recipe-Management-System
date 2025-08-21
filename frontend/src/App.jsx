import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CreateRecipePage from './pages/CreateRecipePage';
import UpdateRecipePage from './pages/UpdateRecipePage';
import ViewRecipePage from './pages/ViewRecipePage';

function App() {
return (
  <Router>
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/home' element={<HomePage />} />
      <Route path='/createrecipe' element={<CreateRecipePage />}/>
      <Route path='/updaterecipe/:id' element={<UpdateRecipePage />}/>
      <Route path='/recipe/:id' element={<ViewRecipePage />}/>
    </Routes>
  </Router>
)
  
}

export default App;
