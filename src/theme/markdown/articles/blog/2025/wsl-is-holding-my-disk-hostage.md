@frontmatter
{
    "title": "WSL Is Holding My Disk Hostage!",
    "og_title": "WSL Is Holding My Disk Hostage!",
    "category": "general",
    "tags": ["2025", "free-writing"],
    "description": "How to reclaim disk space on Windows when WSL is using it all up",
    "og_description": "How to reclaim disk space on Windows when WSL is using it all up",
    "og_image": "https://ryanphillips.dev/static/assets/images/blog/2025/wsl-is-holding-my-disk-hostage-preview-1200x630.png",
    "canonical": "https://ryanphillips.dev/blog/2025/wsl-is-holding-my-disk-hostage",
    "og_url": "https://ryanphillips.dev/blog/2025/wsl-is-holding-my-disk-hostage",
    "published_datetime": "2025-12-31T23:30:48Z"
}
@endfrontmatter

I was spinning up a dev container to work on a project as I routinely do when I received the dreaded message: `⚠️ Low Disk Space`.

I knew I had a decent amount of storage being used but figured there should be *at least* 120GB free. I hadn't really downloaded any videos or other large files recently, so I was thrown a little off guard. I briefly wondered if I had picked up some kind of malware, but that seemed implausible.

Then my intuition started to kick in and I thought about anything that may have changed in my workflow recently. 

## The Synopsis

*Aha!* *It must be the Docker containers!*

I had been starting up a Docker container for just about anything and everything, and had been running some PostgreSQL images with a decent chunk of data. I also knew that I am not the most vigilant when it comes to pruning unused container objects and volumes, so I decided to give it a shot and ran the command to clean it all up.

```
docker system prune --all --volumes
```

I knew I could rebuild everything I needed to, so I wasn't too worried about losing anything important. Since it was taking a long time to finish, I knew it must have been building up for a while this time.

Once it finished, I was happy to see over 125GB freed up!

I quickly opened the Windows Control Panel to see my newly restored disk space.

Much to my dismay, it hadn't budged. I tried shuting down WSL (Windows Subsystem for Linux) and even restarting my computer. Alas, the disk space still was nearly full.

*What gives?*

WSL had taken my memory and is now holding it hostage!

## The Solution

My intuition started tingling again, so I did a quick web search for "WSL lost disk space" and quickly found the answers I was looking for. As it turns out, the virtual hard disk (VHDX) used by WSL can grow automatically as more and more disk space is needed, but it's only a one way street. To reclaim that space, we have to roll up our sleeves and do it ourselves.

Here's what has to be done:

### 1. Shutdown WSL

```
wsl --shutdown
```

### 2. Locate the Virtual Hard Disk (VHD) file

This is the file that acts as a hard drive for the Linux distribution, storing all its files and settings. It's usually named something like `ext4.vhdx` and located in the `AppData` directory. It's precise location will depend on the Linux distribution being used, and possibly whether you are using Docker Desktop or docker-engine as well.

For me, it was located at

```
C:\Users\<username>\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu_<version>\LocalState/ext4.vhdx
```

### 3. Optimize the VHD

If you have Windows 11 Pro, Enterprise, or Education editions you can use the `Optimize-VHD` tool, but the machine in question runs Windows Home, so I went with a different optimization method using `diskpart`. No matter which method is used, always make sure you have your important data backed up!

To compact the VHD, **first open the command prompt as an administrator and launch `diskpart`**

```
diskpart
```

**Next, select the VHD**

```
select vdisk file="C:\Users\<username>\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu_<version>\LocalState\ext4.vhdx"
```

(replace the file path with the actual location to your VHD)

**Attach the Vdisk as read-only**

*This will help ensure no processes can write to the disk during the operation as a precaution.*

```
attach vdisk readonly
```

**Compact the VHD**

```
compact vdisk
```

**Detach the Vdisk**

```
detach vdisk
```

**Finally, exit dispart**

```
exit
```

### 4. Check the Windows Disk Usage

After running through these steps, I was finally able to see my reclaimed disk space. All was right in the world once again!

I know any sensible person reading this is wondering why anyone would bother using Windows for development when you have to jump through hoops like this. I don't really have a good answer other than it's what I've always grown up with and used. 

It actually isn't all that bad, but I *am* looking to set up a Linux machine in the near future and will be sure to make a post about that at some point!

Thanks for reading!
