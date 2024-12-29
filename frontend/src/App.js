import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Categories from './pages/Categories';
import Items from './pages/Items';
import Manager from './pages/Manager';
import AddItem from './pages/Additem';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount'; // Import CreateAccount page
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { authState } = useContext(AuthContext);

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && authState.role !== requiredRole) {
    return <Navigate to="/categories" />;
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
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:categoryId"
            element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Manager />
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

          {/* Default Route for Role-Based Navigation */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RedirectBasedOnRole />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Role-Based Redirection Component
const RedirectBasedOnRole = () => {
  const { authState } = useContext(AuthContext);

  if (authState.isAuthenticated) {
    return authState.role === 'Manager' ? <Navigate to="/manager" /> : <Navigate to="/categories" />;
  }

  return <Navigate to="/login" />;
};

export default App;
