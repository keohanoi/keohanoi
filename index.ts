import fs from 'fs';
import path from 'path';

const saveTemplate = (data: { img: string; artwork: string; artist: string; des: string }) => {
  const templatePath = path.resolve(__dirname, 'README.md');

  // Define the template
  const template = `
<div class="artwork-of-the-day">
  <div class="container">
    <div class="img-wrapper">
      <img
        src="${data.img}"
        alt="${data.artwork}" />
    </div>
    <div class="artwork-detail">
      <div class="artwork-origin"> 
        <h2 class="artwork-name">${data.artwork}</h2>
        <h3 class="artist">
          ${data.artist}
        </h3>
      </div>
      <p class="description">
        ${data.des}
      </p>
    </div>
  </div>
</div>
`;

  // Write to the template file
  fs.writeFileSync(templatePath, template, 'utf8');
  console.log('Template saved to:', templatePath);
};

interface WikiArtPainting {
  id: string;
  title: string;
  artistName: string;
  image: string;
  year?: number;
  style?: string;
  genre?: string;
  media?: string;
  completitionYear?: number;
}

const fetchArtworkFromAPI = async () => {
  // Fallback artworks in case API fails
  const fallbackArtworks: WikiArtPainting[] = [
    {
      id: '1',
      title: 'Starry Night',
      artistName: 'Vincent van Gogh',
      image: 'https://uploads0.wikiart.org/00142/images/vincent-van-gogh/the-starry-night.jpg',
      year: 1889,
      style: 'Post-Impressionism',
      genre: 'landscape'
    },
    {
      id: '2',
      title: 'The Great Wave off Kanagawa',
      artistName: 'Katsushika Hokusai',
      image: 'https://uploads7.wikiart.org/images/katsushika-hokusai/the-great-wave-off-kanagawa-1831.jpg',
      year: 1831,
      style: 'Ukiyo-e',
      genre: 'marina'
    },
    {
      id: '3',
      title: 'Girl with a Pearl Earring',
      artistName: 'Johannes Vermeer',
      image: 'https://uploads3.wikiart.org/images/johannes-vermeer/girl-with-a-pearl-earring-1665.jpg',
      year: 1665,
      style: 'Baroque',
      genre: 'portrait'
    },
    {
      id: '4',
      title: 'The Persistence of Memory',
      artistName: 'Salvador Dalí',
      image: 'https://uploads6.wikiart.org/images/salvador-dali/the-persistence-of-memory-1931.jpg',
      year: 1931,
      style: 'Surrealism',
      genre: 'symbolic painting'
    },
    {
      id: '5',
      title: 'The Birth of Venus',
      artistName: 'Sandro Botticelli',
      image: 'https://uploads0.wikiart.org/images/sandro-botticelli/the-birth-of-venus-1485.jpg',
      year: 1485,
      style: 'Early Renaissance',
      genre: 'mythological painting'
    }
  ];

  try {
    console.log('Attempting to fetch from WikiArt API...');
    const response = await fetch('https://www.wikiart.org/en/App/Painting/MostViewedPaintings?offset=0&quantity=100&limit=100&randomSeed=123&json=2', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as WikiArtPainting[];
    console.log('Successfully fetched from API');
    
    // Select a random artwork from the response
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedArtwork = data[randomIndex];
    
    processArtwork(selectedArtwork);
    
  } catch (error) {
    console.log('API failed, using fallback artworks:', error.message);
    // Use fallback artworks
    const randomIndex = Math.floor(Math.random() * fallbackArtworks.length);
    const selectedArtwork = fallbackArtworks[randomIndex];
    processArtwork(selectedArtwork);
  }
};

const processArtwork = (selectedArtwork: WikiArtPainting) => {
  // Extract and format the data
  const artwork = selectedArtwork.title || 'Untitled';
  const artist = selectedArtwork.artistName || 'Unknown Artist';
  const img = selectedArtwork.image || '';
  
  // Create a description from available data
  let des = `A masterpiece by ${artist}`;
  if (selectedArtwork.year || selectedArtwork.completitionYear) {
    const year = selectedArtwork.year || selectedArtwork.completitionYear;
    des += `, created in ${year}`;
  }
  if (selectedArtwork.style) {
    des += `, representing the ${selectedArtwork.style} style`;
  }
  if (selectedArtwork.genre) {
    des += ` in the ${selectedArtwork.genre} genre`;
  }
  des += '.';

  // Log extracted data
  console.log({ img, artwork, artist, des });

  // Save the template
  saveTemplate({ img, artwork, artist, des });
};

fetchArtworkFromAPI();
