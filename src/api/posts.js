import axios from "axios";
import {getRandomClass} from "../lib/coco-classes.js";

export async function getRawPosts() {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export async function fetchPostsBatch(posts) {
    try {
        const postPromises = posts.map((post) => {
            const commentPromise = axios.get('https://jsonplaceholder.typicode.com/comments', {
                params: {
                    postId: post.id
                }
            });

            const imagePromise = axios.get('https://api.pexels.com/v1/search', {
                headers: {
                    Authorization: import.meta.env.VITE_PEXEL_API_KEY,
                },
                params: {
                    query: getRandomClass(),
                    per_page: 1
                }
            });

            return Promise.all([commentPromise, imagePromise])
                .then(([commentsResponse, imageResponse]) => {
                    const comments = commentsResponse.data;
                    const image = imageResponse.data;

                    return {
                        post,
                        comments,
                        image
                    };
                });
        });

        return await Promise.all(postPromises);
    } catch (error) {
        console.error(error);
    }
}