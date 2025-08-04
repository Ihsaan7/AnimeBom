import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// AniList GraphQL API function to fetch high-quality anime images
export async function fetchAnimeImages(animeTitle) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        title {
          romaji
        }
        coverImage {
          medium
          large
          extraLarge
        }
        bannerImage
      }
    }
  `;

  const variables = {
    search: animeTitle
  };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    const media = data.data?.Media;
    if (!media) {
      console.log(`No anime found for title: ${animeTitle}`);
      return null;
    }

    return {
      title: media.title?.romaji || animeTitle,
      coverImage: {
        medium: media.coverImage?.medium,
        large: media.coverImage?.large,
        extraLarge: media.coverImage?.extraLarge
      },
      bannerImage: media.bannerImage
    };
  } catch (error) {
    console.error('Error fetching anime images from AniList:', error);
    return null;
  }
}
