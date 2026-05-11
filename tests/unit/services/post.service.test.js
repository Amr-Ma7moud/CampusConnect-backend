import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const postRepo = {
    createPost: jest.fn(),
    linkPostToEvent: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    insertComment: jest.fn(),
    getCommentsByPostId: jest.fn(),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    getAllPosts: jest.fn(),
    getPostWithAggregates: jest.fn(),
    getPostsByEventId: jest.fn(),
    deletePost: jest.fn(),
};
const userService = {};

jest.unstable_mockModule('../../../src/repositories/post.repository.js', () => ({ default: postRepo }));
jest.unstable_mockModule('../../../src/services/user.service.js', () => ({ default: userService }));

const { default: postService } = await import('../../../src/services/post.service.js');

describe('PostService.createPost', () => {
    beforeEach(() => Object.values(postRepo).forEach((fn) => fn.mockReset()));

    test('creates post without event link when no event_id', async () => {
        postRepo.createPost.mockResolvedValue(10);
        const id = await postService.createPost({ content: 'hi', club_id: 1 });
        expect(id).toBe(10);
        expect(postRepo.linkPostToEvent).not.toHaveBeenCalled();
    });

    test('links post to event when event_id provided', async () => {
        postRepo.createPost.mockResolvedValue(11);
        await postService.createPost({ content: 'hi', club_id: 1, event_id: 42 });
        expect(postRepo.linkPostToEvent).toHaveBeenCalledWith(11, 42);
    });
});

describe('PostService.checkIfPostBelongsToClub', () => {
    beforeEach(() => Object.values(postRepo).forEach((fn) => fn.mockReset()));

    test('returns true when club_id matches', async () => {
        postRepo.getPostById.mockResolvedValue({ post_id: 1, club_id: 3 });
        expect(await postService.checkIfPostBelongsToClub(1, 3)).toBe(true);
    });

    test('returns falsy when no post', async () => {
        postRepo.getPostById.mockResolvedValue(null);
        expect(await postService.checkIfPostBelongsToClub(1, 3)).toBeFalsy();
    });
});

describe('PostService.getPostDetails', () => {
    beforeEach(() => Object.values(postRepo).forEach((fn) => fn.mockReset()));

    test('throws when post not found', async () => {
        postRepo.getPostWithAggregates.mockResolvedValue(null);
        postRepo.getCommentsByPostId.mockResolvedValue([]);
        await expect(postService.getPostDetails(1, 2)).rejects.toThrow('Post not found');
    });

    test('returns normalized post + comments', async () => {
        postRepo.getPostWithAggregates.mockResolvedValue({
            post_id: '1', club_id: '2', event_id: '3', content: 'c', image_url: null,
            created_at: '2030', like_count: '5', comment_count: '1', is_liked: 1
        });
        postRepo.getCommentsByPostId.mockResolvedValue([{ content: 'x' }]);
        const r = await postService.getPostDetails(1, 2);
        expect(r).toMatchObject({ post_id: 1, club_id: 2, event_id: 3, like_count: 5, is_liked: true });
        expect(r.comments).toHaveLength(1);
    });
});
