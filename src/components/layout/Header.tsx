import ProfileDropdown from '../../pages/profle/ProfileDropdown';

const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-xl font-semibold text-gray-800">Panel de Administración</h1>

        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;