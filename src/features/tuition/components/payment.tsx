import { ExternalLink, FileText, Copy, Check } from "lucide-react";

export function Payment({ paymentLink, handleCopyLink, handleOpenLink, copiedLink }: { paymentLink: string, handleCopyLink: () => void, handleOpenLink: () => void, copiedLink: boolean }) {
    return (
        <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <ExternalLink className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm md:text-base font-bold text-gray-900 mb-0.5 md:mb-1">Thanh toán online</p>
                    <p className="text-xs md:text-sm text-gray-600">Thanh toán nhanh chóng và an toàn qua cổng trường</p>
                </div>
            </div>

            {/* Link Box */}
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 mb-3 md:mb-4 hover:border-blue-400 transition-colors">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#004A98] flex-shrink-0" />
                <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs md:text-sm text-[#004A98] hover:underline font-semibold flex-1 break-all"
                >
                    {paymentLink}
                </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 text-xs md:text-sm font-semibold shadow-sm hover:shadow-md"
                >
                    {copiedLink ? (
                        <>
                            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                            <span className="text-green-600">Đã sao chép!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Sao chép link</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleOpenLink}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-[#004A98] to-[#0066CC] hover:from-[#003A78] hover:to-[#0052A3] text-white rounded-lg transition-all duration-200 text-xs md:text-sm font-semibold shadow-md hover:shadow-lg"
                >
                    <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Mở trong tab mới</span>
                </button>
            </div>
        </div>
    )
}
