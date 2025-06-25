// We must do it based on classes because React's core API does not currently support error boundaries in function components via hooks.
import { Component } from 'react';

// Components.
import ErrorPage from '../ErrorPage/ErrorPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to a service like Sentry (optional).
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        // Allow fallback to be a Component or a function.
        return typeof fallback === 'function' ? fallback({ error, errorInfo }) : fallback;
      }

      // Default fallback.
      return <ErrorPage />
    }

    return children;
  }
}

export default ErrorBoundary;
