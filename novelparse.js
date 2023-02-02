function novelparse(src, newLineMode) {
  let eol = ""
  let work = src
  let newlineRn = src.match(/\r\n/)
  let newlineN = src.match(/(?<!\r)\n/)
  if (newlineRn && newlineN && newlineRn.length > newlineN.length) {
    eol = "\r\n"
    work.replace(/\r?\n/g, eol)
  }
  else {
    eol = "\n"
    work.replace(/\r?\n/g, eol)
  }
  let rx0 = new RegExp(`${eol}+`, "g")
  work = work
  .replace(/[|｜](.+?)《(.+?)》/g, `<ruby>$1<rt>$2</rt></ruby>`)
  .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>')
  .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)\(([\u3040-\u309F\u30A0-\u30FF]+?)\)/g, '<ruby>$1<rt>$2</rt></ruby>')
  .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)（([\u3040-\u309F\u30A0-\u30FF]+?)）/g, '<ruby>$1<rt>$2</rt></ruby>')
  .replace(/[|｜](.*?)[|｜]《(.*?)》/g, `$1《$2》`)
  .replace(/[|｜]《(.*?)》/g, '《$1》')
  .replace(/[|｜]\((.*?)\)/g, '($1)')
  .replace(/[|｜]（(.*?)）/g, '（$1）')
  .replace(/#(.*?)__(.*?)__#/g, `<ruby>$1<rt>$2</rt></ruby>`)
  if (newLineMode === "few") {
    work = work
    .replace(rx0, rly => {
        return rly.replace(eol, ``)
    })
  }
  return work
  .split(eol)
  .map(rly => {
    if (/^$/.test(rly)) {
      return `<p><br></p>`
    }
    else {
      return `<p>${rly}</p>`
    }
  })
  .join(eol)
}
