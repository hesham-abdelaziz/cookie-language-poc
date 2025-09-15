# Language Cookie POC

A Proof of Concept demonstrating cookie-based language management between an Angular frontend and Node.js backend.

## Overview

This POC shows how to implement language switching using server-side cookies instead of URL-based language routing. The backend sets language preferences in cookies, and all subsequent API requests automatically include the language preference via `withCredentials: true`.

## Architecture

- **Frontend**: Angular 15+ application with language switching
- **Backend**: Simple Node.js/Express server that manages language cookies
- **Default Language**: Italian (it)
- **Supported Languages**: Italian (it), English (en), German (de), French (fr), Spanish (es), Portuguese (pt)

## Features

- ✅ Cookie-based language persistence
- ✅ Automatic language detection on app start
- ✅ Dynamic content loading based on selected language
- ✅ Clean URLs without language prefixes
- ✅ CORS configuration with credentials
- ✅ Fallback to default language (Italian)

## Project Structure

```
language-poc/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data/
│       └── content.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── home/
│   │   │   │       ├── home.component.ts
│   │   │   │       ├── home.component.spec.ts
│   │   │   │       └── home.component.html
│   │   │   │       └── home.component.scss
│   │   │   ├── services/
│   │   │   │   └── language.service.ts
│   │   │   │   └── language.service.spec.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.spec.ts
│   │   │   ├── app.component.html
│   │   │   └── app.component.scss
│   │   │   └── app.config.ts
│   │   │   └── app.routes.ts
│   │   └── main.ts
│   │   └── styles.scss
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (version 16+)
- npm or yarn
- Angular CLI (version 15+)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Angular development server:
```bash
ng serve
```

The frontend application will run on `http://localhost:4200`

## API Endpoints

### Backend Endpoints

- **POST** `/api/language` - Set language preference in cookies
  - Body: `{ "language": "en" }`
  - Response: Success message
  - Sets `lang` cookie with specified language

- **GET** `/api/content` - Get localized content
  - Uses `lang` cookie to determine response language
  - Returns content object with localized text

- **GET** `/api/current-language` - Get current language from cookies
  - Returns current language setting

## How It Works

1. **Initial Load**: 
   - Angular app starts and checks for current language via `/api/current-language`
   - If no language cookie exists, backend defaults to Italian

2. **Language Change**:
   - User selects new language from dropdown
   - Frontend calls `/api/language` with `withCredentials: true`
   - Backend sets language cookie and returns success
   - Frontend refreshes content by using toObservable on a signal and switchMap to make sure we have latest wanted results by calling `/api/content`

3. **Content Loading**:
   - All API calls use `withCredentials: true`
   - Backend reads language from cookie automatically
   - Returns content in appropriate language

## Testing the POC

1. Open the application at `http://localhost:4200`
2. Observe the default Italian content
3. Use the language selector to change languages
4. Notice how content updates without URL changes
5. Refresh the page - language preference persists
6. Open browser developer tools to see the `lang` cookie being set

## Key Implementation Details

### Frontend (Angular)

```typescript
// Language service with withCredentials
changeLanguage(language: string): Observable<any> {
  return this.http.post('http://localhost:3000/api/language', 
    { language }, 
    { withCredentials: true }
  );
}

getContent(): Observable<any> {
  return this.http.get('http://localhost:3000/api/content', 
    { withCredentials: true }
  );
}
```

### Backend (Node.js)

```javascript
// Cookie-based language detection
app.get('/api/content', (req, res) => {
  const language = req.cookies.lang || 'it';
  const content = getLocalizedContent(language);
  res.json(content);
});

// Setting language cookie
app.post('/api/language', (req, res) => {
  const { language } = req.body;
  res.cookie('lang', language, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
  });
  res.json({ success: true, language });
});
```

## Benefits Demonstrated

1. **Clean URLs**: No language prefixes in routes
2. **Persistent Preferences**: Language choice survives page refreshes
3. **Automatic Inclusion**: Cookies sent with every request
4. **Fallback Handling**: Graceful default to Italian
5. **Simple Implementation**: Minimal code complexity

## Potential Extensions

- Add more languages
- Implement user authentication with language preferences
- Add browser language detection as initial fallback
- Implement language-specific routing for SEO (optional)
- Add loading states during language switches

## Troubleshooting

### CORS Issues
Ensure both servers are running and CORS is properly configured with `credentials: true`

### Cookie Not Being Set
Check that the cookie configuration matches your environment (http vs https)

### Language Not Persisting
Verify `withCredentials: true` is set on all HTTP requests

## Browser Support

This POC works with all modern browsers that support:
- Cookies
- CORS with credentials
- Angular 15+ requirements

## Development Notes

- Backend uses simple in-memory content storage
- No authentication implemented (focus on language mechanism)
- Development CORS configuration (not production-ready)
- Cookies configured for HTTP (adjust for HTTPS in production)