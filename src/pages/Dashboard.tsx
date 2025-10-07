import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SellerDashboard from '@/components/dashboards/SellerDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'seller':
        return <SellerDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'logistics':
        return <LogisticsDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return <Layout>{renderDashboard()}</Layout>;
};

export default Dashboard;
