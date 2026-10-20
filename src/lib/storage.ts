/** Photos are stored in the database and served by the /api/images/[id] route. */
export function imageUrl(imageId: string): string {
  return `/api/images/${imageId}`;
}
