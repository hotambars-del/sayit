# SayIt — anonymous prompts & replies

A mobile-friendly website for creating question links, sharing them to Instagram Stories, and privately reading anonymous replies. It does **not** ask visitors for Instagram passwords and is not affiliated with Instagram.

## Before you start
You need a free Supabase account for login and data storage, and a GitHub account for free static hosting. The website is not connected to a database until you finish the setup below.

## 1. Create your database
1. Go to https://supabase.com and create a project.
2. Open **SQL Editor → New query**.
3. Open `supabase.sql` from this folder, copy all of it into the editor, and press **Run**.
4. Open **Project Settings → API** (or the API Keys page). Copy the Project URL and the public `anon`/publishable key.

## 2. Connect SayIt
1. Open `config.js` in VS Code or Notepad.
2. Replace `PASTE_SUPABASE_PROJECT_URL_HERE` with your Project URL.
3. Replace `PASTE_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE` with the public anon/publishable key.
4. Save. Never put a `service_role` key or any secret key in this file.

## 3. Configure email sign-in
In Supabase, open **Authentication → URL Configuration**. Add your eventual GitHub Pages address to **Site URL** and **Redirect URLs**, for example `https://YOUR-GITHUB-USERNAME.github.io/sayit-website/`. Exact URL depends on your repository name. While testing locally, add `http://localhost:8000/**` to Redirect URLs if the dashboard accepts wildcard URLs.

For easier first test, use the email confirmation link from the sign-up email. If you don't receive it, check spam and review Supabase Auth email settings.

## 4. Test on Windows 11
1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `py -m http.server 8000`
5. In your browser visit `http://localhost:8000`.
6. Create an account with your email and a SayIt-specific password. Confirm your email if asked, then sign in.
7. Create a prompt. Open its generated link in a private/incognito window to test sending a reply.
8. Return to **My inbox** to view the reply.

If `py` is not recognized, try `python -m http.server 8000`.

## 5. Publish free with GitHub Pages
1. Create a new public GitHub repository, e.g. `sayit-website`.
2. Upload the contents of this folder to the repository root (upload the files, not the ZIP itself).
3. In repository **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/(root)`, and Save.
4. Wait for deployment. Copy the Pages URL shown there.
5. Add that exact URL to Supabase **Authentication → URL Configuration** as Site URL and Redirect URL.
6. Open the live website and test sign-up, prompt creation, anonymous reply, and inbox.

## 6. Share on Instagram
Copy your prompt URL and add it to an Instagram Story using Instagram's **Link sticker**. You can write “answer this anonymously 💌” over the Story. The site cannot create or control Instagram's native “Add Yours” sticker; it provides its own prompt and shareable link.

## Privacy and safety
- SayIt never requests or stores Instagram usernames/passwords.
- Reply text is anonymous to the prompt owner; this is not a guarantee of anonymity from hosting/database operators or legal requests.
- Replies are public-submittable but only the prompt owner can read them through the website's row-level security rules.
- Use moderation and do not encourage threats, harassment, doxxing, or sharing private information.
- If you want a team inbox, add a properly designed role system; do not share the owner's password. This starter is owner-only.
- Supabase free tier quotas and platform policies can change. Check current provider terms before publishing.
