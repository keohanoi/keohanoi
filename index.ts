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
      id: '4',
      title: 'The Persistence of Memory',
      artistName: 'Salvador Dalí',
      image: 'https://uploads6.wikiart.org/images/salvador-dali/the-persistence-of-memory-1931.jpg',
      year: 1931,
      style: 'Surrealism',
      genre: 'symbolic painting'
    }
  ];

  // Try multiple API strategies with different art sources
  const apiStrategies = [
    // Strategy 1: Metropolitan Museum of Art API
    {
      url: 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting&departmentId=11',
      name: 'Met Museum API',
      type: 'met'
    },
    // Strategy 2: Art Institute of Chicago API
    {
      url: 'https://api.artic.edu/api/v1/artworks/search?q=painting&limit=100&fields=id,title,artist_title,image_id,date_display,style_title,classification_title',
      name: 'Art Institute Chicago API',
      type: 'artic'
    },
    // Strategy 3: Harvard Art Museums API (no key required for basic search)
    {
      url: 'https://api.harvardartmuseums.org/object?classification=Paintings&hasimage=1&size=100',
      name: 'Harvard Art Museums API',
      type: 'harvard'
    }
  ];

  for (const strategy of apiStrategies) {
    try {
      console.log(`Attempting ${strategy.name}: ${strategy.url}`);
      
      // Add random delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      const response = await fetch(strategy.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      console.log(`${strategy.name} response status:`, response.status);

      if (!response.ok) {
        console.log(`${strategy.name} failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log(`${strategy.name} raw response:`, JSON.stringify(data).substring(0, 500));

      let artworks: any[] = [];
      let selectedArtwork: WikiArtPainting | null = null;

      // Process different API response formats
      if (strategy.type === 'met') {
        // Met Museum returns object IDs, need to fetch individual objects
        if (data.objectIDs && data.objectIDs.length > 0) {
          const randomObjectId = data.objectIDs[Math.floor(Math.random() * Math.min(data.objectIDs.length, 20))];
          const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomObjectId}`);
          if (objectResponse.ok) {
            const artwork = await objectResponse.json();
            if (artwork.primaryImage && artwork.title && artwork.artistDisplayName) {
              selectedArtwork = {
                id: artwork.objectID.toString(),
                title: artwork.title,
                artistName: artwork.artistDisplayName,
                image: artwork.primaryImage,
                year: artwork.objectDate ? parseInt(artwork.objectDate) : undefined,
                style: artwork.period,
                genre: artwork.classification
              };
            }
          }
        }
      } else if (strategy.type === 'artic') {
        // Art Institute of Chicago format
        if (data.data && data.data.length > 0) {
          const artwork = data.data[Math.floor(Math.random() * data.data.length)];
          if (artwork.image_id && artwork.title && artwork.artist_title) {
            selectedArtwork = {
              id: artwork.id.toString(),
              title: artwork.title,
              artistName: artwork.artist_title,
              image: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`,
              year: artwork.date_display ? parseInt(artwork.date_display) : undefined,
              style: artwork.style_title,
              genre: artwork.classification_title
            };
          }
        }
      } else if (strategy.type === 'harvard') {
        // Harvard Art Museums format
        if (data.records && data.records.length > 0) {
          const artwork = data.records[Math.floor(Math.random() * data.records.length)];
          if (artwork.primaryimageurl && artwork.title && artwork.people && artwork.people.length > 0) {
            selectedArtwork = {
              id: artwork.objectid.toString(),
              title: artwork.title,
              artistName: artwork.people[0].name,
              image: artwork.primaryimageurl,
              year: artwork.dated ? parseInt(artwork.dated) : undefined,
              style: artwork.period,
              genre: artwork.classification
            };
          }
        }
      }

      if (selectedArtwork) {
        console.log(`${strategy.name} SUCCESS! Selected artwork:`, selectedArtwork);
        processArtwork(selectedArtwork);
        return; // Success, exit function
      } else {
        console.log(`${strategy.name} failed to extract valid artwork data`);
        continue;
      }
      
    } catch (error) {
      console.log(`${strategy.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
      continue;
    }
  }

  // All strategies failed, use fallback
  console.log('All API strategies failed, using fallback artworks');
  const randomIndex = Math.floor(Math.random() * fallbackArtworks.length);
  const selectedArtwork = fallbackArtworks[randomIndex];
  processArtwork(selectedArtwork);
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
