const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxyu-zaa5aWHy0aZ1DyGYkhhjCG6MNEYDfU2SD7TyG78E3CfkqlPlNhxTq-bQZOTQJ/exec";
const REVENUE_API_URL = "https://script.google.com/macros/s/AKfycbwdnGRxuXhnvx3BrGJHOdyGmIpNIg1GKKb0irBYvTUmlneoohFHWrwt4bRwo6imDvSw9w/exec";
const landingPage = document.getElementById('landing-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginModal = document.getElementById('login-modal');
const errorMsg = document.getElementById('error-msg');
let isYearInitialized = false;
let currentRevenueView = 'overview';
// Biến lưu Cache dữ liệu ngày để đỡ phải gọi API nhiều lần khi đổi ngày lọc
let cachedDailyData = [];
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
    const totalProfitEl = document.getElementById('daily-total-profit'); // Element hiển thị số to
    const targetDate = getYesterdayString(); 

    // Reset trạng thái loading
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
        const filteredData = cachedDailyData.filter(item => item.date === targetDate);

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
            let totalRevenue = 0;
            let totalProfit = 0;
            
            // --- VÒNG 1: TÍNH TỔNG TRƯỚC ĐỂ HIỆN LÊN HEADER ---
            filteredData.forEach(row => {
                totalRevenue += (row.revenue || 0);
                totalProfit += (row.profit || 0);
            });

            // Hiển thị ngay Tổng Lãi lên Header (Số to đùng)
            totalProfitEl.innerText = `$${totalProfit.toLocaleString()}`;
            totalProfitEl.style.color = totalProfit >= 0 ? '#27ae60' : '#e74c3c';

            // --- VÒNG 2: VẼ BẢNG CHI TIẾT ---
            filteredData.forEach(row => {
                const profit = row.profit || 0;
                const revenue = row.revenue || 0;
                const cost = revenue - profit; // Tự tính Cost để hiển thị cho đầy đủ

                const tr = `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px 20px; font-weight: 600; color: #333;">
                            ${row.game}
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