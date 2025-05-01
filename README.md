# Lucke Calcutta – Frontend

This is the frontend of the Calcutta Rodeo Betting App, providing an interactive interface for users to browse events, place bids, and manage their mock-money portfolio. Built with React and styled using Bootstrap 5, the frontend is deployed globally via Cloudflare Pages.

## 🧱 Tech Stack

- **Framework:** React (with React Router)
- **Styling:** Bootstrap 5
- **API Integration:** Secure session-based fetch via custom `apiFetch()` utility
- **Deployment:** Cloudflare Pages
- **CI/CD:** GitHub-integrated deployment pipeline via Cloudflare

## 🌐 Live Site

```
https://luckecalcutta.com
```

## 🔗 Connected API

This frontend communicates with:

```
https://api.luckecalcutta.com/api
```

Requests are session-authenticated and support CORS credentials.

## 🚀 Deployment Notes

- Automatically deployed via Cloudflare Pages from the `main` branch.
- Environment variables such as `REACT_APP_API_URL` are configured in the Cloudflare Pages dashboard.
- Uses HTTPS and global CDN by default for performance and security.
- Supports SPA routing via `redirects` file.

## 📁 Directory Overview

```
.
├── src/
│   ├── api/             # Authenticated fetch logic
│   ├── context/         # Auth context provider
│   ├── pages/           # Login, event listings, bidding portal
│   ├── components/      # UI components (cards, buttons, tables)
│   ├── App.js           # Main router
│   └── index.js         # App entry point
├── public/
├── package.json
```

## 🧠 Features

- Login/logout with session persistence
- Event list with details and bidding options
- Admin UI for event creation
- Bootstrap-styled UI for responsiveness
- Graceful error handling and loading states

## 📞 Contact

For access to demo credentials, production config, or Git integration:

**Colin McArthur**  
- 📞 (720)-469-3966 
- 📧 colinmcarthur01@gmail.com
