import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import {usePostsStore} from "../store/posts.js";

export function useImageClassification() {
    const postsStore = usePostsStore();

    cocoSsd.load().then((model) => {
        addImageClassifications(model);
    });

    const addImageClassifications = model => {
        postsStore.posts.forEach(item => {
            const imgUrl = item.image.photos[0]?.src.large;
            // This is done to avoid CORS issues.  Ideally we would like to use images from our own domain.
            // This would allow us to load the images directly into the model without having to fetch them first.
            fetch(imgUrl)
                .then(response => response.blob()) // Fetch the image as a Blob
                .then(blob => {
                    const img = new Image();
                    const objectUrl = URL.createObjectURL(blob); // Create an object URL
                    img.src = objectUrl;
                    img.onload = () => {
                        URL.revokeObjectURL(objectUrl); // Revoke the object URL after loading the image
                        model.detect(img).then((predictions) => {
                            const itemIndex = postsStore.posts.findIndex(post => post.post.id === item.post.id);
                            if (itemIndex !== -1) {
                                postsStore.posts[itemIndex].predictions = predictions.length ? predictions : null;
                            }
                        })
                    }
                })
                .catch(error => {
                    console.error('Error fetching the image:', error);
                });
        });
    }
}