import { GPA_CONFIG, ACADEMIC_RULES } from '../../../../constants';
import type { GPAPullInputSectionProps } from '../../types';

export function GPAPullInputSection({
    targetGPAInput,
    setTargetGPAInput,
    targetGpaError,
    minTargetGpa
}: GPAPullInputSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-start gap-3">
                <label htmlFor="gpa-pull-target" className="mt-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                    GPA mục tiêu
                </label>
                <div>
                    <input
                        id="gpa-pull-target"
                        type="number"
                        min={minTargetGpa}
                        max={ACADEMIC_RULES.MAX_GPA}
                        step={0.1}
                        value={targetGPAInput}
                        onChange={(e) => setTargetGPAInput(e.target.value)}
                        placeholder="8.0"
                        aria-label="GPA mong muốn lúc ra trường"
                        className={`w-28 px-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent ${targetGpaError
                            ? 'border-red-300 focus:ring-red-300'
                            : 'border-gray-200 focus:ring-[#004A98]'
                            }`}
                    />
                    <div className="min-h-[1.25rem] mt-1">
                        {targetGpaError && (
                            <p className="text-sm text-red-600" role="alert" aria-live="polite">
                                {targetGpaError}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {GPA_CONFIG.slice(0, 4).map((config) => (
                    <button
                        key={config.value}
                        type="button"
                        onClick={() => setTargetGPAInput(String(config.value))}
                        className="px-2 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-[#004A98] hover:text-white hover:border-[#004A98] transition-colors"
                    >
                        {config.value}
                    </button>
                ))}
            </div>
        </div>
    );
}
