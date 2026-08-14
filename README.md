# SwiftLink Frontend

This is the real, buildable version of the SwiftLink website — the same
app you saw in the chat preview, but packaged so it can live on a real
website address and actually talk to your backend on Railway.

## Step 1: Unzip and open the folder

Unzip this folder, then open Command Prompt and `cd` into it, the same
way you did for the backend:

```
cd path\to\swiftlink-frontend
```

## Step 2: Install the tools it needs

```
npm install
```

Same idea as before — this downloads React, Vite (the tool that builds
the site), and the icon library, based on the list in `package.json`.

## Step 3: Test it on your own computer first

```
npm run dev
```

This will print a local web address, usually:
```
http://localhost:5173
```

Open that link in your browser (Chrome, Firefox, etc.) — you should see
SwiftLink running for real, on your own machine, outside of any chat.

**Important:** because this is now a real website (not the padded chat
sandbox), it should actually be able to reach your Railway backend and
load real countries and real prices. This is the true test.

## Step 4: Put the code on GitHub

Same steps as the backend:

```
git init
git config --global user.email "blesseddsquare@gmail.com"
git config --global user.name "Alwell"
git add .
git commit -m "Initial SwiftLink frontend"
```

Then create a new repository on GitHub called `swiftlink-frontend`
(same way you made `swiftlink-backend`), copy its URL, and run:

```
git remote add origin https://github.com/your-username/swiftlink-frontend.git
git branch -M main
git push -u origin main
```

## Step 5: Deploy it on Vercel (the real, live website)

Vercel is a company built specifically for hosting frontend sites like
this one — it's free for a project this size.

1. Go to https://vercel.com and click **Sign Up**
2. Choose **Continue with GitHub** — this links your Vercel account to
   your GitHub account, the same trust relationship Railway has
3. Click **Add New** → **Project**
4. Find and select your `swiftlink-frontend` repository
5. Vercel will auto-detect it's a Vite project — leave the settings as
   they are
6. Click **Deploy**

Wait about a minute. Vercel will give you a real, live web address like:
```
https://swiftlink-frontend.vercel.app
```

## Step 6: Lock your backend's door back down

Remember earlier we set `ALLOWED_ORIGINS` to empty on Railway so "anyone"
could reach your backend, just for testing? Now that SwiftLink has its
own real address, let's only allow that one address in — safer, like
changing the guest list back from "everyone" to "just my real shop."

Go back to Railway → `swiftlink-backend` → Variables → `ALLOWED_ORIGINS`
→ set its value to your new Vercel address, e.g.:
```
https://swiftlink-frontend.vercel.app
```

## Step 7: Test the real thing

Visit your Vercel link on your phone or laptop, pick a country, tap
Place Order, and try Virtual Number. This time, since it's a real
website talking to a real backend, it should work fully — no sandbox
restrictions in the way.
