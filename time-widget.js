document.addEventListener('DOMContentLoaded', () => {
    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .aw-container {
            background: rgba(11, 46, 42, 0.75);
            border: 1px solid rgba(46, 230, 166, 0.2);
            border-radius: 12px;
            padding: 1rem;
            width: 100%;
            max-width: 280px;
            font-family: inherit;
            color: #E6FFF7;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
        }
        .aw-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 0.5rem;
        }
        .aw-time-box {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .aw-time {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent-color, #2EE6A6);
        }
        .aw-timezone {
            font-size: 0.7rem;
            color: var(--text-secondary, #a0aabf);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .aw-status {
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .aw-message {
            font-size: 0.8rem;
            color: var(--text-secondary, #a0aabf);
            margin-bottom: 0.2rem;
        }
        .aw-calendar {
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            font-size: 0.65rem;
            text-align: center;
            color: var(--text-secondary, #a0aabf);
        }
        .aw-cal-day {
            padding: 2px 0;
            font-weight: 600;
        }
        .aw-cal-date {
            padding: 2px 0;
            border-radius: 4px;
        }
        .aw-cal-date.active {
            background-color: var(--accent-color, #2EE6A6);
            color: #050B0A;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);

    const getKeralaTime = () => {
        return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    };

    const format12Hour = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    };

    const renderCalendar = (currentDate) => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        let html = '';
        
        days.forEach(d => {
            html += `<div class="aw-cal-day">${d}</div>`;
        });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = currentDate.getDate();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            html += `<div></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today;
            html += `<div class="aw-cal-date ${isToday ? 'active' : ''}">${i}</div>`;
        }
        return html;
    };

    const initWidget = () => {
        // Can target multiple containers if present
        const containers = document.querySelectorAll('#availability-widget');
        if (!containers.length) return;

        containers.forEach(container => {
            container.innerHTML = `
                <div class="aw-container">
                    <div class="aw-header">
                        <div class="aw-time-box">
                            <i class="far fa-clock" style="color: var(--accent-color, #2EE6A6); font-size: 0.9rem;"></i>
                            <span class="aw-time" id="aw-time-display">--:--</span>
                        </div>
                        <span class="aw-timezone">Kerala (IST)</span>
                    </div>
                    <div class="aw-status" id="aw-status-text"></div>
                    <div class="aw-message">Working Hours: 10:00 AM – 5:00 PM</div>
                    <div class="aw-calendar" id="aw-calendar-display"></div>
                </div>
            `;
        });

        const updateTime = () => {
            const keralaTime = getKeralaTime();
            const timeStr = format12Hour(keralaTime);
            const hour = keralaTime.getHours();
            
            // 10 AM to 5 PM (17:00 exclusive)
            const isAvailable = hour >= 10 && hour < 17;
            
            requestAnimationFrame(() => {
                document.querySelectorAll('#aw-time-display').forEach(el => el.innerText = timeStr);
                document.querySelectorAll('#aw-status-text').forEach(el => {
                    el.innerText = isAvailable ? '🟢 Available to Connect' : '🌙 Outside Working Hours';
                });
            });
            
            // Only render calendar once since we mostly just care about today
            document.querySelectorAll('#aw-calendar-display').forEach(el => {
                if(!el.innerHTML) {
                    const calendarHtml = renderCalendar(keralaTime);
                    requestAnimationFrame(() => {
                        el.innerHTML = calendarHtml;
                    });
                }
            });
        };

        updateTime();
        setInterval(updateTime, 60000);
    };

    initWidget();
});
