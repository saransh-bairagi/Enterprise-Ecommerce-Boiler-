/**
 * DTO helpers for Review responses.
 */

function reviewDTO(review) {
  if (!review) return null;

  return {
    id: review._id || review.id,
    publicId: review.publicId,
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    title: review.title,
    content: review.content,
    images: review.images || [],
    verified: review.verified,
    helpful: review.helpful,
    unhelpful: review.unhelpful,
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function reviewsDTO(reviews = []) {
  return reviews.map(reviewDTO);
}

module.exports = {
  reviewDTO,
  reviewsDTO,
};
