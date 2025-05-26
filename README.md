# NuCliq
A social media app leveraging existing features fomr other platforms with a focus on community and advanced personalization, with 100+ beta downloads, built with React Native (hooks, functional components), Expo (managed workflow), Node.js (async/await), Firebase, and GCP.

## Status
NuCliq is in beta, with 100+ downloads during testing. Active development continues, with a group chat and group homepage feature being developed for Q2 2025.

## Tech Stack
- Frontend: React Native (hooks, functional components), Expo (managed workflow)
- Backend: Node.js (async/await), Express
- Integrations: Firebase (auth, database), GCP (serverless APIs via Cloud Functions), RevenueCat (subscriptions), Docker (containerization)

## Features
- User authentication (Firebase)
- Real-time social interactions (posts (text, image, and video), likes, comments, replies, shares, reposts. mentions)
- Secure payments (RevenueCat subscriptions)
- Profile creation and updates relating to posts and profile information (e.g. 'bio', first name, etc.)
- Theme (in-app wallpaper for posts and profile) marketplace - able to upload theme as well as share it with other users through marketplace. Users can obtain theme for free and apply to either or both posts and profile.
- Subscription to purchase 'NuCliq credits' in order to upload Theme (batches of 10 credits to purchase)
- Upcoming: Group chat and Group homepage (in development, Q2 2025)
- Upcoming: Updated subscription for multi-use of features listed above (in development, Q2 2025)

## Metrics
- 100+ beta downloads, connecting diverse users
- 30% faster APIs via GCP serverless (vs. non-optimized baseline)
- 40% faster UI with reusable components and AsyncStorage caching (vs. non-cached rendering)
- Processed $100+ in RevenueCat Transactions.
- 100+ daily API requests, 99.9% uptime

## Setup
1. Clone: `git clone https://github.com/Dsavaglio01/NuCliqQA`
2. Install: `npm install`
3. Configure: Add `.env` with API keys
4. Run: `npm start`

## Screenshots
![Registration](https://media.licdn.com/dms/image/v2/D4E2DAQH_7HGRwKpnyw/profile-treasury-image-shrink_1920_1920/profile-treasury-image-shrink_1920_1920/0/1733936523140?e=1748880000&v=beta&t=8UCFagk9vk6Ql_hSoozN2Ao7CsXeiWwfEhWZSDovd0I)
![Home/Video Feed](https://media.licdn.com/dms/image/v2/D4E2DAQGrpNN5vOl3bQ/profile-treasury-image-shrink_1920_1920/profile-treasury-image-shrink_1920_1920/0/1733936624561?e=1748880000&v=beta&t=0GHrzGWZc-E6v-Itw22GRhBZmpiywAGU3R5I4VkdZ84)
![Theme Marketplace](https://media.licdn.com/dms/image/v2/D4E2DAQHetTcsD7OiHw/profile-treasury-image-shrink_1920_1920/profile-treasury-image-shrink_1920_1920/0/1733936701869?e=1748880000&v=beta&t=F4MiG-LBOdSW_eYm3ozINLeoWD4IyXfS85AWxi1j9Uo)
![Apply Theme View](https://media.licdn.com/dms/image/v2/D4E2DAQHoLt3dNzg8XA/profile-treasury-image-shrink_1920_1920/profile-treasury-image-shrink_1920_1920/0/1733936739625?e=1748880000&v=beta&t=ksZhAHPPDCWe_UmfEI5DGl08wAf3F9zzYD6CjEz8r54)
