/**
 * Utility function to generate unique keys for React components
 * This prevents the "Encountered two children with the same key" error
 * 
 * @param {any} item - The item being rendered (object, string, etc.)
 * @param {number} index - The index in the array
 * @param {string} prefix - Optional prefix for the key (e.g., 'anime-', 'character-')
 * @returns {string} A unique key string
 */
export const generateUniqueKey = (item, index, prefix = '') => {
  // Always include index to ensure uniqueness even with duplicate mal_ids or other identifiers
  if (item?.mal_id) return `${prefix}${item.mal_id}-${index}`
  if (item?.id) return `${prefix}${item.id}-${index}`
  if (item?.name) return `${prefix}${item.name.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  if (typeof item === 'string') return `${prefix}${item.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
  
  // Fallback for any other type of item
  return `${prefix}${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper function specifically for anime items
 * @param {Object} anime - Anime object with mal_id, id, or title
 * @param {number} index - Array index
 * @returns {string} Unique key for anime
 */
export const generateAnimeKey = (anime, index) => {
  return generateUniqueKey(anime, index, 'anime-')
}

/**
 * Helper function specifically for character items
 * @param {Object} character - Character object with mal_id, id, or name
 * @param {number} index - Array index
 * @returns {string} Unique key for character
 */
export const generateCharacterKey = (character, index) => {
  return generateUniqueKey(character, index, 'character-')
}

/**
 * Helper function for string arrays (genres, tags, studios)
 * @param {string} str - String value
 * @param {number} index - Array index
 * @param {string} type - Type of string (genre, tag, studio, etc.)
 * @returns {string} Unique key for string
 */
export const generateStringKey = (str, index, type = 'item') => {
  return generateUniqueKey(str, index, `${type}-`)
}

export default generateUniqueKey
