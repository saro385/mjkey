interface StepIndicatorProps {
  currentStep: 1 | 2;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
          currentStep >= 1 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          1
        </div>
        <span className={`ml-3 text-sm font-medium ${
          currentStep >= 1 ? 'text-slate-800' : 'text-slate-500'
        }`}>
          Generate Keywords
        </span>
      </div>
      <div className="w-12 h-px bg-slate-300"></div>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
          currentStep >= 2 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          2
        </div>
        <span className={`ml-3 text-sm font-medium ${
          currentStep >= 2 ? 'text-slate-800' : 'text-slate-500'
        }`}>
          Generate Prompts
        </span>
      </div>
    </div>
  );
}
