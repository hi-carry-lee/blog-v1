export interface EmbeddingGenerateEvent {
  name: "post/embedding.generate";
  data: {
    postId: string;
  };
}
