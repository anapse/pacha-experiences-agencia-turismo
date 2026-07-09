import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import ToastContainer from '../common/ToastContainer';
import ChatWidget from '../chat/ChatWidget';
import ConstructionModal from '../common/ConstructionModal';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <ConstructionModal />
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
