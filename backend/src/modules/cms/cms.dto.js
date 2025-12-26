/**
 * CMS DTO
 * Data Transfer Objects for CMS responses
 */

const pageDTO = (page) => {
  if (!page) return null;

  return {
    id: page.publicId,
    title: page.title,
    slug: page.slug,
    excerpt: page.excerpt,
    content: page.content,
    featuredImage: page.featuredImage,
    author: page.author,
    status: page.status,
    publishedAt: page.publishedAt,
    seo: page.seo || {},
    sections: page.sections || [],
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
};

const pageListDTO = (pages) => {
  return pages.map(pageDTO);
};

const blogPostDTO = (post) => {
  if (!post) return null;

  return {
    id: post.publicId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    author: post.author,
    category: post.category,
    tags: post.tags || [],
    status: post.status,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    viewCount: post.viewCount,
    seo: post.seo || {},
    commentCount: post.comments ? post.comments.length : 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const blogPostDetailDTO = (post) => {
  return {
    ...blogPostDTO(post),
    comments: post.comments || [],
  };
};

const blogPostListDTO = (posts) => {
  return posts.map(blogPostDTO);
};

module.exports = {
  pageDTO,
  pageListDTO,
  blogPostDTO,
  blogPostDetailDTO,
  blogPostListDTO,
};
