function novelparse(input) {
  /*

    # varinParenthesisle

  */
  // src
  let src = input.src === undefined ? `` : input.src
  // new line treatment
  let newLineMode = input.newLineMode === undefined ? `normal` : input.newLineMode
  // ruby treatment
  let rubyMode = input.rubyMode === undefined ? `parse` : input.rubyMode
  // parenthesis
  let parenthesis = input.parenthesis === undefined || `normal` ? [[`「`, `」`], [`『`, `』`], [`（`, `）`]] : input.parenthesis
  // "#" line treatment
  let comment = input.comment === undefined ? `delete-together` : input.comment
  // decide the value what is end of line
  let eols = {
    "n": (src.match(/(?<!\r)\n/g) || []).length,
    "r": (src.match(/\r(?!\n)/g) || []).length,
    "rn": (src.match(/\r\n/g) || []).length
  }
  let eol = eols.n >= eols.r ? eols.n >= eols.rn ? `\n` : `\r\n` : eols.r <= eols.rn ? `\r\n` : `\r`
  /*

    # execute
  
  */
  return procNewLine(procComment(src))
  .then(rly => procRuby(rly))
  /*

    # function

  */
  function procComment(src) {
    if (comment === `unprocessed` || (comment !== `unprocessed` && comment !== `delete-together`)) {
      return src
      .split(/\r?\n|\r(?!\n)/)
    }
    if (comment === `delete-together`) {
      return src
      .replace(/\/\*[\s\S]*?(\*\/|$)/g, ``)
      .split(/\r?\n|\r(?!\n)/)
      .filter(e => !/^#+ |^[ \t]*[\-+*] |^[ \t]*\d+\. |^\/\//.test(e))
    }
  }
  async function procNewLine(src) {
    let parenthesisStart = parenthesis.map(rly => rly[0]).join(``)
    let reParenthesis0 = new RegExp(`^(?<![　 ])[${parenthesisStart}]`)
    if (newLineMode === `normal`) {
      return src
      .map(rly => rly.replace(/^(.+)$/, `<p>$1</p>`).replace(/^$/, `<p><br></p>`))
    }
    if (newLineMode === `few`) {
      return procFew(src)
    }
    if (newLineMode === `raw` || (newLineMode !== `normal` && newLineMode !== `few`)) {
      return src
    }
    async function procFew(work) {
      return new Promise(resolve => {
        let i = 0
        let inParagraph = false // in the paragraph
        let inParenthesis = false // in the parenthesis
        fn()
        function fn(parenthesisStartInherited) {
          let hol = i !== 0 ? eol : `` // head of line
          let parenthesisStart = parenthesisStartInherited !== undefined ? parenthesisStartInherited : reParenthesis0.test(work[i]) ? work[i].match(reParenthesis0)[0] : ``
          let parenthesisEnd = parenthesisStart !== `` ? parenthesis.filter(rly => rly[0] === parenthesisStart)[0][1] : ``
          let reParenthesisStart = new RegExp(`^${parenthesisStart}`)
          let reParenthesisEnd = new RegExp(`${parenthesisEnd}$`)
          if (i !== work.length - 1) {
            proc(true)
          }
          else {
            proc(false)
          }
          function proc(notLast) {
            /*
             #### ##    ##    ########  ########   ######                 ##    ##  #######     ########  ########  ##    ## 
              ##  ###   ##    ##     ## ##     ## ##    ##                ###   ## ##     ##    ##     ## ##     ## ###   ## 
              ##  ####  ##    ##     ## ##     ## ##                      ####  ## ##     ##    ##     ## ##     ## ####  ## 
              ##  ## ## ##    ########  ########  ##   ####    #######    ## ## ## ##     ##    ########  ########  ## ## ## 
              ##  ##  ####    ##        ##   ##   ##    ##                ##  #### ##     ##    ##        ##   ##   ##  #### 
              ##  ##   ###    ##        ##    ##  ##    ##                ##   ### ##     ##    ##        ##    ##  ##   ### 
             #### ##    ##    ##        ##     ##  ######                 ##    ##  #######     ##        ##     ## ##    ## 
            */
            if (inParagraph && !inParenthesis) {
              /*
                the paragraph continue
              */
              if (notLast && /^.+$/.test(work[i + 1])) {
                work[i] = work[i].replace(/^[　 ]*/, ``)
                // inParagraph = true
                i++
                fn()
              }
              /*
                the paragraph end, not start
              */
              else if (notLast && /^$/.test(work[i + 1])) {
                work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
                inParagraph = false
                i++
                fn()
              }
              /*
                the end of text
              */
              else if (!notLast) {
                work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
                resolve(work)
              }
              else {
                i++
                fn()
              }
            }
            /*
             ##    ##  #######     ########  ########   ######                 ##    ##  #######     ########  ########  ##    ## 
             ###   ## ##     ##    ##     ## ##     ## ##    ##                ###   ## ##     ##    ##     ## ##     ## ###   ## 
             ####  ## ##     ##    ##     ## ##     ## ##                      ####  ## ##     ##    ##     ## ##     ## ####  ## 
             ## ## ## ##     ##    ########  ########  ##   ####    #######    ## ## ## ##     ##    ########  ########  ## ## ## 
             ##  #### ##     ##    ##        ##   ##   ##    ##                ##  #### ##     ##    ##        ##   ##   ##  #### 
             ##   ### ##     ##    ##        ##    ##  ##    ##                ##   ### ##     ##    ##        ##    ##  ##   ### 
             ##    ##  #######     ##        ##     ##  ######                 ##    ##  #######     ##        ##     ## ##    ## 
            */
            else if (!inParagraph && !inParenthesis) {
              /*
                the paragraph start, not end
              */
              if (notLast && parenthesisStart === `` && /^(?<!\\)[　 ].*$/.test(work[i]) && /^(?<!\\)[　 ].*$/.test(work[i + 1])) {
                work[i] = `${hol}<p>${work[i]}`
                inParagraph = true
                i++
                fn(parenthesisStart)
              }
              /*
                the paragraph start & end
              */
              else if (notLast && parenthesisStart === `` && /^(?<!\\)[　 ].*$/.test(work[i]) && !/^(?<!\\)[　 ].*$/.test(work[i + 1])) {
                work[i] = `${hol}<p>${work[i]}</p>`
                // inParagraph = true & false
                i++
                fn()
              }
              /*
                not the paragraph, and nobody exists
              */
                else if (notLast && parenthesisStart === `` && /^$/.test(work[i])) {
                  work[i] = `${hol}<p><br></p>`
                  i++
                  fn()
                }
              /*
                not the paragraph, but anything exitsts
              */
                else if (notLast && parenthesisStart === `` && /^([^　 ]|(?<=\\)[　 ]).*$/.test(work[i])) {
                  work[i] = `${hol}<p>${work[i].replace(/^\\/, ``)}</p>`
                  i++
                  fn()
                }
                  /*
                the parenthesis start & end
              */
              else if (notLast && parenthesisStart !== `` && !/^$/.test(work[i]) && work[i].search(reParenthesisStart) < work[i].search(reParenthesisEnd)) {
                work[i] = `${hol}<p>${work[i]}</p>`
                // inParenthesis = true & false
                i++
                fn()
              }
              /*
                the parenthesis start, not end
              */
              else if (notLast && parenthesisStart !== `` && !/^$/.test(work[i]) && work[i].search(reParenthesisStart) >= work[i].search(reParenthesisEnd)) {
                work[i] = `${hol}<p>${work[i]}`
                inParenthesis = true
                i++
                fn(parenthesisStart)
              }
              /*
                the end of the text
              */
              else if (!notLast) {
                work[i] = `<p>${work[i].replace(/^[　 ]*/, ``).replace(/^$/, `<br>`)}</p>`
                resolve(work)
              }
              else {
                console.log(`想定外の入力がありました`)
                i++
                fn()
              }
            }
            /*
             ##    ##    ########  ########   ######                 #### ##    ##    ########  ########  ##    ## 
             ###   ##    ##     ## ##     ## ##    ##                 ##  ###   ##    ##     ## ##     ## ###   ## 
             ####  ##    ##     ## ##     ## ##                       ##  ####  ##    ##     ## ##     ## ####  ## 
             ## ## ##    ########  ########  ##   ####    #######     ##  ## ## ##    ########  ########  ## ## ## 
             ##  ####    ##        ##   ##   ##    ##                 ##  ##  ####    ##        ##   ##   ##  #### 
             ##   ###    ##        ##    ##  ##    ##                 ##  ##   ###    ##        ##    ##  ##   ### 
             ##    ##    ##        ##     ##  ######                 #### ##    ##    ##        ##     ## ##    ## 
            */
            else if (!inParagraph && inParenthesis) {
              /*
                the parenthesis end
              */
              if (notLast && parenthesisStart !== `` && !reParenthesisStart.test(work[i]) && reParenthesisEnd.test(work[i])) {
                work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
                inParenthesis = false
                i++
                fn()
              }
              /*
                the parenthesis continue
              */
              if (notLast && parenthesisStart !== `` && !reParenthesisStart.test(work[i]) && !reParenthesisEnd.test(work[i])) {
                work[i] = `${work[i].replace(/^[　 ]*/, ``)}`
                // inParenthesis = true
                i++
                fn(parenthesisStart)
              }
              /*
                the end of text
              */
              if (!notLast) {
                work[i] = `${work[i].replace(/^[　 ]*/, ``)}</p>`
                resolve(work)
              }
            }
            else {
            /*
             ######## ##        ######  ######## 
             ##       ##       ##    ## ##       
             ##       ##       ##       ##       
             ######   ##        ######  ######   
             ##       ##             ## ##       
             ##       ##       ##    ## ##       
             ######## ########  ######  ######## 
            */
              console.log(`想定外の入力がありました`)
              i++
              fn()
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
    src = src
    .join(``)
    if (rubyMode === "parse") {
      return src
      .replace(/[|｜](.+?)《(.+?)》/g, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)《(.+?)》/ug, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)\(((\p{scx=Hira}|\p{scx=Kana})+)\)/ug, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)（((\p{scx=Hira}|\p{scx=Kana})+)）/ug, `<ruby>$1<rt>$2</rt></ruby>`)
      .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
      .replace(/#(.+?)__(.+?)__#/g, `<ruby>$1<rt>$2</rt></ruby>`)
    }
    if (rubyMode === "open") {
      return src
      .replace(/[|｜].+?《(.+?)》/g, `$1`)
      .replace(/(?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+《(.+?)》/ug, `$1`)
      .replace(/(?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+\(((\p{scx=Hira}|\p{scx=Kana})+)\)/ug, `$1`)
      .replace(/(?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+（((\p{scx=Hira}|\p{scx=Kana})+)）/ug, `$1`)
      .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
      .replace(/#.+?__(.+?)__#/g, `$1`)
    }
    if (rubyMode === "delete") {
      return src
      .replace(/[|｜](.+?)《(.+?)》/g, `$1`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)《(.+?)》/g, `$1`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)\(((\p{scx=Hira}|\p{scx=Kana})+)\)/ug, `$1`)
      .replace(/((?![〜、。〈〉《》「」『』【】〔〕〖〗〘〙〃〆・〓])\p{scx=Han}+)（((\p{scx=Hira}|\p{scx=Kana})+)）/ug, `$1`)
      .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
      .replace(/#(.+?)__(.+?)__#/g, `$1`)
    }
    if (rubyMode === "raw") {
      return src
    }
  }
}
