export function decodeHtmlEntities(text) {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith('#x')) return String.fromCharCode(parseInt(entity.substring(2), 16));
    if (entity.startsWith('#')) return String.fromCharCode(parseInt(entity.substring(1), 10));
    const entities = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", nbsp: '\u00A0' };
    return entities[entity] || match;
  });
}