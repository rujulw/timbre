import Navbar from './Navbar.jsx';

const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20">{children}</div>
    </div>
  );
};

export default ProtectedLayout;
