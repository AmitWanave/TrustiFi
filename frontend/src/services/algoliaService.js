import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

// Initialize Algolia client
const client = algoliasearch(appId, searchKey);

const indexName = 'products'; // As specified in the requirements

/**
 * Perform a search query against the 'products' index
 * @param {string} query - The search query string
 * @returns {Promise<Array>} - Array of search hits
 */
export const searchProducts = async (query) => {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    // v5 API: call method directly on client with indexName
    const response = await client.searchSingleIndex({
      indexName: indexName,
      searchParams: {
        query: query,
        hitsPerPage: 5, // Limiting for suggestions dropdown
      },
    });

    return response.hits || [];
  } catch (error) {
    console.error(`Algolia Search Error: ${error.message}`);
    return []; // Graceful fallback to empty results
  }
};
