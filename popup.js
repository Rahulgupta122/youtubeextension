document.addEventListener('DOMContentLoaded', () => {
  const startListening = () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log('Heard:', transcript);

        if (transcript === 'stop' || transcript === 'release' || transcript === 'next' || transcript === 'back') {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (command) => {
                  // Handle video play/pause
                  const video = document.querySelector('video');
                  if (video) {
                    if (command === 'stop') {
                      video.pause();
                    } else if (command === 'release') {
                      video.play();
                    }
                  }

                  // Handle next/back commands
                  if (command === 'next') {
                    const nextButton = document.querySelector('.ytp-next-button');
                    if (nextButton) nextButton.click();
                  } else if (command === 'back') {
                    window.history.back(); 
                  }
                },
                args: [transcript]
              });
            }
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        switch (event.error) {
          // case 'not-allowed':
          //   alert('Microphone access is denied.');
          //   break;
          case 'network':
            alert('Network error during speech recognition.');
            break;
          // case 'no-speech':
          //   alert('No speech detected.');
          //   break;
          case 'audio-capture':
            alert('Microphone is in use by another application.');
            break;
          case 'service-not-allowed':
            alert('Speech recognition is not supported in this environment.');
            break;
          // default:
          //   alert('Unknown error during speech recognition.');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended.');
        recognition.start(); // Restart listening
      };

      recognition.start();
      console.log('Voice recognition started. Say "stop", "release", "next", or "back".');
    } catch (error) {
      console.error('Speech Recognition API is not supported in this browser.', error);
      alert('Your browser does not support speech recognition.');
    }
  };

  startListening();
});