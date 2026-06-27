# Climbase

Climbase is a small web app where a wall climber or route setter can upload a picture of a climbing wall and mark different climbing routes on top of it.

Useful examples:

- Upload a climbing wall photo and mark the holds for a route.
- Add route names and grades like `V3`, `6a`, or `5.10b`.
- Create more than one climbing route in different colors.
- Generate suggested easy, moderate, or hard routes.
- Show beginner-friendly difficulty guidance for each generated route.
- Login and logout locally with a climber name and password field.
- Premium feature preview for future paid tools.
- Download the final wall picture with the climbing routes drawn on it.
- Install it as an app on Mac, Windows, Android, and iOS when served from a browser.

## Project files

- `index.html`: page structure
- `styles.css`: app styling
- `app.js`: wall upload, climbing route drawing, route generation, route list, and download behavior
- `manifest.webmanifest`: installable app settings
- `service-worker.js`: offline app cache
- `icons/climbase-logo.png`: realistic app logo with climbing holds and route line
- `server.py`: FastAPI server that serves the app
- `requirements.txt`: Python dependencies

## How to run

From the project folder:

```bash
cd "/Users/vansh/codebase/code-with-vansh/climb-route-maker"
python3 -m http.server 8010
```

Then open:

- `http://localhost:8010`

Press `Ctrl+C` to stop the server.

## Install as an app

### Mac or Windows

1. Run the local server.
2. Open `http://localhost:8010` in Chrome or Microsoft Edge.
3. Click the install icon in the browser address bar, or click `Install app` if the button appears.
4. Climbase opens like a desktop app.

### Android

1. Open the hosted Climbase link in Chrome.
2. Tap the menu button.
3. Tap `Add to Home screen` or `Install app`.

### iPhone or iPad

1. Open the hosted Climbase link in Safari.
2. Tap the share button.
3. Tap `Add to Home Screen`.

For phone installation from another device, Climbase should be hosted online with GitHub Pages, Netlify, or Vercel. A local `localhost` link only opens on the same computer.

## How to use

1. Login with your climber name.
2. Upload a climbing wall picture.
3. Type a route name, optional grade, and choose a marker color.
4. Press `Make new climb`.
5. Click the start hold first, then each next hold in order.
6. Select another climb from the list when you want to edit it.
7. Press `Download route` to save the finished picture.

The current login is local to the browser. It is not a secure online account system yet. The demo asks for a password, but the app does not send it online or store the real password.

## Premium preview

Climbase includes a front-end Premium preview card. It is not connected to real payments yet.

Planned Premium ideas:

- Save unlimited routes
- Training plans by level
- Cloud sync on phone and laptop
- Share routes with friends or coaches

## Generate a route

1. Upload a climbing wall picture.
2. Choose `Easy route`, `Moderate route`, or `Hard route`.
3. Press `Generate new route`.
4. The app creates a suggested route:
   - Easy routes are straighter and use fewer holds.
   - Moderate routes add more holds and side movement.
   - Hard routes move side-to-side more and use the most holds.
5. You can still click more holds after generation to adjust the route.

## Difficulty guide

- Easy route: `V0-V2`, beginner friendly, straighter movement.
- Moderate route: `V3-V4`, for climbers with some practice, adds side movement.
- Hard route: `V5-V7`, for advanced climbers, wider movement and harder body positions.
