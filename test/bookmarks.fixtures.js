function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'Google',
      url: 'https://www.google.com',
      description: 'Dolor est minim est culpa nisi laboris aliquip quis in ipsum nulla.',
      rating: '5'
    },
    {
      id: 2,
      title: 'MMM',
      url: 'https://www.mrmoneymustache.com/',
      description: 'Dolor est minim est culpa nisi laboris aliquip quis in ipsum nulla.',
      rating: '4'
    },
    {
      id: 3,
      title: 'Mad Fientist',
      url: 'https://www.madfientist.com/',
      description: 'Dolor est minim est culpa nisi laboris aliquip quis in ipsum nulla.',
      rating: '4'
    },
    {
      id: 4,
      title: 'Portfolio Charts',
      url: 'https://portfoliocharts.com/',
      description: 'Dolor est minim est culpa nisi laboris aliquip quis in ipsum nulla.',
      rating: '5'
    },
    {
      id: 5,
      title: 'JL Collins',
      url: 'https://jlcollinsnh.com/',
      description: 'Dolor est minim est culpa nisi laboris aliquip quis in ipsum nulla.',
      rating: '3'
    },

  ];
}

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    url: 'http://somemaliciouswebsite.com',
    description: 'Naughty naughty very naughty <script>alert("xss");</script>',
    rating: 4
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    title: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    description: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}


module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark
}