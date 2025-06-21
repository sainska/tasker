# Tasker - Assignment Management Platform

A comprehensive React + Supabase application for managing academic assignments between clients and writers.

## Features

### 🔐 Authentication & User Management
- **Multi-role authentication** (Client, Writer, Admin)
- **Secure signup/signin** with email verification
- **Password reset** functionality
- **Profile management** with role-based access

### 📝 Assignment Management
- **Create assignments** with detailed specifications
- **File upload/download** for submissions
- **Real-time status tracking** (Pending, In Progress, Submitted, Completed)
- **Priority levels** (Low, Standard, High, Urgent)
- **Deadline management** with notifications

### 👥 Role-Based Dashboards

#### Client Dashboard
- Create new assignments
- Track assignment progress
- Download completed work
- Message writers
- View assignment history

#### Writer Dashboard
- Browse available assignments
- Submit completed work
- Track earnings
- Search and filter assignments
- Message clients

#### Admin Dashboard
- Monitor all assignments
- Manage users
- View system statistics
- Revenue tracking
- User role management

### 💬 Communication
- **Real-time messaging** between clients and writers
- **Assignment-specific conversations**
- **Notification system**

### 📊 Analytics & Reporting
- **User statistics** (assignments, earnings, ratings)
- **Admin analytics** (revenue, user growth, assignment metrics)
- **Performance tracking**

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tasker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

#### Option A: Use the Complete Setup Script

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the `setup-complete-database.sql` script
4. Verify setup with `verify-database-setup.sql`

#### Option B: Manual Setup

1. **Enable Extensions**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **Create Tables** (see `setup-complete-database.sql` for full schema)

3. **Set up Row Level Security (RLS)** policies

4. **Create Storage Bucket**:
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('assignment-files', 'assignment-files', true);
   ```

### 5. Supabase Configuration

#### Authentication Settings
1. Go to Authentication > Settings
2. Configure your site URL
3. Set up email templates (optional)

#### Storage Settings
1. Go to Storage > Policies
2. Ensure the `assignment-files` bucket has proper policies

#### RLS Policies
Ensure all tables have proper Row Level Security policies enabled.

### 6. Run the Application

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Core Tables

#### `profiles`
- User profiles with role-based access
- Supports client, writer, and admin roles

#### `assignments`
- Assignment details and status tracking
- Links clients and writers
- Includes budget, deadline, and priority

#### `assignment_submissions`
- File submissions from writers
- Supports both file uploads and text content

#### `messages`
- Real-time communication between users
- Assignment-specific conversations

#### `ratings`
- User feedback and rating system
- Supports comments and star ratings

#### `notifications`
- System notifications and alerts
- Supports different notification types

## API Services

### Authentication Service
- User registration and login
- Password reset
- Profile management

### Assignment Service
- CRUD operations for assignments
- Status management
- Search and filtering

### Submission Service
- File upload/download
- Submission management
- Storage integration

### User Service
- User statistics
- Admin functions
- Role management

### Message Service
- Real-time messaging
- Conversation management

## File Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── ClientDashboard.tsx
│   ├── WriterDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── services/           # API services
│   ├── assignmentService.ts
│   ├── userService.ts
│   └── ...
├── integrations/       # External integrations
│   └── supabase/
├── pages/              # Page components
├── types/              # TypeScript types
└── lib/                # Utility functions
```

## Usage Guide

### For Clients

1. **Register/Login** with client role
2. **Create assignments** with detailed requirements
3. **Track progress** through the dashboard
4. **Download completed work** when ready
5. **Rate and review** writers

### For Writers

1. **Register/Login** with writer role
2. **Browse available assignments**
3. **Accept assignments** that match your expertise
4. **Submit completed work** with files
5. **Track earnings** and ratings

### For Admins

1. **Monitor all activity** through admin dashboard
2. **Manage users** and their roles
3. **View system statistics** and revenue
4. **Resolve disputes** and issues

## Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control**
- **Secure file uploads** with validation
- **Input sanitization** and validation
- **Protected API endpoints**

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports React applications:
- Netlify
- AWS Amplify
- Firebase Hosting
- Traditional hosting

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check if database is properly set up

2. **Authentication Issues**
   - Ensure RLS policies are correct
   - Check Supabase Auth settings

3. **File Upload Problems**
   - Verify storage bucket exists
   - Check storage policies

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript compilation

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the Supabase documentation

## Roadmap

- [ ] Real-time notifications
- [ ] Payment integration
- [ ] Advanced search filters
- [ ] Mobile app
- [ ] API documentation
- [ ] Automated testing
- [ ] Performance optimization
