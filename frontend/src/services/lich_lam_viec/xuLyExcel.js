import * as XLSX from "xlsx";

/**
 * Parse file Excel thành dữ liệu JSON để preview
 * @param {File} file - File Excel
 * @returns {Promise<Array>} - Array chứa dữ liệu các dòng
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Vui lòng chọn file"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        if (rows.length === 0) {
          reject(new Error("File Excel không có dữ liệu"));
          return;
        }

        // Transform data để dễ preview
        const transformedData = rows.map((row, index) => ({
          rowNum: index + 2, // +2 vì bỏ header (row 1) và 1-indexed
          ...row
        }));

        resolve(transformedData);
      } catch (error) {
        reject(new Error("Lỗi khi đọc file Excel: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate dữ liệu trước khi import
 * @param {Array} data - Dữ liệu để validate
 * @param {Array} listCa - Danh sách các ca làm
 * @param {Array} listNhanVien - Danh sách nhân viên
 * @returns {Object} - {valid: boolean, errors: Array, warnings: Array}
 */
// excelScheduleService.js

export const validateScheduleData = (data, listCa, listNhanVien) => {
  const errors = [];
  const warnings = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // Dòng trong Excel
    let ngayLam = row['Ngày Làm'];

    // 1. Chuyển đổi mọi định dạng về String YYYY-MM-DD để kiểm tra
    if (ngayLam instanceof Date) {
      ngayLam = ngayLam.toISOString().split('T')[0];
    } else if (typeof ngayLam === 'number') {
      // Xử lý số serial của Excel (ví dụ 45352)
      const date = new Date(Math.round((ngayLam - 25569) * 864e5));
      ngayLam = date.toISOString().split('T')[0];
    }

    // 2. Regex kiểm tra format
    const regexISO = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const regexVN = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // DD/MM/YYYY

    if (!ngayLam) {
      errors.push(`Dòng ${rowNum}: Ngày Làm không được để trống`);
    } else if (!regexISO.test(ngayLam) && !regexVN.test(ngayLam)) {
      errors.push(`Dòng ${rowNum}: Ngày Làm (${ngayLam}) không đúng format (YYYY-MM-DD hoặc DD/MM/YYYY)`);
    }

    // Kiểm tra Ca Làm
    if (!row['Ca Làm']) {
      errors.push(`Dòng ${rowNum}: Thiếu thông tin Ca Làm`);
    }
  });

  return { errors, warnings };
};

/**
 * Kiểm tra xem chuỗi có phải là ngày hợp lệ không
 */
function isValidDate(dateString) {
  // Kiểm tra format YYYY-MM-DD
  const regex1 = /^\d{4}-\d{2}-\d{2}$/;
  if (regex1.test(dateString)) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  // Kiểm tra format DD/MM/YYYY
  const regex2 = /^\d{2}\/\d{2}\/\d{4}$/;
  if (regex2.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    return date instanceof Date && !isNaN(date);
  }

  return false;
}

/**
 * Format dữ liệu để hiển thị trong preview
 */
export const formatDataForPreview = (data) => {
  return data.map(row => ({
    ...row,
    displayText: `Dòng ${row.rowNum}: ${Object.values(row).slice(1).join(" | ")}`
  }));
};