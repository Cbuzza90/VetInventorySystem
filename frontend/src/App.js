import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Categories from './pages/Categories';
import AddItem from './pages/Additem';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import EditPage from './pages/Edit';
import EditAccounts from './pages/EditAccounts'; // Import EditAccounts component
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { authState } = useContext(AuthContext);

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && authState.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/:categoryId/add-item"
            element={
              <ProtectedRoute requiredRole="Manager">
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/create-account"
            element={
              <ProtectedRoute requiredRole="Manager">
                <CreateAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:type/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <EditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/EditAccounts"
            element={
              <ProtectedRoute requiredRole="Manager">
                <EditAccounts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
