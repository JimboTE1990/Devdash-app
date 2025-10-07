# DevDash Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

This will install all required packages from package.json.

## 2. Firebase Setup

### Create Firebase Project

1. Visit https://console.firebase.google.com/
2. Click "Add project" or use existing project
3. Follow the setup wizard

### Enable Authentication

1. Go to **Authentication** > **Get started**
2. Enable **Email/Password** sign-in method

### Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose "Start in test mode"
3. Select your region

### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click web icon `</>` to add a web app
4. Copy the Firebase configuration

## 3. Configure Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace with your Firebase values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 5. Test the Application

1. **Landing Page**: http://localhost:3000
2. **Register**: Click "Start Free Trial" or go to /auth
3. **Create Account**: Fill in your details
4. **Dashboard**: Explore the Marketing and Product boards
5. **Drag & Drop**: Move tasks between columns
6. **Task Details**: Click any task to see full details
7. **Profile**: Update your profile at /profile
8. **Pricing**: View pricing at /pricing

## Project Features

### Pre-built Boards
- **Marketing Board**: Outbound, Organic, Affiliate/Partnership, Paid Ads
- **Product Build Board**: Build, Test, Validation/Feedback, Bug Fixes

### Task Management
- Drag and drop between columns
- Add due dates, priorities, descriptions
- Create subtasks and comments
- Block or reject tasks with reasons
- Collapsible swimlanes

### Authentication
- Email/password registration
- Login/logout
- Password reset
- 7-day free trial tracking

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Import repository on Vercel
3. Add environment variables
4. Deploy

## Troubleshooting

### Port 3000 already in use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Firebase errors

- Verify `.env.local` has correct values
- Check Firebase Console for enabled services
- Ensure Firestore rules allow test mode

### Build errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## File Structure

```
devdash-app/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── context/          # React context
│   └── lib/              # Utilities & config
├── .env.local           # Environment variables (create this)
├── .env.local.example   # Environment template
├── package.json         # Dependencies
└── README.md            # Full documentation
```

## Next Steps

1. Customize the color scheme in `src/app/globals.css`
2. Add more swimlanes in `src/lib/mock-data.ts`
3. Implement persistent storage with Firestore
4. Add Firebase security rules for production
5. Deploy to Vercel or your preferred platform

---

For detailed documentation, see README.md
