export interface Step {
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className = "" }: ProgressStepsProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: Simple progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-zinc-500">
            {steps[currentStep].label}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFuture = index > currentStep;

            return (
              <div key={index} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  {/* Step circle */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                        transition-all duration-300
                        ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                        ${isCurrent ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white ring-4 ring-emerald-100' : ''}
                        ${isFuture ? 'bg-zinc-200 text-zinc-500' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>

                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <div
                      className={`
                        text-xs font-medium transition-colors duration-300
                        ${isCompleted || isCurrent ? 'text-zinc-900' : 'text-zinc-500'}
                      `}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-6">
                    <div
                      className={`
                        h-full transition-all duration-500
                        ${index < currentStep ? 'bg-emerald-600' : 'bg-zinc-200'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
