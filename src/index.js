import React from 'react'
import ReactDOM from 'react-dom'
import Slider from '@material-ui/core/Slider';
import './style.css';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import gong from './audio/gong.mp3'
import three from './audio/three.mp3'
import two from './audio/two.mp3'
import one from './audio/one.mp3'
import go from './audio/go.mp3'
import rest from './audio/rest.mp3'
import cheer from './audio/cheer.mp3'



class TimerApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inConfigure: true,
      params: {
        readyTime: '00:10',
        workTime: '00:30',
        restTime: '00:15',
        sets: '5',
        reps: '3',
        repsRest: '00:30'
      },
      timer: {
        workTime: '',
        restTime: '',
        sets: '',
        reps: '',
        repsRest: '',
        status: ''
      },
      allTime: 0,
    };

    this.paramsChange = this.paramsChange.bind(this);
    this.firstTimerOpen = true;

  }

  paramsChange(key, e) {
    //validation for mm:ss fields
    const newState = this.state;
    newState.params[key] = (true) ? e : e + ':';
    this.setState(newState);
  }

  renderTimer() {
    this.currentUserSetting = this.state.timer;
    this.setState({ inConfigure: !this.state.inConfigure });
  }

  startTimer() {

    //timer state init
    if (this.firstTimerOpen) {
      this.startParams = {
        readyTime: toSeconds(this.state.params.readyTime),
        workTime: toSeconds(this.state.params.workTime),
        restTime: toSeconds(this.state.params.restTime),
        sets: this.state.params.sets,
        reps: this.state.params.reps,
        repsRest: toSeconds(this.state.params.repsRest),
        status: 'readyTime'
      }

      //we will set new states with this object
      this.newState = {
        readyTime: toSeconds(this.state.params.readyTime),
        workTime: toSeconds(this.state.params.workTime),
        restTime: toSeconds(this.state.params.restTime),
        sets: this.state.params.sets,
        reps: this.state.params.reps,
        repsRest: toSeconds(this.state.params.repsRest),
        status: 'readyTime'
      }

      this.firstTimerOpen = !this.firstTimerOpen;
      this.allTime = this.startParams.readyTime + (this.startParams.sets * this.startParams.workTime + this.startParams.restTime * (this.startParams.sets - 1)) * this.startParams.reps + this.startParams.repsRest * (this.startParams.reps - 1);


    }

    //param to stop our timer
    this.clear = false;
    this.runTimer();
  }

  runTimer() {

    new Promise((res) => {


      if (this.newState.sets !== 0 && this.newState.reps !== 0) {


        return this.timer(this.newState, this.newState.status, this.foo, res);
      }
    }).then((result) => {

      if (result === 'readyTime') {
        this.newState.status = 'workTime';
        this.runTimer();
      }
      if (result === 'workTime') {
        this.newState.sets--;
        if (this.newState.sets > 0) {
          this.newState.restTime = this.startParams.restTime;
          this.newState.status = 'restTime'
          this.runTimer();
        } else {
          this.newState.reps--;
          if (this.newState.reps > 0) {
            this.newState.sets = this.startParams.sets;
            this.newState.status = 'repsRest';
            this.runTimer();
          } else {
            this.foo(this.newState);
          }
        }
      }
      if (result === 'restTime') {
        this.newState.status = 'workTime';
        this.newState.workTime = this.startParams.workTime;
        this.runTimer()
      }
      if (result === 'repsRest') {
        this.newState.repsRest = this.startParams.repsRest;
        this.newState.sets = this.startParams.sets;
        this.newState.restTime = this.startParams.restTime;
        this.newState.workTime = this.startParams.workTime;
        this.newState.status = 'workTime';
        this.runTimer();
      }
    })
  }


  timer(obj, key, foo, resolve) {
    const now = Date.now();
    const then = now + obj[key] * 1000;

    obj[key] = Math.round((then - now) / 1000);
    this.foo(obj);


    let countDown = setInterval(() => {

      if (this.clear === true) {
        clearInterval(countDown);
        return;
      };
      let secondsLeft = Math.round((then - Date.now()) / 1000);

      obj[key] = secondsLeft;

      this.allTime--;

      this.foo(obj);

      if (secondsLeft <= 0) {
        clearInterval(countDown);
        return resolve(key);
      }
    }, 1000);
  }

  foo(obj) {
    const newTimerState = this.state;
    newTimerState.timer = obj;
    this.setState(newTimerState);


    const newAllTimeState = this.state;
    newAllTimeState.allTime = this.allTime;
    this.setState(newAllTimeState);


  }

  stopStart() {
    this.clear = !this.clear;
  }

  renderParmas() {
    if (window.confirm('shure?')) {
      //  this.setState({ inConfigure: !this.state.inConfigure });
      const newState = this.state;
      newState.timer = this.currentUserSetting;
      newState.inConfigure = !this.state.inConfigure;
      this.clear = true;
      this.firstTimerOpen = true;
      this.setState(newState);
    }
  }

  render() {
    const inConfigure = this.state.inConfigure;
    let app;

    if (inConfigure) {
      app = <Config
        isConfChange={() => this.renderTimer()}
        setParam={this.paramsChange}
        params={this.state.params}
      />;
    } else {
      app = <Timer
        isConfChange={() => this.renderParmas()}
        startTimer={() => this.startTimer()}
        timerState={this.state.timer}
        timerSettings={this.state.params}
        allTime={this.state.allTime}
        stopStart={() => this.stopStart()}
      />;
    }

    return (
      <div className="timer-app">
        {app}
      </div>
    );
  }
}

class Timer extends React.Component {

  constructor(props) {
    super(props);
    this.state = { pauseName: 'PAUSE' };
    this.stopStart = this.stopStart.bind(this);

    document.addEventListener('visibilitychange', () => {
      console.log(document.hidden);

      if (document.hidden && this.state.pauseName !== 'GO') {
        this.stopStart()
      }
    });

  }

  componentWillUnmount() {
    console.log('unmount');

  }

  stopStart() {
    const newState = (this.state.pauseName === 'PAUSE') ? 'GO' : 'PAUSE';
    this.setState({ pauseName: newState });
    this.props.stopStart();
    if (newState === 'PAUSE') {
      this.props.startTimer();
    }
  }

  showCountDown() {
    switch (this.props.timerState.status) {
      case 'workTime':
        return this.props.timerState.workTime;
      case 'restTime':
        return this.props.timerState.restTime;
      case 'repsRest':
        return this.props.timerState.repsRest;
      case 'readyTime':
        return this.props.timerState.readyTime;

      default:
        return
    }
  }

  showProgress() {
    const status = this.props.timerState.status;
    let res;
    if (!!status) {
      res = (100 - toSeconds(100 * (this.props.timerState[status] - 1)) / toSeconds(this.props.timerSettings[status]));
    } else {
      res = 1;
    }
    return res;
  }

  getllTimeProgress() {
    const allTime = toSeconds(this.props.timerSettings.readyTime) + (this.props.timerSettings.sets * toSeconds(this.props.timerSettings.workTime) + toSeconds(this.props.timerSettings.restTime) * (this.props.timerSettings.sets - 1)) * this.props.timerSettings.reps + toSeconds(this.props.timerSettings.repsRest) * (this.props.timerSettings.reps - 1);


    const res = 100 * (1 - this.props.allTime / allTime)
    if (res < 3) {
      return 3;
    } else {
      return res;
    }
  }

  componentDidMount() {
    this.props.startTimer();
    console.log('mount');
  }

  showStatus() {

    if (this.props.allTime === 0)
      return 'DONE';


    switch (this.props.timerState.status) {
      case 'workTime':
        return 'GO';
      case 'readyTime':
        return 'READY';
      case 'restTime':
        return 'REST'
      case 'repsRest':
        return 'NEW REP'
      default:
        return '';
    }
  }

  render() {
    let sound;
    if (this.showCountDown() === 3) {
      sound = <audio src={three} autoPlay></audio>;
    } else if (this.showCountDown() === 2) {
      sound = <audio src={two} autoPlay></audio>;
    } else if (this.showCountDown() === 1) {
      sound = <audio src={one} autoPlay></audio>;
    } else if (this.props.timerState.status === 'repsRest') {
      sound = <audio src={gong} autoPlay></audio>;
    } else if (this.props.timerState.status === 'workTime') {
      sound = <audio src={go} autoPlay></audio>;
    } else if (this.props.timerState.status === 'restTime') {
      sound = <audio src={rest} autoPlay></audio>;
    }

    if (this.showCountDown() === 0) {
      sound = <audio src={cheer} autoPlay></audio>;
    }


    const pauseIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5d5d5d" width="30px" height="30px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /><path d="M0 0h24v24H0z" fill="none" /></svg>;
    const startIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5d5d5d" width="30px" height="30px"><path d="M8 5v14l11-7z" /><path d="M0 0h24v24H0z" fill="none" /></svg>;

    if (this.state.pauseName === 'PAUSE') {
      this.icon = pauseIcon;
    } else {
      this.icon = startIcon;
    }

    const progressStyle = {
      width: String(this.getllTimeProgress()) + '%',

    }

    // index.js:1 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
    // in Timer (at src/index.js:210)


    return (
      <div className='timer-wrapper'>
        {sound}
        <div className='timer-progress'>
          <CircularProgressbarWithChildren
            value={this.showProgress()}
            // text={toMmss(this.showCountDown())}
            styles={buildStyles({
              rotation: 0.50,
              textSize: '16px',
              pathTransitionDuration: 1,
              pathColor: `#5cc7d8`,
              textColor: '#f88',
              trailColor: 'rgba(251, 255, 255, 0.61)',
              backgroundColor: '#fbffff',
            })}
          >
            <div className='progress-out-circle'>
              <div className='progress-status'>{this.showStatus()}</div>
              <div className='progress-countdown'>{toMmss(this.showCountDown())}</div>
            </div>

          </CircularProgressbarWithChildren>

        </div>
        <div className='all-progress-bar'>
          <div className='setsreps-progress'>
            <div>
              <div className='sets-reps'>
                Sets: <span>{this.props.timerState.sets}</span>/<span>{this.props.timerSettings.sets}</span>
              </div>
            </div>
            <div>
              <div>
                Reps: <span>{this.props.timerState.reps}</span>/<span>{this.props.timerSettings.reps}</span>
              </div>
            </div>
          </div>
          <div>
            <div className='timecount-box'>
              <div>Time:</div>
              <div><span>{toMmss(this.props.allTime)}</span></div>
            </div>
            <div className='alltime-progressbar'>
              <div className='progress-line' style={progressStyle}></div>
            </div>
          </div>

        </div>
        <div className='btn-box'>
          <button
            className='timer-btn'
            onClick={this.stopStart}
          >{this.icon}</button>
          <button
            className='timer-btn'
            onClick={() => this.props.isConfChange()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5d5d5d" width="30px" height="30px"><path d="M0 0h24v24H0z" fill="none" /><path d="M6 6h12v12H6z" /></svg>
          </button>
        </div>
      </div>
    );
  }
}

class Config extends React.Component {

  render() {
    return (
      <div className='config-wrapper'>
        <div><h1>Interval timer</h1></div>
        <div className='setting-box'>
          <WorkCounter setParam={this.props.setParam} params={this.props.params} />
          <RestCounter setParam={this.props.setParam} params={this.props.params} />
          <SetCounter setParam={this.props.setParam} params={this.props.params} />
          <RepsCounter setParam={this.props.setParam} params={this.props.params} />
          <RepsRestCounter setParam={this.props.setParam} params={this.props.params} />

        </div>
        <div>
          <button
            className='start-btn'
            onClick={() => this.props.isConfChange()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="30px" height="30px"><path d="M0 0h24v24H0z" fill="none" /><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" /></svg>
          </button>
        </div>

      </div>
    );
  }
}

class WorkCounter extends React.Component {

  constructor(props) {
    super(props);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderDefaultValue = toSeconds(this.props.params.workTime);
  }

  sliderChange(value) {
    this.props.setParam('workTime', toMmss(value.target.getAttribute('aria-valuenow')));

  }

  step() {
    if (toSeconds(this.props.params.workTime) < 60) {
      return 5
    } else {
      return 1
    }
  }

  render() {


    return (
      <div>
        <div className='set-name-box'>
          <div>Work</div>
          <div>{this.props.params.workTime}</div>
        </div>
        <div className='slider-box'>
          <Slider
            defaultValue={this.sliderDefaultValue}
            onChange={this.sliderChange}
            scale={(x) => { if (x < 60) { return x } else { return x * 10 - 540 } }}
            step={this.step()}
            min={5}
            max={120}
          //valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}


class RestCounter extends React.Component {

  constructor(props) {
    super(props);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderDefaultValue = toSeconds(this.props.params.restTime);
  }

  sliderChange(value) {
    this.props.setParam('restTime', toMmss(value.target.getAttribute('aria-valuenow')));

  }

  render() {
    return (
      <div>
        <div className='set-name-box'>
          <div>Rest</div>
          <div>{this.props.params.restTime}</div>
        </div>
        <div className='slider-box'>
          <Slider
            defaultValue={this.sliderDefaultValue}
            onChange={this.sliderChange}
            scale={(x) => { if (x < 60) { return x } else { return x } }}
            step={1}
            min={5}
            max={120}
          //valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}

class SetCounter extends React.Component {

  constructor(props) {
    super(props);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderDefaultValue = this.props.params.sets;
  }

  sliderChange(value) {
    this.props.setParam('sets', value.target.getAttribute('aria-valuenow'));

  }

  render() {
    return (
      <div>
        <div className='set-name-box'>
          <div>Sets</div>
          <div>{this.props.params.sets}</div>
        </div>
        <div className='slider-box'>
          <Slider
            defaultValue={this.sliderDefaultValue}
            onChange={this.sliderChange}
            scale={(x) => { if (x < 60) { return x } else { return x } }}
            step={1}
            min={1}
            max={20}
          //valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}

class RepsCounter extends React.Component {

  constructor(props) {
    super(props);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderDefaultValue = this.props.params.reps;
  }

  sliderChange(value) {
    this.props.setParam('reps', value.target.getAttribute('aria-valuenow'));

  }

  render() {
    return (
      <div>
        <div className='set-name-box'>
          <div>Reps</div>
          <div>{this.props.params.reps}</div>
        </div>
        <div className='slider-box'>
          <Slider
            defaultValue={this.sliderDefaultValue}
            onChange={this.sliderChange}
            scale={(x) => { if (x < 60) { return x } else { return x } }}
            step={1}
            min={1}
            max={10}
          //valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}

class RepsRestCounter extends React.Component {

  constructor(props) {
    super(props);
    this.sliderChange = this.sliderChange.bind(this);
    this.sliderDefaultValue = toSeconds(this.props.params.repsRest);
  }

  sliderChange(value) {
    this.props.setParam('repsRest', toMmss(value.target.getAttribute('aria-valuenow')));

  }

  render() {
    return (
      <div>
        <div className='set-name-box'>
          <div>Reps rest</div>
          <div>{this.props.params.repsRest}</div>
        </div>
        <div className='slider-box'>
          <Slider
            defaultValue={this.sliderDefaultValue}
            onChange={this.sliderChange}
            scale={(x) => { if (x < 60) { return x } else { return x } }}
            step={1}
            min={5}
            max={120}
          //valueLabelDisplay="auto"
          />
        </div>
      </div>
    );
  }
}

function toSeconds(mmss) {
  if (typeof (mmss) == 'number') {
    return mmss;
  } else {
    return Number(mmss.match(/^.*(?=:)/)) * 60 + Number(mmss.match(/(?<=:).*$/));

  }
}

function toMmss(sec) {
  let min = Math.floor(sec / 60);
  let secremainder = sec % 60;
  if (String(min).length === 1) {
    return '0' + String(min) + ':' + String(secremainder < 10 ? '0' + secremainder : secremainder)
  } else {
    return String(min) + ':' + String(secremainder < 10 ? '0' + secremainder : secremainder)

  }
}




ReactDOM.render(
  <TimerApp />,
  document.getElementById('root')
)

