import {computed, onMounted, onUnmounted} from "vue";
import * as faceApi from "@vladmandic/face-api";
import {usePostsStore} from "../store/posts.js";
import {isEmpty, isObject} from "lodash";

export function useFaceApi(videoElement) {
    const postsStore = usePostsStore();
    const loadFaceAPIModels = async () => {
        await faceApi.nets.tinyFaceDetector.loadFromUri('/model');
        await faceApi.nets.faceExpressionNet.loadFromUri('/model');
    };

    onMounted(() => {
        loadFaceAPIModels().then(() => {
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({video: true})
                    .then((stream) => {
                        videoElement.value.srcObject = stream;
                        startEmotionTracking(stream);
                    })
                    .catch((err) => {
                        console.error("Error accessing the webcam:", err);
                    });
            }
        })
    })

    onUnmounted(() => {
        stopEmotionTracking();
    })

    const startEmotionTracking = async (stream) => {
        try {
            // Load the webcam stream into the video element
            videoElement.value.srcObject = stream;
            await videoElement.value.play();

            const detectEmotions = async () => {
                const detections = await faceApi.detectAllFaces(
                    videoElement.value,
                    new faceApi.TinyFaceDetectorOptions()
                ).withFaceExpressions();

                const detectedEmotions = detections.map(detection => {
                    const emotions = Object.entries(detection.expressions);
                    emotions.sort((a, b) => b[1] - a[1]); // Sort in descending order based on confidence

                    return {
                        name: emotions[0][0],
                        confidence: emotions[0][1]
                    };
                });

                postsStore.addEmotionsToVisiblePosts(detectedEmotions);

                requestAnimationFrame(detectEmotions);
            };

            detectEmotions();
        } catch (error) {
            console.error("Error starting emotion tracking:", error);
        }
    };

    const stopEmotionTracking = () => {
        if (videoElement.value) {
            videoElement.value.pause();
        }
    };

    const postEmotions = computed(() => {
        return postsStore.posts.reduce((acc, item) => {
            let emotions = [];
            if (isObject(item.emotions) && !isEmpty(item.emotions)) {
                emotions = Object.entries(item.emotions).map(emotion => ({
                        postId: item.post.id,
                        name: emotion[0],
                        confidence: emotion[1]
                    })
                );
            }

            acc[item.post.id] = emotions;

            return acc;
        }, {});
    });

    return {
        postEmotions,
    }
}