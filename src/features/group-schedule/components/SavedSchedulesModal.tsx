import React from 'react';
import { List, X, Clock, Check, Trash2 } from 'lucide-react';
import type { SavedSchedule } from '../../../types';

interface SavedSchedulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSchedules: SavedSchedule[];
  onLoadSchedule: (saved: SavedSchedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export function SavedSchedulesModal({
  isOpen,
  onClose,
  savedSchedules,
  onLoadSchedule,
  onDeleteSchedule,
}: SavedSchedulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <List className="w-4 h-4 text-blue-600" />
            Lịch học đã lưu
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-3 md:p-4" style={{ maxHeight: '60vh' }}>
          {savedSchedules.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Chưa có phương án nào được lưu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {savedSchedules.map((saved) => (
                <div key={saved.id} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between shadow-sm">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="font-bold text-gray-900 truncate text-xs md:text-sm uppercase tracking-wide">{saved.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(saved.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                        {saved.selectedCourses.length} môn
                      </span>
                      {saved.groupSchedule && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Nhóm · {saved.groupSchedule.members.length} thành viên
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (window.confirm('Hành động này sẽ thay đổi danh sách môn học bạn đang chọn. Bạn có chắc chắn?')) {
                          onLoadSchedule(saved);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Xem
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) {
                          onDeleteSchedule(saved.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <p className="text-[10px] text-gray-400">* Lịch được lưu trữ cục bộ trên trình duyệt của bạn.</p>
        </div>
      </div>
    </div>
  );
}
