import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function PasswordGate() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(password);
    if (!success) {
      setError('Incorrect password');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-aifi-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img
            src={import.meta.env.BASE_URL + 'assets/AiFi-LogoH-Inverted.svg'}
            alt="AiFi"
            className="h-10 mx-auto mb-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const span = document.createElement('span');
              span.className = 'text-white font-bold text-3xl tracking-wide';
              span.textContent = 'AiFi';
              (e.target as HTMLImageElement).parentElement!.appendChild(span);
            }}
          />
          <h1 className="text-xl font-semibold text-white mb-1">
            Rack Power Calculator
          </h1>
          <p className="text-sm text-white/50">
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-aifi-blue focus:border-transparent text-sm"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-aifi-blue text-white font-bold text-sm tracking-wider rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-12 text-xs text-white/20">
        Internal tool — AiFi Solutions Team
      </p>
    </div>
  );
}
