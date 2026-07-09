import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import Loading from './components/common/Loading';
import useVisitTracker from './hooks/useVisitTracker';

// Lazy loading de páginas
const Home = lazy(() => import('./pages/Home'));
const Experiences = lazy(() => import('./pages/Experiences'));
const Booking = lazy(() => import('./pages/Booking'));
const Calendar = lazy(() => import('./pages/Calendar'));
const MyReservation = lazy(() => import('./pages/MyReservation'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Detail = lazy(() => import('./pages/Detail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminExperiences = lazy(() => import('./pages/admin/Experiences'));
const AdminDrivers = lazy(() => import('./pages/admin/Drivers'));
const AdminOperators = lazy(() => import('./pages/admin/Operators'));
const AdminVehicles = lazy(() => import('./pages/admin/Vehicles'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminBilling = lazy(() => import('./pages/admin/Billing'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminCarousel = lazy(() => import('./pages/admin/Carousel'));

export default function App() {
  useVisitTracker();

  return (
    <Suspense fallback={<Loading fullScreen text="Cargando..." />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/experiencias" element={<Experiences />} />
          <Route path="/experiencia/:slug" element={<Detail />} />
          <Route path="/experiencias/:slug" element={<Booking />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/mi-reserva" element={<MyReservation />} />
          <Route path="/mis-tickets" element={<MyTickets />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>

        {/* Rutas admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservas" element={<AdminBookings />} />
          <Route path="experiencias" element={<AdminExperiences />} />
          <Route path="clientes" element={<AdminClients />} />
          <Route path="calendario" element={<AdminCalendar />} />
          <Route path="conductores" element={<AdminDrivers />} />
          <Route path="operadores" element={<AdminOperators />} />
          <Route path="vehiculos" element={<AdminVehicles />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="facturacion" element={<AdminBilling />} />
          <Route path="reportes" element={<AdminReports />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="configuracion" element={<AdminSettings />} />
          <Route path="carrusel" element={<AdminCarousel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}
