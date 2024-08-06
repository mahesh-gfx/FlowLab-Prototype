import React, { useContext, useState } from "react";
import { WorkflowContext } from "../context/WorkflowContext";
import Modal from "./Modal";
import "./styles/workflowOptions.css";

const WorkflowOptions: React.FC = () => {
  const { onExport, onImport, startWorkflowExecutionV2, isExecuting }: any =
    useContext(WorkflowContext);

  const [showModal, setShowModal] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onImport(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
      setShowModal(false);
    }
  };

  return (
    <div className="workflow-options">
      <button
        onClick={onExport}
        className="workflow-button-light"
        disabled={isExecuting}
      >
        Export Workflow
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="workflow-button-light"
        disabled={isExecuting}
      >
        Import Workflow
      </button>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div
          className={`drop-area ${dragging ? "dragging" : ""}`}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
                setShowModal(false);
              }
            }}
          />
          <p style={{ color: "black" }}>
            Drag & Drop your file here or click to upload
          </p>
        </div>
      </Modal>
      <button
        onClick={startWorkflowExecutionV2}
        disabled={isExecuting}
        className="workflow-button"
        style={{
          opacity: isExecuting ? 0.5 : 1,
          cursor: isExecuting ? "not-allowed" : "pointer",
        }}
      >
        {isExecuting ? "Executing workflow..." : "Save & Execute Workflow"}
      </button>
    </div>
  );
};

export default WorkflowOptions;
