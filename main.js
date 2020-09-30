const brands = ['ploom', 'iqos', 'glo']
const sources = ['youtube', 'instagram']

const instagramSelectors = {
  rows: 'div[style*="width: 860px; height: 3"]',
  header: '#socialblade-user-content > div:nth-child(3) > h2',
  date: 'div[style="width: 80px; float: left;"]',
  historySubscribers: 'div[style="width: 120px; float: left;"]',
  summarySubscribers: '#YouTubeUserTopInfoBlock > div:nth-child(3) > span:nth-child(3)',
  summaryMediaUploads: '#YouTubeUserTopInfoBlock > div:nth-child(2) > span:nth-child(3)',
  historyMediaUploads: 'div:nth-child(4) > div:nth-child(2)',
  engagementRate: '#YouTubeUserTopInfoBlock > div:nth-child(5) > span:nth-child(4)',
  likes: '#YouTubeUserTopInfoBlock > div:nth-child(6) > span:nth-child(3)',
  comments: '#YouTubeUserTopInfoBlock > div:nth-child(7) > span:nth-child(3)',
  handle: '#YouTubeUserTopInfoBlockTop > div:nth-child(1) > h2 > a',
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
 * @return {{history: *[], statSummary: {}}}
 * List with scraped objects from page.
 */
function getData(rows, header) {
  const historyData = []

  // Get SocialBlade data.
  if (source === 'youtube') {
    for (const row of rows) {
      historyData.push({
        ...getYoutubeData(row, header),
      })
    }

    console.log({
      history: [...historyData],
      statSummary: {},
    })

    return {
      history: [...historyData],
      statSummary: {},
    }
  }

  if (source === 'instagram') {
    for (const row of rows) {
      historyData.push({
        ...getInstagramHistoryData(row, header),
      })
    }

    console.log({
      history: [...historyData],
      statSummary: { ...getInstagramSummary() },
    })

    return {
      history: [...historyData],
      statSummary: { ...getInstagramSummary() },
    }
  }
}

/**
 * Extract history data for SocialBlade Instagram source.
 * @param row Table row selector.
 * @param header SocialBlade block with info about source.
 * @return {Object} Object with scraped data.
 */
function getInstagramHistoryData(row, header) {
  const date = row.querySelector(instagramSelectors.date).textContent

  // Clean up subscribers count.
  const rawSubscribers = row.querySelector(instagramSelectors.historySubscribers).textContent.trim()
  const intSubscribers = +rawSubscribers.replace(',', '')

  const currentBrand = brands.find((brand) => header.textContent.toLowerCase().includes(brand))

  const mediaUploads = +row.querySelector(instagramSelectors.historyMediaUploads).textContent

  // Clean up engagement.
  const rawEngagement = document.querySelector(instagramSelectors.engagementRate).textContent.trim()
  const intEngagementRate = +rawEngagement.replace('%', '')

  const avgLikes = +document.querySelector(instagramSelectors.likes).textContent

  const avgComments = +document.querySelector(instagramSelectors.comments).textContent

  const handle = document.querySelector(instagramSelectors.handle).textContent

  return {
    brand: currentBrand,
    comments: avgComments,
    date: toTimestamp(date),
    engagement: intEngagementRate,
    handle,
    likes: avgLikes,
    mediaUploads,
    source,
    followers: intSubscribers,
    type: 'history',
  }
}

/**
 * Extract summary data for SocialBlade Instagram source.
 * @return {Object} Object with Instagram summary data.
 */
function getInstagramSummary() {
  // Clean up subscribers count.
  const rawSubscribers = document.querySelector(instagramSelectors.summarySubscribers).textContent
  const intSubscribers = +rawSubscribers.trim().replace(',', '')

  const mediaUploads = +document.querySelector(instagramSelectors.summaryMediaUploads).textContent

  return {
    date: toTimestamp(new Date().toISOString().slice(0, 10)),
    followers: intSubscribers,
    media: mediaUploads,
  }
}

/**
 * Extract history data for YouTube Instagram source.
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

  const handleRegexp = /\/channel\/(.+?)\/monthly/
  const handle = window.location.pathname.match(handleRegexp)[1]

  return {
    brand: currentBrand,
    date: toTimestamp(date),
    handle,
    type: 'history',
    source,
    subscribers: Math.ceil(parseFloat(intSubscribers) * 1000),
    videoViews: intVideoViews,
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
