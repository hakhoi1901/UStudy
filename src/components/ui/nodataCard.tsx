import { Database } from "lucide-react";
import { BookmarkletButton } from "../BookmarkletButton";

export function NoDataCard() {
    return (
        <div className="flex h-[calc(100vh-100px)] items-center justify-center">
            <div className="text-center max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có dữ liệu</h2>
                <p className="text-gray-600 mb-6">
                    Kéo Bookmarklet Tool Cào Dữ Liệu vào Bookmark bar của bạn để bắt đầu.
                </p>
                <BookmarkletButton />
            </div>
        </div>
    );
}