@frontmatter
{
    "title": "Make the First 14600 Bytes Count",
    "og_title": "Make the First 14600 Bytes Count",
    "category": "general",
    "tags": ["2026", "TCP", "HTTP", "Networking"],
    "description": "How understanding TCP slow start helped me improve performance of my webpage",
    "og_description": "How understanding TCP slow start helped me improve performance of my webpage",
    "og_image": "https://ryanphillips.dev/static/assets/images/blog/2026/make-the-first-14600-bytes-count-preview-1200x630.png",
    "canonical": "https://ryanphillips.dev/blog/2026/make-the-first-14600-bytes-count",
    "og_url": "https://ryanphillips.dev/blog/2026/make-the-first-14600-bytes-count",
    "published_datetime": "2026-02-14T21:17:54Z"
}
@endfrontmatter

The web is built on Hypertext Transfer Protocol (HTTP).

Understanding the underlying transport network protocols that make up the backbone of HTTP can make you a better web developer.

Both HTTP/1.1 and HTTP/2 are built on top of Transmission Control Protocol (TCP), and HTTP/2 still remains the dominant version used across the web. HTTP/3 is built on top of Quick UDP Internet Connections (QUIC), which itself operates over User Datagram Protocol (UDP). While these protocols have their differences, many of the fundamentals remain the same!

I recently dove into the concept of *Slow Start* thanks to [this Primeagen video](https://www.youtube.com/watch?v=ciNXbR5wvhU) covering [this blog post](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/). I'll briefly go over what that is and how it may have helped me speed up the first contentful paint (FCP) of my home page!

## TCP and Congestion Control Algorithms

When a request is made to a web server, it has no way of immediately knowing how congested the network is. Just like the interstate highways, the amount of data that can freely flow through a network at any given moment is limited,  and that rate slows as more "traffic" clogs it up. 

Transmission Control Protocol (TCP) is a standardized way to ensure reliable delivery of data across networks of varying capacity, or *bandwidth*, and the protocol defines **Slow Start** and **Congestion Avoidance** algorithms to accomplish this.

***Slow Start***, despite its name, is used to quickly figure out how many packets of data can reliably be sent at once. It starts by sending a minimal amount of data, and then exponentially increases this amount as successful acknowledgements are received. Without this feature, the network would constantly get flooded as each new connection is established.

***Congestion Avoidance*** keeps a more stable flow of data once Slow Start reaches a threshold while taking a more fine-grained approach to optimizing the amount of packets sent.

## How does Slow Start work?

Slow Start allows the server to probe network capacity by starting with a small amount of data ([the initial congestion window](#initial-congestion-window)) and exponentially increases it with each successful acknowledgment (ACK). This doubles the window size every round trip until congestion (a.k.a packet loss) occurs or a threshold is hit, preventing network collapse by finding the available bandwidth without overwhelming it.

### Initial Congestion Window

In the first round trip of TCP slow start, [modern servers typically send 10 TCP segments](https://www.rfc-editor.org/info/rfc6928). Older servers may be set up to send less, and newer servers may be set up to send more, but 10 is the most common. Assuming a [standard Maximum Segment Size](https://datatracker.ietf.org/doc/html/rfc894), each packet contains 1500 bytes, including 40 bytes of headers. Therefore, approximately **14600** ((1500 - 40) × 10) bytes of data can be sent on the first round trip, or roughly 14 KB to 15KB!

This limit is known as the **initial congestion window**, and it's designed to prevent network congestion while starting at a reasonable speed.

Once the server receives acknowledgement that the first 10 segments were received, 20 segments can be sent on the next trip, and then 40, and so on until the slow-start threshold is reached. Then, the server will change gears and use a congestion avoidance algorithm to keep things steady.

If congestion is detected at any moment, the slow start phase will begin from the initial congestion window again.

#### A note about TCP and HTTPS

A TCP connection requires a three-way handshake to establish a connection, where the client sends a SYN, the server sends a SYN-ACK, and finally the client sends an ACK.

HTTPS over TCP requires a TLS handshake as well, usually requiring an additional 2 round trips.

The reason I bring this up is because these handshakes involve sending packets between client and server, which means that the congestion window will likely be *larger* than the *initial* congestion window by the time your webpage gets sent. So, that 14.6 KB *could* be more like 20 KB or even more once the initial HTML is getting sent.

The "14 KB rule" is just something that has stuck with people, but just know that it isn't so clear or exact, and in reality is a bit flawed if we are talking about TCP and HTTPS.

### But what about HTTP/3 and QUIC?

While QUIC has many improvements over TCP to allow for a quicker connection time, [it also begins every connection in slow start](https://www.rfc-editor.org/rfc/rfc9002.html#name-the-minimum-congestion-wind) with a similar recommended initial congestion window. Similar to TCP, the congestion window [increases exponentially](https://www.rfc-editor.org/rfc/rfc9002.html#name-slow-start) as acknowledgements are processed.

## What does this mean for my webpage?

The initial congestion window (14.6 KB) often gives us enough room to deliver the HTML of a web page in a single round trip. If you can ensure all of the critical parts of your webpage arrive in that first round trip (after the required TCP/TLS handshakes), it has the potential to [significantly improve page load speed](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/#how-bad-can-one-round-trip-be).

If you can *at least* fit the HTML within that initial window, any additional resources needed will be able to start downloading. One caveat, however, is that if you require any external stylesheets the rendering of the page will be blocked until they are fully downloaded. Some people choose to inline their CSS in the `<head>` of their document for this reason, and it does have its performance benefits (assuming it doesn't go over the initial congestion window), but personally I like to have a separate stylesheet. 

Even when you have multiple additional resources to fetch such as images, stylesheets, scripts, etc, it's still worth it to be mindful of their size for the subsequent round trip!

In HTTP/2 multiple requests can be [multiplexed](https://www.geeksforgeeks.org/computer-networks/multiplexing-and-demultiplexing-in-transport-layer/) over a single TCP connection, so you want to try to fit as much critical data as you can in the congestion window for the next trip, and so on.

## My Website: A Case Study

Can optimizing for the initial congestion window really make a difference in page load speeds?

I decided to use my website to find out!

### Fixing a bloated DOM

There was plenty of room for improvement, as I had several inline SVG images that were making the HTML for my homepage much larger than 14.6 KB. It was a whopping 80 KB before compression, and even after applying Brotli compression it only shrank down to 28.6 KB.

I decided to offload all the inline SVG icons to an external spritesheet, and then used the `<use>` tag to load the icons asynchronously. The only inline SVGs left in the main document were for critical above-the-fold content in the hero section. This significantly reduced the size of the HTML file, and another added benefit is that the spritesheet can be cached!

After offloading the large svg graphics, I was able to get well below 14 KB after compression, with a final document size of 7.2 KB!

### Cleaning up CSS

There was some room for improvement here as well, as I had some old CSS rules that were no longer used, as well as some duplicate styles that could be consolidated. I also added a script to my final build step that removes comments and minifies the CSS.

Ultimately, I was able to shrink the file from 6.6 KB to 5.7 KB.

If I really wanted to, I could separate out some CSS that is only used on other pages, but I didn't think it was worth giving up the benefits of a single, cacheable stylesheet at the time.

### Performance Benchmarks

Now that I had reduced the size of the page's critical resources from 35.2 KB to 12.9 KB, I was eager to see if there would actually be any difference in page load speed. In theory, that would remove the need for an extra round trip to get the HTML.

#### The results

Well? *It kind of depends*.

Using my actual connection at home (fiber), there wasn't much difference at all!

That really isn't too surprising considering that the round trip time over a fiber connection is usually very fast. Nonetheless, there is a very minor improvement!

<small>*All Results gathered from [WebPageTest](https://www.webpagetest.org/). Showing median values out of 3 runs per trial*</small>

<table border="1">
    <caption>
        Actual Network Connection (Fiber, no throttling, 16.58ms RTT)
    </caption>
    <thead>
        <tr>
            <th>Metric</th>
            <th>Before</th>
            <th>After</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Start Render Time</td>
            <td>0.3s</td>
            <td>0.3s</td>
        </tr>
        <tr>
            <td>First Contentful Paint</td>
            <td>0.303s</td>
            <td>0.274s</td>
        </tr>
        <tr>
            <td>Largest Contentful Paint</td>
            <td>0.491</td>
            <td>0.48s</td>
        </tr>
        <tr>
            <td>Speed Index</td>
            <td>0.371s</td>
            <td>0.361s</td>
        </tr>
        <tr>
            <td>Total Time</td>
            <td>0.327s</td>
            <td>0.303s</td>
        </tr>
        <tr>
            <td>Time to First Byte</td>
            <td>0.044s</td>
            <td>0.042s</td>
        </tr>
    </tbody>
</table>

Things get a little more interesting, however, if we slow the network a bit. Using WebPageTest, we can accurately test a slow network because it uses packet-level network throttling rather than just simulating it. This physically delays network packets and provides a somewhat low-variability simulation. To make it dramatically slower, I set the next group of tests to *3G Slow* (400 Kbps, 400ms RTT).

<table border="1">
    <caption>
        3G Slow (400 Kbps, 400ms RTT)
    </caption>
    <thead>
        <tr>
            <th>Metric</th>
            <th>Before</th>
            <th>After</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Start Render Time</td>
            <td>3.2s</td>
            <td>2.7s</td>
        </tr>
        <tr>
            <td>First Contentful Paint</td>
            <td>3.185s</td>
            <td>2.677s</td>
        </tr>
        <tr>
            <td>Largest Contentful Paint</td>
            <td>5.184</td>
            <td>4.679s</td>
        </tr>
        <tr>
            <td>Speed Index</td>
            <td>3.537s</td>
            <td>3.031s</td>
        </tr>
        <tr>
            <td>Total Time</td>
            <td>28.433s</td>
            <td>25.568s</td>
        </tr>
        <tr>
            <td>Time to First Byte</td>
            <td>1.79s</td>
            <td>1.768s</td>
        </tr>
    </tbody>
</table>

So it seems like a modest improvement at best, but it *can* make a difference on slower networks, and you never know how much latency a round trip might have!

If you look at the difference between the numbers for start render time, FCP, and LCP, they *do* seem suspiciously close to the simulated 400ms of the test runs! Perhaps a round trip *has* indeed been shaved off.

I should add that *I don't know what the initial congestion window is on my website's servers*. 10 is common, but it could be 20, or even 30. If that's the case, then the differences would probably be attributed to the browser processing the data rather than additional round trips.

I know this isn't the most comprehensive or scientific test, but I wanted to at least *try* and see how the theory holds up to some real world examples.


## Be Aware of Additional Network Requests for Render-Blocking Resources

I'm going to slightly deviate from the main topic of this post for a second to share something else I realized improved my page load speed while running several of these benchmarks, which turns out to be using self hosted fonts instead of Google Fonts! For all the tests above, self hosted fonts were used, but I did have a few running instances that were using Google Fonts instead, so I was curious about any difference that might make.

Now, Google Fonts are highly optimized for only downloading exactly what you need and having reasonably small woff2 files, so actual bytes isn't the issue here. I found that the real bottleneck was the extra stylesheet that you have to download from the Google Font servers. This is a synchronous, render-blocking resource, so the end user isn't seeing anything on your webpage until that file downloads! I would say you could just inline that stylesheet, but Google Fonts uses hashes in their URLs that change from time to time, so there is no guaranteeing it won't break something randomly.

Anyways, with self hosted fonts you can just include the font-face declarations in your main CSS file or inline them in the HTML. One less network request for a render-blocking resource, especially from an external origin with unknown latency can be huge!

<table border="1">
    <caption>
        Google Fonts to Self Hosted: Cable (5/1 Mbps 28ms RTT)
    </caption>
    <thead>
        <tr>
            <th>Metric</th>
            <th>Before (Google Fonts)</th>
            <th>After (Self Hosted)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Start Render Time</td>
            <td>0.8s</td>
            <td>0.6s</td>
        </tr>
        <tr>
            <td>First Contentful Paint</td>
            <td>0.854s</td>
            <td>0.574s</td>
        </tr>
        <tr>
            <td>Largest Contentful Paint</td>
            <td>1.361s</td>
            <td>0.854s</td>
        </tr>
        <tr>
            <td>Speed Index</td>
            <td>0.899s</td>
            <td>0.67s</td>
        </tr>
        <tr>
            <td>Total Time</td>
            <td>1.309s</td>
            <td>0.944s</td>
        </tr>
        <tr>
            <td>Time to First Byte</td>
            <td>0.185s</td>
            <td>0.185s</td>
        </tr>
    </tbody>
</table>

This is tested from a reasonably fast cable connection, so you can imagine that comparing on slower mobile and satellite connections would have *much* greater differences.

I mostly wanted to include this to illustrate the impact additional round trips can have in a scenario where I *know* for sure that an additional round trip is happening. Yes, it probably also takes longer since the resource is from a different origin, but the point is that latency will magnify the impact of every additional round trip!

## Conclusion

Well, there you have it. Is optimizing for the initial congestion window enough of a difference to go out of your way to make your webpage under 14.6 KB? I honestly don't know, but I always like to find ways of making things more speedy and efficient, even if only ever so slightly.

What I concluded from my little experiment is that in most cases, no one would ever notice, but in a few rare instances it could be the difference between someone seeing your beautiful website while they're out deep sea fishing in the middle of the pacific ocean, or giving up out of impatience and frustration.

At the very least, being *aware* of possible bottlenecks in our web creations never hurts, and you get to choose what is and isn't worth tweaking and improving.

In any case, I'd encourage everyone to take what you read on the internet from strangers like me with a grain of salt, and try experimenting for yourself. There is no greater joy than finding things out first hand!

I'll let you decide if a few milliseconds in loading times is something you want to worry about, but I'm sure visitors to your webpage wouldn't be any more upset if a they get a couple more milliseconds out of their day!

As always, thanks for reading!
