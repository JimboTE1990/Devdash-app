# DevDash - Project Planner for Indie Developers

The ultimate project planner for indie developers and business owners. Streamline your workflow from build, launch, and marketing with powerful Kanban boards and swimlane organization.

## Features

- **Pre-built Boards**: Marketing and Product Build boards with predefined swimlanes
- **Swimlane Organization**: Horizontal swimlanes for workflow stages
- **Drag & Drop**: Intuitive task management with drag-and-drop interface
- **Rich Task Details**: Comments, subtasks, due dates, priorities, blocking, and rejection
- **Custom Workflows**: Create unlimited custom boards
- **Firebase Authentication**: Secure email/password authentication
- **7-Day Free Trial**: Full access to all features
- **Premium Plan**: £9.99/month after trial

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier works fine)

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

#### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method

#### Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (you can add security rules later)
4. Select your preferred region

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname (e.g., "DevDash Web")
5. Copy the Firebase configuration object

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration from step 2.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
devdash-app/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── forgot-password/      # Password reset
│   │   │   └── page.tsx             # Login/Register
│   │   ├── dashboard/               # Main dashboard
│   │   ├── how-it-works/            # How it works page
│   │   ├── pricing/                 # Pricing page
│   │   ├── profile/                 # User profile settings
│   │   ├── layout.tsx               # Root layout with Header/Footer
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── auth/                    # Auth components
│   │   │   └── AuthForm.tsx         # Login/Register form
│   │   ├── board/                   # Board components
│   │   │   ├── Board.tsx            # Main board container
│   │   │   ├── Column.tsx           # Column header
│   │   │   ├── Swimlane.tsx         # Swimlane row
│   │   │   ├── TaskCard.tsx         # Task card
│   │   │   └── TaskDetailsDialog.tsx # Task details modal
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   └── Footer.tsx           # Footer
│   │   └── ui/                      # Reusable UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── context/
│   │   └── AuthContext.tsx          # Firebase auth context
│   └── lib/
│       ├── firebase.ts              # Firebase initialization
│       ├── mock-data.ts             # Default board templates
│       ├── types.ts                 # TypeScript interfaces
│       └── utils.ts                 # Utility functions
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Board Types

### Marketing Board

Organize your marketing efforts with these swimlanes:

- **Outbound**: Cold email campaigns, direct outreach
- **Organic**: Build-in-public on X, Reddit AMAs, content marketing
- **Affiliate/Partnership**: Creator partnerships, affiliate programs
- **Paid Ads**: Google Ads, social media advertising

### Product Build Board

Manage your development lifecycle:

- **Build**: Feature development and implementation
- **Test**: Quality assurance and testing
- **Validation/Feedback**: User feedback sessions and validation
- **Bug Fixes/New Features**: Bug tracking and feature requests

### Custom Boards

Create unlimited custom boards with your own columns and swimlanes to match your unique workflow.

## Task Management Features

- **Drag & Drop**: Move tasks between columns
- **Due Dates**: Set deadlines with calendar picker
- **Priorities**: High, medium, low priority levels
- **Subtasks**: Break down work into smaller tasks
- **Comments**: Collaborate with timestamped comments
- **Blocking**: Mark tasks as blocked with reasons
- **Rejection**: Reject tasks with explanations
- **Collapsible Swimlanes**: Focus on what matters

## Git Setup

Initialize your repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DevDash project setup"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/devdash-app.git

# Push to remote
git push -u origin main
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy

### Other Platforms

This is a standard Next.js app and can be deployed to:

- Netlify
- AWS Amplify
- Google Cloud Run
- Any Node.js hosting platform

Make sure to set the environment variables in your deployment platform.

## Firebase Security Rules

Once you're ready for production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write boards they own
    match /boards/{boardId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Customization

### Color Scheme

The app uses a dark teal theme defined in `src/app/globals.css`:

- Background: `#1a3a3a`
- Cards: `#3a5a5a`
- Borders: `#4a6a6a`
- Accent: `#7dd87d` (bright green)

Modify the CSS variables to customize the theme.

### Adding New Swimlanes

Edit `src/lib/mock-data.ts` to add new default swimlanes to the pre-built boards.

## Troubleshooting

### Firebase Connection Issues

- Verify environment variables are set correctly
- Check Firebase project is active
- Ensure Firestore database is created
- Verify authentication is enabled

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Check the documentation
- Review Firebase Console for auth/database issues
- Ensure all environment variables are set correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for indie developers
