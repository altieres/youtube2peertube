### 1- Download youtube files to all.json

```
youtube-dl -j --flat-playlist https://www.youtube.com/c/Bitcoinheiros/videos > all.js
```

### 2- Fix data to be an array and export it, see the example

### 3- Run the first import

```
yarn first-import-dev
```

### 4- Periodically (each hour?!) run import

```
yarn import-dev
```

Or use Heroku Scheduler to run "yarn import" for you
