# Birthday in π

Find your birth date and your name in the digits of Pi. A web app that searches the first 1 million digits of π for your birthday (in multiple formats) and for your name encoded as digits (A=1, B=2, … Z=26).

**Live demo:** [https://hromp.com/pi/](https://hromp.com/pi/)

## Features

- **Birthday search**: Month/day/year picker; searches MMDDYYYY, MDDYYYY, MMDDYY, MDDYY
- **Name search**: Converts letters A–Z to digits 1–26 and searches π
- **Visual result**: Position bar, surrounding digits, highlighted match
- **Pi trivia**: Simple explanation, irrational/transcendental info, digits computed, fun facts

## Hosting on Your Own Webserver

### 1. Get the files

Clone this repository:

```bash
git clone https://github.com/151henry151/pi-birthday.git
cd pi-birthday
```

### 2. Directory layout

You need these files in a directory your web server can serve:

- `index.html` — main page
- `styles.css` — styles
- `app.js` — application logic
- `pi-digits.txt` — first 1 million digits of π (included in repo)

### 3. Nginx configuration

Example location block for `/pi/`:

```nginx
location = /pi {
    return 301 $scheme://$host/pi/;
}
location /pi/ {
    alias /path/to/your/pi-birthday/;
    index index.html;
    try_files $uri $uri/ /pi/index.html;
}
```

Replace `/path/to/your/pi-birthday/` with the actual path.

### 4. Apache configuration

```apache
Alias /pi /path/to/your/pi-birthday
<Directory /path/to/your/pi-birthday>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
    DirectoryIndex index.html
</Directory>
```

### 5. Static file server (Node, Python, etc.)

Any static file server will work. Serve the directory at a path like `/pi/` and ensure `index.html` is the default. The app uses relative URLs for `pi-digits.txt`, so it must be in the same directory.

## Source of Pi digits

The digits are from [Eve Andersson’s collection](http://www.eveandersson.com/pi/digits/) (via the [eneko/Pi](https://github.com/eneko/Pi) repository).

## License

MIT
