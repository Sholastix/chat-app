// We must do it based on classes because React's core API does not currently support error boundaries in function components via hooks.
import { Component } from 'react';

// Components.
import ErrorPage from '../ErrorPage/ErrorPage';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Optional: Report to monitoring service (like "Sentry").
    console.error(error, errorInfo);

    // Only set 'errorInfo' once to avoid redundant updates.
    if (!this.state.errorInfo) {
      this.setState({ errorInfo });
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) return children;

    if (fallback) {
      // Allow fallback to be a React Component or a function.
      return typeof fallback === 'function' ? fallback({ error, errorInfo }) : fallback;
    }

    // Default fallback UI.
    return <ErrorPage />;
  }
}

export default ErrorBoundary;
