# Urban Vac Invoice Management System

A modern, full-stack MERN application for creating, managing, and tracking invoices, quotations, and cash receipts. Built with enhanced features including email delivery, PDF generation, and an admin dashboard.

## Features

### Core Features
- **Multi-Document Support**: Create invoices, quotations, and cash receipts
- **Real-time Calculations**: Automatic calculation of subtotals, GST (10%), and totals
- **PDF Generation**: Professional PDF documents using Puppeteer
- **Email Integration**: Send invoices directly to customers via email
- **Admin Dashboard**: Comprehensive analytics and invoice tracking
- **User Authentication**: Secure JWT-based authentication
- **Role-Based Access**: Admin and user roles with different permissions

### Enhanced Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Instant calculation updates as you type
- **Search & Filter**: Advanced filtering by status, type, and customer
- **Invoice Tracking**: Track all invoices with detailed status information
- **Revenue Analytics**: Dashboard with revenue breakdown and trends
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Puppeteer** - PDF generation
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - HTTP logging

### Frontend
- **React** 19.2.0 - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** 4.1.17 - Styling
- **Lucide React** - Icons
- **React Toastify** - Notifications
- **Date-fns** - Date formatting
- **Vite** - Build tool

## Project Structure

```
urbanvac/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context (Auth)
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API service
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middlewares/         # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── util/                # Utilities (email, PDF)
│   ├── invoices/            # Generated PDFs
│   ├── app.js               # Express app
│   ├── .env                 # Environment variables
│   └── package.json
│
└── to-do/                    # Legacy PHP system (reference)
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Urban Vac <noreply@urbanvac.com>
CLIENT_URL=http://localhost:5173
INVOICE_START_NUMBER=3000
```

4. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Creating an Account

1. Navigate to `http://localhost:5173`
2. Click "Sign Up"
3. Fill in your details (name, email, password)
4. You'll be automatically logged in

### Creating an Invoice

1. Click "New Invoice" in the navigation
2. Select document type (Invoice, Quotation, or Cash Receipt)
3. Fill in customer details
4. Add line items (description, quantity, price)
5. Totals are calculated automatically
6. Click "Create Invoice" to generate PDF

### Sending an Invoice

1. Go to Dashboard
2. Find the invoice you want to send
3. Click the "Send" icon (paper plane)
4. The invoice PDF will be emailed to the customer

### Admin Panel

1. Ensure your account has admin role
2. Click "Admin" in the navigation
3. View dashboard statistics:
   - Total invoices and revenue
   - Invoice status breakdown
   - Recent invoices
   - Monthly revenue trends

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Invoices
- `GET /api/invoices/next-number` - Get next invoice number
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices (with filters)
- `GET /api/invoices/:id` - Get single invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (admin only)
- `POST /api/invoices/:id/send` - Send invoice via email
- `GET /api/invoices/:id/download` - Download invoice PDF
- `PATCH /api/invoices/:id/status` - Update invoice status

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PATCH /api/admin/users/:id/status` - Toggle user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics data

## Email Configuration

### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASSWORD` environment variable

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- SQL injection protection (Mongoose)
- XSS protection

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isActive: Boolean,
  timestamps
}
```

### Invoice Model
```javascript
{
  invoiceNumber: Number (unique),
  documentType: String (invoice/quotation/cash_receipt),
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  issueDate: Date,
  dueDate: Date,
  subtotal: Number,
  gst: Number,
  total: Number,
  status: String (draft/sent/paid/overdue/cancelled),
  pdfPath: String,
  emailSent: Boolean,
  emailSentAt: Date,
  createdBy: ObjectId (User),
  notes: String,
  timestamps
}
```

## Development

### Running in Development Mode

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

### Building for Production

Frontend:
```bash
cd client
npm run build
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running (local) or connection string is correct (Atlas)
   - Check network access settings in MongoDB Atlas
   - Ensure IP address is whitelisted

2. **Email Not Sending**
   - Verify email credentials are correct
   - Check Gmail app password is set up properly
   - Ensure "Less secure app access" is enabled (if not using app password)

3. **PDF Generation Fails**
   - Ensure Puppeteer dependencies are installed
   - On Linux, install required packages: `sudo apt-get install -y libgbm-dev`

4. **Frontend Can't Connect to Backend**
   - Verify backend is running on port 5000
   - Check VITE_API_URL in client/.env
   - Ensure CORS is configured correctly

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Authors

- Anish & Archisman

## Acknowledgments

- Urban Vac Roof & Gutter Pty Ltd for the business requirements
- The open-source community for the amazing tools and libraries
