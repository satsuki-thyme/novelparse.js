function novelparse(srcInput, newLineModeInput, rubyModeInput, parenthesisInput) {
  /*

    # varinPrntle

  */
  // src
  let src = srcInput === undefined ? "" : srcInput
  // new line mode
  let newLineMode = newLineModeInput === undefined ? "normal" : newLineModeInput
  // ruby mode
  let rubyMode = rubyModeInput === undefined ? "parse" : rubyModeInput
  // parenthesis
  let parenthesis = parenthesisInput === undefined ? [["「", "」"], ["『", "』"], ["（", "）"]] : parenthesisInput
  // decide the value what is end of line
  let eol = ""
  let newlineRn = src.match(/\r\n/)
  let newlineN = src.match(/(?<!\r)\n/)
  if (newlineRn && newlineN && newlineRn.length > newlineN.length) {
    eol = "\r\n"
    src.replace(/\r?\n/g, eol)
  }
  else {
    eol = "\n"
    src.replace(/\r?\n/g, eol)
  }
  /*

    execute
  
  */
  return procNewLine(src)
  .then(rly => {return procRuby(rly.join(``))})
  /*

    # function

  */
  /*
    ## new line mode
  */
  async function procNewLine(src) {
    let prntStart = parenthesis.map(rly => rly = rly[0]).join(``)
    let prntEnd = parenthesis.map(rly => rly = rly[1]).join(``)
    let rxPrnt0 = new RegExp(`[${prntStart}]`)
    let rxPrnt1 = new RegExp(`[${prntEnd}]`)
    if (newLineMode === `normal`) {
      return src
      .split(eol)
      .map(rly => rly = rly.replace(/^(.+)$/, `<p>$1</p>`).replace(/^$/, `<p><br></p>`))
    }
    if (newLineMode === `few`) {
      return procFew(src.split(eol))
    }
    if (newLineMode !== `normal` && newLineMode !== `few`) {
      return src.split(eol)
    }
    async function procFew(work) {
      return new Promise(resolve => {
        let i = 0
        let inPrgr = false // in the paragraph
        let inPrnt = false // in the parenthesis
        let notLast = true
        fn()
        function fn(prnt1stStartInherited) {
          let hol = i !== 0 ? eol : `` // head of line
          let prnt1stStart = prnt1stStartInherited !== undefined ? prnt1stStartInherited : rxPrnt0.test(work[i]) ? work[i].match(rxPrnt0)[0] : ``
          let prnt1stEnd = prnt1stStart !== `` ? parenthesis.filter(rly => rly[0] === prnt1stStart)[0][1] : ``
          let rxPrnt1stStart = new RegExp(`${prnt1stStart}`)
          let rxPrnt1stEnd = new RegExp(`${prnt1stEnd}`)
          if (i === work.length - 1) {
            notLast = false
          }
          /*

            in the paragraph

          */
          if (inPrgr && !inPrnt) {
            /*
              the paragraph continue
            */
            if (notLast && /^[　 ]*.+$/.test(work[i + 1])) {
              work[i] = `${work[i].replace(/^[　 ]*/, "")}`
              // inPrgr = true
              i++
              fn()
            }
            /*
              the paragraph end, not start
            */
            if (notLast && /^$/.test(work[i + 1])) {
              work[i] = `${work[i].replace(/^[　 ]*/, "")}</p>`
              inPrgr = false
              i++
              fn()
            }
            /*
              the end of text
            */
            if (!notLast) {
              work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
              resolve(work)
            }
          }
          /*

            not in the paragraph, not in the parenthesis

          */
          if (!inPrgr && !inPrnt) {
            /*
              the paragraph start, not end
            */
            if (notLast && prnt1stStart === `` && !/^$/.test(work[i]) && /^　/.test(work[i + 1])) {
              work[i] = `${hol}<p>${work[i]}`
              inPrgr = true
              i++
              fn(prnt1stStart)
            }
            /*
              the paragraph start, end
            */
            if (notLast && prnt1stStart === `` && !/^$/.test(work[i]) && /^$/.test(work[i + 1])) {
              work[i] = `${hol}<p>${work[i]}</p>`
              // inPrgr = true & false
              i++
              fn()
            }
            /*
              mon paragraph
            */
            if (notLast && prnt1stStart === `` && /^$/.test(work[i])) {
              work[i] = `${hol}<p><br></p>`
              i++
              fn()
            }
            /*
              the parenthesis start, end
            */
            if (notLast && prnt1stStart !== `` && !/^$/.test(work[i]) && work[i].search(rxPrnt1stStart) < work[i].search(rxPrnt1stEnd)) {
              work[i] = `${hol}<p>${work[i]}</p>`
              // inPrnt = true & false
              i++
              fn()
            }
            /*
              the parenthesis start, not end
            */
            if (notLast && prnt1stStart !== `` && !/^$/.test(work[i]) && work[i].search(rxPrnt1stStart) >= work[i].search(rxPrnt1stEnd)) {
              work[i] = `${hol}<p>${work[i]}`
              inPrnt = true
              i++
              fn(prnt1stStart)
            }
            /*
              the end of text
            */
            if (!notLast) {
              work[i] = `<p>${work[i].replace(/^[　 ]*/, ``).replace(/^$/, `<br>`)}</p>`
              resolve(work)
            }
          }
          /*

            in the parenthesis

          */
          if (!inPrgr && inPrnt) {
            /*
              the parenthesis end, not start
            */
            if (notLast && prnt1stStart !== `` && work[i].search(rxPrnt1stStart) < work[i].search(rxPrnt1stEnd)) {
              work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
              inPrnt = false
              i++
              fn()
            }
            /*
              the parenthesis continue
            */
            if (notLast && prnt1stStart !== `` && work[i].search(rxPrnt1stStart) < 0 && work[i].search(rxPrnt1stEnd) < 0) {
              work[i] = `${work[i].replace(/^[　 ]*/, ``)}`
              // inPrnt = true
              i++
              fn(prnt1stStart)
            }
            /*
              the end of text
            */
            if (!notLast) {
              work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
              resolve(work)
            }
          }
        }
      })
    }
  }
  /*
    ## ruby mode
  */
  function procRuby(src) {
    if (rubyMode === "parse") {
      return src
      .replace(/[|｜](.+?)《(.+?)》/g, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)《(.+?)》/g, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)\(([\u3040-\u309F\u30A0-\u30FF]+?)\)/g, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)（([\u3040-\u309F\u30A0-\u30FF]+?)）/g, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
      .replace(/#(.+?)__(.+?)__#/g, `<ruby>$1<rt>$2</rt></ruby>`)
    }
    if (rubyMode === "delete") {
      return src
      .replace(/[|｜](.+?)《(.+?)》/g, `$1`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)《(.+?)》/g, `$1`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)\(([\u3040-\u309F\u30A0-\u30FF]+?)\)/g, `$1`)
      .replace(/([々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]+)（([\u3040-\u309F\u30A0-\u30FF]+?)）/g, `$1`)
      .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
      .replace(/#(.+?)__(.+?)__#/g, `$1`)
    }
    if (rubyMode === "raw") {
      return src
    }
  }
}
