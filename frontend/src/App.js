import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Categories from './pages/Categories';
import AddItem from './pages/Additem';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount'; // Import CreateAccount page
import EditPage from './pages/Edit'; // Import EditPage
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import Dashboard from './pages/Dashboard'; // Corrected import

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { authState } = useContext(AuthContext);

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && authState.role !== requiredRole) {
    return <Navigate to="/" />; // Redirect to dashboard for unauthorized roles
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
