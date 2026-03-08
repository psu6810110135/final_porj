import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQTopic } from "@/utils/contactData";

interface TopicListProps {
    topics: FAQTopic[];
    handleTopicClick: (title: string) => void;
}

export function TopicList({ topics, handleTopicClick }: TopicListProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number, topic: FAQTopic) => {
        if (expandedIndex === index) {
            setExpandedIndex(null);
        } else {
            setExpandedIndex(index);
            // ถ้าเป็นหัวข้อประเภทที่จะต้องพิมพ์ฟอร์มทันที ให้ดึงฟอร์มมาเตรียมพร้อม
            if (topic.isFormFocus) {
                handleTopicClick(topic.title);
            }
        }
    };

    return (
        <div className="space-y-3">
            {topics.length > 0 ? (
                topics.map((topic, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <div key={index} className="bg-white border border-gray-100 rounded-[1.2rem] shadow-sm overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => toggleAccordion(index, topic)}
                                className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors ${isExpanded ? "bg-[#FF8A00]/5" : "hover:bg-gray-50 group"
                                    }`}
                            >
                                <span className={`font-extrabold text-sm md:text-base pr-4 ${isExpanded ? "text-[#FF8A00]" : "text-[#5C3D2E]"}`}>
                                    {topic.title}
                                </span>
                                <ChevronDown
                                    size={20}
                                    className={`shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#FF8A00]" : "text-gray-400 group-hover:text-[#FF8A00]"
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="px-4 md:px-5 pb-5">
                                    <div className="pt-3 border-t border-gray-100 text-[#4F200D]/80 text-sm md:text-sm leading-relaxed whitespace-pre-line">
                                        {topic.answer}
                                    </div>
                                    {!topic.isFormFocus ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTopicClick(topic.title);
                                            }}
                                            className="mt-4 text-sm font-bold text-[#FF8A00] hover:text-[#e67c00] hover:underline flex items-center transition-colors"
                                        >
                                            ติดต่อสอบถามเรื่องนี้เพิ่มเติม &rarr;
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTopicClick(topic.title);
                                            }}
                                            className="mt-4 text-sm font-bold text-[#FF8A00] hover:text-[#e67c00] hover:underline flex items-center transition-colors"
                                        >
                                            กรอกแบบฟอร์มเพื่อส่งข้อมูลด่วน &rarr;
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="p-8 text-center text-gray-400 font-medium bg-white rounded-[1.2rem] border border-gray-100 shadow-sm">
                    ไม่พบหัวข้อที่ค้นหา
                </div>
            )}
        </div>
    );
}
