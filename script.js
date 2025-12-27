const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxyu-zaa5aWHy0aZ1DyGYkhhjCG6MNEYDfU2SD7TyG78E3CfkqlPlNhxTq-bQZOTQJ/exec";
const REVENUE_API_URL = "https://script.google.com/macros/s/AKfycbwdnGRxuXhnvx3BrGJHOdyGmIpNIg1GKKb0irBYvTUmlneoohFHWrwt4bRwo6imDvSw9w/exec";
const ORDER_API_URL = "https://script.google.com/macros/s/AKfycbxrHRHncrv44CpFK4vgPdovosm4mPHaBcWO9sY9VigL7X6RmAMvSklKS5ITalSV8kAtYQ/exec";
const landingPage = document.getElementById('landing-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginModal = document.getElementById('login-modal');
const errorMsg = document.getElementById('error-msg');
let isYearInitialized = false;
let currentRevenueView = 'overview';
const TEAM_MEMBERS = ["Lương", "Cương", "Hải", "Admin", "Dev 1"];
// Biến lưu Cache dữ liệu ngày để đỡ phải gọi API nhiều lần khi đổi ngày lọc
let cachedDailyData = [];
let cachedOrderData = [];
async function loadGamesFromSheet() {
    const container = document.getElementById('game-gallery-container');
    
    // Hiệu ứng Loading đẹp hơn
    container.innerHTML = `
        <div style="text-align:center; width:100%; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 30px; color: var(--primary-orange);"></i>
            <p style="color:#666; margin-top:10px;">Đang đồng bộ dữ liệu...</p>
        </div>
    `;

    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();

        container.innerHTML = ''; // Xóa loading

        if (data.error || data.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#888;">Chưa có dữ liệu nào trên Sheet.</p>`;
            return;
        }

        data.forEach(game => {
            // Xử lý hiển thị sao đánh giá
            let ratingDisplay = game.rating ? 
                `<span style="color: #ff9500; font-weight:bold;">${game.rating} <i class="fas fa-star"></i></span>` : 
                '<span style="color: #999;">Chưa đánh giá</span>';

            // Xử lý icon mặc định nếu ảnh lỗi
            let iconSrc = game.icon && game.icon.startsWith('http') ? game.icon : `https://via.placeholder.com/80/FF6B00/FFFFFF?text=${game.name.charAt(0).toUpperCase()}`;

            const cardHTML = `
                <div class="app-card modern-card">
                    <img src="${iconSrc}" alt="${game.name}" class="app-icon">
                    
                    <div class="app-details">
                        <div class="app-name" title="${game.name}">${game.name}</div>
                        <span class="app-dev">${game.developer || 'Six Studio'}</span>
                        
                        <div class="app-meta">
                            <span class="badge-ios">v${game.version || '1.0'}</span>
                            ${ratingDisplay}
                        </div>
                    </div>

                    <a href="${game.link}" target="_blank" class="btn-get">GET</a>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error("Lỗi:", error);
        container.innerHTML = `<p style="color:red; text-align:center;">Không kết nối được Google Sheet.</p>`;
    }
}
// Gọi hàm này khi tải trang (Thêm vào cuối script.js)
window.addEventListener('load', function() {
    // Nếu đang ở Dashboard thì mới load
    if(document.getElementById('dashboard-page')) {
        loadGamesFromSheet();
    }
});

function lienHe() {
    alert("Cảm ơn bạn đã quan tâm đến Six Game Studio! Chúng tôi sẽ phản hồi sớm.");
}

// Hiệu ứng khi cuộn trang (Scroll)
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    
    // Nếu cuộn xuống quá 50px, thêm bóng đổ đậm hơn
    if (window.scrollY > 50) {
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
    } else {
        // Nếu ở trên cùng thì bóng đổ nhẹ lại như cũ
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    }
});

// 1. Hàm bật/tắt Modal đăng nhập
function toggleLoginModal() {
    loginModal.classList.toggle('hidden');
    // Reset thông báo lỗi mỗi khi mở lại
    errorMsg.classList.add('hidden');
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
}

// 2. Hàm xử lý khi bấm nút "Truy cập"
function xuLyDangNhap(event) {
    event.preventDefault(); // Ngăn trình duyệt load lại trang

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // KIỂM TRA TÀI KHOẢN (Hardcode demo)
    if (user === 'admin' && pass === '123456') {
        // Đăng nhập thành công
        chuyenDenDashboard();
        // Lưu trạng thái vào bộ nhớ trình duyệt (để F5 không bị thoát)
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        // Đăng nhập thất bại
        errorMsg.classList.remove('hidden');
    }
}

// 3. Hàm chuyển giao diện sang Dashboard
function chuyenDenDashboard() {
    // Ẩn modal và trang intro
    loginModal.classList.add('hidden');
    landingPage.classList.add('hidden');
    
    // Hiện dashboard
    dashboardPage.classList.remove('hidden');
}

function switchTab(tabId) {
    console.log("Đang chuyển sang tab: " + tabId); // Log kiểm tra xem nút bấm có ăn không

    // 1. Ẩn hết nội dung cũ
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(el => el.classList.add('hidden'));

    // 2. Hiện nội dung mới
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.remove('hidden');
    } else {
        console.error("Không tìm thấy tab có ID: " + tabId);
        return;
    }

    // 3. Xử lý màu menu (Highlight)
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(el => el.classList.remove('active'));

    // Lấy phần đuôi sau dấu gạch ngang (ví dụ: games, revenue)
    const suffix = tabId.split('-')[1]; 
    const menuId = 'menu-' + suffix;
    
    const targetMenu = document.getElementById(menuId);
    if (targetMenu) {
        targetMenu.classList.add('active');
    }

    // --- QUAN TRỌNG: GỌI HÀM LOAD DỮ LIỆU ---
    // Nếu bấm vào tab Doanh thu thì gọi hàm loadRevenueData()
    if (tabId === 'tab-revenue') {
        console.log("=> Đang gọi API Doanh thu...");
        if (typeof loadRevenueData === 'function') {
            loadRevenueData();
        } else {
            console.error("Lỗi: Không tìm thấy hàm loadRevenueData!");
        }
    }

    if (tabId === 'tab-order') {
        console.log("=> Đang tải bảng Order...");
        if (typeof loadOrderTable === 'function') {
            loadOrderTable();
        } else {
            console.error("Chưa có hàm loadOrderTable!");
        }
    }
}


// --- TÍNH NĂNG THÊM GAME MỚI ---

// 1. Hàm Bật/Tắt Modal Thêm Game
function toggleAddGameModal() {
    const modal = document.getElementById('add-game-modal');
    modal.classList.toggle('hidden');
}


// 4. Hàm Đăng xuất
function dangXuat() {
    localStorage.removeItem('isLoggedIn');
    location.reload(); // Tải lại trang để về trạng thái ban đầu
}

// 5. Kiểm tra trạng thái khi vừa vào web
// (Nếu trước đó đã đăng nhập rồi thì vào thẳng Dashboard)
window.addEventListener('load', function() {
    const status = localStorage.getItem('isLoggedIn');
    if (status === 'true') {
        chuyenDenDashboard();
    }
});

// Console log để kiểm tra file JS đã chạy chưa
console.log("Six Game Studio - Website Ready!");


// Đảm bảo biến này đã có Link chính xác
// const REVENUE_API_URL = "https://script.google.com/macros/s/...../exec"; 
function switchRevenueView(viewName) {
    currentRevenueView = viewName;

    // 1. Cập nhật nút Active
    document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
    // (Logic tìm nút nào được bấm để add active hơi dài dòng nếu không dùng ID, 
    // cách đơn giản nhất là add class dựa trên thứ tự hoặc truyền this vào, 
    // nhưng ở đây tôi dùng CSS selector cho nhanh)
    if(viewName === 'overview') document.querySelector('.switch-btn:nth-child(1)').classList.add('active');
    else document.querySelector('.switch-btn:nth-child(2)').classList.add('active');

    // 2. Ẩn hiện nội dung
    document.getElementById('view-overview').classList.add('hidden');
    document.getElementById('view-daily').classList.add('hidden');

    const target = document.getElementById(`view-${viewName}`);
    target.classList.remove('hidden');
    
    // Thêm hiệu ứng fade-in
    target.classList.remove('fade-in');
    void target.offsetWidth; 
    target.classList.add('fade-in');

    // 3. Gọi hàm tải dữ liệu tương ứng
    if (viewName === 'overview') {
        loadRevenueData(); // Hàm cũ (Tổng quan)
    } else {
        loadDailyRevenue(); // Hàm mới (Chi tiết)
    }
}

// Hàm xử lý khi đổi năm
function handleYearChange() {
    if (currentRevenueView === 'overview') loadRevenueData();
    else loadDailyRevenue();
}
// Hàm xử lý số liệu an toàn
function safeParseFloat(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = val.toString().replace(/[^0-9.-]/g, ""); 
    return parseFloat(cleanStr) || 0;
}

async function loadRevenueData() {
    const loader = document.getElementById('revenue-loader');
    const content = document.getElementById('revenue-content');
    const yearSelect = document.getElementById('revenue-year-select');

    // 1. TỰ ĐỘNG CHỌN NĂM HIỆN TẠI (Chạy 1 lần đầu tiên)
    if (!isYearInitialized && yearSelect) {
        const currentYear = new Date().getFullYear().toString();
        // Kiểm tra xem trong option có năm hiện tại không, nếu có thì select
        if (yearSelect.querySelector(`option[value="${currentYear}"]`)) {
            yearSelect.value = currentYear;
        }
        isYearInitialized = true;
    }

    const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();

    // 2. TRẠNG THÁI LOADING (UX Chuyên nghiệp)
    // Ẩn nội dung, Hiện loader quay vòng
    if (content) content.classList.add('hidden');
    if (loader) loader.style.display = 'block';

    console.log(`--- ĐANG TẢI DỮ LIỆU NĂM ${selectedYear} ---`);

    try {
        const apiUrl = `${REVENUE_API_URL}?year=${selectedYear}`;
        const response = await fetch(apiUrl);
        const rawData = await response.json();

        // Giả lập độ trễ 0.5s để người dùng kịp nhìn thấy hiệu ứng loading (nhìn cho mượt)
        // Nếu mạng quá nhanh, nó nháy cái bụp rất khó chịu.
        await new Promise(r => setTimeout(r, 500));

        if (rawData.error) {
            alert(rawData.error); // Hoặc hiển thị lỗi đẹp hơn
            if (loader) loader.style.display = 'none';
            return;
        }

        // Xử lý dữ liệu (Cắt 12 dòng)
        const monthsData = rawData.slice(0, 12);
        renderRevenueUI(monthsData); // Gọi hàm vẽ giao diện tách riêng cho gọn

        // 3. TẢI XONG -> HIỆN NỘI DUNG
        if (loader) loader.style.display = 'none';
        if (content) {
            content.classList.remove('hidden');
            // Reset animation để nó chạy lại mỗi lần load
            content.classList.remove('fade-in');
            void content.offsetWidth; // Trigger reflow
            content.classList.add('fade-in');
        }

    } catch (error) {
        console.error("Lỗi:", error);
        if (loader) loader.style.display = 'none';
        alert("Không tải được dữ liệu server!");
    }
}

// Hàm phụ: Vẽ giao diện (Tách ra cho code loadRevenueData đỡ dài)
function renderRevenueUI(data) {
    const tbody = document.getElementById('revenue-table-body');
    const chartContainer = document.getElementById('revenue-chart-bars');
    
    tbody.innerHTML = '';
    chartContainer.innerHTML = '';

    let totalRevenue = 0;
    let nextMilestone = 0;
    let foundNext = false;
    
    // Tính max để vẽ chart
    const values = data.map(d => safeParseFloat(d.actual));
    const maxRevenue = Math.max(...values) || 1; 

    data.forEach((row, index) => {
        let actual = safeParseFloat(row.actual);
        let target = safeParseFloat(row.target);
        totalRevenue += actual;
        
        let isDone = (row.status === true || row.status === "TRUE" || row.status === "true");

        if (!isDone && !foundNext) {
            nextMilestone = target;
            foundNext = true;
        }

        // Render Table Row
        const statusIcon = isDone 
            ? `<i class="fas fa-check-circle" style="color:#27ae60"></i>` 
            : `<i class="far fa-circle" style="color:#ddd"></i>`;

        const tr = `
            <tr>
                <td>${row.month || 'Tháng ' + (index+1)}</td>
                <td style="font-weight:bold; color: #27ae60;">$${actual.toLocaleString()}</td>
                <td style="color:#888;">$${target.toLocaleString()}</td>
                <td style="text-align:center;">${statusIcon}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);

        // Render Chart Bar
        const heightPercent = (actual / maxRevenue) * 100;
        const barHTML = `
            <div class="chart-bar" style="height: ${heightPercent}%;">
                <div class="chart-tooltip">$${actual.toLocaleString()}</div>
                <span>T${index + 1}</span>
            </div>
        `;
        chartContainer.insertAdjacentHTML('beforeend', barHTML);
    });

    // Update KPI Text
    document.getElementById('total-revenue').innerText = `$${totalRevenue.toLocaleString()}`;
    if(!foundNext) nextMilestone = totalRevenue;
    document.getElementById('next-milestone').innerText = `$${nextMilestone.toLocaleString()}`;

    // Update KPI Logic
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24)) || 1;
    const avgDaily = Math.floor(totalRevenue / daysPassed);
    const needed = nextMilestone - totalRevenue;

    document.getElementById('avg-daily').innerText = `$${avgDaily.toLocaleString()} / ngày`;

    const neededEl = document.getElementById('needed-amount');
    const predictEl = document.getElementById('days-to-goal');

    if (needed > 0) {
        neededEl.innerHTML = `Thiếu: <b style="color:red">$${needed.toLocaleString()}</b>`;
        const days = avgDaily > 0 ? Math.ceil(needed/avgDaily) : 0;
        predictEl.innerText = `Dự kiến: ${days} ngày nữa`;
    } else {
        neededEl.innerHTML = `<b style="color:green">Đã hoàn thành!</b>`;
        predictEl.innerText = `Tuyệt vời!`;
    }
}

function toggleDailyModal() {
    const modal = document.getElementById('daily-modal');
    modal.classList.toggle('hidden');

    if (!modal.classList.contains('hidden')) {
        // Lấy ngày HÔM QUA
        const yesterdayStr = getYesterdayString();
        
        // Hiển thị ngày lên giao diện
        document.getElementById('current-date-display').innerText = formatDateVN(yesterdayStr);

        // Gọi hàm tải dữ liệu
        loadDailyRevenue();
    }
}

async function loadDailyRevenue() {
    const tbody = document.getElementById('daily-table-body');
    const totalProfitEl = document.getElementById('daily-total-profit'); 
    const targetDate = getYesterdayString(); 

    // Reset giao diện
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 50px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px; color: var(--primary-orange);"></i><br>Đang tải dữ liệu...</td></tr>`;
    totalProfitEl.innerText = "---";

    try {
        if (cachedDailyData.length === 0) {
            const response = await fetch(`${REVENUE_API_URL}?action=daily`);
            const rawData = await response.json();
            if (rawData.error) {
                tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">${rawData.error}</td></tr>`;
                return;
            }
            cachedDailyData = rawData;
        }

        // Lọc dữ liệu ngày hôm qua
        let filteredData = cachedDailyData.filter(item => item.date === targetDate);

        tbody.innerHTML = '';
        
        if (filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 100px; color:#888;">
                        <i class="fas fa-folder-open" style="font-size: 50px; margin-bottom: 20px; color: #ddd;"></i><br>
                        Chưa có dữ liệu chốt ngày ${formatDateVN(targetDate)}
                    </td>
                </tr>`;
            totalProfitEl.innerText = "$0";
            totalProfitEl.style.color = "#999";
        } else {
            let totalProfit = 0;
            
            // --- BƯỚC 1: TÍNH TỔNG LÃI TOÀN BỘ (Để hiện lên Header) ---
            filteredData.forEach(row => {
                totalProfit += (row.profit || 0);
            });

            // Hiển thị số to đùng
            totalProfitEl.innerText = `$${totalProfit.toLocaleString()}`;
            totalProfitEl.style.color = totalProfit >= 0 ? '#27ae60' : '#e74c3c';

            // --- BƯỚC 2: SẮP XẾP TỪ CAO XUỐNG THẤP (SORTING) ---
            // Logic: Lấy (b - a) để số lớn lên đầu
            filteredData.sort((a, b) => {
                const profitA = a.profit || 0;
                const profitB = b.profit || 0;
                return profitB - profitA;
            });

            // --- BƯỚC 3: VẼ BẢNG (Lúc này dữ liệu đã được sắp xếp) ---
            filteredData.forEach((row, index) => {
                const profit = row.profit || 0;
                const revenue = row.revenue || 0;
                const cost = revenue - profit; 

                // Thêm icon Top 1, 2, 3 cho sinh động
                let rankIcon = "";
                if (index === 0) rankIcon = "🥇";
                else if (index === 1) rankIcon = "🥈";
                else if (index === 2) rankIcon = "🥉";

                const tr = `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px 20px; font-weight: 600; color: #333;">
                            ${rankIcon} ${row.game}
                        </td>
                        <td style="text-align: right; color: #555;">
                            $${revenue.toLocaleString()}
                        </td>
                        <td style="text-align: right; color: #888;">
                            $${cost.toLocaleString()}
                        </td>
                        <td style="text-align: right; padding-right: 30px; font-weight: bold; color: ${profit >= 0 ? '#2980b9' : 'red'}; font-size: 1.1rem;">
                            $${profit.toLocaleString()}
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', tr);
            });
        }

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Lỗi kết nối Server!</td></tr>`;
    }
}
function getYesterdayString() {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Lùi lại 1 ngày
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
// Trả về chuỗi YYYY-MM-DD của ngày hiện tại (theo giờ máy tính)
function getTodayString() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Trả về chuỗi hiển thị đẹp (DD/MM/YYYY)
function formatDateVN(dateStr) {
    if(!dateStr) return "";
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// 2. Hàm Callback khi đăng nhập Google thành công
function handleCredentialResponse(response) {
    try {
        // Giải mã thông tin user
        const responsePayload = decodeJwtResponse(response.credential);
        
        console.log("ID: " + responsePayload.sub);
        console.log('Full Name: ' + responsePayload.name);
        console.log('Given Name: ' + responsePayload.given_name);
        console.log('Image URL: ' + responsePayload.picture);
        console.log('Email: ' + responsePayload.email);

        // --- KIỂM TRA QUYỀN TRUY CẬP ---
        // Ví dụ: Chỉ cho phép email đuôi @gmail.com hoặc email cụ thể
        const allowedEmails = ["admin@sixstudio.com", "ban@gmail.com"]; // Thêm email của bạn vào đây
        
        // (Hoặc cho phép tất cả thì bỏ đoạn if này đi)
        // if (!allowedEmails.includes(responsePayload.email)) {
        //     document.getElementById('error-msg').innerText = "Email này chưa được cấp quyền!";
        //     document.getElementById('error-msg').classList.remove('hidden');
        //     return;
        // }

        // Đăng nhập thành công -> Lưu thông tin
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userAvatar', responsePayload.picture);
        localStorage.setItem('userName', responsePayload.name);

        // Cập nhật giao diện Dashboard ngay lập tức
        updateDashboardUser(responsePayload.name, responsePayload.picture);

        // Chuyển trang
        chuyenDenDashboard();

    } catch (e) {
        console.error("Lỗi đăng nhập Google:", e);
    }
}

// Dữ liệu mẫu ban đầu
let orderData = [
    { done: true, priority: 'Low', req: 'Lương', exec: 'Hải', dead: '2025-12-22', content: 'Map Assets', note: '' },
    { done: true, priority: 'Medium', req: 'Cương', exec: 'Hải', dead: '2025-12-24', content: 'Asset Map, Worker', note: '' },
    { done: false, priority: 'High', req: 'Admin', exec: 'Lương', dead: '2025-12-30', content: 'UI/UX Game mới', note: 'Gấp' }
];

// 1. Hàm load bảng Order (Gọi khi bấm tab Order)
function loadOrderTable() {
    const tbody = document.getElementById('order-table-body');
    tbody.innerHTML = '';

    orderData.forEach((row, index) => {
        createOrderRowHTML(tbody, row, index);
    });
}

// 2. Hàm tạo HTML cho 1 dòng
function createOrderRowHTML(tbody, data = {}, index = null) {
    const safeData = {
        done: data.done || false,
        sheetName: data.sheetName || 'Mới',
        priority: data.priority || 'Low',
        req: data.req || TEAM_MEMBERS[0],
        exec: data.exec || TEAM_MEMBERS[0],
        dead: data.dead || '',
        content: data.content || '',
        note: data.note || ''
    };

    const optionsMember = TEAM_MEMBERS.map(m => `<option value="${m}">${m}</option>`).join('');
    
    let prioClass = 'prio-low';
    if(safeData.priority === 'Medium') prioClass = 'prio-medium';
    if(safeData.priority === 'High') prioClass = 'prio-high';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="text-center" style="width: 50px;">
            <input type="checkbox" class="table-checkbox" ${safeData.done ? 'checked' : ''}>
        </td>
        <td style="font-size: 0.85rem; color: #888; padding-top: 15px; width: 100px;">
            ${safeData.sheetName}
        </td>
        <td style="width: 130px;">
            <select class="table-select ${prioClass}" onchange="changePrioColor(this)">
                <option value="Low" ${safeData.priority === 'Low' ? 'selected' : ''}>Low</option>
                <option value="Medium" ${safeData.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="High" ${safeData.priority === 'High' ? 'selected' : ''}>High</option>
            </select>
        </td>
        <td style="width: 140px;">
            <select class="table-select" style="font-weight: 500;">
                ${optionsMember.replace(`"${safeData.req}"`, `"${safeData.req}" selected`)}
            </select>
        </td>
        <td style="width: 140px;">
            <select class="table-select" style="font-weight: 500;">
                ${optionsMember.replace(`"${safeData.exec}"`, `"${safeData.exec}" selected`)}
            </select>
        </td>
        <td style="width: 150px;">
            <input type="date" class="table-input" value="${safeData.dead}" style="color: #666;">
        </td>
        <td>
            <textarea class="table-textarea" placeholder="Nhập nội dung..." oninput="autoResize(this)" rows="1">${safeData.content}</textarea>
        </td>
        
        <td style="width: 220px;">
            <div class="note-cell-wrapper">
                <div class="link-display-mode">
                    <a href="#" target="_blank" class="btn-access-link">
                        <i class="fas fa-link"></i> Mở Link
                    </a>
                    <button class="btn-edit-link" title="Sửa link" onclick="enableEditLink(this)">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>

                <textarea class="note-textarea" 
                          placeholder="Link/Ghi chú..." 
                          oninput="autoResize(this)" 
                          onblur="checkLinkDisplay(this)"
                          rows="1">${safeData.note}</textarea>
            </div>
        </td>
        
        <td class="text-center" style="width: 60px;">
            <button class="btn-discord" title="Gửi thông báo Discord" onclick="pingDiscord(this)">
                <i class="fab fa-discord"></i>
            </button>
        </td>

        <td class="text-center" style="width: 60px;">
            <button class="btn-delete-row" onclick="deleteOrderRow(this)"><i class="fas fa-trash-alt"></i></button>
        </td>
    `;
    tbody.appendChild(tr);

    // Kích hoạt logic kiểm tra link ngay khi load
    tr.querySelectorAll('textarea').forEach(el => autoResize(el));
    tr.querySelectorAll('.note-textarea').forEach(el => checkLinkDisplay(el));
}

function checkLinkDisplay(textarea) {
    const val = textarea.value.trim();
    const wrapper = textarea.parentElement;
    const displayMode = wrapper.querySelector('.link-display-mode');
    const linkBtn = wrapper.querySelector('.btn-access-link');
    
    // Nếu là Link (bắt đầu bằng http)
    if (val.toLowerCase().startsWith('http')) {
        // Cập nhật href cho nút
        linkBtn.href = val;
        
        // Hiện chế độ Button
        displayMode.classList.add('visible');
        
        // Ẩn textarea đi
        textarea.classList.add('hidden-input');
    } else {
        // Nếu không phải link (text thường hoặc rỗng) -> Hiện textarea bình thường
        displayMode.classList.remove('visible');
        textarea.classList.remove('hidden-input');
    }
}

// 2. Hàm khi bấm nút Bút chì (Sửa link)
function enableEditLink(btn) {
    const wrapper = btn.parentElement.parentElement;
    const textarea = wrapper.querySelector('.note-textarea');
    const displayMode = wrapper.querySelector('.link-display-mode');

    // Ẩn chế độ Button
    displayMode.classList.remove('visible');
    
    // Hiện textarea và focus vào nó
    textarea.classList.remove('hidden-input');
    textarea.focus();
}

function checkLinkInput(textarea) {
    const val = textarea.value.trim();
    // Tìm nút Link nằm ngay cạnh textarea
    const linkBtn = textarea.parentElement.querySelector('.btn-open-link');
    
    if (!linkBtn) return;

    // Kiểm tra xem có bắt đầu bằng http:// hoặc https:// không
    if (val.startsWith('http://') || val.startsWith('https://')) {
        linkBtn.href = val; // Gán link vào nút
        linkBtn.classList.add('visible'); // Hiện nút
    } else {
        linkBtn.classList.remove('visible'); // Ẩn nút
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto'; // Reset chiều cao
    textarea.style.height = textarea.scrollHeight + 'px'; // Set chiều cao bằng nội dung
}

// 3. Hàm Thêm dòng mới
function addOrderRow() {
    const tbody = document.getElementById('order-table-body');
    const filterSelect = document.getElementById('order-month-filter');
    
    // 1. Lấy ngày thực tế hiện tại
    const now = new Date();
    // Tạo chuỗi tên tháng chuẩn: "Tháng 1 2026" (hoặc "Tháng 12 2025")
    // Lưu ý: getMonth() trả về từ 0-11 nên phải +1
    const currentMonthName = `Tháng ${now.getMonth() + 1} ${now.getFullYear()}`;
    
    let targetSheetName = "";

    // 2. Logic chọn tên tháng cho dòng mới
    if (filterSelect.value !== 'all') {
        // Nếu đang lọc riêng 1 tháng (VD đang xem lại tháng cũ) -> Thêm vào tháng đó
        targetSheetName = filterSelect.value;
    } else {
        // Nếu đang xem "Tất cả" -> Ưu tiên dùng THÁNG HIỆN TẠI (Realtime)
        // Bất kể trong Sheet đã có hay chưa.
        targetSheetName = currentMonthName;
    }

    // 3. Tạo dòng mới
    createOrderRowHTML(tbody, { sheetName: targetSheetName });
    
    // 4. Scroll xuống cuối cùng để thấy dòng mới
    tbody.lastElementChild.scrollIntoView({ behavior: 'smooth' });
}

async function pingDiscord(btn) {
    const row = btn.closest('tr');
    
    // Hiệu ứng loading
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    btn.disabled = true;

    // Lấy dữ liệu dòng đó
    const data = {
        sheetName: row.querySelector('td:nth-child(2)').innerText.trim(),
        priority: row.querySelector('select:nth-of-type(1)').value,
        req: row.querySelectorAll('select')[1].value,
        exec: row.querySelectorAll('select')[2].value,
        dead: row.querySelector('input[type="date"]').value,
        // Lấy nội dung (Textarea đầu tiên)
        content: row.querySelectorAll('textarea')[0].value,
        // Lấy Note (Textarea trong wrapper)
        note: row.querySelectorAll('textarea')[1].value
    };

    try {
        // Gửi lên Server với action = send_discord
        const response = await fetch(ORDER_API_URL, {
            method: 'POST',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                action: "send_discord", // Cờ hiệu để Server biết cần làm gì
                data: data 
            })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            alert("✅ Đã gửi thông báo lên Discord!");
        } else {
            alert("❌ Lỗi: " + result.message);
        }

    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối!");
    } finally {
        btn.innerHTML = originalIcon;
        btn.disabled = false;
    }
}

// 4. Hàm Xóa dòng
function deleteOrderRow(btn) {
    if(confirm('Bạn có chắc muốn xóa dòng này?')) {
        const row = btn.closest('tr');
        row.remove();
    }
}

// 5. Hàm đổi màu Priority khi chọn dropdown
function changePrioColor(select) {
    select.className = 'table-select'; // Reset class
    if(select.value === 'Low') select.classList.add('prio-low');
    if(select.value === 'Medium') select.classList.add('prio-medium');
    if(select.value === 'High') select.classList.add('prio-high');
}

// 6. Hàm Lưu (Hiện tại chỉ log ra console, sau này nối API)
async function saveOrderData() {
    const btnSave = document.querySelector('.action-buttons button'); // Nút lưu
    const originalText = btnSave.innerHTML;
    
    // 1. Hiệu ứng Loading
    btnSave.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang lưu...`;
    btnSave.disabled = true;

    try {
        // 2. Quét dữ liệu từ bảng HTML
        const rows = document.querySelectorAll('#order-table-body tr');
        let dataToSend = [];
        let hasError = false;

        rows.forEach(row => {
            // Lấy thông tin từ các ô input/select
            const done = row.querySelector('.table-checkbox').checked;
            
            // Lấy Sheet Name (Tên tháng) từ cột thứ 2
            // Quan trọng: textContent sẽ lấy "Tháng 12 2025"
            const sheetName = row.querySelector('td:nth-child(2)').innerText.trim(); 

            const priority = row.querySelector('select:nth-of-type(1)').value;
            // Requester & Executer (Lưu ý thứ tự select trong HTML)
            const req = row.querySelectorAll('select')[1].value;
            const exec = row.querySelectorAll('select')[2].value;
            
            const dead = row.querySelector('input[type="date"]').value;
            
            // Lấy nội dung (Textarea thứ nhất)
            const content = row.querySelectorAll('textarea')[0].value;
            
            // Lấy Note/Link (Textarea thứ hai - nằm trong wrapper)
            const note = row.querySelectorAll('textarea')[1].value;

            // Kiểm tra dữ liệu cơ bản (VD: Phải có tên sheet)
            if (!sheetName) {
                hasError = true;
                return;
            }

            dataToSend.push({
                sheetName: sheetName,
                done: done,
                priority: priority,
                req: req,
                exec: exec,
                dead: dead,
                content: content,
                note: note
            });
        });

        if (hasError) {
            alert("Lỗi: Có dòng thiếu thông tin Tháng/Sheet. Vui lòng kiểm tra lại.");
            resetButton();
            return;
        }

        if (dataToSend.length === 0) {
            alert("Không có dữ liệu để lưu!");
            resetButton();
            return;
        }

        console.log("Dữ liệu chuẩn bị gửi:", dataToSend);

        // 3. Gửi POST lên Google Apps Script
        // Lưu ý: Dùng no-cors hoặc text/plain để tránh lỗi Preflight của Google
       const response = await fetch(ORDER_API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "text/plain;charset=utf-8", 
            },
            body: JSON.stringify({ data: dataToSend }) // Vẫn gửi chuỗi JSON bình thường
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("✅ Đã lưu thành công!");
            // Load lại bảng để cập nhật dữ liệu mới nhất (nếu cần)
            // loadOrderTable(); 
        } else {
            alert("❌ Lỗi Server: " + result.message);
        }

    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối: " + e.message);
    } finally {
        resetButton();
    }

    function resetButton() {
        btnSave.innerHTML = originalText;
        btnSave.disabled = false;
    }
}

async function loadOrderTable() {
    const tbody = document.getElementById('order-table-body');
    const filterSelect = document.getElementById('order-month-filter');

    // Reset bảng
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu Order...</td></tr>`;

    try {
        console.log("Đang gọi API Order riêng biệt...");
        
        // === SỬA Ở ĐÂY: DÙNG URL MỚI VÀ KHÔNG CẦN ?action=... NỮA ===
        const response = await fetch(ORDER_API_URL); 
        const data = await response.json();

        if (data.error) {
            tbody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">${data.error}</td></tr>`;
            return;
        }

        // Lưu Cache
        cachedOrderData = data;

        // --- XỬ LÝ DROPDOWN CHỌN THÁNG ---
        const uniqueMonths = [...new Set(data.map(item => item.sheetName))];
        // Sắp xếp tháng giảm dần (Mới nhất lên đầu)
        uniqueMonths.sort((a, b) => {
             // Logic sort đơn giản: so sánh chuỗi (Năm 2026 sẽ > 2025)
             return b.localeCompare(a); 
        });

        // Chỉ tạo lại Dropdown nếu chưa có (để đỡ bị reset khi đang chọn)
        if (filterSelect.options.length <= 1) {
            uniqueMonths.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.innerText = name;
                filterSelect.appendChild(option);
            });
            // Mặc định chọn tháng mới nhất
            if (uniqueMonths.length > 0) filterSelect.value = uniqueMonths[0];
        }

        // Vẽ bảng
        renderOrderTable();

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">Lỗi kết nối tới Script Order!</td></tr>`;
    }
}

// 2. Hàm Vẽ Bảng (Có lọc)
function renderOrderTable() {
    const tbody = document.getElementById('order-table-body');
    const filterValue = document.getElementById('order-month-filter').value;

    tbody.innerHTML = '';

    // Lọc dữ liệu
    let displayData = cachedOrderData;
    if (filterValue !== 'all') {
        displayData = cachedOrderData.filter(item => item.sheetName === filterValue);
    }

    if (displayData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color:#999;">Không có dữ liệu cho tháng này.</td></tr>`;
        return;
    }

    // Duyệt và vẽ từng dòng
    displayData.forEach((row, index) => {
        createOrderRowHTML(tbody, row);
    });
}

// 3. Hàm cập nhật Avatar & Tên trên Header (Dashboard)
function updateDashboardUser(name, avatarUrl) {
    const userInfoDiv = document.querySelector('.user-info');
    if (userInfoDiv) {
        // Thay nội dung HTML của phần User
        userInfoDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${avatarUrl}" alt="Avatar" style="width: 35px; height: 35px; border-radius: 50%; border: 2px solid var(--primary-orange);">
                <span style="font-weight: 500;">${name}</span>
                <button class="btn-logout" onclick="dangXuat()" style="margin-left: 10px; font-size: 0.8rem;">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    renderHeroTrending(); // Render list demo ngay
    fetchRealGamesForHero(); // Gọi API ngầm
});
let globalRealGames = [];
let heroSlideshowInterval;

async function fetchRealGamesForHero() {
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();

        if (data && !data.error && data.length > 0) {
            renderHeroTrending(data); // Cập nhật lại khi có data thật
        }
    } catch (e) {
        console.error("Lỗi lấy data Landing Page:", e);
    }
}

function renderHeroTrending(customList = null) {
    const container = document.getElementById('hero-trending-list');
    if (!container) return;

    // Dữ liệu mẫu
    let displayList = [
        { name: "Six Battle Arena" }, { name: "Dragon Legend" }, 
        { name: "Space War Z" }, { name: "Racing Storm" }
    ];

    if (customList && customList.length > 0) displayList = customList.filter(g => g.name);

    // Random lấy 3 game
    const shuffled = [...displayList].sort(() => 0.5 - Math.random());
    const top3 = shuffled.slice(0, 3);

    container.innerHTML = '';
    
    top3.forEach((gameData, index) => {
        const downloads = (Math.random() * 2 + 0.5).toFixed(1); 
        
        // Tạo Rating giả lập (4.5 -> 5.0)
        const rating = (Math.random() * 0.5 + 4.5).toFixed(1);

        // Tạo Link ảnh
        let iconSrc = "";
        if (gameData.icon && gameData.icon.toString().startsWith('http')) {
            iconSrc = gameData.icon;
        } else {
            const randomColor = Math.floor(Math.random()*16777215).toString(16);
            iconSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(gameData.name)}&background=${randomColor}&color=fff&size=512&bold=true`;
        }

        // --- QUAN TRỌNG: Lưu dữ liệu vào data attributes ---
        const html = `
            <div class="game-stat-item" 
                 data-img="${iconSrc}" 
                 data-name="${gameData.name}" 
                 data-rating="${rating}">
                 
                <img src="${iconSrc}" alt="${gameData.name}" class="gs-icon-img">
                <div class="gs-info">
                    <h4>${gameData.name}</h4>
                    <p class="downloads">
                        <i class="fas fa-download"></i> ${downloads} Triệu lượt tải
                    </p>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    startSlideshow();
}

function startSlideshow() {
    const items = document.querySelectorAll('.game-stat-item');
    
    // Lấy các element mới trong điện thoại
    const glassCard = document.getElementById('phone-app-display');
    const bgFull = document.getElementById('p-bg-full'); // Ảnh nền to
    
    const pIcon = document.getElementById('p-icon');
    const pName = document.getElementById('p-name');
    const pScore = document.getElementById('p-score');

    if (items.length === 0 || !glassCard) return;

    if (heroSlideshowInterval) clearInterval(heroSlideshowInterval);

    let currentIndex = 0;

    const runSlide = () => {
        // Active item bên trái
        items.forEach(el => el.classList.remove('active'));
        const activeItem = items[currentIndex];
        activeItem.classList.add('active');

        // Lấy dữ liệu
        const img = activeItem.getAttribute('data-img');
        const name = activeItem.getAttribute('data-name');
        const rating = activeItem.getAttribute('data-rating');

        // 1. Ẩn nội dung cũ (Fade Out)
        glassCard.classList.add('fade-out');
        bgFull.style.opacity = 0; // Mờ ảnh nền

        // 2. Đổi dữ liệu sau 0.4s
        setTimeout(() => {
            pIcon.src = img;
            pName.innerText = name;
            pScore.innerText = rating;
            
            // Cập nhật ảnh nền lớn (Dùng chính icon game làm nền)
            bgFull.src = img; 

            // 3. Hiện lại (Fade In)
            glassCard.classList.remove('fade-out');
            bgFull.style.opacity = 1;
        }, 400);

        currentIndex++;
        if (currentIndex >= items.length) currentIndex = 0;
    };

    runSlide();
    heroSlideshowInterval = setInterval(runSlide, 4000); 
}

// 4. Sửa lại hàm kiểm tra lúc Load trang (để nhớ Avatar cũ)
window.addEventListener('load', function() {
    const status = localStorage.getItem('isLoggedIn');
    if (status === 'true') {
        // Lấy thông tin đã lưu
        const savedName = localStorage.getItem('userName') || "Admin";
        const savedAvatar = localStorage.getItem('userAvatar') || "https://via.placeholder.com/40";
        
        chuyenDenDashboard();
        updateDashboardUser(savedName, savedAvatar);
        
        // Tự động load tab game (hoặc logic cũ của bạn)
        if(document.getElementById('dashboard-page')) {
            loadGamesFromSheet(); 
        }
    }
});