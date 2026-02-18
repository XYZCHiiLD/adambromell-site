# Adam Bromell Personal Site

Clean, minimal personal website built with Next.js and Tailwind CSS.

## Local Development (Optional)

If you want to run this site on your local machine:

1. Install Node.js from https://nodejs.org/ (download the LTS version)

2. Open terminal in this folder and run:
```bash
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

## Deployment to Vercel

1. Create a GitHub account at https://github.com
2. Create a new repository and upload these files
3. Create a Vercel account at https://vercel.com
4. Connect your GitHub repository to Vercel
5. Vercel will automatically build and deploy your site

## Making Changes

Edit the content in `src/app/page.js` - this is where all your text, links, and structure live.

## File Structure

```
adambromell-site/
├── src/
│   └── app/
│       ├── page.js          # Main page content (edit this!)
│       ├── layout.js         # HTML wrapper and metadata
│       └── globals.css       # Global styles
├── package.json              # Project dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── postcss.config.js         # PostCSS configuration
```
