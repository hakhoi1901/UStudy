import React from 'react';
import {
    Shield, Lock, KeyRound, Server, Eye, EyeOff, Fingerprint,
    HardDriveDownload, Trash2, RefreshCw, AlertTriangle, CheckCircle2,
    ArrowRight, FileKey2, Globe, Cpu
} from 'lucide-react';

const sections = [
    {
        id: 'overview',
        icon: Shield,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
        title: 'Tổng quan bảo mật',
        content: 'UStudy được thiết kế với nguyên tắc "Privacy by Design" — quyền riêng tư của bạn được đặt lên hàng đầu trong mọi quyết định kiến trúc. Toàn bộ dữ liệu cá nhân (điểm số, lịch học, thông tin sinh viên) được mã hóa ngay trên thiết bị của bạn trước khi lưu vào bộ nhớ trình duyệt. Không có bất kỳ dữ liệu nào được gửi lên máy chủ của chúng tôi.',
    },
    // {
    //     id: 'encryption',
    //     icon: Lock,
    //     iconColor: 'text-indigo-600',
    //     iconBg: 'bg-indigo-50',
    //     title: 'Mã hóa dữ liệu',
    //     items: [
    //         { icon: FileKey2, label: 'Thuật toán', desc: 'PBKDF2 (310,000 vòng lặp) + AES-GCM 256-bit — tiêu chuẩn mã hóa được sử dụng bởi các tổ chức tài chính và chính phủ trên thế giới.' },
    //         { icon: KeyRound, label: 'Khóa mã hóa', desc: 'CryptoKey chỉ tồn tại trong RAM (bộ nhớ tạm) và không bao giờ được ghi ra ổ cứng hay localStorage. Khi bạn đóng tab hoặc khóa ứng dụng, khóa sẽ bị xóa hoàn toàn.' },
    //         { icon: RefreshCw, label: 'Salt & IV ngẫu nhiên', desc: 'Mỗi người dùng có Salt 16 byte riêng, mỗi lần mã hóa sử dụng IV 12 byte ngẫu nhiên — đảm bảo cùng một dữ liệu sẽ tạo ra ciphertext khác nhau mỗi lần.' },
    //         { icon: Fingerprint, label: 'Xác thực toàn vẹn', desc: 'AES-GCM tự động kiểm tra tính toàn vẹn (authentication tag). Bất kỳ thay đổi nào trên dữ liệu đã mã hóa sẽ bị phát hiện và từ chối giải mã.' },
    //     ],
    // },
    {
        id: 'data-storage',
        icon: HardDriveDownload,
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
        title: 'Nơi lưu trữ dữ liệu',
        items: [
            { icon: Globe, label: '100% Client-side', desc: 'Toàn bộ dữ liệu được lưu trong localStorage của trình duyệt bạn. Không có máy chủ (server) nào của UStudy lưu trữ dữ liệu cá nhân của bạn.' },
            { icon: EyeOff, label: 'Không theo dõi', desc: 'UStudy không sử dụng cookie theo dõi, fingerprinting, hay bất kỳ hình thức thu thập dữ liệu hành vi nào. Chúng tôi không biết bạn là ai, bạn dùng tính năng gì.' },
            { icon: Server, label: 'Không có database trung tâm', desc: 'Không tồn tại cơ sở dữ liệu tập trung chứa thông tin sinh viên. Mỗi người dùng là một "đảo" độc lập — dữ liệu của bạn chỉ thuộc về bạn.' },
        ],
    },
    // {
    //     id: 'auth',
    //     icon: KeyRound,
    //     iconColor: 'text-amber-600',
    //     iconBg: 'bg-amber-50',
    //     title: 'Xác thực & Mật khẩu',
    //     items: [
    //         { icon: Lock, label: 'Mật khẩu không lưu trữ', desc: 'Mật khẩu của bạn không bao giờ được lưu dưới dạng plaintext hay hash. Nó chỉ được dùng để derive khóa AES thông qua PBKDF2, sau đó biến mất khỏi RAM.' },
    //         { icon: Cpu, label: 'Chống brute-force', desc: 'PBKDF2 với 310,000 iterations khiến mỗi lần thử mật khẩu mất ~0.5 giây. Kẻ tấn công cần hàng chục năm để dò mật khẩu 4 ký tự đơn giản.' },
    //         { icon: AlertTriangle, label: 'Khóa tạm thời', desc: 'Sau nhiều lần nhập sai, hệ thống tự động khóa tạm thời với thời gian tăng dần — ngăn chặn tấn công brute-force trực tiếp.' },
    //     ],
    // },
    {
        id: 'rights',
        icon: Eye,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50',
        title: 'Quyền dữ liệu cá nhân của bạn',
        items: [
            { icon: Eye, label: 'Quyền được biết', desc: 'Bạn luôn biết chính xác dữ liệu nào được lưu, ở đâu, và được mã hóa bằng cách nào. Trang này chính là minh chứng cho quyền đó.' },
            { icon: HardDriveDownload, label: 'Quyền xuất dữ liệu', desc: 'Bạn có thể xuất toàn bộ dữ liệu ra file backup mã hóa bất cứ lúc nào thông qua tính năng Sao lưu ở trang Cài đặt.' },
            { icon: Trash2, label: 'Quyền xóa dữ liệu', desc: 'Bạn có thể xóa toàn bộ dữ liệu ngay lập tức bằng cách Đăng xuất hoặc "Quên mật khẩu" trên màn hình khóa. Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.' },
            { icon: RefreshCw, label: 'Quyền đồng bộ lại', desc: 'Sau khi xóa, bạn luôn có thể đồng bộ lại dữ liệu từ Portal trường thông qua Bookmarklet — không cần liên hệ hỗ trợ.' },
        ],
    },
    {
        id: 'risks',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
        title: 'Rủi ro bạn nên biết',
        items: [
            { icon: AlertTriangle, label: 'Quên mật khẩu', desc: 'Nếu quên mật khẩu, dữ liệu đã mã hóa không thể giải mã được. Hệ thống sẽ yêu cầu xóa toàn bộ và đồng bộ lại từ Portal. Đây là đánh đổi cần thiết để bảo vệ quyền riêng tư.' },
            { icon: Globe, label: 'Môi trường không bảo mật', desc: 'UStudy yêu cầu HTTPS hoặc môi trường bảo mật (như ứng dụng APK) để hoạt động. Nếu chạy trên HTTP, mã hóa sẽ bị vô hiệu hóa — không nên sử dụng trong trường hợp này.' },
            { icon: Server, label: 'Trình duyệt dùng chung', desc: 'Nếu nhiều người dùng cùng một trình duyệt, dữ liệu của bạn có thể bị người khác truy cập. Hãy luôn khóa hoặc đăng xuất khi rời khỏi máy tính dùng chung.' },
        ],
    },
    {
        id: 'recommendations',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
        title: 'Khuyến nghị bảo mật',
        items: [
            { icon: KeyRound, label: 'Sử dụng mật khẩu mạnh', desc: 'Chọn mật khẩu từ 8 ký tự trở lên, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt. Tránh ngày sinh, tên, hoặc mật khẩu đơn giản như "1234".' },
            { icon: HardDriveDownload, label: 'Sao lưu thường xuyên', desc: 'Xuất file backup định kỳ và lưu ở nơi an toàn (USB, cloud riêng). Nếu quên mật khẩu, file backup là cách duy nhất để khôi phục dữ liệu mà không cần đồng bộ lại.' },
            { icon: Lock, label: 'Khóa khi rời khỏi', desc: 'Sử dụng nút "Khóa ngay" hoặc "Đăng xuất" khi rời khỏi máy tính. CryptoKey sẽ bị xóa khỏi RAM và ứng dụng yêu cầu nhập lại mật khẩu.' },
            { icon: Globe, label: 'Chỉ sử dụng HTTPS', desc: 'Luôn truy cập UStudy qua HTTPS hoặc ứng dụng APK. Không bao giờ sử dụng trên kết nối HTTP vì dữ liệu có thể bị nghe lén.' },
        ],
    },
];

export function PrivacySecurity() {
    return (
        <div className="max-w-[1600px] mx-auto w-full">
            <div className="mb-6 md:mb-8">
                <h1 className="text-gray-900 mb-1 md:mb-2">Bảo mật & Quyền dữ liệu cá nhân</h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Tìm hiểu cách UStudy bảo vệ dữ liệu của bạn và các quyền bạn có đối với thông tin cá nhân.
                </p>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-6">

                    {/* Quick summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: 'Mã hóa', value: 'AES-256', icon: Lock, color: 'text-indigo-600 bg-indigo-50' },
                            { label: 'Nơi lưu trữ', value: 'Thiết bị bạn', icon: Globe, color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Gửi lên server', value: 'Không có', icon: EyeOff, color: 'text-red-600 bg-red-50' },
                            { label: 'PBKDF2', value: '310K vòng', icon: Cpu, color: 'text-amber-600 bg-amber-50' },
                        ].map((card) => (
                            <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
                                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mx-auto mb-2`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                                <p className="text-sm font-bold text-gray-900">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Sections */}
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                            <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                <div className={`w-8 h-8 rounded-lg ${section.iconBg} flex items-center justify-center`}>
                                    <section.icon className={`w-4 h-4 ${section.iconColor}`} />
                                </div>
                                {section.title}
                            </h2>

                            {section.content && (
                                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                            )}

                            {section.items && (
                                <div className="mt-4 flex flex-col gap-4">
                                    {section.items.map((item) => (
                                        <div key={item.label} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <item.icon className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Architecture diagram */}
                    <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                        <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-slate-600" />
                            </div>
                            Quy trình mã hóa
                        </h2>
                        <div className="flex flex-col md:flex-row items-stretch gap-3">
                            {[
                                { step: '1', title: 'Nhập mật khẩu', desc: 'Bạn nhập mật khẩu trên giao diện' },
                                { step: '2', title: 'PBKDF2 Derive', desc: 'Mật khẩu + Salt → CryptoKey (310K vòng)' },
                                { step: '3', title: 'AES-GCM Encrypt', desc: 'Dữ liệu + IV ngẫu nhiên → Ciphertext' },
                                { step: '4', title: 'Lưu localStorage', desc: 'Chỉ ciphertext được lưu, khóa nằm trong RAM' },
                            ].map((item, i) => (
                                <React.Fragment key={item.step}>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                                        <div className="w-8 h-8 rounded-full bg-[#004A98] text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                                            {item.step}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 mb-1">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    {i < 3 && (
                                        <div className="hidden md:flex items-center text-gray-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Data classification */}
                    <div className="bg-white rounded-xl p-4 md:p-8 border border-gray-200 shadow-sm w-full">
                        <h2 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                                <Eye className="w-4 h-4 text-sky-600" />
                            </div>
                            Phân loại dữ liệu
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Loại dữ liệu</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Ví dụ</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã hóa</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Gửi lên server</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Dữ liệu nhạy cảm', 'Điểm số, thông tin SV, lịch học', 'AES-256-GCM', 'Không'],
                                        ['Cài đặt ứng dụng', 'Khoa, học kỳ, giao diện', 'Không (plaintext)', 'Không'],
                                        ['Khóa bảo mật', 'Salt, verify blob', 'N/A (hệ thống)', 'Không'],
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                            {row.map((cell, j) => (
                                                <td key={j} className={`py-3 px-4 ${j === 2 && cell === 'AES-256-GCM' ? 'text-green-600 font-medium' : j === 3 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer commitment */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800 mb-1">Cam kết của chúng tôi</p>
                                <p className="text-sm text-blue-600 leading-relaxed">
                                    UStudy sẽ không bao giờ thay đổi nguyên tắc "dữ liệu thuộc về bạn". Mọi cập nhật liên quan đến bảo mật sẽ được thông báo rõ ràng.
                                    Nếu bạn phát hiện lỗ hổng bảo mật, vui lòng báo cáo qua trang "Báo cáo lỗi" trong Cài đặt.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
