import { historyRepository, type PokemonVisit } from '@pokedex/domain/history';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export function LatestVisitToast() {
  const [initialVisit] = useState<PokemonVisit | null>(() =>
    historyRepository?.shouldShowLatestVisit() ? historyRepository.getLatestVisit() : null,
  );
  const [visible, setVisible] = useState(Boolean(initialVisit));
  if (!visible || !initialVisit) return null;
  const close = () => {
    historyRepository?.acknowledgeLatestVisit();
    setVisible(false);
  };
  return (
    <aside className="visit-toast" role="status">
      <span className="toast-icon" aria-hidden="true">
        <Check size={18} />
      </span>
      <div>
        <strong>Última visita</strong>
        <p>
          Visitaste a <b>{initialVisit.pokemonName}</b>.
        </p>
      </div>
      <button onClick={close} aria-label="Cerrar notificación">
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
