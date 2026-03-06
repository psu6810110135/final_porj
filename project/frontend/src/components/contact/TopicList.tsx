import { ChevronRight } from "lucide-react";

interface TopicListProps {
    topics: string[];
    activeTopic: string | null;
    handleTopicClick: (topic: string) => void;
}

export function TopicList({ topics, activeTopic, handleTopicClick }: TopicListProps) {
    return (
        <div className="space-y-1">
            {topics.length > 0 ? (
                topics.map((topic, index) => (
                    <button
                        key={index}
                        onClick={() => handleTopicClick(topic)}
                        className={`w-full flex items-center justify-between p-4 border-b border-[#E0D8C8] hover:bg-white/60 transition text-left font-bold text-base md:text-lg group ${activeTopic === topic ? "text-[#FF8A00]" : "text-[#5C3D2E]"
                            }`}
                    >
                        <span className="pr-4">{topic}</span>
                        <ChevronRight size={20} className={`shrink-0 transition-colors ${activeTopic === topic ? "text-[#FF8A00]" : "text-gray-400 group-hover:text-[#FF8A00]"
                            }`} />
                    </button>
                ))
            ) : (
                <div className="p-4 text-center text-gray-400 font-medium">ไม่พบหัวข้อที่ค้นหา</div>
            )}
        </div>
    );
}
