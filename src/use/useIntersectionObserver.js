import {watch} from "vue";
import {usePostsStore} from "../store/posts.js";

export function useIntersectionObserver(postRefs) {
    const postsStore = usePostsStore();
    const handleIntersection = (entries) => {
        entries.forEach((entry) => {
            const postId = parseInt(entry.target.dataset.postId);
            const intersectionRatio = entry.intersectionRatio;

            if (intersectionRatio > 0.5) {
                postsStore.addVisiblePost(postId);
            } else if (intersectionRatio <= 0.5) {
                postsStore.removeVisiblePost(postId);
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    watch(postRefs, () => {
        observer?.disconnect();
        postRefs.forEach((postElement) => {
            observer.observe(postElement);
        });
    });
}