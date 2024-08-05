import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  // This is a placeholder. In a real application, you'd fetch the workflows from an API or state management system.
  const workflows = ["Workflow 1", "Workflow 2", "Workflow 3"];

  return (
    <div>
      <h2>Your Workflows</h2>
      <ul>
        {workflows.map((workflow, index) => (
          <li key={index}>
            <Link to={`/workflow/${index + 1}`}>{workflow}</Link>
          </li>
        ))}
      </ul>
      <Link to="/workflow/new">Create New Workflow</Link>
    </div>
  );
};

export default Dashboard;
