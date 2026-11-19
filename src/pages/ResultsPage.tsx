import { Navigate, useNavigate } from 'react-router-dom';
import { ComparisonPanel } from '../components/ComparisonPanel';
import { usePlanner } from '../context/PlannerContext';

export function ResultsPage() {
  const { map, results } = usePlanner();
  const navigate = useNavigate();

  if (!results) {
    return <Navigate to="/editor" replace />;
  }

  return (
    <ComparisonPanel
      map={map}
      results={results}
      onBack={() => navigate('/editor')}
      onAnimate={(id) => navigate(`/animation/${id}`)}
    />
  );
}
