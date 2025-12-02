import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <h2 className="font-bold text-red-600 text-lg mb-2">Something went wrong</h2>
                        <p className="text-gray-700 mb-4">The component crashed. Here are the details:</p>
                        <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-60 border border-gray-300">
                            {this.state.error?.toString()}
                            {this.state.error?.stack && (
                                <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500">
                                    {this.state.error.stack}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
