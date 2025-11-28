# Deployment Checklist

## Critical Before Go-Live
- [x] **Configure Formspree**: 
  1. Go to [formspree.io](https://formspree.io) and create an account.
  2. Create a new form and get the unique ID (e.g., `xdkobkwg`).
  3. Update `index.html` line 283: `action="https://formspree.io/f/YOUR_NEW_ID"`.
  4. Verify the form by sending a test message.
- [x] **Configure Calendly**:
  1. Search `index.html` for `YOUR_LINK_HERE` (3 occurrences).
  2. Replace with your actual Calendly URL (e.g., `https://calendly.com/mitchell-group/consult`).

## Assets Needed
- [x] **Favicon**: Add `favicon.ico` or `favicon.png` to the root folder.
- [x] **Social Image**: Add `og-image.jpg` to `assets/` folder for link previews.

## Hosting
- [x] **GitHub Pages**:
  - [x] Repository created
  - [ ] Code pushed (Latest updates)
  - [x] Pages site enabled in Settings > Pages
  - [x] **Enforce HTTPS**: Check this box in GitHub Settings > Pages.

## Post-Deployment
- [ ] Test all links on the live site
- [ ] Test contact form on the live site
- [ ] Verify mobile responsiveness on actual devices
