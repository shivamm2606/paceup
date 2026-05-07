import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import api from "./lib/axios";
import useAuthStore from "./store/authStore";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Verified from "./pages/Verified";
import MainLayout from "./layouts/MainLayout";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Bodyweight from "./pages/Bodyweight";
import ActiveWorkout from "./pages/ActiveWorkout";
import WorkoutComplete from "./pages/WorkoutComplete";
import { Toaster } from "sonner";

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return null;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/welcome"} />;
}

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    api
      .get("/user/profile")
      .then((response) => {
        const user = response.data.data;
        setAuth(user);
        setLoading(false);
      })
      .catch((err) => {
        console.log("not logged in:", err);
        setLoading(false);
      });
  }, [setAuth, setLoading]);

  return (
    <>
      <Toaster
        position="bottom-center"
        theme="dark"
        style={{ bottom: "82px" }}
        toastOptions={{
          style: {
            background: "#16161e",
            border: "1px solid #24242e",
            color: "#f0f0f5",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "14px",
            padding: "12px 16px",
            maxWidth: "380px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/verified" element={<Verified />} />
        <Route path="/register" element={<Register />} />

        {/* protected + layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          {/* Workout pages — no bottom nav */}
          <Route path="/workout/:sessionId" element={<ActiveWorkout />} />
          <Route
            path="/workout/:sessionId/complete"
            element={<WorkoutComplete />}
          />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/workout" element={<ActiveWorkout />} />
            <Route path="/history" element={<div>History</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bodyweight" element={<Bodyweight />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
