const alertService = require('../services/alertService');

class AlertController {
  
  async getAllAlerts(req, res) {
    try {
      const { type, severity, isRead } = req.query;
      const limit = Math.min(parseInt(req.query.limit) || 50, 500);
      const skip = parseInt(req.query.skip) || 0;

      const filters = {};
      if (type) filters.type = type;
      if (severity) filters.severity = severity;
      if (isRead !== undefined) filters.isRead = isRead === 'true';

      const result = await alertService.getAlertsByUser(req.user._id, limit, skip, filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getHouseholdAlerts(req, res) {
    try {
      const { householdId } = req.params;
      const limit = Math.min(parseInt(req.query.limit) || 50, 500);
      const skip = parseInt(req.query.skip) || 0;

      const result = await alertService.getAlertsByHousehold(householdId, limit, skip);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUnreadAlerts(req, res) {
    try {
      const alerts = await alertService.getUnreadAlerts(req.user._id);

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCriticalAlerts(req, res) {
    try {
      const alerts = await alertService.getCriticalAlerts(req.user._id);

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await alertService.countUnreadAlerts(req.user._id);

      res.status(200).json({
        success: true,
        unreadCount: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAlertById(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.getAlertById(id);

      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Alert marked as read',
        data: alert
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const result = await alertService.markAllAsRead(req.user._id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async dismissAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.dismissAlert(id);

      res.status(200).json({
        success: true,
        message: 'Alert dismissed',
        data: alert
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async resolveAlert(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const alert = await alertService.resolveAlert(id, notes);

      res.status(200).json({
        success: true,
        message: 'Alert marked as resolved',
        data: alert
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertService.deleteAlert(id);

      res.status(200).json({
        success: true,
        message: 'Alert deleted',
        data: alert
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAlertsByType(req, res) {
    try {
      const { type } = req.params;
      const alerts = await alertService.getAlertsByType(req.user._id, type);

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length,
        type
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAlertsInRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const alerts = await alertService.getAlertsInRange(
        req.user._id,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AlertController();