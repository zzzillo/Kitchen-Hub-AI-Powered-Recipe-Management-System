import { Suspense, lazy } from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage'));
const UpdateRecipePage = lazy(() => import('./pages/UpdateRecipePage'));
const ViewRecipePage = lazy(() => import('./pages/ViewRecipePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const LegacyRecipeViewRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/recipes/${id}`} replace />;
};

const LegacyRecipeEditRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/recipes/${id}/edit`} replace />;
};

const App = () => {
return (
  <Router>
    <Suspense fallback={null}>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/forgot-password' element={<Navigate to='/reset-password' replace />} />
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/recipes' element={<HomePage />} />
        <Route path='/recipes/new' element={<CreateRecipePage />}/>
        <Route path='/recipes/:id/edit' element={<UpdateRecipePage />}/>
        <Route path='/recipes/:id' element={<ViewRecipePage />}/>
        <Route path='/home' element={<Navigate to='/recipes' replace />} />
        <Route path='/createrecipe' element={<Navigate to='/recipes/new' replace />} />
        <Route path='/updaterecipe/:id' element={<LegacyRecipeEditRedirect />} />
        <Route path='/recipe/:id' element={<LegacyRecipeViewRedirect />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </Router>
)
  
};

export default App;
