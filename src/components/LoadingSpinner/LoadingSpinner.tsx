import React from "react";
import { CircularProgress } from "@mui/material";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;

  visible?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  fullScreen = true,
  visible,
}) => {
  const isVisible = visible === undefined ? true : visible;

  return (
    <div
      className={`loading-spinner-container ${
        fullScreen ? "full-screen" : ""
      } ${isVisible ? "is-visible" : "is-hidden"}`}
    >
      <div className="loading-spinner-content">
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: "#282D86",
          }}
        />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
