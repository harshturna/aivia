import Navbar from "@/components/Characters/Navbar";
import Sidebar from "@/components/Characters/Sidebar";

const CharactersLayout = ({ children }: { children: React.ReactNode }) => {
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

export default CharactersLayout;
