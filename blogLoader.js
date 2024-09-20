// Fetch the JSON file containing the blog posts
fetch('posts.json')
.then(response => response.json()) // Parse the JSON
.then(posts => {
    const postsContainer = document.getElementById('blog-posts');
    posts.forEach(post => {
        // Create an HTML block for each post
        const postElement = document.createElement('div');
        postElement.classList.add('blog-post');
        postElement.innerHTML = `
            <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
            <p>Published on ${post.date}</p>
            <p>${post.summary}</p>
        `;
        postsContainer.appendChild(postElement);
    });
})
.catch(error => console.error('Error loading blog posts:', error));