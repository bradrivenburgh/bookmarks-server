# Bookmarks-Server

This is the backend for the bookmarks-app client.

## Set up

Complete the following steps to use the server:

1. Clone this repository to your local machine `git clone BOOKMARKS-SERVER-URL bookmarks-server`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.