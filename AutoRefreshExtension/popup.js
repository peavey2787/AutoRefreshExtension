document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startButton');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const countdownElement = document.getElementById('countdown');

  let isRunning = false;

  // Check if the timer is running when the popup loads
  chrome.runtime.sendMessage({ action: 'checkStatus' }, function (response) {
      isRunning = response.isRunning || false;
      if (isRunning) {
          startButton.textContent = 'Stop';
          updateCountdown(response.totalTime || 0);
      } else {
          startButton.textContent = 'Start';
      }
  });

  startButton.addEventListener('click', function () {
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;

      if (isRunning) {
          // Stop the timer
          chrome.runtime.sendMessage({ action: 'stopTimer' });
          startButton.textContent = 'Start';
          countdownElement.textContent = '0:00'; // Reset countdown display
          isRunning = false;
      } else {
          const totalTime = (minutes * 60) + seconds;

          if (totalTime > 0) {
              // Get the active tab ID and start the timer
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                  if (tabs.length > 0) {
                      const currentTabId = tabs[0].id;
                      chrome.runtime.sendMessage({ action: 'startTimer', totalTime, tabId: currentTabId });
                      startButton.textContent = 'Stop';
                      isRunning = true;
                      updateCountdown(totalTime); // Update countdown display immediately
                  }
              });
          } else {
              alert('Please set a valid time interval.');
          }
      }
  });

  chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'updateUI') {
          updateCountdown(request.timeRemaining);
      }
  });

  function updateCountdown(totalTime) {
      const minutes = Math.floor(totalTime / 60);
      const seconds = totalTime % 60;
      countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});
