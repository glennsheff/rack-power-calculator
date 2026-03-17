import { useHardware } from '../context/HardwareContext';
import { useRack } from '../context/RackContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { hardware } = useHardware();
  const { savedConfigs } = useRack();
  const navigate = useNavigate();

  const activeHardware = hardware.filter((h) => h.isActive).length;
  const categories = new Set(hardware.map((h) => h.category)).size;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-aifi-black mb-2">
          Welcome to the Rack Power Calculator
        </h2>
        <p className="text-aifi-black-60 leading-relaxed max-w-2xl">
          Spec out power, UPS, and cooling requirements for comms and server racks.
          Select your hardware, configure options, and get presentation-ready specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Hardware Items" value={activeHardware} sub={`${hardware.length} total`} />
        <StatCard label="Categories" value={categories} sub="in library" />
        <StatCard label="Saved Configs" value={savedConfigs.length} sub="rack configurations" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          title="Rack Calculator"
          description="Configure a rack with hardware items and calculate power, UPS, and cooling requirements."
          buttonLabel="Open Calculator"
          onClick={() => navigate('/calculator')}
        />
        <ActionCard
          title="Hardware Library"
          description="Manage the catalogue of available hardware items with power specs and details."
          buttonLabel="Manage Hardware"
          onClick={() => navigate('/hardware')}
          variant="secondary"
        />
      </div>

      {savedConfigs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-aifi-black mb-3">Recent Configurations</h3>
          <div className="bg-white rounded-xl border border-aifi-gray/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-aifi-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-aifi-black-80">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-aifi-black-80">Store</th>
                  <th className="text-left px-4 py-3 font-semibold text-aifi-black-80">Region</th>
                  <th className="text-left px-4 py-3 font-semibold text-aifi-black-80">Items</th>
                  <th className="text-left px-4 py-3 font-semibold text-aifi-black-80">Updated</th>
                </tr>
              </thead>
              <tbody>
                {savedConfigs.slice(0, 5).map((config) => (
                  <tr
                    key={config.id}
                    className="border-t border-aifi-gray/20 hover:bg-aifi-blue-10/50 cursor-pointer transition-colors"
                    onClick={() => {
                      navigate('/calculator');
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{config.name || 'Untitled'}</td>
                    <td className="px-4 py-3 text-aifi-black-60">{config.storeName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-aifi-blue-10 text-aifi-blue text-xs font-semibold rounded-full">
                        {config.region}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-aifi-black-60">{config.items.length}</td>
                    <td className="px-4 py-3 text-aifi-black-60 text-xs">
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-aifi-gray/30 p-5">
      <p className="text-sm text-aifi-black-60 mb-1">{label}</p>
      <p className="text-3xl font-bold text-aifi-black">{value}</p>
      <p className="text-xs text-aifi-black-60 mt-1">{sub}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  buttonLabel,
  onClick,
  variant = 'primary',
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <div className="bg-white rounded-xl border border-aifi-gray/30 p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-aifi-black mb-2">{title}</h3>
      <p className="text-sm text-aifi-black-60 mb-5 flex-1">{description}</p>
      <button
        onClick={onClick}
        className={`self-start px-5 py-2.5 text-sm font-bold tracking-wider rounded-full transition-colors ${
          variant === 'primary'
            ? 'bg-aifi-blue text-white hover:bg-blue-600'
            : 'bg-aifi-gray-50 text-aifi-black hover:bg-aifi-gray'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
