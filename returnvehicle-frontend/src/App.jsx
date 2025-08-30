import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RidesPage from "./pages/Rides";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchPage from "./pages/Search";
import BookingPage from "./pages/Booking";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { ProtectedRoute, RoleRoute } from "./routes/guards";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/rides" element={<RidesPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Shared profile routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />

              {/* Role-based gates */}
              <Route element={<RoleRoute allow={["user"]} />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
              </Route>
              <Route element={<RoleRoute allow={["driver"]} />}>
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
              </Route>
              <Route element={<RoleRoute allow={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Fallbacks */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}
