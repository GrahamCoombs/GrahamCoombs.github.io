// Get the query string parameter (e.g., ?id=1)
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Fetch the JSON file containing the blog posts
fetch('posts.json')
    .then(response => response.json())
    .then(posts => {
        const post = posts.find(p => p.id == postId);
        if (post) {
            document.getElementById('post-title').innerText = post.title;
            document.getElementById('post-date').innerText = 'Published on ' + post.date;
            document.getElementById('post-content').innerHTML = post.content;
        } else {
            document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
        }
    })
    .catch(error => console.error('Error loading post:', error));