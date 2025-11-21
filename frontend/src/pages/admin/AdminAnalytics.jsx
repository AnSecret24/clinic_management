// File: src/pages/AdminAnalytics.jsx
// (Đã cập nhật: Thêm nút Tải về CSV/Excel)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js';
import { DollarSign, Users, Stethoscope, BarChart, ClipboardList, Filter, Download } from 'lucide-react'; // Thêm Download

// 1. Import thư viện CSV
import { CSVLink } from 'react-csv';

// (Component StatCard giữ nguyên)

// ... (Dán code StatCard của bạn vào đây)
function StatCard({ title, value, icon, colorClass }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border border-${colorClass}-200`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${colorClass}-100 text-${colorClass}-600`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// (Các hàm lấy ngày giữ nguyên)

 const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};
const getToday = () => {
  return new Date().toISOString().split('T')[0];
};


export default function AdminAnalytics() {
  // (State cũ giữ nguyên)
  const [summary, setSummary] = useState(null);
  const [specialtyStats, setSpecialtyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  // (useEffect tải thống kê - giữ nguyên)
  useEffect(() => {
    if (!startDate || !endDate) return;
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ startDate, endDate });
        const [summaryRes, specialtyRes] = await Promise.all([
          api.get(`/admin/statistics/summary?${params.toString()}`),
          api.get(`/admin/statistics/specialty?${params.toString()}`)
        ]);
        setSummary(summaryRes.data);
        setSpecialtyStats(specialtyRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê.');
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [startDate, endDate]);


  // === 2. HÀM MỚI: CHUẨN BỊ DỮ LIỆU ĐỂ XUẤT CSV ===

  // Chuẩn bị data cho Báo cáo Tổng quan
  const getSummaryCsvData = () => {
    if (!summary) return [];
    return [
      ["Thống kê", "Giá trị"],
      ["Doanh thu", summary.totalRevenue],
      ["Lượt khám", summary.totalAppointments],
      ["Bệnh nhân mới", summary.totalPatients],
      ["Đơn thuốc", summary.totalPrescriptions],
      ["Từ ngày", startDate],
      ["Đến ngày", endDate]
    ];
  };

  // Chuẩn bị data cho Báo cáo Chuyên khoa
  const getSpecialtyCsvData = () => {
    if (!specialtyStats) return [];
    const data = specialtyStats.map(stat => ({
      "Chuyen Khoa": stat.specialtyName,
      "So Luot Kham": stat.appointmentCount
    }));
    // Thêm hàng tiêu đề
    return [
      ["Chuyên Khoa", "Số Lượt Khám"],
      ...data.map(item => [item["Chuyen Khoa"], item["So Luot Kham"]])
    ];
  };


  if (loading) {
    return <div className="p-8">Đang tải dữ liệu thống kê...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Thống kê và Báo cáo</h1>

      {/* Bộ lọc Ngày tháng (Giữ nguyên) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        {/* ... (Code Bộ lọc Ngày tháng) ... */}
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      {/* === 3. NÚT TẢI BÁO CÁO (MỚI) === */}
      <div className="flex gap-4 mb-6">
        <CSVLink
          data={getSummaryCsvData()} // Gọi hàm lấy data
          filename={`ThongKe_TongQuan_${startDate}_den_${endDate}.csv`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          <Download size={18} />
          Tải Báo cáo Tổng quan (Excel)
        </CSVLink>

        <CSVLink
          data={getSpecialtyCsvData()} // Gọi hàm lấy data
          filename={`ThongKe_ChuyenKhoa_${startDate}_den_${endDate}.csv`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          <Download size={18} />
          Tải Báo cáo Chuyên khoa (Excel)
        </CSVLink>
      </div>

      {/* Thống kê Tổng quan (Giữ nguyên) */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... (Code 4 thẻ StatCard) ... */}
          <StatCard 
            title="Tổng Doanh thu (Đã thanh toán)"
            value={`${Number(summary.totalRevenue).toLocaleString()}đ`}
            icon={<DollarSign size={24} />}
            colorClass="green"
          />
          <StatCard 
            title="Tổng Lượt khám (Đã hoàn thành)"
            value={summary.totalAppointments}
            icon={<Stethoscope size={24} />}
            colorClass="blue"
          />
          <StatCard 
            title="Bệnh nhân mới"
            value={summary.totalPatients}
            icon={<Users size={24} />}
            colorClass="indigo"
          />
          <StatCard 
            title="Tổng Đơn thuốc (Đã kê)"
            value={summary.totalPrescriptions}
            icon={<ClipboardList size={24} />}
            colorClass="purple"
          />
        </div>
      )}

      {/* Báo cáo Chuyên khoa (Giữ nguyên) */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        {/* ... (Code Báo cáo Chuyên khoa) ... */}
         <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart size={20} />
            Thống kê lượt khám theo Chuyên khoa
          </h2>
          <ul className="divide-y divide-gray-200">
            {specialtyStats.length > 0 ? specialtyStats.map(stat => (
              <li key={stat.specialtyName} className="flex justify-between items-center py-3">
                <span className="text-base font-medium text-gray-700">{stat.specialtyName}</span>
                <span className="text-lg font-bold text-blue-600">{stat.appointmentCount} lượt khám</span>
              </li>
            )) : (
              <p className="text-gray-500">Chưa có dữ liệu lượt khám đã hoàn thành trong khoảng thời gian này.</p>
            )}
          </ul>
      </div>

    </div>
  );
}