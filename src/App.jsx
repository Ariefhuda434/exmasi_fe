import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import Home from "./pages/Home"
import OrderStatus from "./pages/OrderStatus"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

function HomeLayout() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/order/:id" element={<OrderStatus />} />
        <Route path="/exmasi-secure-panel" element={<AdminLogin />} />
        <Route path="/exmasi-secure-panel/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}