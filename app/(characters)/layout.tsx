import Navbar from "@/components/Characters/Navbar";
import Sidebar from "@/components/Characters/Sidebar";

const CharactersLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full relative">
      {/* <Navbar /> */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0  bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default CharactersLayout;
