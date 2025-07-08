// Get the date input elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Get the button and gallery elements
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA API key (use your own or 'DEMO_KEY' for testing)
const apiKey = 'EsxlR7LvMEMqFAiY7eyIbWvewXHIhQunfovxIOvu';

// ====== BEGINNER-FRIENDLY "DID YOU KNOW?" FACTS SECTION ======

// Array of fun space facts
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second.",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? One million Earths could fit inside the Sun.",
  "Did you know? Space is completely silent—there’s no air to carry sound.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has the shortest day of all the planets.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? If two pieces of the same type of metal touch in space, they will bond permanently.",
  "Did you know? Saturn could float in water because it’s mostly made of gas."
];

// Pick a random fact from the array
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Create a section above the gallery to display the fact
const factSection = document.createElement('section');
factSection.className = 'space-fact';
factSection.innerHTML = `<strong>${randomFact}</strong>`;

// Insert the fact section above the gallery
const container = document.querySelector('.container');
container.insertBefore(factSection, gallery);

// ====== END OF "DID YOU KNOW?" FACTS SECTION ======

// Function to show a modal with image or video, title, date, and explanation
function showModal(item) {
  // Create the overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  // Create the modal content
  const modal = document.createElement('div');
  modal.className = 'modal';

  // Fill the modal with the correct media type
  let mediaContent = '';
  if (item.media_type === 'image') {
    // Show a large image
    const imageUrl = item.hdurl || item.url;
    mediaContent = `<img src="${imageUrl}" alt="${item.title}" class="modal-image" />`;
  } else if (item.media_type === 'video') {
    // If it's a YouTube video, embed it, otherwise show a link
    if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      // Extract YouTube video ID for embedding
      let videoId = '';
      if (item.url.includes('youtube.com')) {
        const urlObj = new URL(item.url);
        videoId = urlObj.searchParams.get('v');
      } else if (item.url.includes('youtu.be')) {
        videoId = item.url.split('/').pop();
      }
      if (videoId) {
        mediaContent = `
          <div class="modal-video-container">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" 
              title="YouTube video player" frameborder="0" allowfullscreen></iframe>
          </div>
        `;
      } else {
        mediaContent = `<a href="${item.url}" target="_blank" rel="noopener">Watch Video</a>`;
      }
    } else {
      // Not a YouTube video, just show a link
      mediaContent = `<a href="${item.url}" target="_blank" rel="noopener">Watch Video</a>`;
    }
  }

  // Fill the modal with media, title, date, and explanation
  modal.innerHTML = `
    <button class="modal-close" title="Close">&times;</button>
    ${mediaContent}
    <h2>${item.title}</h2>
    <p class="modal-date">${item.date}</p>
    <p class="modal-explanation">${item.explanation}</p>
  `;

  // Add the modal to the overlay
  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  // Close the modal when clicking the close button or outside the modal
  modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay || event.target.classList.contains('modal-close')) {
      document.body.removeChild(modalOverlay);
    }
  });
}

// When the button is clicked, fetch images and update the gallery
button.addEventListener('click', () => {
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // If either date is missing, show an alert and stop
  if (!startDate || !endDate) {
    alert('Please select both a start and end date.');
    return;
  }

  // Build the API URL
  const url = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

  // Show a loading message
  gallery.innerHTML = '<p>Loading images...</p>';

  // Fetch data from NASA's API
  fetch(url)
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok. Details: ${errorText}`);
      }
      return response.json();
    })
    .then(data => {
      // If the API returns an error, show it
      if (data.error) {
        gallery.innerHTML = `<p>${data.error.message}</p>`;
        return;
      }

      // Make sure we always have an array (even for a single day)
      const items = Array.isArray(data) ? data : [data];

      // If no items, show a message
      if (items.length === 0) {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
        return;
      }

      // Clear the gallery
      gallery.innerHTML = '';

      // For each item, create a gallery item with media, title, and date
      items.forEach(item => {
        // Create a container for the gallery item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';

        // Create the media element (image or video)
        let mediaElement;
        if (item.media_type === 'image') {
          mediaElement = document.createElement('img');
          mediaElement.src = item.url;
          mediaElement.alt = item.title;
          mediaElement.title = item.title;
          mediaElement.className = 'apod-image';
        } else if (item.media_type === 'video') {
          // Create a wrapper for the preview and link
          const videoWrapper = document.createElement('div');
          videoWrapper.style.position = 'relative';

          // If it's a YouTube video, show a thumbnail preview
          let videoId = '';
          if (item.url.includes('youtube.com')) {
            const urlObj = new URL(item.url);
            videoId = urlObj.searchParams.get('v');
          } else if (item.url.includes('youtu.be')) {
            videoId = item.url.split('/').pop();
          }

          if (videoId) {
            // Create the preview image
            const previewImg = document.createElement('img');
            previewImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            previewImg.alt = "YouTube Video Preview";
            previewImg.className = 'video-preview';

            // Add a play icon overlay
            const playIcon = document.createElement('span');
            playIcon.className = 'video-play-icon';
            playIcon.innerHTML = '▶';

            // Position the play icon over the image
            videoWrapper.appendChild(previewImg);
            videoWrapper.appendChild(playIcon);
          }

          // Create the video link
          const videoLink = document.createElement('a');
          videoLink.href = item.url;
          videoLink.target = '_blank';
          videoLink.rel = 'noopener';
          videoLink.textContent = 'Watch Video';

          // Add the preview and link to the gallery item
          itemDiv.appendChild(videoWrapper);
          itemDiv.appendChild(videoLink);
        }

        // Create the title element
        const title = document.createElement('h3');
        title.textContent = item.title;

        // Create the date element
        const date = document.createElement('p');
        date.textContent = item.date;

        // Add media, title, and date to the gallery item
        if (mediaElement) itemDiv.appendChild(mediaElement);
        itemDiv.appendChild(title);
        itemDiv.appendChild(date);

        // When the gallery item is clicked, show the modal
        itemDiv.addEventListener('click', () => showModal(item));

        // Add the gallery item to the gallery
        gallery.appendChild(itemDiv);
      });

      // If there were no valid items, show a message
      if (gallery.innerHTML === '') {
        gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p>Sorry, there was an error: ${error.message}</p>`;
    });
});
