import {defineStore} from "pinia";
import {fetchPostsBatch, getRawPosts} from "../api/posts.js";
import dayjs from "dayjs";

export const usePostsStore = defineStore('posts', {
    state: () => ({
        cocoSsdModel: null,
        posts: [],
        visiblePosts: [],
    }),
    actions: {
        async fetchPosts() {
            try {
                const posts = await getRawPosts();

                const initialPostSlice = posts.slice(0, 12);
                const restSlice = posts.slice(12, 100);

                const initialPosts = await fetchPostsBatch(initialPostSlice);
                this.posts = [...this.posts, ...initialPosts];
                this.posts = this.posts.map(post => {
                    return {
                        ...post,
                        dwell: 0,
                    }
                })

                // fetchPostsBatch(restSlice).then((posts) => {
                //     this.posts = [...this.posts, ...posts];
                // });
            } catch (error) {
                console.error(error);
            }
        },
        addVisiblePost(postId) {
            const existing = this.visiblePosts.find(post => post.id === postId);
            if (!existing) {
                this.visiblePosts.push({
                    id: postId,
                    start: dayjs()
                });
            }
        },
        removeVisiblePost(postId) {
            const visiblePost = this.visiblePosts.find(post => post.id === postId);
            if (!visiblePost) return;

            const dwellTime = dayjs().diff(visiblePost.start, "millisecond");
            const postIndex = this.posts.findIndex((post) => post.post.id === postId);
            if (postIndex !== -1) {
                this.posts[postIndex].dwell += dwellTime;
            }

            this.visiblePosts = this.visiblePosts.filter((post) => post.id !== postId);
        },
        getObjectClasses(postId) {
            const post = this.posts.find(post => post.post.id === postId);
            const predictions = post.predictions;
            if (!post || !predictions?.length) return [];

            return predictions.map(prediction => ({
                class: prediction.class,
                score: (prediction.score * 100).toFixed(2),
            }));
        },
        addEmotionsToVisiblePosts(emotions) {
            this.visiblePosts.forEach(visiblePost => {
                const postIndex = this.posts.findIndex(item => item.post.id === visiblePost.id);
                if (postIndex !== -1) {
                    this.posts[postIndex].emotions = this.posts[postIndex].emotions ? this.posts[postIndex].emotions : {};
                    emotions.forEach(emotion => {
                        this.posts[postIndex].emotions[emotion.name] = emotion.confidence;
                    })
                }
            })
        },
    },
    getters: {
        postEmotions(state) {
            return state.posts.map(item => {
                if (!item.emotions?.length) return [];
                return Object.entries(item.emotions).map(emotion => ({
                    postId: item.post.id,
                    name: emotion[0],
                    confidence: emotion[1]
                }));
            })
        },
    }
})