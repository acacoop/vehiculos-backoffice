import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  fullScreen = true,
}) => {
  return (
    <div
      className={`loading-spinner-container ${fullScreen ? "full-screen" : ""}`}
    >
      <div className="loading-spinner-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
