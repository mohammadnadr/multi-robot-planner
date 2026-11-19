import { Link, useLocation } from 'react-router-dom';
import { ALGORITHM_ORDER } from '../algorithms';
import type { AlgorithmId } from '../types';

type Crumb = { label: string; to?: string };

const ALGO_LABELS: Record<AlgorithmId, string> = {
  greedy: 'Greedy',
  prioritized: 'Prioritized',
  aco: 'Ant Colony',
  genetic: 'Genetic',
};

function crumbsForPath(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Home', to: '/editor' }];

  if (parts.length === 0 || (parts[0] === 'editor' && parts.length === 1)) {
    crumbs.push({ label: 'Editor' });
    return crumbs;
  }

  if (parts[0] === 'results') {
    crumbs.push({ label: 'Editor', to: '/editor' });
    crumbs.push({ label: 'Results' });
    return crumbs;
  }

  if (parts[0] === 'animation') {
    crumbs.push({ label: 'Editor', to: '/editor' });
    crumbs.push({ label: 'Results', to: '/results' });
    const alg = parts[1] as AlgorithmId | undefined;
    const label =
      alg && ALGORITHM_ORDER.includes(alg)
        ? `Animation · ${ALGO_LABELS[alg]}`
        : 'Animation';
    crumbs.push({ label });
    return crumbs;
  }

  crumbs.push({ label: parts.join(' / ') });
  return crumbs;
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = crumbsForPath(pathname);

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.label}-${i}`}>
              {i > 0 && <span className="breadcrumb-sep" aria-hidden>/</span>}
              {c.to && !isLast ? (
                <Link to={c.to}>{c.label}</Link>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
