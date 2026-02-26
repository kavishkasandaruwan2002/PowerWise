const TariffPlan = require('./models/tariffPlan');

class TariffService {
  /**
   * Get all tariff plans
   */
  async getAllTariffs(isActive = true) {
    try {
      const query = {};
      if (isActive !== undefined) {
        query.isActive = isActive;
      }
      
      return await TariffPlan.find(query)
        .sort({ effectiveFrom: -1 })
        .select('-__v');
    } catch (error) {
      throw new Error(`Failed to get tariffs: ${error.message}`);
    }
  }

  /**
   * Get tariff by ID
   */
  async getTariffById(tariffId) {
    try {
      const tariff = await TariffPlan.findById(tariffId);
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      return tariff;
    } catch (error) {
      throw new Error(`Failed to get tariff: ${error.message}`);
    }
  }

  /**
   * Get currently active domestic tariff
   */
  async getActiveTariff() {
    try {
      const tariff = await TariffPlan.getActiveTariff();
      
      if (!tariff) {
        throw new Error('No active tariff found');
      }
      
      return tariff;
    } catch (error) {
      throw new Error(`Failed to get active tariff: ${error.message}`);
    }
  }

  /**
   * Create new tariff plan
   */
  async createTariff(tariffData, userId) {
    try {
      // Validate blocks
      if (!tariffData.blocks || tariffData.blocks.length === 0) {
        throw new Error('At least one tariff block is required');
      }
      
      // Sort blocks by minUsage
      tariffData.blocks.sort((a, b) => a.minUsage - b.minUsage);
      
      // Validate block sequence
      for (let i = 0; i < tariffData.blocks.length; i++) {
        const block = tariffData.blocks[i];
        
        if (i === 0 && block.minUsage !== 0) {
          throw new Error('First block must start at 0 kWh');
        }
        
        if (i > 0) {
          const prevBlock = tariffData.blocks[i - 1];
          if (block.minUsage !== prevBlock.maxUsage) {
            throw new Error('Blocks must be continuous with no gaps');
          }
        }
        
        if (block.minUsage >= block.maxUsage) {
          throw new Error('minUsage must be less than maxUsage');
        }
        
        if (block.ratePerUnit <= 0) {
          throw new Error('Rate per unit must be greater than 0');
        }
      }
      
      // Set metadata
      tariffData.createdBy = userId;
      tariffData.lastModifiedBy = userId;
      
      const tariff = new TariffPlan(tariffData);
      await tariff.save();
      
      return tariff;
    } catch (error) {
      throw new Error(`Failed to create tariff: ${error.message}`);
    }
  }

  /**
   * Update tariff plan
   */
  async updateTariff(tariffId, updateData, userId) {
    try {
      const tariff = await TariffPlan.findById(tariffId);
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      // Validate blocks if updating
      if (updateData.blocks && updateData.blocks.length > 0) {
        updateData.blocks.sort((a, b) => a.minUsage - b.minUsage);
        
        for (let i = 0; i < updateData.blocks.length; i++) {
          const block = updateData.blocks[i];
          
          if (i === 0 && block.minUsage !== 0) {
            throw new Error('First block must start at 0 kWh');
          }
          
          if (i > 0) {
            const prevBlock = updateData.blocks[i - 1];
            if (block.minUsage !== prevBlock.maxUsage) {
              throw new Error('Blocks must be continuous with no gaps');
            }
          }
        }
      }
      
      // Prevent changing immutable fields
      delete updateData.name;
      delete updateData.provider;
      delete updateData.createdBy;
      
      // Update fields
      Object.assign(tariff, updateData);
      tariff.lastModifiedBy = userId;
      tariff.version += 1;
      
      await tariff.save();
      
      return tariff;
    } catch (error) {
      throw new Error(`Failed to update tariff: ${error.message}`);
    }
  }

  /**
   * Deactivate tariff plan (soft delete)
   */
  async deactivateTariff(tariffId, userId) {
    try {
      const tariff = await TariffPlan.findByIdAndUpdate(
        tariffId,
        {
          isActive: false,
          effectiveTo: new Date(),
          lastModifiedBy: userId
        },
        { new: true }
      );
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      return tariff;
    } catch (error) {
      throw new Error(`Failed to deactivate tariff: ${error.message}`);
    }
  }

  /**
   * Calculate bill for given consumption
   */
  async calculateBill(tariffId, consumption) {
    try {
      // Validate consumption
      if (typeof consumption !== 'number' || consumption < 0) {
        throw new Error('Consumption must be a non-negative number');
      }

      const tariff = await TariffPlan.findById(tariffId);
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      if (!tariff.isCurrentlyActive()) {
        throw new Error('This tariff plan is not currently active');
      }
      
      return tariff.calculateBill(consumption);
    } catch (error) {
      throw new Error(`Failed to calculate bill: ${error.message}`);
    }
  }

  /**
   * Calculate bill using active tariff (most common use)
   */
  async calculateBillWithActiveTariff(consumption) {
    try {
      // Validate consumption
      if (typeof consumption !== 'number' || consumption < 0) {
        throw new Error('Consumption must be a non-negative number');
      }

      const tariff = await this.getActiveTariff();
      return tariff.calculateBill(consumption);
    } catch (error) {
      throw new Error(`Failed to calculate bill: ${error.message}`);
    }
  }

  /**
   * Compare bills across different consumption levels
   */
  async compareConsumptionScenarios(tariffId, consumptionLevels = []) {
    try {
      if (!Array.isArray(consumptionLevels) || consumptionLevels.length === 0) {
        throw new Error('consumptionLevels must be a non-empty array');
      }

      const tariff = await TariffPlan.findById(tariffId);
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      const scenarios = consumptionLevels.map(consumption => ({
        consumption,
        bill: tariff.calculateBill(consumption)
      }));
      
      return scenarios;
    } catch (error) {
      throw new Error(`Failed to compare scenarios: ${error.message}`);
    }
  }

  /**
   * Search tariffs by name
   */
  async searchTariffs(searchTerm) {
    try {
      const query = {
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      
      return await TariffPlan.find(query).sort({ name: 1 });
    } catch (error) {
      throw new Error(`Failed to search tariffs: ${error.message}`);
    }
  }

  /**
   * Export tariff as JSON
   */
  async exportTariff(tariffId) {
    try {
      const tariff = await TariffPlan.findById(tariffId);
      
      if (!tariff) {
        throw new Error('Tariff plan not found');
      }
      
      return tariff.toObject();
    } catch (error) {
      throw new Error(`Failed to export tariff: ${error.message}`);
    }
  }

  /**
   * Get tariff history/versions
   */
  async getTariffHistory(tariffName) {
    try {
      return await TariffPlan.find({ name: tariffName })
        .sort({ version: -1 });
    } catch (error) {
      throw new Error(`Failed to get tariff history: ${error.message}`);
    }
  }
}

module.exports = new TariffService();