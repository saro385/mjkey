import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  status: string;
  nextStepTitle?: string;
  nextStepDescription?: string;
  nextStepButton?: React.ReactNode;
  backButton?: React.ReactNode;
}

export function ProgressCard({ 
  title, 
  current, 
  total, 
  status, 
  nextStepTitle,
  nextStepDescription,
  nextStepButton,
  backButton
}: ProgressCardProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Progress</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{title}</span>
            <span className="font-medium text-slate-800">{current} / {total}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Status */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              current > 0 && current < total 
                ? 'bg-blue-500' 
                : current === total && total > 0
                ? 'bg-emerald-500'
                : 'bg-slate-400'
            }`}></div>
            <span className="text-sm text-slate-600">{status}</span>
          </div>
        </div>
      </div>

      {/* Next Step Card */}
      {nextStepTitle && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{nextStepTitle}</h3>
          {nextStepDescription && (
            <p className="text-sm text-slate-600 mb-4">{nextStepDescription}</p>
          )}
          {nextStepButton}
        </div>
      )}

      {/* Back Button */}
      {backButton && backButton}
    </div>
  );
}
