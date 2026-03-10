import React from "react";
import { ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    message: string;
}

interface ContactFormProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    submitStatus: "idle" | "success" | "error";
    statusMessage: string;
    isPhoneDropdownOpen: boolean;
    setIsPhoneDropdownOpen: (open: boolean) => void;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
    phoneCodes: { code: string; label: string }[];
}

export function ContactForm({
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    submitStatus,
    statusMessage,
    isPhoneDropdownOpen,
    setIsPhoneDropdownOpen,
    setFormData,
    messageInputRef,
    phoneCodes,
}: ContactFormProps) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-50 lg:sticky lg:top-28">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#5C3D2E] mb-6">สนใจติดต่อ</h2>

            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="ชื่อจริง"
                        required
                        className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50"
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="นามสกุล"
                        required
                        className="flex-1 min-w-0 p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50"
                    />
                </div>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="อีเมลของคุณ"
                    required
                    className="w-full p-3.5 rounded-2xl md:rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm bg-gray-50/50"
                />

                {/* Custom Dropdown เบอร์โทรศัพท์ */}
                <div className="flex relative border border-gray-200 rounded-2xl md:rounded-full focus-within:ring-2 focus-within:ring-[#FF8A00] bg-gray-50/50">

                    {/* ปุ่มกด Dropdown */}
                    <div className="relative border-r border-gray-200 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
                            className="flex items-center gap-2 h-full bg-transparent py-3.5 pl-5 pr-3 text-sm outline-none text-gray-600 font-bold cursor-pointer"
                        >
                            <span className="text-[#8e8e8e]">
                                {phoneCodes.find((p) => p.code === formData.phoneCode)?.label}
                            </span>
                            <span className="text-[#5C3D2E] font-extrabold">
                                {formData.phoneCode}
                            </span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isPhoneDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* เมนู Dropdown */}
                        {isPhoneDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsPhoneDropdownOpen(false)}
                                />
                                <div className="absolute top-[calc(100%+8px)] left-0 w-[110px] bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                                    {phoneCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${formData.phoneCode === item.code
                                                ? "bg-[#FF8A00]/10 text-[#FF8A00] font-bold"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                            onClick={() => {
                                                setFormData((prev: FormData) => ({ ...prev, phoneCode: item.code }));
                                                setIsPhoneDropdownOpen(false);
                                            }}
                                        >
                                            <span className="font-bold">{item.label}</span>
                                            <span className="text-gray-400 ml-auto">{item.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="หมายเลขโทรศัพท์"
                        required
                        className="flex-1 w-full p-3.5 pl-4 text-sm outline-none bg-transparent rounded-r-2xl md:rounded-r-full"
                    />
                </div>

                <textarea
                    ref={messageInputRef}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="เราจะช่วยคุณได้อย่างไร?"
                    rows={5}
                    required
                    className="w-full p-4 rounded-[1.2rem] md:rounded-[1.5rem] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] text-sm resize-none bg-gray-50/50"
                ></textarea>

                {/* Submit Status Box */}
                {submitStatus !== "idle" && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${submitStatus === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                        {submitStatus === "success" ? <CheckCircle2 className="shrink-0 mt-0.5" size={18} /> : <XCircle className="shrink-0 mt-0.5" size={18} />}
                        <p>{statusMessage}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold py-3.5 md:py-4 rounded-full transition-all text-lg shadow-md hover:shadow-lg active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            กำลังส่ง...
                        </>
                    ) : (
                        "ส่งข้อความ"
                    )}
                </button>
            </form>
        </div>
    );
}
