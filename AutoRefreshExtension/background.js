let timerId;
let totalTime;
let currentTabId;
let isRunning = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTimer') {
        totalTime = request.totalTime;
        currentTabId = request.tabId;
        isRunning = true;
        startTimer(totalTime);
        chrome.storage.local.set({ isRunning: true });
    } else if (request.action === 'stopTimer') {
        stopTimer();
    } else if (request.action === 'checkStatus') {
        sendResponse({ isRunning, totalTime });
    }
});

function startTimer(initTime) {
    totalTime = initTime;

    if (!timerId) {
        timerId = setInterval(() => {
            if (totalTime > 0) {
                totalTime--;
                updateBadge(totalTime);
                chrome.runtime.sendMessage({ action: 'updateUI', timeRemaining: totalTime });
            } else {
                refreshCurrentTab();
                totalTime = initTime; // Reset timer
            }
        }, 1000);
    }
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    isRunning = false;
    chrome.storage.local.set({ isRunning: false });
    chrome.action.setBadgeText({ text: '' }); // Clear the badge text when stopped
}

function updateBadge(totalTime) {
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const badgeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Set the badge color to red
}

function refreshCurrentTab() {
    if (currentTabId) {
        chrome.tabs.reload(currentTabId);
    }
}
