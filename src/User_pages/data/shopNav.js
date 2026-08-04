/** Shared shop navigation links — category names/images come from useShopCategories / shopCategories.js */

export const SHOP_QUICK_LINKS = [
  { label: 'All jewellery', to: '/shop' },
  { label: 'New arrivals', to: '/shop?sort=latest' },
  { label: 'Bridal edit', to: '/shop?category=Bridal%20Set' },
  { label: 'Contact', to: '/contact' },
]

export function categoryCollectionHref(name) {
  return `/shop?category=${encodeURIComponent(name)}`
}
