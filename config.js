// ============================================
// REUNION SURVEY 2026 - CONFIGURATION
// ============================================
// Chỉnh sửa file này để customize ứng dụng

const CONFIG = {
    // ========================================
    // API CONFIGURATION
    // ========================================
    // QUAN TRỌNG: Thay bằng Google Apps Script URL sau khi deploy
    API_URL: 'https://script.google.com/macros/s/AKfycbyZ2EPfu2Z5sHXyAsMPFzGhhgVX1iZMm9q3X8VtIDl8U8dlrnjAs2NzmB4fhzlD-VETDQ/exec',
    
    // ========================================
    // SURVEY INFORMATION
    // ========================================
    surveyTitle: 'HỌP LỚP\n2026',
    surveySubtitle: 'Tết Bính Ngọ',
    surveyDescription: 'Khảo Sát Tham Dự',
    
    // ========================================
    // CALENDAR DATES
    // ========================================
    // Các ngày có thể chọn cho buổi họp
    calendarDates: [
        { date: '2026-02-17', label: 'Mùng 1 Tết', day: '17', month: 'Thg 2' },
        { date: '2026-02-18', label: 'Mùng 2 Tết', day: '18', month: 'Thg 2' },
        { date: '2026-02-19', label: 'Mùng 3 Tết', day: '19', month: 'Thg 2' },
        { date: '2026-02-20', label: 'Mùng 4 Tết', day: '20', month: 'Thg 2' },
        { date: '2026-02-21', label: 'Mùng 5 Tết', day: '21', month: 'Thg 2' }
    ],
    
    // ========================================
    // MEMBERS LIST
    // ========================================
    // Danh sách thành viên lớp
    // Thay ảnh bằng URL thật hoặc upload lên Imgur
    members: [
        { id: 'member_001', name: 'Nguyễn Văn A', photo: 'https://i.pravatar.cc/200?img=1' },
        { id: 'member_002', name: 'Trần Thị B', photo: 'https://i.pravatar.cc/200?img=2' },
        { id: 'member_003', name: 'Lê Văn C', photo: 'https://i.pravatar.cc/200?img=3' },
        { id: 'member_004', name: 'Phạm Thị D', photo: 'https://i.pravatar.cc/200?img=4' },
        { id: 'member_005', name: 'Hoàng Văn E', photo: 'https://i.pravatar.cc/200?img=5' },
        { id: 'member_006', name: 'Vũ Thị F', photo: 'https://i.pravatar.cc/200?img=6' },
        { id: 'member_007', name: 'Đỗ Văn G', photo: 'https://i.pravatar.cc/200?img=7' },
        { id: 'member_008', name: 'Bùi Thị H', photo: 'https://i.pravatar.cc/200?img=8' },
        { id: 'member_009', name: 'Đặng Văn I', photo: 'https://i.pravatar.cc/200?img=9' },
        { id: 'member_010', name: 'Ngô Thị K', photo: 'https://i.pravatar.cc/200?img=10' },
        { id: 'member_011', name: 'Dương Văn L', photo: 'https://i.pravatar.cc/200?img=11' },
        { id: 'member_012', name: 'Võ Thị M', photo: 'https://i.pravatar.cc/200?img=12' }
    ],
    
    // ========================================
    // TEACHERS LIST
    // ========================================
    // Danh sách giáo viên
    teachers: [
        { id: 'teacher_001', name: 'Cô Hương', subject: 'Toán', photo: 'https://i.pravatar.cc/200?img=20' },
        { id: 'teacher_002', name: 'Thầy Nam', subject: 'Văn', photo: 'https://i.pravatar.cc/200?img=21' },
    ],
    
    // ========================================
    // UI SETTINGS
    // ========================================
    ui: {
        // Thời gian chuyển slide (ms)
        slideTransitionDuration: 600,
        
        // Tốc độ marquee (s)
        marqueeSpeed: 30,
        
        // Thời gian confetti (ms)
        confettiDuration: 3000,
        
        // Delay sau khi submit (ms)
        submitDelay: 2000
    },
    
    // ========================================
    // GOOGLE SHEETS SETTINGS
    // ========================================
    sheets: {
        // Tên sheet trong Google Spreadsheet
        sheetName: 'Reunion_Survey_2026'
    }
};

// Export để các file khác sử dụng
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
