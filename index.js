var TIMEOUT_IN_SECS = 3 * 60;
var TEMPLATE = '<h1 style="margin: auto"><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>';
var ALERT_TIMEOUT = 30;
var MOTIVATIONS = ["Делай сегодня то, что другие не хотят, завтра будешь жить так, как другие не могут.",
  "Я не терпел поражений. Я просто нашёл 10 000 способов, которые не работают. © Томас Эдисон",
  "Раз в жизни фортуна стучится в дверь каждого человека, но человек в это время нередко сидит в ближайшей пивной и никакого стука не слышит. © Марк Твен"];

function padZero(number) {
  return ("00" + String(number)).slice(-2);
}

class Timer {
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs) {
    this.initial_timeout_in_secs = timeout_in_secs;
    this.reset()
  }

  setSecsLeft(timeout_in_secs) {
    this.initial_timeout_in_secs = timeout_in_secs
    this.timeout_in_secs = this.initial_timeout_in_secs
    this.timestampOnStart = this.getTimestampInSecs()
  }

  getTimestampInSecs() {
    var timestampInMilliseconds = new Date().getTime();
    return Math.round(timestampInMilliseconds / 1000)
  }

  start() {
    if (this.isRunning)
      return;
    this.timestampOnStart = this.getTimestampInSecs();
    this.isRunning = true
  }

  stop() {
    if (!this.isRunning)
      return;
    this.timeout_in_secs = this.calculateSecsLeft();
    this.timestampOnStart = null;
    this.isRunning = false
  }

  reset(timeout_in_secs) {
    this.isRunning = false;
    this.timestampOnStart = null;
    this.timeout_in_secs = this.initial_timeout_in_secs
  }

  calculateSecsLeft() {
    if (!this.isRunning)
      return this.timeout_in_secs;
    var currentTimestamp = this.getTimestampInSecs();
    var secsGone = currentTimestamp - this.timestampOnStart;
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }
}

class TimerWidget {
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct() {
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }

  mount(rootTag) {
    if (this.timerContainer)
      this.unmount();

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div');

    this.timerContainer.setAttribute("style", "height: auto; width: auto; position: fixed; z-index: 1000; top: 10px; padding: 1em; background-color: gray");
    this.timerContainer.innerHTML = TEMPLATE;

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild);

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0];
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0];
  }

  update(secsLeft) {
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes);
    this.seconds_element.innerHTML = padZero(seconds);
  }

  unmount() {
    if (!this.timerContainer)
      return;
    this.timerContainer.remove();
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


function alertMotivation() {
  var randomMotivation = MOTIVATIONS[randomIntFromInterval(0, MOTIVATIONS.length)]
  alert(randomMotivation)
}


function main() {

  var timer = new Timer(TIMEOUT_IN_SECS)
  var timerWiget = new TimerWidget()
  var intervalId = null

  timerWiget.mount(document.body);

  function handleIntervalTick() {
    var secsLeft = timer.calculateSecsLeft()
    timerWiget.update(secsLeft)
    if (secsLeft <= 0) {
      alertMotivation();
      timer.setSecsLeft(ALERT_TIMEOUT)
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      timer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      timer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main);