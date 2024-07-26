function novelparse(srcInput, newLineModeInput, rubyModeInput, parenthesisInput) {
  /*

    # varinParenthesisle

  */
  // src
  let src = srcInput === undefined ? `` : srcInput
  // new line mode
  let newLineMode = newLineModeInput === undefined ? `normal` : newLineModeInput
  // ruby mode
  let rubyMode = rubyModeInput === undefined ? `parse` : rubyModeInput
  // parenthesis
  let parenthesis = parenthesisInput === undefined ? [[`「`, `」`], [`『`, `』`], [`（`, `）`]] : parenthesisInput
  // decide the value what is end of line
  let eols = {
    "n": (src.match(/(?<!\r)\n/g) || []).length,
    "r": (src.match(/\r(?!\n)/g) || []).length,
    "rn": (src.match(/\r\n/g) || []).length
  }
  let eol = eols.n >= eols.r ? eols.n >= eols.rn ? `\n` : `\r\n` : eols.r <= eols.rn ? `\r\n` : `\r`
  src = src.replace(/\r?\n|\r(?!\n)/g, eol)
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
    let parenthesisStart = parenthesis.map(rly => rly[0]).join(``)
    let reParenthesis0 = new RegExp(`^(?<![　 ])[${parenthesisStart}]`)
    if (newLineMode === `normal`) {
      return src
      .split(eol)
      .map(rly => rly.replace(/^(.+)$/, `<p>$1</p>`).replace(/^$/, `<p><br></p>`))
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
                work[i] = `${work[i].replace(/^[　 ]*/, "")}`
                // inParagraph = true
                i++
                fn()
              }
              /*
                the paragraph end, not start
              */
              else if (notLast && /^$/.test(work[i + 1])) {
                work[i] = `${work[i].replace(/^[　 ]*/, "")}</p>`
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
              if (notLast && parenthesisStart === `` && /^[　 ].*$/.test(work[i]) && /^[　 ].*$/.test(work[i + 1])) {
                work[i] = `${hol}<p>${work[i]}`
                inParagraph = true
                i++
                fn(parenthesisStart)
              }
              /*
                the paragraph start & end
              */
              else if (notLast && parenthesisStart === `` && /^[　 ].*$/.test(work[i]) && !/^[　 ].*$/.test(work[i + 1])) {
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
                else if (notLast && parenthesisStart === `` && /^[^　 ].*$/.test(work[i])) {
                  work[i] = `${hol}<p>${work[i]}</p>`
                  i++
                  fn()
                }
                  /*
                the parenthesis start, end
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
                the end of text
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
