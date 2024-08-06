import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWorkflows } from "../api/getWorkflows";
import "./styles/dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteWorkflowById } from "../api/deleteWorkflowById";

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
  const [workflows, setWorkflows] = useState<Array<any>>([]);
  const navigate = useNavigate();

  const handleClickOnDasbhoardWorkflowElement = (workflowId: string) => {
    navigate(`/workflow/${workflowId}`);
  };

  const handleCreateNewWorkflow = () => {
    navigate("/workflow/new");
  };

  const onDeleteWorkflow = (event: React.MouseEvent, workflowId: string) => {
    event.stopPropagation();
    console.log("Deleting workflow ", workflowId);
    deleteWorkflowById(workflowId).then((response) => {
      console.log("Delete workflow response: ", response);
    });
    setWorkflows((prev) =>
      prev.filter((workflow) => workflow.id == workflowId)
    );
  };

  useEffect(() => {
    getWorkflows().then((response) => {
      console.log("get workflows: ", response.data.workflows);
      if (
        response.data.workflows != undefined &&
        response.data.workflows != null
      )
        setWorkflows(response.data.workflows);
    });
  }, []);

  return (
    <div className="page-container">
      <h3 className="page-title">Your Workflow Executions</h3>
      <ul className="workflow-list">
        {workflows.length > 0 ? (
          workflows.map((workflow: dashboardWorkflowElement, index) => (
            <li key={index}>
              <div
                className="workflow-dashboard-element"
                onClick={() =>
                  handleClickOnDasbhoardWorkflowElement(workflow.id)
                }
              >
                <div className="workflow-info">
                  <div className="workflow-name">{workflow.name}</div>
                  <div className="workflow-description">
                    {workflow.description}
                  </div>
                  {/* <span className="workflow-created-at">
                Created {formatDate(workflow.createdAt)}
              </span> */}
                  <span className="workflow-updated-at">
                    {formatDate(workflow.updatedAt)}
                  </span>
                </div>
                <div className="delete-workflow-btn-wrapper">
                  <button
                    className="delete-button"
                    onClick={(event) => onDeleteWorkflow(event, workflow.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <span className="no-workflow-found">
            No workflows found! <Link to="/workflow/new">Create one</Link>...
          </span>
        )}
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
