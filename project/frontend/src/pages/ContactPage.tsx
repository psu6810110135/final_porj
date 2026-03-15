import { useState, useEffect, useRef } from "react";

// Icons
import { Search } from "lucide-react";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TopicList } from "@/components/contact/TopicList";
import { ContactForm } from "@/components/contact/ContactForm";
import { ConfirmationModal } from "@/components/contact/ConfirmationModal";

// Config
import { API_BASE_URL } from "@/config/api";

// Constants
import { TOPICS, PHONE_CODES } from "@/utils/contactData";

// --- Main Component ---
const ContactPage = () => {
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+66",
    phoneNumber: "",
    message: "",
  });

  // UI & Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);

  // Search State
  const [searchTopic, setSearchTopic] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const filteredTopics = TOPICS.filter((topic) =>
    topic.title.toLowerCase().includes(searchTopic.toLowerCase()),
  );

  const handleTopicClick = (title: string) => {
    setFormData((prev) => {
      const prefix = `สอบถามเรื่อง: ${title}\n\nรายละเอียด: `;
      let details = "";

      if (prev.message.includes("รายละเอียด: ")) {
        details = prev.message.substring(
          prev.message.indexOf("รายละเอียด: ") + "รายละเอียด: ".length,
        );
      } else if (prev.message.includes("สอบถามเรื่อง:")) {
        const newlineIndex = prev.message.indexOf("\n");
        if (newlineIndex !== -1) {
          details = prev.message.substring(newlineIndex).trim();
        } else {
          details = "";
        }
      } else {
        details = prev.message;
      }

      return { ...prev, message: `${prefix}${details}` };
    });
    if (messageInputRef.current) messageInputRef.current.focus();
  };

  useEffect(() => {
    if (submitStatus === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus("idle");
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    
    // Clear error when user changes the value
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "phoneNumber") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อจริง";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^\d{9,10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "เบอร์โทรศัพท์ต้องมี 9-10 หลัก";
    }

    if (!formData.message.trim()) newErrors.message = "กรุณากรอกรายละเอียดเรื่องที่ต้องการติดต่อ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmAndSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setStatusMessage("");

    try {
      const formattedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: `${formData.phoneCode}${formData.phoneNumber}`,
        message: formData.message,
      };

      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setStatusMessage("ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneCode: "+66",
          phoneNumber: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setStatusMessage("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setStatusMessage(
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเปิด Backend แล้วหรือยัง",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] flex flex-col relative">
      <Navbar activePage="contact" />

      <main className="flex-grow py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#5C3D2E] text-center mb-8 md:mb-12 leading-tight">
            ยินดีต้อนรับสู่หน้าติดต่อเรา
          </h1>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* ซ้าย: หัวข้อ */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="relative mb-6 md:mb-8">
                <input
                  type="text"
                  placeholder="ค้นหาหัวข้อ"
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  className="w-full p-3 pl-6 pr-16 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00] shadow-sm text-sm md:text-base"
                />
                <button className="absolute right-0 top-0 h-full w-14 bg-gray-200 rounded-r-full flex items-center justify-center text-gray-500 hover:bg-[#FF8A00] hover:text-white transition-colors duration-300">
                  <Search size={20} />
                </button>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-[#5C3D2E] mb-4 md:mb-6">
                คำถามยอดฮิต
              </h2>
              <TopicList
                topics={filteredTopics}
                handleTopicClick={handleTopicClick}
              />
            </div>

            {/* ขวา: ฟอร์มติดต่อ */}
            <div className="w-full lg:w-[450px] shrink-0 order-1 lg:order-2">
              <ContactForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitStatus={submitStatus}
                statusMessage={statusMessage}
                isPhoneDropdownOpen={isPhoneDropdownOpen}
                setIsPhoneDropdownOpen={setIsPhoneDropdownOpen}
                setFormData={setFormData}
                messageInputRef={messageInputRef}
                phoneCodes={PHONE_CODES}
                errors={errors}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmationModal
        show={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={confirmAndSubmit}
      />
    </div>
  );
};

export default ContactPage;

//test แยก branch
