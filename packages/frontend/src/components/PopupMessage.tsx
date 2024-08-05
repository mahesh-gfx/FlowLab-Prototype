import React, { useEffect, useState } from "react";

export interface PopupMessageProps {
  message: string;
  type: "loading" | "error" | "success" | "invisible" | string;
  onClose: () => void;
}

const PopupMessage: React.FC<PopupMessageProps> = ({
  message,
  type,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (type === "success") {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  if (!visible) return null;

  const backgroundColor =
    type === "loading" ? "#3498db" : type === "error" ? "red" : "green";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: backgroundColor,
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: "200px",
        maxWidth: "80%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {type === "loading" && (
          <div
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              border: "3px solid #fff",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginRight: "10px",
            }}
          />
        )}
        <span>{message}</span>
      </div>
      {(type === "error" || type === "success") && (
        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default PopupMessage;
