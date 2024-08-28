import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MyPage from "./views/user/MyPage";
import Main from "./views/product/Main";
import ProductDetail from "./views/product/ProductDetail";
import Feed from "./views/feed/Feed";
import CreateFeed from "./views/feed/CreateFeed";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated} = useAuth();
 
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
 
  
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  const { isAuthenticated, logout, checkUser, User } = useAuth();

  useEffect(() => {
    checkUser();
  }, []);


  return (
    <Router>
      <div style={{
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        <Header isUser={isAuthenticated} onUpdateLoginStatus={logout} />
        <div style={{
          maxWidth: "600px",
          width: "100%",
          margin: "0px auto",
          flexGrow: 1,
          paddingTop: "100px",
          paddingBottom: "50px",
        }}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={
              <PublicRoute>
                {/* Add your login component here */}
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                {/* Add your signup component here */}
              </PublicRoute>
            } />
            <Route path="/mypage" element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            } />
            <Route path="/product/:product_id" element={<ProductDetail />} />
            <Route path="/feed" element={<Feed isLogin={isAuthenticated} authUser={User} />} />
            <Route path="/create" element={
              <PrivateRoute>
                <CreateFeed authUser={User} />
              </PrivateRoute>
            } />
          </Routes>
        </div>
        <Footer isUser={isAuthenticated} />
      </div>
    </Router>
  );
}

function App() {
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
