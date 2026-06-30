import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';

export default function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
