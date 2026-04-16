/**
 * Anshid's AI Assistant - Chatbot Logic
 * Lightweight, rule-based simulated AI assistant
 */

(function() {
    // Configuration
    const CONFIG = {
        GREETING_DELAY: 6000, // 6 seconds
        BOT_NAME: "Anshid's Assistant",
        TYPING_SPEED: 1000,
        SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwHQNCp53r_-9lnEKM6pXrVuyqtxuqq-5C3tCm8tHJYJYEhJJYN1dryN_PTSZLbo1tA/exec",
        WHATSAPP_NUMBER: "919778179727"
    };

    // Chatbot state
    let state = {
        isOpen: false,
        isGreetingSent: false,
        isAuditOfferSent: false,
        inactivityTimer: null,
        interactionCount: 0,
        currentStep: 'initial', // initial, asking_name, asking_phone, asking_message, finished
        leadData: {
            name: '',
            phone: '',
            message: ''
        }
    };

    // DOM Elements
    let elements = {};

    // Initialization
    function init() {
        createChatbotUI();
        setupEventListeners();
        
        // Auto-greet after delay (once per session)
        const sessionGreeted = sessionStorage.getItem('anshid_chat_greeted');
        
        setTimeout(() => {
            if (!sessionGreeted && !state.isGreetingSent) {
                // Removed openChat() to prevent auto-popup
                sendBotMessage("Hi, I’m Anshid’s assistant. Need help with SEO, ads, or getting more leads?");
                showQuickReplies([
                    "SEO Services", 
                    "Google Ads", 
                    "Social Media Marketing", 
                    "Pricing", 
                    "WhatsApp Now"
                ]);
                resetInactivityTimer();
                state.isGreetingSent = true;
                sessionStorage.setItem('anshid_chat_greeted', 'true');
            }
        }, CONFIG.GREETING_DELAY);
    }

    function createChatbotUI() {
        const container = document.createElement('div');
        container.className = 'chatbot-container';
        container.innerHTML = `
            <div class="chatbot-bubble" id="chatbotBubble">
                <span>Hey! Need help with SEO?</span>
            </div>
            <button class="chatbot-toggle" id="chatbotToggle">
                <div class="toggle-icon">
                    <i class="fas fa-comment-dots"></i>
                </div>
                <span class="toggle-label">Chat with AI</span>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
                    <div class="chatbot-header-info">
                        <h4>${CONFIG.BOT_NAME}</h4>
                        <div class="chatbot-status">Online & Responsive</div>
                    </div>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Messages will appear here -->
                </div>
                <div class="chatbot-ctas">
                    <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank" class="cta-link"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
                    <a href="contact/" class="cta-link"><i class="fas fa-envelope"></i> Contact Page</a>
                </div>
                <div class="quick-replies" id="chatbotReplies"></div>
                <form class="chatbot-input-area" id="chatbotForm">
                    <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Write a message..." autocomplete="off">
                    <button type="submit" class="chatbot-send"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        `;
        document.body.appendChild(container);

        elements = {
            toggle: document.getElementById('chatbotToggle'),
            bubble: document.getElementById('chatbotBubble'),
            window: document.getElementById('chatbotWindow'),
            messages: document.getElementById('chatbotMessages'),
            replies: document.getElementById('chatbotReplies'),
            form: document.getElementById('chatbotForm'),
            input: document.getElementById('chatbotInput')
        };
    }

    function setupEventListeners() {
        elements.toggle.addEventListener('click', toggleChat);
        
        elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = elements.input.value.trim();
            if (text) {
                handleUserInput(text);
                elements.input.value = '';
            }
        });

        // Delegate quick reply clicks
        elements.replies.addEventListener('click', (e) => {
            if (e.target.classList.contains('reply-btn')) {
                handleUserInput(e.target.innerText);
            }
        });
    }

    function toggleChat() {
        state.isOpen ? closeChat() : openChat();
    }

    function openChat() {
        state.isOpen = true;
        elements.window.classList.add('active');
        elements.toggle.classList.add('active');
        elements.bubble.classList.add('hidden');
        elements.toggle.querySelector('.toggle-icon').innerHTML = '<i class="fas fa-times"></i>';
    }

    function closeChat() {
        state.isOpen = false;
        elements.window.classList.remove('active');
        elements.toggle.classList.remove('active');
        elements.bubble.classList.remove('hidden');
        elements.toggle.querySelector('.toggle-icon').innerHTML = '<i class="fas fa-comment-dots"></i>';
    }

    function sendBotMessage(text, delay = 0) {
        showTypingIndicator();
        resetInactivityTimer();
        setTimeout(() => {
            removeTypingIndicator();
            const msgEl = document.createElement('div');
            msgEl.className = 'message bot';
            msgEl.innerHTML = text; // Allow HTML for links/bold
            elements.messages.appendChild(msgEl);
            scrollToBottom();
        }, delay || CONFIG.TYPING_SPEED);
    }

    function sendUserMessage(text) {
        resetInactivityTimer();
        const msgEl = document.createElement('div');
        msgEl.className = 'message user';
        msgEl.innerText = text;
        elements.messages.appendChild(msgEl);
        scrollToBottom();
    }

    function showQuickReplies(options) {
        elements.replies.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'reply-btn';
            btn.innerText = opt;
            elements.replies.appendChild(btn);
        });
    }

    function clearQuickReplies() {
        elements.replies.innerHTML = '';
    }

    function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'typing';
        typing.id = 'typingIndicator';
        typing.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        elements.messages.appendChild(typing);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        });
    }

    function handleUserInput(text) {
        sendUserMessage(text);
        clearQuickReplies();
        state.interactionCount++;
        
        const input = text.toLowerCase();

        // 1. Process Lead Capture Steps
        if (state.currentStep === 'asking_name') {
            state.leadData.name = text;
            state.currentStep = 'asking_phone';
            sendBotMessage(`Got it, ${text}! What’s your phone number? I'll have Anshid reach out.`);
            return;
        }

        if (state.currentStep === 'asking_phone') {
            state.leadData.phone = text;
            state.currentStep = 'asking_message';
            sendBotMessage("One last thing, what business or project are you working on?");
            return;
        }

        if (state.currentStep === 'asking_message') {
            state.leadData.message = text;
            state.currentStep = 'finished';
            saveLead();
            sendBotMessage("Perfect! I've shared your details with Anshid. He'll get in touch shortly. Anything else I can help with?");
            showQuickReplies(["Services", "Pricing", "Contact Page"]);
            return;
        }

        // 2. Process Interaction Threshold for Lead Capture
        if (state.interactionCount >= 2 && state.currentStep === 'initial') {
            setTimeout(() => {
                sendBotMessage("I’d like to help you personally. Can I get your name and number? I’ll pass it directly to Anshid.");
                state.currentStep = 'asking_name';
            }, 1000);
            return;
        }

        // 3. Process Smart Replies
        if (input.includes('seo service')) {
            sendBotMessage("SEO helps your website rank on Google and bring organic leads. I focus on local SEO + high-intent keywords.");
            showQuickReplies(["Pricing", "Lead Capture", "WhatsApp"]);
        } 
        else if (input.includes('google ads')) {
            sendBotMessage("I run performance-driven ads that generate leads with controlled cost per conversion.");
            showQuickReplies(["Pricing", "Service Audit", "WhatsApp"]);
        }
        else if (input.includes('social media')) {
            sendBotMessage("I help grow your brand and generate engagement + leads through strategic content.");
            showQuickReplies(["Pricing", "WhatsApp"]);
        }
        else if (input.includes('pricing')) {
            sendBotMessage("Pricing depends on your business goals. I can suggest the best plan after a quick discussion.");
            showQuickReplies(["Send Details", "WhatsApp"]);
        }
        else if (input.includes('whatsapp') || input.includes('contact')) {
            sendBotMessage("Opening WhatsApp for a direct chat with Anshid...");
            setTimeout(() => {
                window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Anshid, I'm interested in your digital marketing services.")}`, '_blank');
            }, 1000);
        }
        else if (input.includes('audit')) {
            sendBotMessage("I can definitely help with a free audit! Let's get your details first.");
            state.currentStep = 'asking_name';
            sendBotMessage("What's your name?");
        }
        else {
            sendBotMessage("I'm trained to help with SEO, Ads, and lead generation. Which one are you interested in?");
            showQuickReplies(["SEO Services", "Google Ads", "Social Media", "Pricing"]);
        }
    }

    function resetInactivityTimer() {
        if (state.inactivityTimer) clearTimeout(state.inactivityTimer);
        state.inactivityTimer = setTimeout(() => {
            if (state.isOpen && state.currentStep === 'initial' && !state.isAuditOfferSent) {
                sendBotMessage("Want a free website audit? I can help");
                showQuickReplies(["Yes, Help Me", "Maybe Later"]);
                state.isAuditOfferSent = true;
            }
        }, 30000); // Increased to 30 seconds for better experience
    }

    function saveLead() {
        const formData = {
            name: state.leadData.name,
            phone: state.leadData.phone,
            email: "CHATBOT_LEAD",
            message: "[CHATBOT ASSISTANT]: Interested in " + state.leadData.message || "Marketing Services"
        };

        fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(formData)
        });
    }

    // Lazy load logic: Run after page is fully loaded
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
