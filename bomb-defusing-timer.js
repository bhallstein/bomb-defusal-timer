import figlet from 'figlet'
import { spawn } from 'node:child_process'
import {argv, exit, stdout} from 'node:process'

const OneDay = 24 * 3600
const Fonts = {
  plain: 'Colossal',
  bright: 'Electronic',
  sinister: 'Gothic',
}


function print_error_and_exit(err) {
  console.error(err)
  exit(1)
}


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


function format_countdown_component(x) {
  return x < 10 ? `0${x}` : x
}


function format_countdown(duration, t_remaining) {
  if (duration >= OneDay) {
    print_error_and_exit(`Maximum number of seconds is ${OneDay - 1}`)
  }

  // Establish format
  const format = duration > 3600 ? 'h:m:s' : 'm:s'
  t_remaining = Math.ceil(t_remaining)

  const hours   = format_countdown_component(Math.floor(t_remaining / 3600))
  const mins    = format_countdown_component(Math.floor(t_remaining / 60))
  const seconds = format_countdown_component(t_remaining % 60)

  return `${format === 'h:m:s' ? `${hours}:` : ''}${mins}:${seconds}`
}


function play_audio_file(filename) {
  return spawn('afplay', [filename], {stdio: 'ignore'})
}


async function run() {
  const duration_str = argv[2]
  const font_style = argv[3] || 'plain'
  if (!(argv.length >= 3 && argv.length <= 4) || !duration_str.match(/^\d+$/) || !['plain', 'bright', 'sinister'].includes(font_style)) {
    print_error_and_exit('Usage: node bomb-defusing-timer.js seconds [plain|bright|sinister]')
  }

  const font = Fonts[font_style]
  const duration = Number(duration_str)
  format_countdown(duration, 0)  // Check valid

  const ticking_sound = play_audio_file('files/ticking-fast.mp3')

  await wait(500)
  let t_start = performance.now()

  const interval = setInterval(() => {
    const t_now = performance.now()
    const t_remaining = Math.max(duration - (t_now - t_start) / 1000, 0)

    const str = format_countdown(duration, `${t_remaining}`)
    const str_formatted = figlet.textSync(str, font)
      .split("\n")
      .map(line => `       ${line}`)
      .join("\n")

    console.clear()
    console.log("\n\n\n\n")
    console.log(str_formatted)

    t_remaining == 0 && end()
  }, 100)

  function end() {
    clearInterval(interval)
    ticking_sound.kill()
    play_audio_file('files/alarm-bell.mp3')
  }
}
run()
