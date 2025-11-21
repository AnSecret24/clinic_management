
export default function Footer() {
    return (
        <footer id="lien-he" className="mt-16 border-t bg-blue-200">
            <div className="max-w-6xl mx-auto px-4 py-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <h4 className="font-semibold text-blue-700">Tâm An Clinic</h4>
                    <p className="text-sm text-gray-600 mt-2">
                        Nơi chăm sóc sức khỏe tận tâm – hiện đại – hiệu quả.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold">Liên hệ</h4>
                    <p className="text-sm text-gray-600 mt-2">0123 456 789</p>
                    <p className="text-sm text-gray-600">tamanclinic@gmail.com</p>
                </div>
                <div>
                    <h4 className="font-semibold">Địa chỉ</h4>
                    <p className="text-sm text-gray-600 mt-2">
                        123 Nguyễn Văn Cừ, Quận 5, TP.HCM
                    </p>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 py-3">
                © 2025 Tâm An Clinic. All rights reserved.
            </div>
        </footer>
    );
}
