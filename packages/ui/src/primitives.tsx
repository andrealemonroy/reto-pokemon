import {
  Component,
  type ButtonHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
};
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`button button--${variant} ${className}`} {...props} />;
}

export function Spinner({ label = 'Cargando' }: { readonly label?: string }) {
  return (
    <span className="spinner" role="status">
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className = '' }: { readonly className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <section className="state-panel">
      <span className="state-panel__icon" aria-hidden="true">
        ○
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function ErrorState({
  title = 'No pudimos cargar esta sección',
  description,
  onRetry,
  onBack,
}: {
  readonly title?: string;
  readonly description: string;
  readonly onRetry?: () => void;
  readonly onBack?: () => void;
}) {
  return (
    <section className="state-panel" role="alert">
      <span className="state-panel__icon" aria-hidden="true">
        !
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="button-row">
        {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            Volver al inicio
          </Button>
        )}
      </div>
    </section>
  );
}

interface ErrorBoundaryProps extends PropsWithChildren {
  readonly fallback: (retry: () => void) => ReactNode;
}
interface ErrorBoundaryState {
  readonly error: Error | null;
}
export class RemoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) return this.props.fallback(() => this.setState({ error: null }));
    return this.props.children;
  }
}

export function RemoteSkeleton() {
  return (
    <div className="remote-skeleton" aria-label="Cargando sección">
      <Skeleton className="skeleton--title" />
      <Skeleton className="skeleton--hero" />
      <div className="skeleton-grid">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
}
