import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ALGORITHM_ORDER } from '../algorithms';
import { AnimationView } from '../components/AnimationView';
import { usePlanner } from '../context/PlannerContext';
import type { AlgorithmId } from '../types';

function isAlgorithmId(value: string | undefined): value is AlgorithmId {
  return !!value && (ALGORITHM_ORDER as string[]).includes(value);
}

export function AnimationPage() {
  const { algorithmId } = useParams();
  const { map, results } = usePlanner();
  const navigate = useNavigate();

  if (!results) {
    return <Navigate to="/editor" replace />;
  }

  const id: AlgorithmId = isAlgorithmId(algorithmId)
    ? algorithmId
    : 'greedy';

  if (!isAlgorithmId(algorithmId)) {
    return <Navigate to={`/animation/${id}`} replace />;
  }

  return (
    <AnimationView
      map={map}
      results={results}
      initialId={id}
      onBack={() => navigate('/results')}
      onAlgorithmChange={(next) => navigate(`/animation/${next}`)}
    />
  );
}
