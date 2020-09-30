const brands = ['ploom', 'iqos', 'glo']
const sources = ['youtube', 'instagram']

const instagramSelectors = {
  rows: 'div[style*="width: 860px; height: 3"]',
  header: '#socialblade-user-content > div:nth-child(3) > h2',
  date: 'div[style="width: 80px; float: left;"]',
  subscribers: 'div[style="width: 120px; float: left;"]',
  mediaUploads: '#YouTubeUserTopInfoBlock > div:nth-child(2) > span:nth-child(3)',
  engagementRate: '#YouTubeUserTopInfoBlock > div:nth-child(5) > span:nth-child(4)',
  likes: '#YouTubeUserTopInfoBlock > div:nth-child(6) > span:nth-child(3)',
  comments: '#YouTubeUserTopInfoBlock > div:nth-child(7) > span:nth-child(3)',
}

const youtubeSelectors = {
  rows: 'div[style*="width: 860px; height: 3"]',
  header: '#socialblade-user-content > div:nth-child(1) > div:nth-child(3) > h2',
  date: 'div[style="float: left; width: 95px;"]',
  subscribers: '#YouTubeUserTopInfoBlock > div:nth-child(3) > span:nth-child(3)',
  videoViews: 'div:nth-child(4) > div:nth-child(2)',
}

// Extract source from location.
const source = sources.find((source) => window.location.pathname.toLowerCase().includes(source))

/**
 * Extension entry point.
 * Check current `source`, extract all data.
 * Copy result JSON to buffer.
 */
;(function main() {
  let rows
  let header

  if (source === 'instagram') {
    rows = document.querySelectorAll(instagramSelectors.rows)
    header = document.querySelector(instagramSelectors.header)
  } else {
    rows = document.querySelectorAll(youtubeSelectors.rows)
    header = document.querySelector(youtubeSelectors.header)
  }

  // Make copy to buffer.
  copy(JSON.stringify(getData(rows, header)))
})()

/**
 * Extract data from table depends on `source`.
 * @param rows List with table rows selectors.
 * @param header SocialBlade block with info about source.
 * @return {[]} List with scraped objects from page.
 */
function getData(rows, header) {
  const results = []

  // Get SocialBlade data.
  for (const row of rows) {
    if (source === 'instagram') {
      results.push({
        ...getInstagramData(row, header),
      })
    }

    if (source === 'youtube') {
      results.push({
        ...getYoutubeData(row, header),
      })
    }
  }

  console.log(results)

  return results
}

/**
 * Extract data for SocialBlade Instagram source.
 * @param row Table row selector.
 * @param header SocialBlade block with info about source.
 * @return {Object} Object with scraped data.
 */
function getInstagramData(row, header) {
  const date = row.querySelector(instagramSelectors.date).textContent

  // Clean up subscribers count.
  const rawSubscribers = row.querySelector(instagramSelectors.subscribers).textContent.trim()
  const intSubscribers = +rawSubscribers.replace(',', '')

  const currentBrand = brands.find((brand) => header.textContent.toLowerCase().includes(brand))

  const mediaUploads = +document.querySelector(instagramSelectors.mediaUploads).textContent

  // Clean up engagement.
  const rawEngagement = document.querySelector(instagramSelectors.engagementRate).textContent.trim()
  const intEngagementRate = +rawEngagement.replace('%', '')

  const avgLikes = +document.querySelector(instagramSelectors.likes).textContent

  const avgComments = +document.querySelector(instagramSelectors.comments).textContent

  return {
    date: toTimestamp(date),
    subscribers: intSubscribers,
    brand: currentBrand,
    mediaUploads,
    engagement: intEngagementRate,
    likes: avgLikes,
    comments: avgComments,
    source,
  }
}

/**
 * Extract data for YouTube Instagram source.
 * @param row Table row selector.
 * @param header SocialBlade block with info about source.
 * @return {Object} Object with scraped data.
 */
function getYoutubeData(row, header) {
  const date = row.querySelector(youtubeSelectors.date).textContent

  const currentBrand = brands.find((brand) => header.textContent.toLowerCase().includes(brand))

  // Clean up views.
  const rawVideoViews = row.querySelector(youtubeSelectors.videoViews).textContent
  const intVideoViews = rawVideoViews.replace(',', '')

  // Clean up subscribers count.
  const rawSubscribers = document.querySelector(youtubeSelectors.subscribers).textContent.trim()
  const intSubscribers = rawSubscribers.replace('K', '')

  return {
    date: toTimestamp(date),
    subscribers: Math.ceil(parseFloat(intSubscribers) * 1000),
    brand: currentBrand,
    videoViews: intVideoViews,
    source,
  }
}

/**
 * Convert scraped (str) date to numeric timestamp format.
 * By default convert to milliseconds, but we need in seconds.
 * So it need divide by 1000.
 * @param strDate Raw date string from page.
 * @return {number} Date in timestamp format in seconds.
 */
function toTimestamp(strDate) {
  const dateObj = Date.parse(strDate)
  return dateObj / 1000
}

/**
 * Provide ability to copy data to buffer.
 * @param text JSON object for copy.
 * @return {boolean}
 */
function copy(text) {
  const input = document.createElement('textarea')
  input.innerHTML = text
  document.body.appendChild(input)
  input.select()

  const result = document.execCommand('copy')
  document.body.removeChild(input)

  return result
}
