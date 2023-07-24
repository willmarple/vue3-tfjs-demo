<template>
  <div class="container">
    <div class="social-feed">
      <video ref="videoElement" class="emotion-tracking" autoplay muted></video>
      <div class="feed-header">
        <h2>Social Feed</h2>
      </div>
      <div class="post-container">
        <div v-for="item in posts"
             :key="`post-${item.post.id}`"
             class="post"
             :data-post-id="item.post.id"
             :ref="el => postRefs.push(el)">
          <div class="post-header">
            <h3>{{ item.post.title }}</h3>
            <div class="featured-image-container">
              <img :src="getPostImage(item.image)"
                   alt="Featured Image"
                   class="featured-image"/>
              <div class="stats-container">
                <table class="post-stats">
                  <thead>
                    <tr>
                      <th>Object Classes</th>
                      <th>Dwell Time</th>
                      <th>Emotions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="object-classes">
                          <div class="object-class"
                               v-for="(prediction, index) in postsStore.getObjectClasses(item.post.id)"
                               :key="`${prediction.class}-${index}-${item.post.id}`">
                            <span class="class-name">{{ prediction.class }}: </span>
                            <span class="class-score">{{ prediction.score }}%</span>
                          </div>
                        </div>
                      </td>
                      <td>{{ formatDuration(item.dwell) }}</td>
                      <td>
                        <div class="object-classes">
                          <div class="object-class"
                               v-for="(emotion, index) in postEmotions[item.post.id]"
                               :key="`${emotion.name}-${index}-${item.post.id}`">
                            <span class="class-name">{{ emotion.name }}: </span>
                            <span class="class-score">{{ (emotion.confidence * 100).toFixed(2) }}%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="post-content">
            <p>{{ item.post.body }}</p>
          </div>
          <div class="post-actions">
            <button class="action-button">Like</button>
            <button class="action-button">Comment</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {usePostsStore} from "../store/posts.js";
import {computed, reactive, ref} from "vue";
import {useImageClassification} from "../use/useImageClassification.js";
import {useIntersectionObserver} from "../use/useIntersectionObserver.js";
import {formatDuration} from "../lib/helpers.js";
import {useFaceApi} from "../use/useFaceApi.js";

const postsStore = usePostsStore();
const posts = computed(() => postsStore.posts);
const postRefs = reactive([]);
const videoElement = ref(null)

const {postEmotions} = useFaceApi(videoElement);

useIntersectionObserver(postRefs);

await postsStore.fetchPosts();

useImageClassification();

const getPostImage = (img) => {
  return img.photos[0]?.src.large ?? '';
}
</script>

<style scoped>
.emotion-tracking {
  width: 320px;
  height: 240px;
  position: sticky;
  left: 0;
  top: 96px;
  z-index: 999;
  border-radius: 8px;
}

.container {
  display: flex;
  justify-content: center;
  min-width: 100%;
}

.social-feed {
  margin: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  max-width: 768px;
  position: relative;
}

.feed-header {
  margin-bottom: 20px;
}

.post-container {
  display: grid;
  gap: 24px;
}

.post {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 24px;
}

.post-header {
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 10px;
}

.featured-image-container {
  overflow: hidden;
  display: flex;
  justify-content: center;
  position: relative;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stats-container {
  position: absolute;
  min-height: 120px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
}

.post-stats {
  width: 100%;
  border-collapse: collapse;
  color: #000;
  text-align: left;
}

.username {
  margin: 0;
}

.timestamp {
  margin: 0;
  font-size: 12px;
  color: #888;
}

.post-content {
  margin-bottom: 10px;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}

.action-button:hover {
  background-color: #0056b3;
}
</style>