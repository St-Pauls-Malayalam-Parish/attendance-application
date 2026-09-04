import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-center">
          <div className="card" style={{ maxWidth: '32rem' }}>
            <h1>Something went wrong</h1>
            <p className="muted">
              The page hit an unexpected error. Try refreshing, or sign out and sign in again.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
