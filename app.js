// DOM Elements
const sidebar = document.getElementById('sidebar');
const subjectTabs = document.getElementById('subjectTabs');
const contentArea = document.getElementById('contentArea');
const subjectTitle = document.getElementById('subjectTitle');
const topicTitle = document.getElementById('topicTitle');
const contentText = document.getElementById('contentText');
const menuToggle = document.getElementById('menuToggle');
const overlay = document.getElementById('overlay');
const checklistToggle = document.getElementById('checklistToggle');
const checklistPanel = document.getElementById('checklistPanel');
const closeChecklist = document.getElementById('closeChecklist');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const checklistContent = document.getElementById('checklistContent');
const mobileTabs = document.getElementById('mobileTabs');

// Translation Elements
const translateBtn = document.createElement('button');
translateBtn.className = 'translate-btn';
translateBtn.innerHTML = '<i class="fas fa-language"></i> <span>English</span>';
translateBtn.style.position = 'fixed';
translateBtn.style.bottom = '20px';
translateBtn.style.right = '20px';
translateBtn.style.zIndex = '1000';
translateBtn.style.padding = '10px 15px';
translateBtn.style.backgroundColor = 'var(--primary-color)';
translateBtn.style.color = 'white';
translateBtn.style.border = 'none';
translateBtn.style.borderRadius = 'var(--border-radius)';
translateBtn.style.cursor = 'pointer';
translateBtn.style.boxShadow = 'var(--box-shadow)';
document.body.appendChild(translateBtn);

// State
let currentSubject = null;
let currentTopicIndex = null;
let isTranslated = false; // Start in English mode
const completionStatus = JSON.parse(localStorage.getItem('completionStatus')) || {};

// Initialize the app
function initApp() {
    renderSubjectTabs();
    loadFirstSubject();
    setupEventListeners();
    updateProgress();
    
    // Set initial translation state (remove the toggleTranslation call)
    translateBtn.addEventListener('click', () => toggleTranslation());
}

// Render subject tabs in the sidebar with collapsible topics
function renderSubjectTabs() {
    subjectTabs.innerHTML = '';
    
    Object.keys(data).forEach(subject => {
        // Create subject tab
        const subjectTab = document.createElement('div');
        subjectTab.className = 'subject-tab';
        
        // Subject title with chevron
        const subjectHeader = document.createElement('div');
        subjectHeader.className = 'subject-header';
        subjectHeader.innerHTML = `
            <span>${isTranslated ? getTranslatedSubjectName(subject) : subject}</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        // Topics container
        const topicContainer = document.createElement('div');
        topicContainer.className = 'topic-container';
        topicContainer.style.display = 'none'; // Start collapsed
        
        // Add topics
        data[subject].forEach((topic, index) => {
            const topicTab = document.createElement('div');
            topicTab.className = 'topic-tab';
            topicTab.textContent = isTranslated ? getTranslatedTopicName(subject, index) : topic.topic;
            topicTab.addEventListener('click', (e) => {
                e.stopPropagation();
                loadTopic(subject, index);
            });
            topicContainer.appendChild(topicTab);
        });
        
        // Toggle topic visibility
        subjectHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = subjectTab.classList.contains('active');
            
            // Collapse all other subject tabs
            document.querySelectorAll('.subject-tab').forEach(tab => {
                if (tab !== subjectTab) {
                    tab.classList.remove('active');
                    tab.querySelector('.topic-container').style.display = 'none';
                    tab.querySelector('.fa-chevron-down').classList.remove('fa-chevron-up');
                }
            });
            
            // Toggle current subject
            subjectTab.classList.toggle('active', !wasActive);
            topicContainer.style.display = wasActive ? 'none' : 'block';
            const icon = subjectHeader.querySelector('i');
            icon.classList.toggle('fa-chevron-up', !wasActive);
            icon.classList.toggle('fa-chevron-down', wasActive);
        });
        
        subjectTab.appendChild(subjectHeader);
        subjectTab.appendChild(topicContainer);
        subjectTabs.appendChild(subjectTab);
    });
}

// Get translated subject name
function getTranslatedSubjectName(subject) {
    return translation[subject] ? Object.keys(translation).find(key => key === subject) : subject;
}

// Get translated topic name
function getTranslatedTopicName(subject, index) {
    if (translation[subject] && translation[subject][index]) {
        return translation[subject][index].topic;
    }
    return data[subject][index].topic;
}

// Load the first subject by default
function loadFirstSubject() {
    const firstSubject = Object.keys(data)[0];
    if (firstSubject) {
        loadSubject(firstSubject);
    }
}

// Load a subject
function loadSubject(subject) {
    currentSubject = subject;
    
    // Update active subject tab
    document.querySelectorAll('.subject-tab').forEach(tab => {
        const tabSubject = isTranslated ? 
            getOriginalSubjectName(tab.querySelector('.subject-header span').textContent) :
            tab.querySelector('.subject-header span').textContent;
        tab.classList.toggle('active-tab', tabSubject === subject);
    });
    
    // Update content area
    subjectTitle.textContent = isTranslated ? getTranslatedSubjectName(subject) : subject;
    
    // Load the first topic of the subject
    if (data[subject] && data[subject].length > 0) {
        loadTopic(subject, 0);
    }
    
    // Update mobile tabs
    updateMobileTabs(subject);
}

// Get original subject name from translated name
function getOriginalSubjectName(translatedName) {
    return Object.keys(data).find(key => key === translatedName) || translatedName;
}

// Load a specific topic
function loadTopic(subject, topicIndex) {
    const topic = data[subject][topicIndex];
    const translatedTopic = translation[subject] ? translation[subject][topicIndex] : null;
    currentTopicIndex = topicIndex;
    const topicId = `${subject}-${topicIndex}`;
    
    // Update active topic tab
    document.querySelectorAll('.topic-tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === topicIndex);
    });
    
    // Update content area
    topicTitle.textContent = isTranslated ? 
        (translatedTopic ? translatedTopic.topic : topic.topic) : 
        topic.topic;
    
    // Format the content
    const currentContent = isTranslated ? 
        (translatedTopic ? translatedTopic.content : topic.content) : 
        topic.content;
    
    let formattedContent = formatContent(currentContent);
    contentText.innerHTML = formattedContent || '<p>No content available for this topic.</p>';
    
    // Store original and translated content
    contentText.dataset.originalContent = formatContent(topic.content);
    contentText.dataset.translatedContent = translatedTopic ? formatContent(translatedTopic.content) : formatContent(topic.content);
    
    // Set content direction based on translation state
    contentText.style.direction = isTranslated ? 'ltr' : 'rtl';
    contentText.style.textAlign = isTranslated ? 'left' : 'right';
    
    // Mark as visited
    if (!completionStatus[topicId]) {
        completionStatus[topicId] = { visited: true, completed: false };
        localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
        updateProgress();
    }
    
    // Add fade-in animation
    contentText.classList.add('fade-in');
    setTimeout(() => contentText.classList.remove('fade-in'), 500);
    
    // Update mobile tabs
    updateMobileTabs(subject, topicIndex);
}

// Toggle between original and translated content
function toggleTranslation(shouldUpdate = true) {
    isTranslated = !isTranslated;
    
    // Update button text
    translateBtn.querySelector('span').textContent = isTranslated ? 'العربية' : 'English';
    
    // Update all visible text elements
    if (shouldUpdate) {
        // Update subject tabs
        document.querySelectorAll('.subject-header span').forEach(span => {
            const subject = getOriginalSubjectName(span.textContent);
            span.textContent = isTranslated ? getTranslatedSubjectName(subject) : subject;
        });
        
        // Update topic tabs
        document.querySelectorAll('.topic-tab').forEach((tab, index) => {
            const subject = currentSubject;
            tab.textContent = isTranslated ? 
                getTranslatedTopicName(subject, index) : 
                data[subject][index].topic;
        });
        
        // Update content area
        if (currentSubject !== null && currentTopicIndex !== null) {
            loadTopic(currentSubject, currentTopicIndex);
        }
        
        // Update checklist
        renderChecklist();
    }
}

// Format content based on its structure
function formatContent(content) {
    let formattedContent = '';
    
    if (content) {
        if (Array.isArray(content)) {
            // Handle array of Q&A pairs
            content.forEach(item => {
                if (item.question && item.answer) {
                    const qPrefix = isTranslated ? 'Q:' : 'س:';
                    formattedContent += `
                        <div class="question"><strong>${qPrefix}</strong> ${item.question}</div>
                        <div class="answer">${item.answer}</div>
                    `;
                }
            });
        } else if (typeof content === 'object' && content.question && content.answer) {
            // Handle single Q&A object
            const qPrefix = isTranslated ? 'Q:' : 'س:';
            formattedContent = `
                <div class="question"><strong>${qPrefix}</strong> ${content.question}</div>
                <div class="answer">${content.answer}</div>
            `;
        } else if (typeof content === 'string') {
            // Handle raw HTML content
            formattedContent = content;
        }
    }
    
    return formattedContent;
}

// Update mobile tabs
function updateMobileTabs(subject, activeIndex = 0) {
    mobileTabs.innerHTML = '';
    
    if (!data[subject]) return;
    
    data[subject].forEach((topic, index) => {
        const tab = document.createElement('div');
        tab.className = `mobile-tab ${index === activeIndex ? 'active' : ''}`;
        tab.textContent = isTranslated ? 
            (translation[subject] && translation[subject][index] ? 
                translation[subject][index].topic : topic.topic) : 
            topic.topic;
        tab.addEventListener('click', () => loadTopic(subject, index));
        mobileTabs.appendChild(tab);
    });
}

// Update progress bar and checklist
function updateProgress() {
    const allTopics = getAllTopics();
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter(topic => completionStatus[topic]?.completed).length;
    const visitedTopics = allTopics.filter(topic => completionStatus[topic]?.visited).length;
    
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const visitedPercentage = totalTopics > 0 ? Math.round((visitedTopics / totalTopics) * 100) : 0;
    
    progressFill.style.width = `${completionPercentage}%`;
    progressText.textContent = isTranslated ? 
        `${completionPercentage}% completed (${visitedPercentage}% visited)` :
        `${completionPercentage}% مكتمل (${visitedPercentage}% تمت زيارتها)`;
    
    renderChecklist();
}

// Get all topics across all subjects
function getAllTopics() {
    let topics = [];
    Object.keys(data).forEach(subject => {
        data[subject].forEach((_, index) => {
            topics.push(`${subject}-${index}`);
        });
    });
    return topics;
}

// Render the checklist
function renderChecklist() {
    checklistContent.innerHTML = '';
    
    Object.keys(data).forEach(subject => {
        const subjectChecklist = document.createElement('div');
        subjectChecklist.className = 'subject-checklist active';
        
        const subjectTitle = document.createElement('div');
        subjectTitle.className = 'subject-checklist-title';
        subjectTitle.innerHTML = `
            <span>${isTranslated ? getTranslatedSubjectName(subject) : subject}</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        const topicList = document.createElement('div');
        topicList.className = 'topic-checklist';
        
        data[subject].forEach((topic, index) => {
            const topicId = `${subject}-${index}`;
            const isCompleted = completionStatus[topicId]?.completed || false;
            
            const checklistItem = document.createElement('div');
            checklistItem.className = `checklist-item ${isCompleted ? 'completed' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `check-${topicId}`;
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', (e) => {
                if (!completionStatus[topicId]) {
                    completionStatus[topicId] = { visited: true, completed: e.target.checked };
                } else {
                    completionStatus[topicId].completed = e.target.checked;
                }
                localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
                checklistItem.classList.toggle('completed', e.target.checked);
                updateProgress();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `check-${topicId}`;
            label.textContent = isTranslated ? 
                (translation[subject] && translation[subject][index] ? 
                    translation[subject][index].topic : topic.topic) : 
                topic.topic;
            
            checklistItem.appendChild(checkbox);
            checklistItem.appendChild(label);
            topicList.appendChild(checklistItem);
        });
        
        subjectTitle.addEventListener('click', () => {
            subjectChecklist.classList.toggle('active');
            subjectTitle.classList.toggle('collapsed');
        });
        
        subjectChecklist.appendChild(subjectTitle);
        subjectChecklist.appendChild(topicList);
        checklistContent.appendChild(subjectChecklist);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Menu toggle for mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    // Overlay click to close sidebar
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Checklist toggle
    checklistToggle.addEventListener('click', () => {
        checklistPanel.classList.add('active');
        overlay.classList.add('active');
    });
    
    closeChecklist.addEventListener('click', () => {
        checklistPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    overlay.addEventListener('click', () => {
        checklistPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);