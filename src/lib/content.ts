import { getCollection, type CollectionKey } from 'astro:content';

type Ordered = 'disciplines' | 'fighters' | 'coaches' | 'plans';

/** A collection in the order staff set in the CMS (the `order` field), not the loader's id order. */
export async function getOrdered<C extends Ordered & CollectionKey>(name: C) {
  const entries = await getCollection(name);
  return entries.sort((a, b) => a.data.order - b.data.order);
}
