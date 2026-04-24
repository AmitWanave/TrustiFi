const { algoliasearch } = require('algoliasearch');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Algolia client (v5 API)
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

const indexName = process.env.ALGOLIA_INDEX_NAME || 'products';

/**
 * Sync a listing to Algolia
 * @param {Object} listing - The listing document from Mongoose
 */
const saveListingToAlgolia = async (listing) => {
  try {
    const record = {
      objectID: listing._id.toString(),
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      category: listing.brand,
      condition: listing.condition,
      price: listing.price?.asking || 0,
      location: listing.location?.city || 'Unknown',
      status: listing.status,
      image: listing.images?.find(img => img.isPrimary)?.url || listing.images?.[0]?.url || null,
      updatedAt: listing.updatedAt,
    };

    // v5 API: call method directly on client with indexName
    await client.saveObject({ 
      indexName, 
      body: record 
    });
    
    console.log(`Algolia: Synced listing ${listing._id}`);
  } catch (error) {
    console.error(`Algolia Sync Error [Save]: ${error.message}`);
  }
};

/**
 * Remove a listing from Algolia
 * @param {string} objectID - The MongoDB ID string
 */
const deleteListingFromAlgolia = async (objectID) => {
  try {
    // v5 API: call method directly on client with indexName
    await client.deleteObject({ 
      indexName, 
      objectID 
    });
    
    console.log(`Algolia: Deleted listing ${objectID}`);
  } catch (error) {
    console.error(`Algolia Sync Error [Delete]: ${error.message}`);
  }
};

module.exports = {
  saveListingToAlgolia,
  deleteListingFromAlgolia,
};
