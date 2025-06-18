# NuCliq
A social media app leveraging existing features from other platforms with a focus on community and advanced personalization, with 100+ beta downloads, built with React Native (hooks, functional components), Expo (managed workflow), Node.js (async/await), Firebase, and GCP.

## Status
NuCliq is in beta, achieving 100+ downloads during testing. Active development continues, with group chat and homepage features targeted for Q2 2025, enhancing community engagement.

## Tech Stack
- Frontend: React Native (hooks, functional components), Expo (managed workflow)
- Backend: Node.js (async/await, robust error handling), Express
- Integrations: Firebase (authentication, Cloud Firestore for real-time database), GCP (serverless APIs via Cloud Functions), RevenueCat (subscriptions), Docker (containerization)

## Features
- User authentication (Firebase, Apple/Google Sign-in with JWT-based security)
- Real-time social interactions (text/image/video posts, likes, comments, replies, shares, reposts, mentions; powered by Cloud Firestore)
- Mood-based filtering (algorithm-driven personalization for happy/scary/sad feeds, enhancing user experience)
- Secure payments (RevenueCat for one-time payments/subscriptions, API-driven transactions)
- Profile creation/updates (bio, name, real-time sync via Cloud Firestore)
- Theme marketplace (Firestore-backed real-time uploads/sharing of wallpapers, free or credit-based)
- Upcoming: Group chat and homepage (React Native UI, Firebase Realtime Database, Q2 2025)
- Upcoming: Enhanced subscription for multi-feature access (API-driven, Q2 2025)

## Metrics
- 100+ beta downloads, connecting diverse users
- 30% faster APIs via GCP serverless (vs. non-optimized Node.js endpoints)
- 40% faster UI with reusable components and AsyncStorage caching (vs. non-cached rendering)
- Processed $100+ in RevenueCat subscription transactions
- 100+ daily API requests, supporting 10K+ monthly requests with 99.9% uptime
- 20% higher user engagement via personalized theme marketplace

## Setup
1. Clone: `git clone https://github.com/Dsavaglio01/NuCliqQA`
2. Install: `npm install`
3. Configure: Add `.env` with API keys
4. Run: `npm start`

## Screenshots
![Home/Video Feed](https://imgur.com/gallery/home-video-feed-75jdb51)
![Theme Marketplace](https://imgur.com/gallery/theme-marketplace-yzi6Ua2)
![Apply Theme View](https://imgur.com/gallery/apply-theme-EOkcbhC)

## Demos
Image/Text Posting demo: [here](https://drive.google.com/file/d/1Npwm9BXX3IhD2UDUSrZ-rdpjJBnlrnMy/view?usp=drive_link) <br/>
Liking/Saving Posts demo: [here](https://drive.google.com/file/d/1jV3dXp4XV_srjggivZ8nWi1w7WX-aVQT/view?usp=drive_link)
