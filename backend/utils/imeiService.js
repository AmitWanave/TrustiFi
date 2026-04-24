const axios = require('axios');

/**
 * Service to interact with IMEIcheck.net API
 */
class ImeiService {
  constructor() {
    this.apiKey = process.env.IMEICHECK_API_KEY;
    this.baseUrl = process.env.IMEICHECK_BASE_URL || 'https://api.imeicheck.net';
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Fetch all available services to map the correct serviceId
   */
  async fetchServices() {
    try {
      const response = await this.api.get('/v1/services');
      return response.data;
    } catch (error) {
      console.error('IMEIcheck fetchServices error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Perform a device check
   * @param {string} deviceId IMEI or Serial Number
   * @param {number} serviceId Numeric ID of the service
   */
  async checkImei(deviceId, serviceId) {
    try {
      if (!deviceId || !serviceId) {
        const error = new Error('deviceId and serviceId are required');
        error.status = 422;
        throw error;
      }

      const response = await this.api.post('/v1/checks', {
        deviceId: deviceId.trim(),
        serviceId: Number(serviceId)
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        const err = new Error(error.response.data?.message || 'Invalid deviceId or serviceId');
        err.status = 422;
        throw err;
      }
      console.error('IMEIcheck checkImei error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Helper to find best serviceId based on brand
   * Updated to use service ID 12 as per user request.
   */
  async getBestServiceId(brand) {
    // User specifically requested to use service ID 12
    return 12;
  }
}

module.exports = new ImeiService();
