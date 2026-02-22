import { DollarSign } from "lucide-react";

export default function ExpensesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <DollarSign className="mb-4 h-12 w-12 text-neutral-600" />
      <h1 className="text-xl font-semibold text-white">Expenses</h1>
      <p className="mt-2 text-sm text-neutral-400">Coming soon</p>
    </div>
  );
}
