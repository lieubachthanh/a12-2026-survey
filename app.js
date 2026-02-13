/**
 * ============================================
 * REUNION SURVEY 2026 - APPLICATION
 * ============================================
 * Clean, modular JavaScript application
 * No dependencies except config.js and external libraries
 */

const app = (function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        currentSlide: 1,
        selectedMember: null,
        surveyData: {
            user_id: null,
            name: null,
            attendance: null,
            selected_dates: [],
            visit_teachers: false,
            teacher_list: [],
            ideas: ''
        },
        heatmapData: {},
        submittedUsers: new Set()
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        console.log('🚀 Initializing Reunion Survey App...');
        
        // Load components
        loadMemberMarquee();
        loadTeacherGrid();
        initMarqueeSwipe();
        initCharacterCounter();
        
        // Fetch existing data
        fetchExistingData();
        
        console.log('✅ App initialized successfully');
    }

    // ============================================
    // SLIDE NAVIGATION
    // ============================================
    function goToSlide(slideNumber) {
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach((slide, index) => {
            const num = index + 1;
            let transform;
            
            if (num < slideNumber) {
                transform = 'translateX(-100%)';
            } else if (num === slideNumber) {
                transform = 'translateX(0%)';
            } else {
                transform = 'translateX(100%)';
            }
            
            slide.style.transform = transform;
        });
        
        state.currentSlide = slideNumber;
        
        // Special handling for calendar slide
        if (slideNumber === 4) {
            setTimeout(() => loadCalendar(), 100);
        }
        
        console.log(`📍 Navigated to slide ${slideNumber}`);
    }

    function nextSlide() {
        if (state.currentSlide < 7) {
            goToSlide(state.currentSlide + 1);
        }
    }

    function prevSlide() {
        if (state.currentSlide > 1) {
            goToSlide(state.currentSlide - 1);
        }
    }

    // ============================================
    // MEMBER SELECTION (Slide 2)
    // ============================================
    function loadMemberMarquee() {
        const marquee = document.getElementById('memberMarquee');
        if (!marquee) return;
        
        const members = CONFIG.members;
        
        // Duplicate for seamless loop
        const allMembers = [...members, ...members];
        
        const html = allMembers.map(member => {
            const hasSubmitted = state.submittedUsers.has(member.id);
            const badge = hasSubmitted ? '<div class="member-badge">✓</div>' : '';
            
            return `
                <div class="member-card" onclick="app.selectMember('${member.id}', '${escapeHtml(member.name)}')">
                    <img src="${member.photo}" alt="${escapeHtml(member.name)}" loading="lazy">
                    <div class="member-card-name">
                        <p class="retro-font text-2xl font-bold">${escapeHtml(member.name)}</p>
                    </div>
                    ${badge}
                </div>
            `;
        }).join('');
        
        marquee.innerHTML = html;
    }

    function initMarqueeSwipe() {
        const track = document.getElementById('memberMarquee');
        if (!track) return;
        
        let isDragging = false;
        let startX = 0;
        let velocity = 0;
        let lastX = 0;
        let lastTime = Date.now();
        
        // Event handlers
        track.addEventListener('mousedown', startDrag);
        track.addEventListener('touchstart', startDrag);
        track.addEventListener('mousemove', drag);
        track.addEventListener('touchmove', drag);
        track.addEventListener('mouseup', stopDrag);
        track.addEventListener('mouseleave', stopDrag);
        track.addEventListener('touchend', stopDrag);
        
        function startDrag(e) {
            isDragging = true;
            track.style.animationPlayState = 'paused';
            
            const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            startX = pageX;
            lastX = pageX;
            lastTime = Date.now();
            velocity = 0;
            
            track.style.cursor = 'grabbing';
            track.style.userSelect = 'none';
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            
            if (deltaTime > 0) {
                velocity = (pageX - lastX) / deltaTime;
            }
            
            const currentTransform = getComputedStyle(track).transform;
            let currentX = 0;
            
            if (currentTransform !== 'none') {
                const matrix = currentTransform.match(/matrix\(([^)]+)\)/);
                if (matrix) {
                    currentX = parseFloat(matrix[1].split(',')[4]);
                }
            }
            
            track.style.transform = `translateX(${currentX + (pageX - lastX)}px)`;
            
            lastX = pageX;
            lastTime = currentTime;
        }
        
        function stopDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            track.style.cursor = 'grab';
            
            if (Math.abs(velocity) > 0.1) {
                applyMomentum();
            } else {
                setTimeout(() => {
                    track.style.animationPlayState = 'running';
                }, 500);
            }
        }
        
        function applyMomentum() {
            let currentVelocity = velocity * 1000;
            const friction = 0.95;
            
            function animate() {
                if (Math.abs(currentVelocity) < 10) {
                    track.style.animationPlayState = 'running';
                    return;
                }
                
                const currentTransform = getComputedStyle(track).transform;
                let currentX = 0;
                
                if (currentTransform !== 'none') {
                    const matrix = currentTransform.match(/matrix\(([^)]+)\)/);
                    if (matrix) {
                        currentX = parseFloat(matrix[1].split(',')[4]);
                    }
                }
                
                currentX += currentVelocity / 60;
                currentVelocity *= friction;
                
                track.style.transform = `translateX(${currentX}px)`;
                requestAnimationFrame(animate);
            }
            
            animate();
        }
    }

    function selectMember(userId, name) {
        state.selectedMember = { user_id: userId, name: name };
        
        const modalText = document.getElementById('modalText');
        const modal = document.getElementById('memberModal');
        
        if (modalText && modal) {
            modalText.textContent = `Bạn là ${name}, đúng không?`;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function confirmMemberSelection() {
        if (state.selectedMember) {
            state.surveyData.user_id = state.selectedMember.user_id;
            state.surveyData.name = state.selectedMember.name;
            
            console.log('✅ Member selected:', state.selectedMember.name);
            
            cancelMemberSelection();
            nextSlide();
        }
    }

    function cancelMemberSelection() {
        state.selectedMember = null;
        const modal = document.getElementById('memberModal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // ============================================
    // ATTENDANCE (Slide 3)
    // ============================================
    function selectAttendance(status) {
        state.surveyData.attendance = status;
        console.log('✅ Attendance selected:', status);
        
        if (status === 'No') {
            // Skip to feedback slide
            goToSlide(6);
        } else {
            nextSlide();
        }
    }

    // ============================================
    // CALENDAR (Slide 4)
    // ============================================
    function loadCalendar() {
        const grid = document.getElementById('calendarGrid');
        const loading = document.getElementById('calendarLoading');
        
        if (!grid || !loading) return;
        
        loading.style.display = 'flex';
        grid.style.display = 'none';
        
        setTimeout(() => {
            const dates = CONFIG.calendarDates;
            const totalMembers = CONFIG.members.length;
            
            const html = dates.map(dateInfo => {
                const dateKey = dateInfo.date;
                const heatInfo = state.heatmapData[dateKey] || { count: 0, users: [] };
                const percentage = heatInfo.count > 0 ? (heatInfo.count / totalMembers) * 100 : 0;
                
                // Calculate heat level (0-4)
                let heatLevel = 0;
                if (percentage > 70) heatLevel = 4;
                else if (percentage > 50) heatLevel = 3;
                else if (percentage > 30) heatLevel = 2;
                else if (percentage > 10) heatLevel = 1;
                
                return `
                    <div class="calendar-day heat-${heatLevel}" 
                         data-date="${dateKey}" 
                         onclick="app.toggleDate('${dateKey}')"
                         tabindex="0"
                         role="checkbox"
                         aria-checked="false">
                        <div class="info-icon" 
                             onclick="event.stopPropagation(); app.showCalendarPopover('${dateKey}', event)"
                             title="Xem ai đã chọn">i</div>
                        <p class="retro-font text-3xl font-bold mb-2">${dateInfo.day}</p>
                        <p class="retro-font text-xl mb-1">${dateInfo.month}</p>
                        <p class="retro-font text-lg font-bold">${escapeHtml(dateInfo.label)}</p>
                        <p class="retro-font text-sm mt-2">${heatInfo.count} người</p>
                    </div>
                `;
            }).join('');
            
            grid.innerHTML = html;
            loading.style.display = 'none';
            grid.style.display = 'grid';
        }, 500);
    }

    function toggleDate(date) {
        const dateElement = document.querySelector(`[data-date="${date}"]`);
        if (!dateElement) return;
        
        const index = state.surveyData.selected_dates.indexOf(date);
        
        if (index > -1) {
            state.surveyData.selected_dates.splice(index, 1);
            dateElement.classList.remove('selected');
            dateElement.setAttribute('aria-checked', 'false');
        } else {
            state.surveyData.selected_dates.push(date);
            dateElement.classList.add('selected');
            dateElement.setAttribute('aria-checked', 'true');
        }
        
        console.log('📅 Selected dates:', state.surveyData.selected_dates);
    }

    function showCalendarPopover(date, event) {
        const popover = document.getElementById('calendarPopover');
        const list = document.getElementById('popoverList');
        
        if (!popover || !list) return;
        
        const heatInfo = state.heatmapData[date] || { count: 0, users: [] };
        
        if (heatInfo.users.length === 0) {
            list.innerHTML = '<li>Chưa có ai chọn</li>';
        } else {
            list.innerHTML = heatInfo.users.map(name => 
                `<li>• ${escapeHtml(name)}</li>`
            ).join('');
        }
        
        const rect = event.target.getBoundingClientRect();
        popover.style.top = `${rect.bottom + 10}px`;
        popover.style.left = `${rect.left - 100}px`;
        popover.classList.add('active');
        
        setTimeout(() => {
            document.addEventListener('click', closeCalendarPopover);
        }, 100);
    }

    function closeCalendarPopover() {
        const popover = document.getElementById('calendarPopover');
        if (popover) {
            popover.classList.remove('active');
        }
        document.removeEventListener('click', closeCalendarPopover);
    }

    // ============================================
    // TEACHERS (Slide 5)
    // ============================================
    function loadTeacherGrid() {
        const grid = document.getElementById('teacherGrid');
        if (!grid) return;
        
        const teachers = CONFIG.teachers;
        
        const html = teachers.map(teacher => `
            <div class="teacher-card" 
                 data-teacher-id="${teacher.id}" 
                 onclick="app.toggleTeacher('${teacher.id}')"
                 tabindex="0"
                 role="checkbox"
                 aria-checked="false">
                <div class="teacher-checkmark">✓</div>
                <img src="${teacher.photo}" alt="${escapeHtml(teacher.name)}" loading="lazy">
                <p class="retro-font text-2xl font-bold mb-1">${escapeHtml(teacher.name)}</p>
                <p class="retro-font text-lg">${escapeHtml(teacher.subject)}</p>
            </div>
        `).join('');
        
        grid.innerHTML = html;
    }

    function toggleTeacher(teacherId) {
        const card = document.querySelector(`[data-teacher-id="${teacherId}"]`);
        if (!card) return;
        
        const index = state.surveyData.teacher_list.indexOf(teacherId);
        
        if (index > -1) {
            state.surveyData.teacher_list.splice(index, 1);
            card.classList.remove('selected');
            card.setAttribute('aria-checked', 'false');
        } else {
            state.surveyData.teacher_list.push(teacherId);
            card.classList.add('selected');
            card.setAttribute('aria-checked', 'true');
        }
        
        state.surveyData.visit_teachers = state.surveyData.teacher_list.length > 0;
        
        console.log('👨‍🏫 Selected teachers:', state.surveyData.teacher_list);
    }

    function skipTeachers() {
        state.surveyData.visit_teachers = false;
        state.surveyData.teacher_list = [];
        
        // Deselect all
        document.querySelectorAll('.teacher-card.selected').forEach(card => {
            card.classList.remove('selected');
            card.setAttribute('aria-checked', 'false');
        });
        
        nextSlide();
    }

    // ============================================
    // FEEDBACK (Slide 6)
    // ============================================
    function initCharacterCounter() {
        const textarea = document.getElementById('feedbackInput');
        const counter = document.getElementById('charCount');
        
        if (!textarea || !counter) return;
        
        textarea.addEventListener('input', () => {
            counter.textContent = textarea.value.length;
        });
    }

    // ============================================
    // SUBMIT
    // ============================================
    async function submitSurvey() {
        const submitBtn = document.getElementById('submitBtn');
        const feedbackInput = document.getElementById('feedbackInput');
        
        // Validation
        if (!state.surveyData.user_id || !state.surveyData.name) {
            alert('⚠️ Vui lòng chọn tên của bạn!');
            goToSlide(2);
            return;
        }
        
        if (!state.surveyData.attendance) {
            alert('⚠️ Vui lòng chọn trạng thái tham gia!');
            goToSlide(3);
            return;
        }
        
        // Get feedback
        state.surveyData.ideas = feedbackInput ? feedbackInput.value.trim() : '';
        
        // Prepare data
        const submitData = {
            timestamp: new Date().toISOString(),
            user_id: state.surveyData.user_id,
            name: state.surveyData.name,
            attendance: state.surveyData.attendance,
            selected_dates: state.surveyData.selected_dates.join(', '),
            visit_teachers: state.surveyData.visit_teachers ? 'true' : 'false',
            teacher_list: state.surveyData.teacher_list.map(id => {
                const teacher = CONFIG.teachers.find(t => t.id === id);
                return teacher ? teacher.name : id;
            }).join(', '),
            ideas: state.surveyData.ideas
        };
        
        console.log('📤 Submitting survey:', submitData);
        
        // Check API URL
        if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            alert('⚠️ Cần cập nhật API_URL trong file config.js!\n\nVui lòng xem hướng dẫn trong README.md');
            return;
        }
        
        // Disable button
        if (submitBtn) {
            submitBtn.textContent = 'Đang Gửi...';
            submitBtn.disabled = true;
        }
        
        try {
            await submitViaURL(submitData);
            
            console.log('✅ Survey submitted successfully');
            
            // Show success
            showConfetti();
            nextSlide();
            
        } catch (error) {
            console.error('❌ Submit error:', error);
            alert('⚠️ Có lỗi xảy ra khi gửi khảo sát.\n\nVui lòng thử lại hoặc liên hệ admin.');
        } finally {
            // Reset button
            if (submitBtn) {
                setTimeout(() => {
                    submitBtn.textContent = 'Gửi Khảo Sát';
                    submitBtn.disabled = false;
                }, 1000);
            }
        }
    }

    function submitViaURL(data) {
        return new Promise((resolve) => {
            // Convert to JSON and encode
            const jsonString = JSON.stringify(data);
            const encodedData = encodeURIComponent(jsonString);
            
            // Create URL
            const url = `${CONFIG.API_URL}?data=${encodedData}&method=submit`;
            
            console.log('🔗 Submission URL created (data length):', encodedData.length);
            
            // Create hidden iframe
            let iframe = document.getElementById('submit-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'submit-iframe';
                iframe.name = 'submit-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            
            // Set timeout for success
            setTimeout(() => {
                console.log('✅ Submission timeout completed');
                resolve();
            }, CONFIG.ui.submitDelay);
            
            // Load URL in iframe
            iframe.src = url;
        });
    }

    function showConfetti() {
        const duration = CONFIG.ui.confettiDuration;
        const animationEnd = Date.now() + duration;

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 10000,
                origin: { 
                    x: randomInRange(0.1, 0.3), 
                    y: Math.random() - 0.2 
                }
            });
            
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 10000,
                origin: { 
                    x: randomInRange(0.7, 0.9), 
                    y: Math.random() - 0.2 
                }
            });
        }, 250);
    }

    // ============================================
    // RESET
    // ============================================
    function reset() {
        // Reset state
        state.surveyData = {
            user_id: null,
            name: null,
            attendance: null,
            selected_dates: [],
            visit_teachers: false,
            teacher_list: [],
            ideas: ''
        };
        state.selectedMember = null;
        
        // Reset UI
        const feedbackInput = document.getElementById('feedbackInput');
        if (feedbackInput) {
            feedbackInput.value = '';
        }
        
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = '0';
        }
        
        // Deselect all teachers
        document.querySelectorAll('.teacher-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Deselect all dates
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        console.log('🔄 Survey reset');
        
        // Go back to start
        goToSlide(1);
    }

    // ============================================
    // API - FETCH EXISTING DATA
    // ============================================
    async function fetchExistingData() {
        // Check API URL
        if (CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.warn('⚠️ API_URL not configured, using mock data');
            useMockData();
            return;
        }
        
        try {
            const url = `${CONFIG.API_URL}?action=getData&t=${Date.now()}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.submissions) {
                processExistingData(data.submissions);
                console.log('✅ Loaded existing data:', data.submissions.length, 'submissions');
            }
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            console.warn('⚠️ Using mock data instead');
            useMockData();
        }
    }

    function processExistingData(submissions) {
        state.submittedUsers.clear();
        state.heatmapData = {};
        
        submissions.forEach(submission => {
            // Track submitted users
            state.submittedUsers.add(submission.user_id);
            
            // Process calendar dates
            if (submission.selected_dates) {
                const dates = submission.selected_dates.split(',').map(d => d.trim());
                dates.forEach(date => {
                    if (!state.heatmapData[date]) {
                        state.heatmapData[date] = { count: 0, users: [] };
                    }
                    state.heatmapData[date].count++;
                    state.heatmapData[date].users.push(submission.name);
                });
            }
        });
        
        // Update member marquee with badges
        loadMemberMarquee();
    }

    function useMockData() {
        const mockSubmissions = [
            {
                user_id: 'member_001',
                name: 'Nguyễn Văn A',
                selected_dates: '2026-02-17, 2026-02-18'
            },
            {
                user_id: 'member_003',
                name: 'Lê Văn C',
                selected_dates: '2026-02-17, 2026-02-19'
            },
            {
                user_id: 'member_005',
                name: 'Hoàng Văn E',
                selected_dates: '2026-02-18, 2026-02-19, 2026-02-20'
            }
        ];
        
        processExistingData(mockSubmissions);
        console.log('📝 Mock data loaded');
    }

    // ============================================
    // PUBLIC API
    // ============================================
    return {
        init,
        nextSlide,
        prevSlide,
        goToSlide,
        selectMember,
        confirmMemberSelection,
        cancelMemberSelection,
        selectAttendance,
        toggleDate,
        showCalendarPopover,
        toggleTeacher,
        skipTeachers,
        submitSurvey,
        reset
    };
})();

// ============================================
// UTILITIES
// ============================================
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}
