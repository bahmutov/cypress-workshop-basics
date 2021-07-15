/**
 * The image urls pointing at local relative files
 * should be updated to be served from the full base URL.
 *
 * @param {String} baseUrl The URL of the server
 * @param {String} md The markdown text
 */
export const updateRelativeUrls = (baseUrl, md) => {
  // only update the relative link urls
  // in the form [...](./some/path/to/file.jpg)
  return md.replace(/]\(\.\//g, '](' + baseUrl)
}
