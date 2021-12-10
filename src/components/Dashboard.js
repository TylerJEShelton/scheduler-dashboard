import React, { Component } from 'react';
import axios from 'axios';

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
} from 'helpers/selectors';

import classnames from 'classnames';

import Loading from './Loading';
import Panel from './Panel';

const data = [
  {
    id: 1,
    label: 'Total Interviews',
    getValue: getTotalInterviews,
  },
  {
    id: 2,
    label: 'Least Popular Time Slot',
    getValue: getLeastPopularTimeSlot,
  },
  {
    id: 3,
    label: 'Most Popular Day',
    getValue: getMostPopularDay,
  },
  {
    id: 4,
    label: 'Interviews Per Day',
    getValue: getInterviewsPerDay,
  },
];

export default class Dashboard extends Component {
  state = {
    days: [],
    appointments: {},
    interviewers: {},
    loading: true,
    focused: null,
  };

  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem('focused'));
    Promise.all([
      axios.get('/api/days'),
      axios.get('/api/appointments'),
      axios.get('/api/interviewers'),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data,
      });
    });

    if (focused) {
      this.setState({ focused });
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem('focused', JSON.stringify(this.state.focused));
    }
  }

  selectPanel(id) {
    this.setState(prevState => ({
      focused: prevState.focused !== null ? null : id,
    }));
  }

  render() {
    const dashboardClasses = classnames('dashboard', {
      'dashboard--focused': this.state.focused,
    });

    if (this.state.loading) {
      return <Loading />;
    }

    const panels = data
      .filter(
        panel => this.state.focused === null || this.state.focused === panel.id
      )
      .map(panel => (
        <Panel
          key={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          onSelect={e => this.selectPanel(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}
