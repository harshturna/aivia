import MobileSidebar from "./MobileSidebar";
import LogoutButton from "../LogoutButton";

const Navbar = async () => {
  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Navbar;
