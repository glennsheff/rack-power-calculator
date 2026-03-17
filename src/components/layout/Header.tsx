import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-aifi-gray/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-aifi-gray-50 text-aifi-black-60"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-aifi-black">{title}</h1>
      </div>
      <button
        onClick={logout}
        className="text-sm text-aifi-black-60 hover:text-aifi-black transition-colors"
      >
        Sign Out
      </button>
    </header>
  );
}
