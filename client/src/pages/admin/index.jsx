import React from "react";
import {
  CommonDashboardItems,
  AdminDashboardItems,
} from "../../data/DashboardData";
import Dashboard from "../../components/UI/Dashboard";

function AdminDashboard() {
  const items = CommonDashboardItems.concat(AdminDashboardItems);

  return <Dashboard items={items} />;
}

AdminDashboard.forAdmin = true;
export default AdminDashboard;
