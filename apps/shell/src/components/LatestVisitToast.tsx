import { historyRepository, type PokemonVisit } from '@pokedex/domain';
import { useRef, useState } from 'react';

export function LatestVisitToast() {
  const initialVisit = useRef<PokemonVisit | null>(historyRepository?.shouldShowLatestVisit() ? historyRepository.getLatestVisit() : null);
  const [visible, setVisible] = useState(Boolean(initialVisit.current));
  if (!visible || !initialVisit.current) return null;
  const close = () => { historyRepository?.acknowledgeLatestVisit(); setVisible(false); };
  return <aside className="visit-toast" role="status"><span className="toast-icon" aria-hidden="true">✓</span><div><strong>Última visita recuperada</strong><p>Tu exploración de <b>{initialVisit.current.pokemonName}</b> quedó guardada.</p></div><button onClick={close} aria-label="Cerrar notificación">×</button></aside>;
}
