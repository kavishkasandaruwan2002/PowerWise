const Alert = require('../models/alertSchema');

class AlertService {
  
    //new alert C
  async createAlert(alertData) {
    try {
      if (!alertData.householdId || !alertData.userId || !alertData.type) {
        throw new Error('Household ID, User ID, and alert type are required');
      }

      // Check for duplicate alert within the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const existingAlert = await Alert.findOne({
        householdId: alertData.householdId,
        userId: alertData.userId,
        type: alertData.type,
        severity: alertData.severity || 'warning',
        createdAt: { $gte: oneHourAgo },
        isDismissed: false
      });

      if (existingAlert) {
        console.log('Alert deduplication: skipping duplicate alert', existingAlert._id);
        return existingAlert;
      }

      // Auto-set title and message if not provided
      if (!alertData.title) {
        alertData.title = this.getAlertTitle(alertData.type);
      }

      if (!alertData.message && alertData.relatedData) {
        alertData.message = this.getAlertMessage(alertData.type, alertData.relatedData);
      }

      // Set default severity if not provided
      if (!alertData.severity) {
        alertData.severity = this.getSeverity(alertData.type);
      }

      const alert = new Alert(alertData);
      await alert.save();

      return alert;
    } catch (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  //get all
  async getAlertsByUser(userId, limit = 50, skip = 0, filters = {}) {
    try {
      const query = { userId, isDismissed: false };

      if (filters.type) query.type = filters.type;
      if (filters.severity) query.severity = filters.severity;
      if (filters.isRead !== undefined) query.isRead = filters.isRead;

      const alerts = await Alert.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Alert.countDocuments(query);

      return {
        data: alerts,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }
  }

  //house id get by
  async getAlertsByHousehold(householdId, limit = 50, skip = 0) {
    try {
      const alerts = await Alert.find({
        householdId,
        isDismissed: false
      })
        .sort({ severity: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Alert.countDocuments({
        householdId,
        isDismissed: false
      });

      return {
        data: alerts,
        pagination: { total, limit, skip, pages: Math.ceil(total / limit) }
      };
    } catch (error) {
      throw new Error(`Failed to get household alerts: ${error.message}`);
    }
  }

  //unread
  async getUnreadAlerts(userId) {
    try {
      return await Alert.getUnreadAlerts(userId);
    } catch (error) {
      throw new Error(`Failed to get unread alerts: ${error.message}`);
    }
  }

  //critical
  async getCriticalAlerts(userId) {
    try {
      return await Alert.getCriticalAlerts(userId);
    } catch (error) {
      throw new Error(`Failed to get critical alerts: ${error.message}`);
    }
  }


  async countUnreadAlerts(userId) {
    try {
      return await Alert.countUnread(userId);
    } catch (error) {
      throw new Error(`Failed to count unread alerts: ${error.message}`);
    }
  }


  async markAsRead(alertId) {
    try {
      const alert = await Alert.findById(alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      return await alert.markAsRead();
    } catch (error) {
      throw new Error(`Failed to mark alert as read: ${error.message}`);
    }
  }


  async markAllAsRead(userId) {
    try {
      const result = await Alert.updateMany(
        {
          userId,
          isRead: false,
          isDismissed: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      return {
        modified: result.modifiedCount,
        message: `${result.modifiedCount} alerts marked as read`
      };
    } catch (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

 
  async dismissAlert(alertId) {
    try {
      const alert = await Alert.findById(alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      return await alert.dismiss();
    } catch (error) {
      throw new Error(`Failed to dismiss alert: ${error.message}`);
    }
  }

  
  async resolveAlert(alertId, notes = '') {
    try {
      const alert = await Alert.findById(alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      return await alert.markAsResolved(notes);
    } catch (error) {
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }


  async getAlertById(alertId) {
    try {
      const alert = await Alert.findById(alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      return alert;
    } catch (error) {
      throw new Error(`Failed to get alert: ${error.message}`);
    }
  }

  async deleteAlert(alertId) {
    try {
      const alert = await Alert.findById(alertId);

      if (!alert) {
        throw new Error('Alert not found');
      }

      return await alert.dismiss();
    } catch (error) {
      throw new Error(`Failed to delete alert: ${error.message}`);
    }
  }

  async getAlertsByType(userId, type) {
    try {
      return await Alert.getByType(userId, type);
    } catch (error) {
      throw new Error(`Failed to get alerts by type: ${error.message}`);
    }
  }

  async getAlertsInRange(userId, startDate, endDate) {
    try {
      return await Alert.getAlertsInRange(userId, new Date(startDate), new Date(endDate));
    } catch (error) {
      throw new Error(`Failed to get alerts in range: ${error.message}`);
    }
  }

  async createBudgetAlert(householdId, userId, budgetData) {
    try {
      let severity = 'warning';
      let title = 'Budget Alert';
      let message = '';

      const percentage = (budgetData.currentBill / budgetData.monthlyBudget) * 100;

      if (percentage > 100) {
        severity = 'critical';
        title = '🚨 Budget EXCEEDED';
        message = `Your spending (Rs. ${budgetData.currentBill}) has exceeded your budget of Rs. ${budgetData.monthlyBudget}. Please reduce consumption.`;
      } else if (percentage > 90) {
        severity = 'critical';
        title = '⚠️ Critical: Budget Nearly Exceeded';
        message = `You are at ${percentage.toFixed(1)}% of your budget. Careful! You have only Rs. ${(budgetData.monthlyBudget - budgetData.currentBill).toFixed(2)} remaining.`;
      } else if (percentage > 80) {
        severity = 'warning';
        title = '⚠️ Budget Threshold Reached';
        message = `You have used Rs. ${budgetData.currentBill} of your Rs. ${budgetData.monthlyBudget} budget (${percentage.toFixed(1)}%).`;
      }

      return await this.createAlert({
        householdId,
        userId,
        type: percentage > 100 ? 'budget_exceeded' : 'budget_threshold',
        title,
        message,
        severity,
        sourceModule: 'budget',
        relatedData: budgetData
      });
    } catch (error) {
      throw new Error(`Failed to create budget alert: ${error.message}`);
    }
  }

  async createSpikeAlert(householdId, userId, spikeData) {
    try {
      const severity = spikeData.percentageChange > 50 ? 'critical' : 'warning';

      return await this.createAlert({
        householdId,
        userId,
        type: 'usage_spike',
        title: '⚡ Unusual Consumption Spike Detected',
        message: `Your consumption is ${spikeData.percentageChange.toFixed(1)}% higher than normal (${spikeData.consumption} kWh vs ${(spikeData.dailyAverage ?? spikeData.averageDaily ?? 0).toFixed(2)} kWh average).`,
        severity,
        sourceModule: 'spike_detection',
        relatedData: spikeData
      });
    } catch (error) {
      throw new Error(`Failed to create spike alert: ${error.message}`);
    }
  }

  async createPredictionAlert(householdId, userId, predictionData) {
    try {
      const willExceed = predictionData.predictedBill > predictionData.monthlyBudget;
      const severity = willExceed ? 'critical' : 'warning';

      return await this.createAlert({
        householdId,
        userId,
        type: 'bill_prediction',
        title: willExceed ? '🚨 Bill Will Exceed Budget' : '📊 Bill Prediction Alert',
        message: willExceed
          ? `Your projected month-end bill is Rs. ${predictionData.predictedBill}, which exceeds your budget of Rs. ${predictionData.monthlyBudget}.`
          : `Your projected month-end bill is Rs. ${predictionData.predictedBill}, which is ${((predictionData.predictedBill / predictionData.monthlyBudget) * 100).toFixed(1)}% of your budget.`,
        severity,
        sourceModule: 'prediction',
        relatedData: predictionData
      });
    } catch (error) {
      throw new Error(`Failed to create prediction alert: ${error.message}`);
    }
  }

  getAlertTitle(type) {
    const titles = {
      budget_threshold: '📊 Budget Threshold Alert',
      budget_exceeded: '🚨 Budget Exceeded',
      usage_spike: '⚡ Unusual Spike Detected',
      bill_prediction: '📈 Bill Prediction',
      anomaly: '⚠️ Anomaly Detected',
      tariff_change: '💡 Tariff Change'
    };
    return titles[type] || 'Alert';
  }

  getAlertMessage(type, data) {
    const messages = {
      budget_threshold: 'You have reached your budget threshold',
      budget_exceeded: 'Your spending has exceeded your budget',
      usage_spike: 'Unusual consumption spike detected',
      bill_prediction: 'Your projected bill prediction',
      anomaly: 'Anomalous usage pattern detected',
      tariff_change: 'Tariff rates have been updated'
    };
    return messages[type] || 'New alert';
  }

  getSeverity(type) {
    const severities = {
      budget_exceeded: 'critical',
      usage_spike: 'warning',
      bill_prediction: 'warning',
      budget_threshold: 'warning',
      anomaly: 'warning',
      tariff_change: 'info'
    };
    return severities[type] || 'warning';
  }

  async cleanupOldAlerts(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await Alert.deleteMany({
        isDismissed: true,
        dismissedAt: { $lt: cutoffDate }
      });

      return {
        deleted: result.deletedCount,
        message: `Deleted ${result.deletedCount} old dismissed alerts`
      };
    } catch (error) {
      throw new Error(`Failed to cleanup alerts: ${error.message}`);
    }
  }
}

module.exports = new AlertService();