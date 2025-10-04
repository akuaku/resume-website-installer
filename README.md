# Resume Website Installer 🚀

One-command installer for a professional resume website with Strapi CMS backend.

## ✨ Features

- **Modern Frontend**: Clean, responsive HTML/CSS/JS design
- **Powerful Backend**: Strapi v3 headless CMS
- **Easy Management**: Update content through admin panel
- **Database Included**: PostgreSQL for reliable data storage
- **Docker Ready**: Complete containerized setup
- **One-Click Deploy**: Automated installation script

## 🎯 What You Get

- Home page with profile and skills
- Education timeline
- Work experience showcase
- Image gallery
- Fully customizable through Strapi admin
- Mobile-responsive design

## 📋 Prerequisites

- Docker and Docker Compose installed
- Linux/Unix server (Unraid, Ubuntu, Debian, etc.)
- 2GB RAM minimum
- 10GB disk space

## 🚀 Quick Install

### Option 1: Direct Download & Run (Kindly change your installation path, ports in the install.sh) 
```bash
curl -sSL https://raw.githubusercontent.com/akuaku/resume-website-installer/main/install.sh -o install.sh
chmod +x install.sh
./install.sh
```

### Option 2: Clone Repository (Kindly change your installation path, ports in the install.sh) 
```bash
git clone https://github.com/akuaku/resume-website-installer.git
cd resume-website-installer
chmod +x install.sh
./install.sh
```

### Option 3: Download ZIP
1. Download the [latest release](https://github.com/akuaku/resume-website-installer/releases)
2. Extract the zip file
3. Run `./install.sh`

## 🎬 Installation Walkthrough

The installer will ask for:

1. **Installation path** (default: `/mnt/user/appdata/david-resume`)
2. **Server IP** (your local IP address)
3. **Strapi port** (default: `1338`)
4. **Frontend port** (default: `3003`)
5. **Database password** (set a secure password)
6. **Domain name** (optional, for production use)

The script will automatically:
- ✅ Create all necessary directories
- ✅ Generate Docker configuration
- ✅ Set up Nginx reverse proxy
- ✅ Deploy all containers
- ✅ Create a setup guide with your URLs

## 📱 Access Your Site

After installation completes:

- **Frontend**: `http://YOUR_IP:3003`
- **Strapi Admin**: `http://YOUR_IP:1338/admin`

## 🔧 Initial Setup

### 1. Create Admin Account
Visit the Strapi admin URL and create your admin account.

### 2. Build Content Types

In Strapi admin, go to **Content-Types Builder** and create:

#### Profile (Single Type)
- `name` - Text
- `title` - Text
- `bio` - Rich Text

#### Skills (Collection Type)
- `name` - Text (required)
- `level` - Text (optional)

#### Education (Collection Type)
- `degree` - Text (required)
- `institution` - Text (required)
- `year` - Text (required)
- `description` - Rich Text (optional)

#### Experience (Collection Type)
- `position` - Text (required)
- `company` - Text (required)
- `period` - Text (required)
- `description` - Rich Text (optional)

#### Gallery (Collection Type)
- `title` - Text (required)
- `image` - Media (Single image, required)

### 3. Set Permissions

Go to **Settings** → **Roles** → **Public**

Enable `find` permission for:
- ✅ profile
- ✅ skills
- ✅ educations
- ✅ experiences
- ✅ galleries

### 4. Add Your Content

Now add your personal information through the Strapi admin panel!

## 🌐 Production Deployment

### Using Nginx Proxy Manager

Add these custom locations:

```nginx
location /strapi/ {
    proxy_pass http://YOUR_IP:1338/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}

location /strapi/uploads/ {
    proxy_pass http://YOUR_IP:1338/uploads/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 🛠️ Management

### View Logs
```bash
docker logs resume-cms --tail 50
docker logs resume-frontend --tail 50
docker logs resume-db --tail 50
```

### Restart Services
```bash
cd /path/to/installation
docker-compose restart
```

### Stop Services
```bash
cd /path/to/installation
docker-compose down
```

### Update Containers
```bash
cd /path/to/installation
docker-compose pull
docker-compose up -d
```

## 💾 Backup & Restore

### Backup Database
```bash
docker exec resume-db pg_dump -U strapi strapi > backup_$(date +%Y%m%d).sql
```

### Backup Uploads
```bash
docker cp resume-cms:/srv/app/public/uploads ./uploads_backup
```

### Restore Database
```bash
cat backup_20241004.sql | docker exec -i resume-db psql -U strapi strapi
```

### Restore Uploads
```bash
docker cp ./uploads_backup resume-cms:/srv/app/public/uploads
docker restart resume-cms
```

## 🐛 Troubleshooting

### Containers won't start
```bash
docker-compose logs
docker ps -a
```

### Can't access Strapi admin
- Wait 2-3 minutes after first start
- Check logs: `docker logs resume-cms`
- Verify port is not in use: `netstat -tulpn | grep 1338`

### Frontend not loading data
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for API errors
- Verify Strapi permissions are set to Public
- Check Strapi is running: `docker ps | grep resume-cms`

### Database connection issues
- Verify password matches in docker-compose.yml
- Check resume-db container: `docker logs resume-db`
- Inspect network: `docker network inspect resume-network`

## 📦 What's Included

```
resume-installer/
├── install.sh              # Automated installation script
├── README.md              # This file
└── frontend/              # Pre-built frontend files
    ├── index.html         # Home page
    ├── education.html     # Education timeline
    ├── experience.html    # Work experience
    ├── gallery.html       # Image gallery
    ├── css/
    │   └── style.css      # Responsive styling
    └── js/
        └── app.js         # API integration
```

## 🔒 Security Notes

- Change the default database password
- Don't expose Strapi admin port to the internet
- Use Nginx Proxy Manager with SSL for production
- Keep Docker images updated
- Regularly backup your data

## 🤝 Contributing

Found a bug or want to contribute? Feel free to:
- Open an issue
- Submit a pull request
- Suggest improvements

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🙋 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the SETUP_GUIDE.md created during installation
3. Check Docker logs
4. Open an issue on GitHub

## 🌟 Credits

Built with:
- [Strapi](https://strapi.io/) - Headless CMS
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Nginx](https://nginx.org/) - Web server
- [Docker](https://www.docker.com/) - Containerization

---

**Made with ❤️ for selfresume hosting**

⭐ Star this repo if you find it helpful!
