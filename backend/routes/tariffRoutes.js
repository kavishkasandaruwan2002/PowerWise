const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');

const { protect: authMiddleware } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.get('/',
  authMiddleware,
  tariffController.getAllTariffs
);

router.get('/active',
  authMiddleware,
  tariffController.getActiveTariff
);

router.get('/:id',
  authMiddleware,
  tariffController.getTariffById
);

router.post('/calculate-bill',
  authMiddleware,
  tariffController.calculateBillActive
);

router.post('/compare',
  authMiddleware,
  tariffController.compareScenarios
);

router.get('/search/:searchTerm',
  authMiddleware,
  tariffController.searchTariffs
);

//admin onl protected
router.post('/',
  authMiddleware,
  adminOnly,
  tariffController.createTariff
);

router.put('/:id',
  authMiddleware,
  adminOnly,
  tariffController.updateTariff
);

router.delete('/:id',
  authMiddleware,
  adminOnly,
  tariffController.deleteTariff
);

router.post('/:id/calculate-bill',
  authMiddleware,
  tariffController.calculateBill
);

router.get('/:id/history',
  authMiddleware,
  tariffController.getTariffHistory
);

router.get('/:id/export',
  authMiddleware,
  adminOnly,
  tariffController.exportTariff
);

module.exports = router;