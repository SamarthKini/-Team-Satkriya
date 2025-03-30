import Post from "@/types/posts.types";
import VerifiedPostProfile from "@/types/verifiedPostProfileInfo";

export interface PostArgu {
  content: string;
  images: File[];
  videos: File[];
  documents: File[];
  filters: string[];
  verified: VerifiedPostProfile[] | null;
}

export interface EditPostArgu {
  content: string;
  images: File[] | string[];
  videos: File[] | string[];
  documents: File[] | string[];
}

export type CreatePostType = (
  postData: PostArgu,
  firebaseDocument: "experts" | "farmers"
) => Promise<string | null>;

export type EditPostType = (
  postId: string,
  postOwnerId:string,
  updatedPostData: EditPostArgu,
  existingFilters: string[],
  firebaseDocument: "experts" | "farmers"
) => Promise<string | void>;

export type deletePostType = (
  postId: string,
  postOwnerId: string,
  firebaseDocument: "farmers" | "experts"
) => Promise<string | void>;

export type GetAllPostType = () => Promise<Post[]>;

export type GetFilteredPostType = (
  filters: string[],
  userType: string | null
) => Promise<Post[]>;

export type fetchPostByIdType = (id: string) => Promise<Post | null>;

export type GetYourPostType = () => Promise<Post[]>;
