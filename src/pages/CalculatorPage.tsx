import { RackConfigurator } from '../components/calculator/RackConfigurator';

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-aifi-black">Rack Calculator</h1>
        <p className="mt-1 text-sm text-aifi-black-60">
          Configure your rack hardware and get UPS, power, and cooling recommendations
        </p>
      </div>
      <RackConfigurator />
    </div>
  );
}
