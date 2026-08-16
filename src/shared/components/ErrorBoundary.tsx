import React from "react";
import { Section } from "./Section";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Section
          id=""
          className="h-screen w-screen flex items-center justify-center roboto-flex-font px-4 break-words"
        >
          <div className="text-center">
            <h1 className="sm:text-7xl text-6xl font-semibold leading-none text-sky-300 mb-8">
              Something went wrong.
            </h1>
            <p className="text-base mb-16">
              Please try again, or head back to the homepage.
            </p>
            <button
              onClick={this.handleReload}
              className="text-rose-500 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Back to Homepage
            </button>
          </div>
        </Section>
      );
    }

    return this.props.children;
  }
}
