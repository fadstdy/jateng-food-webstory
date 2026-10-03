import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-putih border border-garis rounded-xl text-center shadow-md">
          <h3 className="text-hijau-utama font-bold text-xl mb-2">Visualisasi gagal dimuat</h3>
          <p className="text-teks-sekunder text-sm">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}