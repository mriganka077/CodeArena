import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Homepage/Home";
import DrivePreview from "./pages/Drive/DrivePreview";
import Assessment from "./pages/InterView/Assessment.jsx";

import PracticeSet from "./pages/Prcaticeset/PracticeSet.jsx";
import DomainSelectorPage from "./pages/Prcaticeset/DomainSelectorPage";
import MockInterviewFeedback from "./pages/LoginProfile/MockInterviewFeedback.jsx";
import ProfileDashboard from "./pages/LoginProfile/ProfileDashboard";
import AuthPage from "./pages/LoginProfile/AuthPage";
import ForgotPassword from "./pages/LoginProfile/ForgotPassword";
import "./App.css";
import SignUp from "./pages/SignUp/SignUp";
import NotFound from "./pages/NotFound";



import { useAuth } from "./context/AuthContext.jsx";
// import Dashboard from "./pages/Dashboard.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Interview from "./pages/InterView/Interview.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
// import CandidatesPage from "./components/admin/sidebar/Candidatespage.jsx";
import AdminLoginPage from "./pages/Admin/AdminLoginPage.jsx";
// import AdminDrive from "./components/admin/sidebar/AdminDrive.jsx";
import UserProfileForm from "./pages/Registration/UserProfileForm.jsx";
import AdminAssessments from "./components/admin/sidebar/AdminAssessments.jsx";
import AdminInterview from "./components/admin/sidebar/AdminInterview.jsx";
import InterviewComplete from "./pages/InterView/InterviewComplete.jsx";
import ResultPage from './pages/Drive/ResultPage'; // Add this line


function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return (

    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/" element={<Home />} />
      <Route path="/drive" element={<DrivePreview />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/domainselector" element={<DomainSelectorPage />} />
      {/* <Route path="/dash" element={<Dash />} /> */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/interviewfeedback" element={<MockInterviewFeedback />} />

      <Route
        path="/adminlogin"
        element={
          localStorage.getItem("adminToken")
            ? <Navigate to="/admin" replace />
            : <AdminLoginPage />
        }
      />

      <Route
        path="/admin"
        element={
          localStorage.getItem("adminToken")
            ? <AdminDashboard />
            : <Navigate to="/adminlogin" replace />
        }
      />
      <Route path="/admin/assessments" element={<AdminAssessments />} />
      <Route path="/admin/interview" element={<AdminInterview />} />

      <Route path="/interview/:driveId" element={<Interview />} />
      <Route path="/interviewdone" element={<InterviewComplete/>} />
      <Route path="/registration" element={<UserProfileForm />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/practiceset" 
        element={
          <ProtectedRoute>
            <PracticeSet />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileDashboard />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/drive/result/:driveId/:type" 
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />


      {/* Default redirect */}
      {/* <Route
        path="*"
        element={
            isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
        }
      /> */}

    </Routes>
  );
}

export default App;
