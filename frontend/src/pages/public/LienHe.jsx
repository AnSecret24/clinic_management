import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Contact() {
  // Loại bỏ hoàn toàn logic useState và hàm submit không cần thiết

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 1. Header nhỏ */}
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="text-xs text-gray-500">Trang chủ / <span className="text-blue-700">Liên hệ</span></nav>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mt-2">Liên hệ Tâm An Clinic</h1>
          <p className="text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
        </div>
      </div>

      {/* 2. Nội dung chính: Đã chuyển sang bố cục 2 cột cho thông tin và bản đồ */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-8">
        
        {/* Cột 1: Thông tin Chi tiết */}
        <div className="bg-white rounded-2xl border shadow-xl p-8 h-fit">
          <h4 className="text-2xl font-bold text-blue-800 mb-5 border-b pb-3">Thông tin liên hệ chính thức</h4>
          
          <div className="space-y-4 text-base text-gray-700">
            <p className="flex items-center gap-3 text-xl font-semibold text-blue-600">
                <Phone size={24}/> Hotline Tư Vấn
            </p>
            <p className="ml-8">
                <a href="tel:0123456789" className="hover:underline">0123 456 789</a> (Hỗ trợ 24/7)
            </p>

            <div className="pt-4 border-t border-gray-100"></div>

            <p className="flex items-center gap-3"><Mail size={18} className="text-blue-500"/> 
              Email: <span className="font-semibold">tamanclinic@gmail.com</span>
            </p>
            <p className="flex items-center gap-3"><MapPin size={18} className="text-blue-500"/> 
              Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM
            </p>
            <p className="flex items-center gap-3"><Clock size={18} className="text-blue-500"/> 
              Giờ làm việc: <span className="font-semibold">Thứ 2 - Chủ nhật</span>
            </p>
              <p>Sáng: <span className="font-semibold">08:00 – 11:00</span></p>
              <p>Chiều: <span className="font-semibold">14:00 – 17:00</span></p>
            
          </div>
        </div>

        {/* Cột 2: Bản đồ */}
        <div className="bg-white rounded-2xl border overflow-hidden shadow-xl">
          <h4 className="text-xl font-bold text-blue-800 p-4 border-b">Vị trí trên Bản đồ</h4>
          <iframe
            title="map"
            width="100%" height="450" loading="lazy"
            className="border-0"
            referrerPolicy="no-referrer-when-downgrade"
            // Sử dụng địa chỉ để nhúng bản đồ
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.49755255403!2d106.68748371480056!3d10.77353979232815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2d129759d5%3A0xb3a48e7e1c84f49!2zMTIzIE5ndXnhu4VuIFbEg24gQ+G7qywgUGjGsOG7nW5nIDIsIFF14bqtbiA1LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s"
          >
          </iframe>
        </div>
        
      </section>
    </div>
  );
}