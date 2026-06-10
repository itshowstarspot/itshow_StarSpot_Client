let pending = null

export const setPendingReview = (placeId, photoSrc) => { pending = { placeId, photoSrc } }
export const getPendingReview = () => pending
export const clearPendingReview = () => { pending = null }
