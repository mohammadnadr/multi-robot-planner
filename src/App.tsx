import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PlannerProvider } from './context/PlannerContext';
import { AppLayout } from './layout/AppLayout';
import { AnimationPage } from './pages/AnimationPage';
import { EditorPage } from './pages/EditorPage';
import { ResultsPage } from './pages/ResultsPage';
import './App.css';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export default function App() {
  return (
    <BrowserRouter basename={basename === '/' ? undefined : basename}>
      <PlannerProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/editor" replace />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="animation" element={<Navigate to="/animation/greedy" replace />} />
            <Route path="animation/:algorithmId" element={<AnimationPage />} />
            <Route path="*" element={<Navigate to="/editor" replace />} />
          </Route>
        </Routes>
      </PlannerProvider>
    </BrowserRouter>
  );
}
