import { Component } from "react";
import { AlertCircle } from "lucide-react";

export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#05080F] noise flex items-center justify-center p-6" data-testid="admin-error-boundary">
        <div className="glass-strong rounded-2xl max-w-md w-full p-7 text-center">
          <AlertCircle size={24} className="mx-auto text-amber-300"/>
          <h1 className="mt-4 font-display text-[22px] font-semibold text-white">Admin console could not render</h1>
          <p className="mt-2 text-[13.5px] text-[#9AA3B8]">
            Refresh the page or sign in again. The site remains available while the admin data recovers.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-5 mx-auto !py-2.5"
          >
            Refresh admin
          </button>
        </div>
      </div>
    );
  }
}
