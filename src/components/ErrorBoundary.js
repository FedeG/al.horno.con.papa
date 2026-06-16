import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error_boundary', {
        error_message: error.message,
        component_stack: info.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          background: '#F5F3ED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
          }}>
            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C4704F 0%, #B85C3E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '36px',
              color: '#ffffff',
              lineHeight: 1,
            }}>
              🍳
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#333',
              marginBottom: '12px',
            }}>
              Algo salió mal en la cocina
            </h1>

            <p style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#666',
              marginBottom: '8px',
            }}>
              Hubo un error inesperado mientras preparábamos esta página.
            </p>

            <p style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '32px',
            }}>
              No te preocupes, el error ya fue registrado.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #C4704F 0%, #B85C3E 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(196, 112, 79, 0.3)',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                Intentar de nuevo
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '14px 28px',
                  background: '#ffffff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#C4704F';
                  e.currentTarget.style.color = '#C4704F';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Volver al inicio
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '32px',
                textAlign: 'left',
                background: '#f0f0f0',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#666',
                }}>
                  Detalles del error (solo desarrollo)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#C4704F',
                  marginTop: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error?.message}
                  {this.state.error?.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
