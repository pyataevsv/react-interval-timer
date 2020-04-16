import React from 'react'
import ReactDOM from 'react-dom'
import InputMask from 'react-input-mask';



class TimerApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inConfigure: true,
            params: {
                workTime: '00:45',
                restTime: '00:15',
                sets: '7',
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
            }
        };
        this.paramsChange = this.paramsChange.bind(this);
    }

    paramsChange(key, e) {

        //validation for mm:ss fields
        const newState = this.state.params;
        newState[key] = (true) ? e : e + ':';
        this.setState(newState);
        console.log(this.state.params);

    }

    beginTrain() {
        this.setState({ inConfigure: !this.state.inConfigure });
    }

    startTimer() {
        console.log('go');

    }

    quitTrain() {
        if (window.confirm('shure?')) this.setState({ inConfigure: !this.state.inConfigure });
    }

    render() {
        const inConfigure = this.state.inConfigure;
        let app;
        if (inConfigure) {
            app = <Config
                isConfChange={() => this.beginTrain()}
                setParam={this.paramsChange}
                params={this.state.params}
            />;
        } else {
            app = <Timer isConfChange={() => this.quitTrain()} startTimer={() => this.startTimer()} />;
        }

        return (
            <div className="timer-app">
                {app}
            </div>
        );
    }
}

class Timer extends React.Component {

    componentDidMount() {
        this.props.startTimer();
    }

    render() {
        return (
            <div>
                <h1>STATUS</h1>
                <div>00:45</div>
                <div>
                    <div>SETS: <span>1</span>/<span>14</span></div>
                    <div>REPS: <span>1</span>/<span>3</span></div>
                    <div>TIME: 12:21</div>
                    <button>PAUSE</button>
                    <button
                        onClick={() => this.props.isConfChange()}
                    >QUIT</button>
                </div>
            </div>
        );
    }
}

class Config extends React.Component {

    render() {
        return (
            <div>
                <h1>HIIT PLAN</h1>
                <div>
                    <WorkCounter setParam={this.props.setParam} params={this.props.params} />
                    <RestCounter setParam={this.props.setParam} params={this.props.params} />
                    <SetCounter setParam={this.props.setParam} params={this.props.params} />
                    <RepsCounter setParam={this.props.setParam} params={this.props.params} />
                    <RepsRestCounter setParam={this.props.setParam} params={this.props.params} />
                </div>
                <button
                    onClick={() => this.props.isConfChange()}
                >START</button>
            </div>
        );
    }
}

class WorkCounter extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setParam('workTime', e.target.value);
    }

    render() {
        return (
            <div>
                <div>Work</div>
                <InputMask
                    type="text"
                    mask='99:99'
                    maskChar=""
                    onChange={this.handleChange}
                    value={this.props.params.workTime}
                />
            </div>
        );
    }
}


class RestCounter extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setParam('restTime', e.target.value);
    }

    render() {
        return (
            <div>
                <div>Rest</div>
                <InputMask
                    type="text"
                    mask='99:99'
                    maskChar=""
                    onChange={this.handleChange}
                    value={this.props.params.restTime}
                />
            </div>
        );
    }
}

class SetCounter extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setParam('sets', e.target.value);
    }

    render() {
        return (
            <div>
                <div>Sets</div>
                <InputMask
                    type="text"
                    mask='99'
                    maskChar=""
                    onChange={this.handleChange}
                    value={this.props.params.sets}
                />
            </div>
        );
    }
}

class RepsCounter extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setParam('reps', e.target.value);
    }

    render() {
        return (
            <div>
                <div>Reps</div>
                <InputMask
                    type="text"
                    mask='99'
                    maskChar=""
                    onChange={this.handleChange}
                    value={this.props.params.reps}
                />
            </div>
        );
    }
}

class RepsRestCounter extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setParam('repsRest', e.target.value);
    }

    render() {
        return (
            <div>
                <div>Reps Rest</div>
                <InputMask
                    type="text"
                    mask='99:99'
                    maskChar=""
                    onChange={this.handleChange}
                    value={this.props.params.repsRest}
                />
            </div>
        );
    }
}



ReactDOM.render(
    <TimerApp />,
    document.getElementById('root')
)

let obj = {
    workTime: 5,
    readyTime: 3,
    restTime: 5,
    sets: 2,
    reps: 2,
    repsRest: 5,
    status: 'readyTime'
}


let clear = false;

const stop = document.createElement('button');
stop.innerHTML = 'stop';

document.querySelector('body').appendChild(stop);
stop.addEventListener('click', () => {
    clear = true;
});

let wt, rt, rr, ss;

wt = obj.workTime;
rt = obj.restTime;
rr = obj.repsRest;
ss = obj.sets;

const start = document.createElement('button');
start.innerHTML = 'start';
document.querySelector('body').appendChild(start);
start.addEventListener('click', () => {
    clear = false;
    runTimer();
});

let countDown;

function runTimer() {

    new Promise((res) => {
        return timer(obj, obj.status, foo, res);
    }).then((result) => {
        if (result === 'readyTime') {
            obj.status = 'workTime';
            runTimer();
        }
        if (result === 'workTime') {
            obj.sets--;
            if (obj.sets > 0) {
                obj.restTime = rt;
                obj.status = 'restTime'
                runTimer();
            } else {
                obj.reps--;
                if (obj.reps > 0) {
                    obj.status = 'repsRest';
                    runTimer();
                } else {
                    console.log('congrats');

                }
            }
        }
        if (result === 'restTime') {
            obj.status = 'workTime';
            obj.workTime = wt;
            runTimer()
        }
        if (result === 'repsRest') {
            obj.repsRest = rr;
            obj.sets = ss;
            obj.restTime = rt;
            obj.workTime = wt;
            obj.status = 'workTime';
            runTimer();
        }
    })

}

function timer(obj, key, foo, resolve) {
    const now = Date.now();
    const then = now + obj[key] * 1000;

    obj[key] = Math.round((then - now) / 1000);
    foo(obj);

    countDown = setInterval(() => {
        if (clear === true) {
            clearInterval(countDown);
            return;
        };
        let secondsLeft = Math.round((then - Date.now()) / 1000);
        obj[key] = secondsLeft;
        foo(obj);
        if (secondsLeft <= 0) {
            clearInterval(countDown);
            return resolve(key);
        }
    }, 1000);
}

// function renderTimeLeft(sec) {
//   let min = Math.floor(sec / 60);
//   let secremainder = sec % 60;
//   return ({
//     min: min,
//     secremainder: (secremainder < 10 ? '0' + secremainder : secremainder)
//   });
// }

//set state prot
function foo(obj) {
    console.log(obj.status + ' ready:' + obj.readyTime + ' work:' + obj.workTime + ' rest' + obj.restTime + ' sets' + obj.sets + ' reps' + obj.reps + ' repsRest' + obj.repsRest);
}

//timer(124, foo);


