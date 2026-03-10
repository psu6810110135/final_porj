import { AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
    show: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmationModal({ show, onCancel, onConfirm }: ConfirmationModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-[#FF8A00]">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#5C3D2E] mb-2">ยืนยันการส่งข้อความ</h3>
                    <p className="text-gray-500 text-sm md:text-base">
                        คุณตรวจสอบข้อมูลครบถ้วน และต้องการส่งข้อความถึงทีมงานใช่หรือไม่?
                    </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-bold bg-[#FF8A00] hover:bg-[#e67c00] text-white shadow-md hover:shadow-lg transition-all"
                    >
                        ยืนยันการส่ง
                    </button>
                </div>
            </div>
        </div>
    );
}
