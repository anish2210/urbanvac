import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get total invoices count
    const totalInvoices = await Invoice.countDocuments();

    // Get invoices by status
    const invoicesByStatus = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get invoices by document type
    const invoicesByType = await Invoice.aggregate([
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total revenue
    const revenueStats = await Invoice.aggregate([
      {
        $match: {
          documentType: 'invoice',
          status: { $in: ['sent', 'paid'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0],
            },
          },
          pendingRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sent'] }, '$total', 0],
            },
          },
        },
      },
    ]);

    // Get recent invoices
    const recentInvoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          documentType: 'invoice',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get overdue invoices
    const overdueInvoices = await Invoice.countDocuments({
      status: 'overdue',
    });

    // Emails sent count
    const emailsSent = await Invoice.countDocuments({
      emailSent: true,
    });

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalUsers,
        overdueInvoices,
        emailsSent,
        invoicesByStatus: invoicesByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        invoicesByType: invoicesByType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
        },
        monthlyRevenue,
        recentInvoices,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Deactivate/Activate user
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get invoice analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Top customers by total spending
    const topCustomers = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$customer.email',
          customerName: { $first: '$customer.name' },
          totalSpent: { $sum: '$total' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    // Invoice trends by day
    const dailyTrends = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Average invoice value
    const avgInvoiceValue = await Invoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          average: { $avg: '$total' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        topCustomers,
        dailyTrends,
        averageInvoiceValue: avgInvoiceValue[0]?.average || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
