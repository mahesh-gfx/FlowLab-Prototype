import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWorkflows } from "../api/getWorkflows";
import "./styles/dashboard.css";

interface dashboardWorkflowElement {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
}

//TODO: Move this to Shared package/utilities
function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });
  const dayOfMonthFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const day = dayFormatter.format(date);
  const month = monthFormatter.format(date);
  const dayOfMonth = dayOfMonthFormatter.format(date);
  const time = timeFormatter.format(date);

  return `${day}, ${month} ${dayOfMonth} at ${time}`;
}

const Dashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState([]);
  const navigate = useNavigate();

  const handleClickOnDasbhoardWorkflowElement = (workflowId: string) => {
    navigate(`/workflow/${workflowId}`);
  };

  const handleCreateNewWorkflow = () => {
    navigate("/workflow/new");
  };

  useEffect(() => {
    getWorkflows().then((response) => {
      console.log("get workflows: ", response.data.workflows);
      setWorkflows(response.data.workflows);
    });
  }, []);

  return (
    <div className="page-container">
      <h3 className="page-title">Your Workflow Executions</h3>
      <ul className="workflow-list">
        {workflows.map((workflow: dashboardWorkflowElement, index) => (
          <li key={index}>
            <div
              className="workflow-dashboard-element"
              onClick={() => handleClickOnDasbhoardWorkflowElement(workflow.id)}
            >
              <div className="workflow-name">{workflow.name}</div>
              <div className="workflow-description">{workflow.description}</div>
              {/* <span className="workflow-created-at">
                Created {formatDate(workflow.createdAt)}
              </span> */}
              <span className="workflow-updated-at">
                {formatDate(workflow.updatedAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={handleCreateNewWorkflow}
        className="create-new-workflow-button"
      >
        Create New Workflow
      </button>
    </div>
  );
};

export default Dashboard;
