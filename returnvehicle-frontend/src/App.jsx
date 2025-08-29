import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, RoleRoute } from "./routes/guards";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileEdit from "./pages/ProfileEdit";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Auth required (any role) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/edit" element={<ProfileEdit />} />
            </Route>

            {/* Role-based */}
            <Route element={<RoleRoute allow={["user"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
            </Route>

            <Route element={<RoleRoute allow={["driver"]} />}>
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
            </Route>

            <Route element={<RoleRoute allow={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
