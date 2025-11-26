async function novelparse(input) {

  // src input
  let src = input.src === undefined ? `` : input.src

  // new line processing option
  let newLineMode = input.newLineMode === undefined ? `normal` : input.newLineMode

  // ruby processing option
  let rubyMode = input.rubyMode === undefined ? `parse` : input.rubyMode

  // parenthesis assignment option
  let parenthesis = input.parenthesis === undefined || `normal` ? [[`「`, `」`], [`『`, `』`], [`（`, `）`]] : input.parenthesis

  // parenthesises of begin
  let parenBgn = parenthesis.map(e => esc(e[0]))

  // parenthesises of end
  let parenEnd = parenthesis.map(e => esc(e[1]))

  // "#", "-", "+", "*", ":", "/", "\", "." line processing option
  let comment = input.comment === undefined ? `delete-together` : input.comment



  /*

    # execute
  
  */
  return (await procNewLine(procComment()).then(v => procRuby(v))).replace(/\r|\n/g, ``)



  /*

    # function

  */
  function procComment() {
    if (comment === `unprocessed` || (comment !== `unprocessed` && comment !== `delete-together`)) {
      return src
    }
    if (comment === `delete-together`) {
      return src

      // programing comment out
      .replace(/\/\*[\s\S]*?(\*\/|$)|\/\/.*(\r?\n|\r(?!\n))+/g, ``)

      // Markdown
      .replace(/^(#+ |[ \t]*[+*-] |[ \t]*\d+\. ).*(\r?\n|\r(?!\n))+/gm, ``)

      // YAML
      .replace(/^(?=.*(?!\\).:).*(\r?\n|\r(?!\n))+/gm, ``)

      // My comment format
      .replace(/^[ \t]*[./\\].*(\r?\n|\r(?!\n))+/gm, ``)
    }
  }



  async function procNewLine(src) {
    if (newLineMode === `normal`) {
      return normal()
    }
    if (newLineMode === `few`) {
      return few()
    }
    if (newLineMode === `alt`) {
      return alt()
    }
    if (newLineMode === `paper`) {
      return paper()
    }
    if (newLineMode === `raw` || (newLineMode !== `normal` && newLineMode !== `few` && newLineMode !== `alt` && newLineMode !== `paper`)) {
      return src
    }



    function normal() {
      return src
      .split(/\r?\n|\r(?!\n)/)
      .map(e => e.replace(/^([^\r\n]+)$/gm, `<p>$1</p>`).replace(/^$/gm, `<p><br></p>`))
      .join(`\n`)
    }



    function few() {
      return src

      // 文章の最初に段落を始める
      .replace(/^/, `<p>`)

      // 3個だけの改行を置換する
      .replace(new RegExp(`$(\\r?\\n|\\r(?!\\n)){2}(?!\\r?\\n|\\r(?!\\n))`, `gm`), `</p><p><br></p><p>`)

      // 前に括弧終わりがある改行を置換する
      .replace(new RegExp(`(${parenEnd.join(`|`)})(\\r?\\n|\\r(?!\\n))`, `g`), `$1</p><p>`)

      // 2個以上の改行を置換する
      .replace(/(\r?\n|\r(?!\n)){2,}/g, m => m.replace(/(\r?\n|\r(?!\n))/g, `<p><br></p>`))

      // 文章の終わりに段落を閉じる
      .replace(/(?!<\/p>)$/, `</p>`)
    }



    function alt() {
      return src

      // 文章の最初に段落を始める
      .replace(/^/, `<p>`)

      // 1個だけの改行を置換する
      .replace(new RegExp(`$(\\r?\\n|\\r(?!\\n))(?!\\r?\\n|\\r(?!\\n))`, `gm`), `</p><p><br></p><p>`)

      // 1個以上の改行を置換する
      .replace(/(\r?\n|\r(?!\n))+/g, m => m.replace(/(\r?\n|\r(?!\n))/g, `<p><br></p>`))

      // 文章の終わりに段落を閉じる
      .replace(/(?!<\/p>)$/, `</p>`)
    }



    function paper() {
      return src

      // 文章の最初に段落を始める
      .replace(/^/, `<p>`)

      // 前に括弧終わりが来ず、次に括弧始まりが来ない2個のみの改行を置換する
      .replace(new RegExp(`((?!\\r?\\n|\\r(?!\\r)|${parenEnd.join(`|`)}).)(\\r?\\n|\\r(?!\\n)){2}(?!\\r?\\n|\\r(?!\\n)|${parenBgn.join(`|`)})`, `gm`), `$1</p>\n<p>`)

      // 次に括弧始まりが来る2個のみの改行を置換する
      .replace(new RegExp(`$(\\r?\\n|\\r(?!\\n)){2}(?=${parenBgn.join(`|`)})`, `gm`), `</p>\n<p><br></p>\n<p>`)

      // 前に括弧閉じ、次に括弧始まりが来る1個のみの改行を置換する
      .replace(new RegExp(`(${parenEnd.join(`|`)})(\\r?\\n|\\r(?!\\n))(?=${parenBgn.join(`|`)})`, `g`), `$1</p>\n<p>`)

      // 前に括弧閉じが来る1個のみの改行を置換する
      .replace(new RegExp(`(${parenEnd.join(`|`)})(\\r?\\n|\\r(?!\\n))`, `g`), `$1</p>\n<p><br></p>\n<p>`)

      // 文章の終わりに段落を閉じる
      .replace(/(?!<\/p>)$/, `</p>`)
    }
  }



  /*

    ruby mode

  */
  function procRuby(src) {
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



  /*

    escape

  */
  function esc(r) {
    if (typeof r === "string" || r instanceof String) return p(r)
    else if (Array.isArray(r)) return r.map(r => p(r))
    else return r
    function p(r) {
      return r.replace(/(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "\\$1")
    }
  }



  function unEsc(r) {
    if (typeof r === "string" || r instanceof String) return p(r)
    else if (Array.isArray(r)) return r.map(r => p(r))
    else return r
    function p(r) {
      return r.replace(/\\(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "$1")
    }
  }
}
