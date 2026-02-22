const axios = require('axios');

/**
 * CarbonFootprintService - Third-party API integration for carbon emission calculations
 * Uses the Carbon Interface API (https://www.carboninterface.com/)
 * Fallback: Local calculation using Sri Lanka grid emission factor
 */
class CarbonFootprintService {

    // Sri Lanka electricity grid emission factor (kg CO2 per kWh)
    // Source: IEA emission factors for Sri Lanka
    static SL_EMISSION_FACTOR = 0.682; // kg CO2 per kWh

    // Carbon Interface API
    static API_BASE_URL = 'https://www.carboninterface.com/api/v1';

    /**
     * Calculate carbon footprint using local estimation
     * (Used as fallback or when no API key is configured)
     * @param {Number} monthlyKWh - Monthly electricity consumption in kWh
     * @returns {Object} Carbon footprint details
     */
    static calculateLocalCarbonFootprint(monthlyKWh) {
        const monthlyCO2Kg = monthlyKWh * this.SL_EMISSION_FACTOR;
        const annualCO2Kg = monthlyCO2Kg * 12;

        return {
            source: 'local_calculation',
            emissionFactor: this.SL_EMISSION_FACTOR,
            country: 'Sri Lanka',
            monthly: {
                kWh: parseFloat(monthlyKWh.toFixed(2)),
                co2Kg: parseFloat(monthlyCO2Kg.toFixed(2)),
                co2Tonnes: parseFloat((monthlyCO2Kg / 1000).toFixed(4))
            },
            annual: {
                kWh: parseFloat((monthlyKWh * 12).toFixed(2)),
                co2Kg: parseFloat(annualCO2Kg.toFixed(2)),
                co2Tonnes: parseFloat((annualCO2Kg / 1000).toFixed(4))
            },
            equivalents: {
                treesNeededToOffset: Math.ceil(annualCO2Kg / 22), // ~22kg CO2 absorbed per tree/year
                kmDriving: Math.round(annualCO2Kg / 0.21), // ~0.21 kg CO2 per km average car
                litresOfPetrol: Math.round(annualCO2Kg / 2.31) // ~2.31 kg CO2 per litre petrol
            }
        };
    }

    /**
     * Calculate carbon footprint using Carbon Interface API
     * Falls back to local calculation if API fails
     * @param {Number} monthlyKWh - Monthly electricity usage
     * @returns {Object} Carbon footprint data
     */
    static async calculateCarbonFootprint(monthlyKWh) {
        const apiKey = process.env.CARBON_API_KEY;

        // If no API key, use local calculation
        if (!apiKey) {
            return this.calculateLocalCarbonFootprint(monthlyKWh);
        }

        try {
            const response = await axios.post(
                `${this.API_BASE_URL}/estimates`,
                {
                    type: 'electricity',
                    electricity_unit: 'kwh',
                    electricity_value: monthlyKWh,
                    country: 'lk' // Sri Lanka ISO code
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            const data = response.data.data.attributes;

            return {
                source: 'carbon_interface_api',
                country: data.country,
                monthly: {
                    kWh: data.electricity_value,
                    co2Kg: parseFloat(data.carbon_kg.toFixed(2)),
                    co2Tonnes: parseFloat(data.carbon_mt.toFixed(4))
                },
                annual: {
                    kWh: parseFloat((monthlyKWh * 12).toFixed(2)),
                    co2Kg: parseFloat((data.carbon_kg * 12).toFixed(2)),
                    co2Tonnes: parseFloat((data.carbon_mt * 12).toFixed(4))
                },
                equivalents: {
                    treesNeededToOffset: Math.ceil((data.carbon_kg * 12) / 22),
                    kmDriving: Math.round((data.carbon_kg * 12) / 0.21),
                    litresOfPetrol: Math.round((data.carbon_kg * 12) / 2.31)
                },
                estimatedAt: data.estimated_at
            };
        } catch (error) {
            console.warn('Carbon API failed, using local calculation:', error.message);
            // Fallback to local calculation
            return this.calculateLocalCarbonFootprint(monthlyKWh);
        }
    }

    /**
     * Calculate carbon footprint for each appliance
     * @param {Array} appliances - Array of appliance objects
     * @returns {Array} Appliances with carbon data
     */
    static calculateApplianceCarbonFootprint(appliances) {
        return appliances.map(app => {
            const appObj = app.toObject ? app.toObject() : { ...app };
            const monthlyKWh = (appObj.wattage * appObj.dailyUsageHours * 30) / 1000;
            const monthlyCO2Kg = monthlyKWh * this.SL_EMISSION_FACTOR;

            return {
                _id: appObj._id,
                name: appObj.name,
                category: appObj.category,
                monthlyKWh: parseFloat(monthlyKWh.toFixed(2)),
                monthlyCO2Kg: parseFloat(monthlyCO2Kg.toFixed(2)),
                annualCO2Kg: parseFloat((monthlyCO2Kg * 12).toFixed(2)),
                treesNeeded: Math.ceil((monthlyCO2Kg * 12) / 22)
            };
        });
    }
}

module.exports = CarbonFootprintService;
