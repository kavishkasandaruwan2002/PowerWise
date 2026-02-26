const express = require('express');
const {
    createHousehold, getMyHousehold, updateHousehold,
    addMember, removeMember,
    setBudget, getBudgets, deleteBudget,
    transferOwnership, deleteHousehold, updateBudgetById
} = require('../controllers/householdController');
const { protect, householdAccess } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// HOUSEHOLD CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/households:
 *   post:
 *     tags: [🏠 Household]
 *     summary: Create a new household
 *     description: |
 *       Create a household. The logged-in user becomes the **owner** and first **member** automatically.
 *       One user can only own one household.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHouseholdRequest'
 *           examples:
 *             ColomboApartment:
 *               summary: Colombo apartment
 *               value:
 *                 name: Perera Family
 *                 householdSize: 4
 *                 householdType: apartment
 *                 tariffType: domestic
 *                 incomeBracket: middle
 *                 location:
 *                   city: Colombo
 *                   district: Colombo
 *                   province: Western
 *                   latitude: 6.9271
 *                   longitude: 79.8612
 *             KandyRural:
 *               summary: Kandy rural home
 *               value:
 *                 name: Silva Rural Home
 *                 householdSize: 6
 *                 householdType: rural_home
 *                 tariffType: domestic
 *                 incomeBracket: low
 *                 location:
 *                   city: Kandy
 *                   district: Kandy
 *                   province: Central
 *                   latitude: 7.2906
 *                   longitude: 80.6337
 *             BoardingHouse:
 *               summary: Boarding house
 *               value:
 *                 name: Green Lane Boarding
 *                 householdSize: 8
 *                 householdType: boarding_house
 *                 tariffType: small_business
 *                 incomeBracket: middle
 *     responses:
 *       201:
 *         description: Household created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 household:
 *                   $ref: '#/components/schemas/HouseholdResponse'
 *       409:
 *         description: User already owns a household
 */
router.post('/', createHousehold);

/**
 * @swagger
 * /api/households/my:
 *   get:
 *     tags: [🏠 Household]
 *     summary: Get my household profile
 *     description: Returns the household the logged-in user owns or belongs to, with all members and current budget.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Household profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 household:
 *                   $ref: '#/components/schemas/HouseholdResponse'
 *       404:
 *         description: No household found for this user
 */
router.get('/my', getMyHousehold);

/**
 * @swagger
 * /api/households/{id}:
 *   put:
 *     tags: [🏠 Household]
 *     summary: Update household profile
 *     description: Update household details. Only the **owner** or **admin** can update.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHouseholdRequest'
 *           example:
 *             householdSize: 5
 *             tariffType: small_business
 *             location:
 *               city: Galle
 *               district: Galle
 *               province: Southern
 *     responses:
 *       200:
 *         description: Household updated successfully
 *       403:
 *         description: Only the owner can update
 *       404:
 *         description: Household not found
 */
router.put('/:id', householdAccess, updateHousehold);

/**
 * @swagger
 * /api/households/{id}:
 *   delete:
 *     tags: [🏠 Household]
 *     summary: Delete a household
 *     description: |
 *       Deletes the household and removes the household reference from all members.
 *       Only the **owner** or an **admin** can delete.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     responses:
 *       200:
 *         description: Household deleted
 *       403:
 *         description: Only owner or admin can delete
 */
router.delete('/:id', householdAccess, deleteHousehold);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/households/{id}/members:
 *   post:
 *     tags: [👥 Members]
 *     summary: Add a member to household
 *     description: |
 *       Add another registered user to the household by their **email address**.
 *       Only the household **owner** can add members.
 *       The added user must not already belong to another household.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMemberRequest'
 *           example:
 *             email: nimal@gmail.com
 *     responses:
 *       200:
 *         description: Member added successfully
 *       403:
 *         description: Only the owner can add members
 *       404:
 *         description: User with that email not found
 *       409:
 *         description: User already belongs to a household
 */
router.post('/:id/members', householdAccess, addMember);

/**
 * @swagger
 * /api/households/{id}/members/{memberId}:
 *   delete:
 *     tags: [👥 Members]
 *     summary: Remove a member from household
 *     description: |
 *       Remove a member from the household.
 *       Only the **owner** can remove members.
 *       The **owner themselves cannot be removed**.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove the household owner
 *       403:
 *         description: Only the owner can remove members
 */
router.delete('/:id/members/:memberId', householdAccess, removeMember);

// ─────────────────────────────────────────────────────────────────────────────
// OWNERSHIP TRANSFER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/households/{id}/transfer-owner:
 *   put:
 *     tags: [🏠 Household]
 *     summary: Transfer household ownership to another member
 *     description: Only the current owner can transfer ownership. New owner must be an existing member.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d4
 *     responses:
 *       200:
 *         description: Ownership transferred
 *       400:
 *         description: New owner must be a member
 *       403:
 *         description: Only owner can transfer
 */
router.put('/:id/transfer-owner', householdAccess, transferOwnership);

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/households/{id}/budgets:
 *   post:
 *     tags: [💰 Budget]
 *     summary: Set or update monthly electricity budget
 *     description: |
 *       Set a target budget (in **LKR**) for a specific month and year.
 *       If a budget for that month already exists it will be **updated** (upsert logic).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BudgetRequest'
 *           examples:
 *             November:
 *               summary: November 2024
 *               value:
 *                 month: 11
 *                 year: 2024
 *                 targetAmount: 3500
 *                 notes: Reduce AC usage this month
 *             December:
 *               summary: December 2024 (holiday)
 *               value:
 *                 month: 12
 *                 year: 2024
 *                 targetAmount: 4500
 *                 notes: Holiday season — higher usage expected
 *     responses:
 *       200:
 *         description: Budget set or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Budget set.
 *                 budget:
 *                   $ref: '#/components/schemas/BudgetResponse'
 *       400:
 *         description: Missing required fields
 */
router.post('/:id/budgets', householdAccess, setBudget);

/**
 * @swagger
 * /api/households/{id}/budgets:
 *   get:
 *     tags: [💰 Budget]
 *     summary: Get full budget history
 *     description: Returns all monthly budgets sorted by most recent first, plus the current month's budget separately.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     responses:
 *       200:
 *         description: Budget history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 6
 *                 currentBudget:
 *                   $ref: '#/components/schemas/BudgetResponse'
 *                 budgets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BudgetResponse'
 */
router.get('/:id/budgets', householdAccess, getBudgets);

/**
 * @swagger
 * /api/households/{id}/budgets/{budgetId}:
 *   put:
 *     tags: [💰 Budget]
 *     summary: Update a specific budget entry by ID
 *     description: Update targetAmount and/or notes for an existing budget entry.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget entry ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetAmount:
 *                 type: number
 *                 example: 4000
 *               notes:
 *                 type: string
 *                 example: Updated note
 *     responses:
 *       200:
 *         description: Budget entry updated
 *       404:
 *         description: Budget entry not found
 */
router.put('/:id/budgets/:budgetId', householdAccess, updateBudgetById);

/**
 * @swagger
 * /api/households/{id}/budgets/{budgetId}:
 *   delete:
 *     tags: [💰 Budget]
 *     summary: Delete a budget entry
 *     description: Remove a single budget entry from the household's budget history.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget entry ID
 *     responses:
 *       200:
 *         description: Budget entry deleted
 *       404:
 *         description: Budget entry not found
 */
router.delete('/:id/budgets/:budgetId', householdAccess, deleteBudget);

module.exports = router;