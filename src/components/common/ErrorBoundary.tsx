import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    const chunk = /Failed to fetch dynamically imported module|Loading chunk/i.test(this.state.error.message);
    return (
      <div className="grid min-h-screen place-items-center bg-mist p-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-semibold text-night">{chunk ? 'Connexion interrompue' : 'Une erreur inattendue est survenue'}</h1>
          <p className="mt-2 text-ink/70">{chunk ? 'La page n’a pas pu être chargée. Vérifiez votre connexion puis réessayez.' : 'Veuillez recharger la page. Si le problème persiste, contactez l’administration.'}</p>
          <button className="mt-6 rounded-xl bg-night px-5 py-2.5 font-semibold text-white" onClick={() => window.location.reload()}>Recharger</button>
        </div>
      </div>
    );
  }
}
