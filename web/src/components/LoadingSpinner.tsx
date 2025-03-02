import React from "react";
import "./LoadingSpinner.css"; // 我们会创建这个CSS文件

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 