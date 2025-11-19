# Deployment Checklist

## Critical Before Go-Live
- [ ] **Configure Formspree**: 
  1. Go to [formspree.io](https://formspree.io) and create an account.
  2. Create a new form and get the unique ID (e.g., `xdkobkwg`).
  3. Update `index.html` line 283: `action="https://formspree.io/f/YOUR_NEW_ID"`.
  4. Verify the form by sending a test message.

## Hosting
- [ ] **GitHub Pages**:
  - [ ] Repository created
  - [ ] Code pushed
  - [ ] Pages site enabled in Settings > Pages

## Post-Deployment
- [ ] Test all links on the live site
- [ ] Test contact form on the live site
- [ ] Verify mobile responsiveness on actual devices
