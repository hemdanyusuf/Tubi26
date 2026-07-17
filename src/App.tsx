import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import { LoadingState } from './components/PageState';

const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Recipes = lazy(() => import('./pages/Recipes'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Shopping = lazy(() => import('./pages/Shopping'));
const AddIngredient = lazy(() => import('./pages/AddIngredient'));
const Chat = lazy(() => import('./pages/Chat'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingState label="Tubi26 hazırlanıyor..." />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="shopping" element={<Shopping />} />
            <Route path="add-ingredient" element={<AddIngredient />} />
            <Route path="chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
