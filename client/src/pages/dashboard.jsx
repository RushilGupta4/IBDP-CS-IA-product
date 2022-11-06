import React from 'react';
import useUser from '../hooks/useUser';
import { CommonDashboardItems, AdminDashboardItems, EmployeeDashboardItems } from "../data/DashboardData";
import GenericDashboard from "../components/UI/GenericDashboard";


function Dashboard() {
    const { user } = useUser();

    if (user.isAdmin) {
        return <GenericDashboard items={CommonDashboardItems.concat(AdminDashboardItems)} />
    }
    return <GenericDashboard items={CommonDashboardItems.concat(EmployeeDashboardItems)} />
}

Dashboard.forAdmin = true;
Dashboard.forEmployee = true;
export default Dashboard;
