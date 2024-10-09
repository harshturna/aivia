import Sidebar from "@/components/transformations/Sidebar";
import Navbar from "@/components/transformations/Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full relative">
      <div className="hidden h-full lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0  bg-gray-900">
        <Sidebar />
      </div>
      <main className="lg:pl-72 h-full">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default Layout;
