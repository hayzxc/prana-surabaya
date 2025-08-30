# PT Prana Argentum - Certification Portal

A comprehensive web application for managing fumigation certificates and services for PT Prana Argentum.

## Features

- **User Authentication**: Secure login system with role-based access
- **Certificate Management**: Create, view, and manage fumigation certificates
- **Admin Dashboard**: Administrative interface for managing users and certificates
- **User Dashboard**: User-friendly interface for viewing personal certificates
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **File Upload**: Support for certificate document uploads
- **Real-time Updates**: Live certificate status updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Custom authentication system
- **Database**: PostgreSQL (production), Mock data (development)
- **File Storage**: Local file system (development), Cloud storage (production)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd certification-portal
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

**Admin Account:**
- Email: admin@prana.com
- Password: admin123

**User Account:**
- Email: user@prana.com
- Password: user123

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # User dashboard pages
│   ├── login/             # Authentication pages
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions and configurations
├── public/               # Static assets
└── scripts/              # Database scripts
\`\`\`

## Key Components

- **Authentication**: Role-based access control with admin and user roles
- **Certificate Management**: CRUD operations for fumigation certificates
- **File Upload**: Secure file upload and storage system
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/certificates` - Get certificates
- `POST /api/certificates` - Create certificate
- `GET /api/user/certificates` - Get user certificates
- `POST /api/upload` - File upload

## Deployment

The application is configured for deployment on Vercel with the following features:

- Automatic deployments from Git
- Environment variable management
- Static file optimization
- API route handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software for PT Prana Argentum.
